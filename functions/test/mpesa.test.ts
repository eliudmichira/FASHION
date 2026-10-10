import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  clearTokenCache,
  darajaTimestamp,
  describeResult,
  normalisePhone,
  parseCallback,
  stkPassword,
  stkPush,
  stkQuery,
  type MpesaConfig,
} from "../src/mpesa";
import { priceOrder } from "../src/order";

const cfg: MpesaConfig = {
  env: "sandbox",
  consumerKey: "key",
  consumerSecret: "secret",
  passkey: "pass",
  shortcode: "174379",
  partyB: "174379",
  transactionType: "CustomerPayBillOnline",
  callbackUrl: "https://example.web.app/api/mpesa/callback?token=t",
};

type Call = { url: string; init?: RequestInit };

// A stand-in for fetch that answers Daraja's endpoints and records each call.
function fakeDaraja(answers: Record<string, unknown>, calls: Call[]): typeof fetch {
  return (async (url: string | URL, init?: RequestInit) => {
    calls.push({ url: String(url), init });
    const path = new URL(String(url)).pathname;
    const body = answers[path];
    return new Response(JSON.stringify(body ?? {}), { status: body ? 200 : 404 });
  }) as typeof fetch;
}

describe("normalisePhone", () => {
  it("accepts the ways Kenyans write a Safaricom number", () => {
    for (const input of ["0712345678", "0712 345 678", "712345678", "+254712345678", "254712345678", "0112-345-678"]) {
      assert.match(normalisePhone(input) ?? "", /^254[17]\d{8}$/, input);
    }
    assert.equal(normalisePhone("0712 345 678"), "254712345678");
    assert.equal(normalisePhone("0112345678"), "254112345678");
  });
  it("rejects anything else", () => {
    for (const input of ["", "12345", "0812345678", "25471234567", "+1 415 555 0100", "07123456789"]) {
      assert.equal(normalisePhone(input), null, input);
    }
  });
});

describe("darajaTimestamp and password", () => {
  it("uses Kenyan time, YYYYMMDDHHmmss", () => {
    // 21:05:09 UTC is 00:05:09 the next day in Nairobi (UTC+3).
    assert.equal(darajaTimestamp(new Date("2026-10-10T21:05:09Z")), "20261011000509");
  });
  it("builds the password as base64(shortcode + passkey + timestamp)", () => {
    assert.equal(stkPassword("174379", "pass", "20261011000509"), Buffer.from("174379pass20261011000509").toString("base64"));
  });
});

describe("stkPush", () => {
  beforeEach(() => clearTokenCache());

  it("signs in, then sends a correctly shaped prompt", async () => {
    const calls: Call[] = [];
    const fetchImpl = fakeDaraja(
      {
        "/oauth/v1/generate": { access_token: "tok", expires_in: "3599" },
        "/mpesa/stkpush/v1/processrequest": {
          ResponseCode: "0",
          MerchantRequestID: "m-1",
          CheckoutRequestID: "ws_CO_1",
          CustomerMessage: "Success. Request accepted for processing",
        },
      },
      calls,
    );
    const result = await stkPush(cfg, { amount: 2998, phone: "254712345678", reference: "ABCDEFGHIJKLMNOP", description: "Order for the shop" }, fetchImpl);

    assert.equal(result.checkoutRequestId, "ws_CO_1");
    assert.equal(calls[0].url, "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials");
    assert.equal((calls[0].init?.headers as Record<string, string>).Authorization, `Basic ${Buffer.from("key:secret").toString("base64")}`);

    const push = JSON.parse(String(calls[1].init?.body));
    assert.equal((calls[1].init?.headers as Record<string, string>).Authorization, "Bearer tok");
    assert.match(push.Timestamp, /^\d{14}$/);
    assert.equal(push.Password, stkPassword("174379", "pass", push.Timestamp));
    assert.equal(push.Amount, 2998);
    assert.equal(push.PartyA, "254712345678");
    assert.equal(push.PhoneNumber, "254712345678");
    assert.equal(push.PartyB, "174379");
    assert.equal(push.TransactionType, "CustomerPayBillOnline");
    assert.equal(push.CallBackURL, cfg.callbackUrl);
    assert.equal(push.AccountReference.length, 12);
    assert.equal(push.TransactionDesc.length, 13);
  });

  it("reuses the token instead of signing in every time", async () => {
    const calls: Call[] = [];
    const fetchImpl = fakeDaraja(
      {
        "/oauth/v1/generate": { access_token: "tok", expires_in: "3599" },
        "/mpesa/stkpush/v1/processrequest": { ResponseCode: "0", CheckoutRequestID: "ws_CO_1" },
      },
      calls,
    );
    await stkPush(cfg, { amount: 1, phone: "254712345678", reference: "A", description: "B" }, fetchImpl);
    await stkPush(cfg, { amount: 1, phone: "254712345678", reference: "A", description: "B" }, fetchImpl);
    assert.equal(calls.filter((c) => c.url.includes("/oauth/")).length, 1);
  });

  it("throws when Daraja refuses the prompt", async () => {
    const fetchImpl = fakeDaraja(
      {
        "/oauth/v1/generate": { access_token: "tok" },
        "/mpesa/stkpush/v1/processrequest": { errorMessage: "Invalid PhoneNumber" },
      },
      [],
    );
    await assert.rejects(stkPush(cfg, { amount: 1, phone: "254712345678", reference: "A", description: "B" }, fetchImpl), /Invalid PhoneNumber/);
  });
});

describe("stkQuery", () => {
  beforeEach(() => clearTokenCache());
  const query = (answer: unknown) =>
    stkQuery(cfg, "ws_CO_1", fakeDaraja({ "/oauth/v1/generate": { access_token: "tok" }, "/mpesa/stkpushquery/v1/query": answer }, []));

  it("reads 'still processing' as pending", async () => {
    assert.deepEqual(await query({ errorCode: "500.001.1001", errorMessage: "The transaction is being processed" }), { state: "pending" });
  });
  it("reads result code 0 as paid", async () => {
    assert.deepEqual(await query({ ResponseCode: "0", ResultCode: "0", ResultDesc: "The service request is processed successfully." }), { state: "paid" });
  });
  it("reads a cancelled prompt as failed, with a plain message", async () => {
    assert.deepEqual(await query({ ResponseCode: "0", ResultCode: "1032", ResultDesc: "Request cancelled by user" }), {
      state: "failed",
      resultCode: 1032,
      message: describeResult(1032),
    });
  });
});

describe("parseCallback", () => {
  it("reads a successful payment", () => {
    const parsed = parseCallback({
      Body: {
        stkCallback: {
          MerchantRequestID: "m-1",
          CheckoutRequestID: "ws_CO_1",
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: 2998 },
              { Name: "MpesaReceiptNumber", Value: "NLJ7RT61SV" },
              { Name: "TransactionDate", Value: 20261011102115 },
              { Name: "PhoneNumber", Value: 254712345678 },
            ],
          },
        },
      },
    });
    assert.deepEqual(parsed, {
      checkoutRequestId: "ws_CO_1",
      resultCode: 0,
      resultDesc: "The service request is processed successfully.",
      amount: 2998,
      receipt: "NLJ7RT61SV",
      phone: "254712345678",
      transactionDate: "20261011102115",
    });
  });
  it("reads a cancelled prompt (no metadata)", () => {
    const parsed = parseCallback({ Body: { stkCallback: { CheckoutRequestID: "ws_CO_2", ResultCode: 1032, ResultDesc: "Request cancelled by user" } } });
    assert.equal(parsed?.resultCode, 1032);
    assert.equal(parsed?.receipt, undefined);
  });
  it("rejects bodies that aren't callbacks", () => {
    assert.equal(parseCallback({}), null);
    assert.equal(parseCallback("nope"), null);
  });
});

describe("priceOrder", () => {
  it("charges the catalogue price plus delivery, whatever the browser sent", () => {
    const result = priceOrder([{ slug: "night-dweller-baby-tee", size: "S", qty: 2, price: 1, deliveryFee: 0 }]);
    assert.ok(!("error" in result));
    assert.equal(result.subtotal, 1000 * 2);
    assert.equal(result.deliveryFee, 298);
    assert.equal(result.amount, 1000 * 2 + 298);
    assert.equal(result.items[0].price, 1000);
    assert.equal(result.items[0].name, "Night Dweller Baby Tee");
  });
  it("adds up several lines", () => {
    const result = priceOrder([
      { slug: "night-dweller-baby-tee", size: "M", qty: 1 },
      { slug: "night-dweller-baby-tee", size: "S", qty: 2 },
    ]);
    assert.ok(!("error" in result));
    // One delivery fee per order, however many pieces.
    assert.equal(result.amount, 1000 + 1000 * 2 + 298);
  });
  it("refuses empty bags, unknown pieces, sold-out sizes and odd quantities", () => {
    assert.ok("error" in priceOrder([]));
    assert.ok("error" in priceOrder("x"));
    assert.ok("error" in priceOrder([{ slug: "nope", size: "S", qty: 1 }]));
    assert.ok("error" in priceOrder([{ slug: "nylon-track-jacket", size: "XS", qty: 1 }]));
    assert.ok("error" in priceOrder([{ slug: "night-dweller-baby-tee", size: "XXXL", qty: 1 }]));
    for (const qty of [0, -1, 1.5, 11, "2"]) {
      assert.ok("error" in priceOrder([{ slug: "night-dweller-baby-tee", size: "S", qty }]), String(qty));
    }
  });
});
