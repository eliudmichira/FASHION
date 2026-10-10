import { timingSafeEqual } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall, onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import { defineSecret, defineString } from "firebase-functions/params";
import { setGlobalOptions } from "firebase-functions/v2";
import { describeResult, normalisePhone, parseCallback, stkPush, stkQuery, type MpesaConfig } from "./mpesa";
import { priceOrder } from "./order";

// Same region the site's checkout calls (site.payments.region).
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });
initializeApp();
const db = getFirestore();

// Secrets: set with `firebase functions:secrets:set NAME`. Never in the repo.
const consumerKey = defineSecret("MPESA_CONSUMER_KEY");
const consumerSecret = defineSecret("MPESA_CONSUMER_SECRET");
const passkey = defineSecret("MPESA_PASSKEY");
// A long random string. Safaricom doesn't sign its callbacks, so the callback
// URL carries this and anything without it is turned away.
const callbackToken = defineSecret("MPESA_CALLBACK_TOKEN");

// Plain settings: functions/.env (see functions/.env.example).
const mpesaEnv = defineString("MPESA_ENV", { default: "sandbox" });
const shortcode = defineString("MPESA_SHORTCODE", { default: "174379" });
const partyB = defineString("MPESA_PARTY_B", { default: "" });
const transactionType = defineString("MPESA_TRANSACTION_TYPE", { default: "CustomerPayBillOnline" });
const callbackBase = defineString("MPESA_CALLBACK_BASE", { default: "" });

const secrets = [consumerKey, consumerSecret, passkey, callbackToken];

function mpesaConfig(): MpesaConfig {
  const base = callbackBase.value() || `https://${process.env.GCLOUD_PROJECT}.web.app`;
  return {
    env: mpesaEnv.value() === "production" ? "production" : "sandbox",
    consumerKey: consumerKey.value(),
    consumerSecret: consumerSecret.value(),
    passkey: passkey.value(),
    shortcode: shortcode.value(),
    partyB: partyB.value() || shortcode.value(),
    transactionType: transactionType.value() === "CustomerBuyGoodsOnline" ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline",
    callbackUrl: `${base}/api/mpesa/callback?token=${encodeURIComponent(callbackToken.value())}`,
  };
}

function sameToken(given: unknown, expected: string): boolean {
  if (typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function text(value: unknown, min: number, max: number): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v.length >= min && v.length <= max ? v : null;
}

// Checkout: price the bag, save a pending order, send the PIN prompt.
export const startMpesaPayment = onCall({ secrets }, async (request) => {
  const data = (request.data ?? {}) as Record<string, unknown>;
  const name = text(data.name, 2, 80);
  if (!name) throw new HttpsError("invalid-argument", "Add your name.");
  const address = text(data.address, 3, 300);
  if (!address) throw new HttpsError("invalid-argument", "Add a delivery address.");
  const phone = normalisePhone(String(data.phone ?? ""));
  if (!phone) throw new HttpsError("invalid-argument", "Use a Safaricom number, like 0712 345 678.");

  const priced = priceOrder(data.items);
  if ("error" in priced) throw new HttpsError("invalid-argument", priced.error);

  // One prompt per number per minute, so nobody can flood a phone with prompts.
  await db.runTransaction(async (tx) => {
    const ref = db.doc(`mpesaRateLimits/${phone}`);
    const last = (await tx.get(ref)).get("lastAt") as Timestamp | undefined;
    if (last && Date.now() - last.toMillis() < 60_000) {
      throw new HttpsError("resource-exhausted", "We just sent a prompt to that number. Wait a minute and try again.");
    }
    tx.set(ref, { lastAt: FieldValue.serverTimestamp() });
  });

  const order = db.collection("orders").doc();
  await order.set({
    items: priced.items,
    subtotal: priced.subtotal,
    deliveryFee: priced.deliveryFee,
    amount: priced.amount,
    currency: "KES",
    customer: { name, phone, address },
    status: "pending",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  try {
    const push = await stkPush(mpesaConfig(), {
      amount: priced.amount,
      phone,
      reference: order.id.slice(0, 12).toUpperCase(),
      description: "Order",
    });
    await order.update({
      "mpesa.merchantRequestId": push.merchantRequestId,
      "mpesa.checkoutRequestId": push.checkoutRequestId,
      pushedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { orderId: order.id, amount: priced.amount };
  } catch (err) {
    logger.error("STK push failed", { orderId: order.id, err: String(err) });
    // The prompt never went out, so don't make the customer wait out the limit.
    await db.doc(`mpesaRateLimits/${phone}`).delete().catch(() => undefined);
    await order.update({ status: "failed", "mpesa.resultDesc": "Prompt not sent", updatedAt: FieldValue.serverTimestamp() });
    throw new HttpsError("unavailable", "We couldn't reach M-Pesa. Try again in a minute.");
  }
});

// The checkout polls this while the customer has the prompt open.
export const mpesaPaymentStatus = onCall({ secrets }, async (request) => {
  const orderId = String((request.data as Record<string, unknown> | undefined)?.orderId ?? "");
  if (!/^[A-Za-z0-9]{20}$/.test(orderId)) throw new HttpsError("invalid-argument", "Unknown order.");
  const ref = db.doc(`orders/${orderId}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Unknown order.");
  let order = snap.data()!;

  // Callbacks can arrive late or not at all. After a short wait, ask Daraja.
  const pushedAt = order.pushedAt as Timestamp | undefined;
  const checkoutRequestId = order.mpesa?.checkoutRequestId as string | undefined;
  if (order.status === "pending" && checkoutRequestId && pushedAt && Date.now() - pushedAt.toMillis() > 25_000) {
    const result = await stkQuery(mpesaConfig(), checkoutRequestId).catch((err) => {
      logger.warn("STK query failed", { orderId, err: String(err) });
      return null;
    });
    if (result && result.state !== "pending") {
      const update =
        result.state === "paid"
          ? { status: "paid", "mpesa.resultCode": 0, "mpesa.confirmedBy": "query" }
          : { status: "failed", "mpesa.resultCode": result.resultCode, "mpesa.resultDesc": result.message };
      await db.runTransaction(async (tx) => {
        const fresh = await tx.get(ref);
        if (fresh.get("status") === "pending") tx.update(ref, { ...update, updatedAt: FieldValue.serverTimestamp() });
      });
      order = (await ref.get()).data()!;
    }
  }

  return {
    status: order.status as string,
    receipt: (order.mpesa?.receipt as string | undefined) ?? null,
    message: order.status === "failed" ? describeResult(Number(order.mpesa?.resultCode ?? -1)) : null,
  };
});

// Safaricom posts the outcome of every prompt here (via the Hosting rewrite
// /api/mpesa/callback in firebase.json).
export const mpesaCallback = onRequest({ secrets: [callbackToken] }, async (req, res) => {
  if (req.method !== "POST" || !sameToken(req.query.token, callbackToken.value())) {
    res.status(403).json({ ResultCode: 1, ResultDesc: "Rejected" });
    return;
  }
  const cb = parseCallback(req.body);
  if (!cb) {
    res.status(400).json({ ResultCode: 1, ResultDesc: "Unreadable callback" });
    return;
  }

  const match = await db.collection("orders").where("mpesa.checkoutRequestId", "==", cb.checkoutRequestId).limit(1).get();
  if (match.empty) {
    logger.warn("Callback for unknown prompt", { checkoutRequestId: cb.checkoutRequestId });
  } else {
    const ref = match.docs[0].ref;
    await db.runTransaction(async (tx) => {
      const order = await tx.get(ref);
      // A paid order never goes back; a late failure can't undo a payment.
      if (order.get("status") === "paid") return;
      if (cb.resultCode === 0) {
        // The amount should always match; if it doesn't, hold the order for a person to check.
        const status = cb.amount === order.get("amount") ? "paid" : "review";
        tx.update(ref, {
          status,
          "mpesa.resultCode": 0,
          "mpesa.receipt": cb.receipt ?? null,
          "mpesa.paidAmount": cb.amount ?? null,
          "mpesa.payerPhone": cb.phone ?? null,
          "mpesa.transactionDate": cb.transactionDate ?? null,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        tx.update(ref, {
          status: "failed",
          "mpesa.resultCode": cb.resultCode,
          "mpesa.resultDesc": cb.resultDesc,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    });
  }
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});
