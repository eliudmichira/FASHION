// Safaricom Daraja: Lipa na M-Pesa Online (STK push). The customer gets a PIN
// prompt on their phone; Safaricom then calls our callback with the result.
// https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate

export type MpesaConfig = {
  env: "sandbox" | "production";
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  // Paybill number, or the store (head office) number for a Till.
  shortcode: string;
  // Who receives the money: the same Paybill, or the Till number.
  partyB: string;
  transactionType: "CustomerPayBillOnline" | "CustomerBuyGoodsOnline";
  callbackUrl: string;
};

type Fetch = typeof fetch;

const BASE_URL = {
  sandbox: "https://sandbox.safaricom.co.ke",
  production: "https://api.safaricom.co.ke",
};

// Accepts 0712 345 678, 712345678, +254712345678 or 254712345678 (07xx and 01xx
// lines) and returns the 2547XXXXXXXX form Daraja wants, or null.
export function normalisePhone(input: string): string | null {
  let n = input.replace(/[\s-]/g, "").replace(/^\+/, "");
  if (/^0[17]\d{8}$/.test(n)) n = `254${n.slice(1)}`;
  else if (/^[17]\d{8}$/.test(n)) n = `254${n}`;
  return /^254[17]\d{8}$/.test(n) ? n : null;
}

// Daraja expects the timestamp in Kenyan time, as YYYYMMDDHHmmss.
export function darajaTimestamp(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}${get("month")}${get("day")}${get("hour")}${get("minute")}${get("second")}`;
}

export function stkPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

// Daraja tokens last an hour; reuse one until shortly before it expires.
let cachedToken: { value: string; expiresAt: number; key: string } | null = null;

export function clearTokenCache() {
  cachedToken = null;
}

async function accessToken(cfg: MpesaConfig, fetchImpl: Fetch): Promise<string> {
  const key = `${cfg.env}:${cfg.consumerKey}`;
  if (cachedToken && cachedToken.key === key && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  const basic = Buffer.from(`${cfg.consumerKey}:${cfg.consumerSecret}`).toString("base64");
  const res = await fetchImpl(`${BASE_URL[cfg.env]}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) throw new Error(`Daraja auth failed: HTTP ${res.status}`);
  const body = (await res.json()) as { access_token?: string; expires_in?: string | number };
  if (!body.access_token) throw new Error("Daraja auth returned no token");
  const ttl = Number(body.expires_in ?? 3599) * 1000;
  cachedToken = { value: body.access_token, expiresAt: Date.now() + ttl - 60_000, key };
  return body.access_token;
}

export type StkPushInput = {
  amount: number;
  phone: string;
  // Shown on the customer's prompt and statement. Daraja caps these at 12 and 13 characters.
  reference: string;
  description: string;
};

export async function stkPush(cfg: MpesaConfig, input: StkPushInput, fetchImpl: Fetch = fetch) {
  const token = await accessToken(cfg, fetchImpl);
  const timestamp = darajaTimestamp();
  const res = await fetchImpl(`${BASE_URL[cfg.env]}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: cfg.shortcode,
      Password: stkPassword(cfg.shortcode, cfg.passkey, timestamp),
      Timestamp: timestamp,
      TransactionType: cfg.transactionType,
      Amount: Math.round(input.amount),
      PartyA: input.phone,
      PartyB: cfg.partyB,
      PhoneNumber: input.phone,
      CallBackURL: cfg.callbackUrl,
      AccountReference: input.reference.slice(0, 12),
      TransactionDesc: input.description.slice(0, 13),
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    ResponseCode?: string;
    MerchantRequestID?: string;
    CheckoutRequestID?: string;
    CustomerMessage?: string;
    errorMessage?: string;
  };
  if (!res.ok || body.ResponseCode !== "0" || !body.CheckoutRequestID) {
    throw new Error(`STK push rejected: HTTP ${res.status} ${body.errorMessage ?? body.ResponseCode ?? ""}`.trim());
  }
  return {
    merchantRequestId: body.MerchantRequestID ?? "",
    checkoutRequestId: body.CheckoutRequestID,
    customerMessage: body.CustomerMessage ?? "",
  };
}

export type QueryResult = { state: "pending" } | { state: "paid" } | { state: "failed"; resultCode: number; message: string };

// Asks Daraja directly how a prompt ended, for when the callback is late or lost.
export async function stkQuery(cfg: MpesaConfig, checkoutRequestId: string, fetchImpl: Fetch = fetch): Promise<QueryResult> {
  const token = await accessToken(cfg, fetchImpl);
  const timestamp = darajaTimestamp();
  const res = await fetchImpl(`${BASE_URL[cfg.env]}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: cfg.shortcode,
      Password: stkPassword(cfg.shortcode, cfg.passkey, timestamp),
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { ResultCode?: string; errorCode?: string };
  // While the customer still has the prompt open, Daraja answers with an
  // "is being processed" error rather than a result.
  if (body.ResultCode === undefined) return { state: "pending" };
  const code = Number(body.ResultCode);
  if (code === 0) return { state: "paid" };
  return { state: "failed", resultCode: code, message: describeResult(code) };
}

export type CallbackResult = {
  checkoutRequestId: string;
  resultCode: number;
  resultDesc: string;
  amount?: number;
  receipt?: string;
  phone?: string;
  transactionDate?: string;
};

export function parseCallback(body: unknown): CallbackResult | null {
  const cb = (body as { Body?: { stkCallback?: Record<string, unknown> } })?.Body?.stkCallback;
  if (!cb || typeof cb.CheckoutRequestID !== "string") return null;
  const items = ((cb.CallbackMetadata as { Item?: { Name: string; Value?: string | number }[] })?.Item ?? []).reduce<
    Record<string, string | number | undefined>
  >((acc, i) => ({ ...acc, [i.Name]: i.Value }), {});
  return {
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: Number(cb.ResultCode),
    resultDesc: String(cb.ResultDesc ?? ""),
    amount: items.Amount === undefined ? undefined : Number(items.Amount),
    receipt: items.MpesaReceiptNumber === undefined ? undefined : String(items.MpesaReceiptNumber),
    phone: items.PhoneNumber === undefined ? undefined : String(items.PhoneNumber),
    transactionDate: items.TransactionDate === undefined ? undefined : String(items.TransactionDate),
  };
}

// What the shopper sees when a prompt doesn't end in a payment.
export function describeResult(code: number): string {
  switch (code) {
    case 0:
      return "Paid.";
    case 1032:
      return "The M-Pesa prompt was cancelled.";
    case 1037:
      return "The M-Pesa prompt timed out before a PIN was entered.";
    case 1:
      return "There isn't enough in that M-Pesa account.";
    case 2001:
      return "The M-Pesa PIN was wrong.";
    default:
      return "M-Pesa couldn't complete the payment.";
  }
}
