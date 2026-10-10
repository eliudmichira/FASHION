import { site } from "@/data/site";

export type CheckoutLine = { slug: string; size: string; qty: number };

export type PaymentStatus = {
  // "review": M-Pesa took the money but the amount didn't match; a person checks it.
  status: "pending" | "paid" | "failed" | "review";
  receipt: string | null;
  message: string | null;
};

// Firebase callable functions, loaded only when someone actually checks out.
async function callable<In, Out>(name: string) {
  const [{ getFunctions, httpsCallable }, { app }] = await Promise.all([import("firebase/functions"), import("@/lib/firebase")]);
  return httpsCallable<In, Out>(getFunctions(app, site.payments.region), name);
}

export async function startMpesaPayment(input: { items: CheckoutLine[]; phone: string; name: string; address: string }) {
  const fn = await callable<typeof input, { orderId: string; amount: number }>("startMpesaPayment");
  return (await fn(input)).data;
}

export async function getPaymentStatus(orderId: string) {
  const fn = await callable<{ orderId: string }, PaymentStatus>("mpesaPaymentStatus");
  return (await fn({ orderId })).data;
}

// The functions send shopper-ready messages for the errors a shopper can fix;
// anything else gets a general one. The raw error goes to the browser console
// (see MpesaCheckout), not to the shopper.
export function paymentErrorMessage(err: unknown): string {
  const rawCode = (err as { code?: string })?.code ?? "";
  const code = rawCode.replace(/^functions\//, "");
  const message = (err as { message?: string })?.message;
  const shopperFacing = ["invalid-argument", "resource-exhausted", "unavailable"];
  // The Functions SDK appends the HTTP status ("… [400]"); shoppers don't need it.
  if (shopperFacing.includes(code) && message) return message.replace(/\s*\[\d{3}\]$/, "");
  return "Checkout isn't working right now. Try again in a few minutes.";
}
