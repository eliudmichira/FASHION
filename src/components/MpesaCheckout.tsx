"use client";

import { useEffect, useId, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { site } from "@/data/site";
import { formatKsh } from "@/lib/format";
import { getPaymentStatus, paymentErrorMessage, startMpesaPayment } from "@/lib/mpesa";

const POLL_MS = 3000;
// STK prompts expire after about a minute; give the callback some slack on top.
const GIVE_UP_MS = 120_000;

export type PaidOrder = { receipt: string | null; phone: string; amount: number; review: boolean };

type Step =
  | { kind: "bag" }
  | { kind: "details"; error: string | null; sending: boolean }
  | { kind: "waiting"; orderId: string; amount: number; startedAt: number }
  | { kind: "failed"; message: string }
  | { kind: "timeout" };

const field = "min-h-12 w-full border-2 border-void bg-chalk px-3 text-void placeholder:text-dim-studio";
const primary =
  "min-h-12 w-full border-2 border-void bg-void font-semibold text-chalk hover:bg-studio hover:text-void disabled:opacity-60";

export function MpesaCheckout({ onPaid }: { onPaid: (order: PaidOrder) => void }) {
  const id = useId();
  const { lines, subtotal, clear } = useCart();
  const [step, setStep] = useState<Step>({ kind: "bag" });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setStep({ kind: "details", error: "Fill in your name, M-Pesa number and delivery address.", sending: false });
      return;
    }
    setStep({ kind: "details", error: null, sending: true });
    try {
      const { orderId, amount } = await startMpesaPayment({
        items: lines.map(({ slug, size, qty }) => ({ slug, size, qty })),
        phone,
        name,
        address,
      });
      setStep({ kind: "waiting", orderId, amount, startedAt: Date.now() });
    } catch (err) {
      console.error("M-Pesa checkout failed", err);
      setStep({ kind: "details", error: paymentErrorMessage(err), sending: false });
    }
  }

  // While the prompt is open on the customer's phone, check in every few seconds.
  useEffect(() => {
    if (step.kind !== "waiting") return;
    let stopped = false;
    const timer = window.setInterval(async () => {
      if (Date.now() - step.startedAt > GIVE_UP_MS) {
        stopped = true;
        window.clearInterval(timer);
        setStep({ kind: "timeout" });
        return;
      }
      try {
        const result = await getPaymentStatus(step.orderId);
        if (stopped || result.status === "pending") return;
        stopped = true;
        window.clearInterval(timer);
        if (result.status === "failed") {
          setStep({ kind: "failed", message: result.message ?? "M-Pesa couldn't complete the payment." });
        } else {
          clear();
          onPaid({ receipt: result.receipt, phone, amount: step.amount, review: result.status === "review" });
        }
      } catch {
        // A dropped connection shouldn't end the wait; the next check tries again.
      }
    }, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [step, clear, onPaid, phone]);

  if (!site.payments.mpesa) {
    return (
      <>
        <button type="button" disabled aria-describedby={`${id}-soon`} className={`mt-4 ${primary} opacity-50`}>
          Checkout
        </button>
        <p id={`${id}-soon`} className="mt-2 text-center text-sm text-dim-studio">
          Coming soon: checkout opens when the store goes live.
        </p>
      </>
    );
  }

  if (step.kind === "bag") {
    return (
      <button
        type="button"
        disabled={lines.length === 0}
        onClick={() => setStep({ kind: "details", error: null, sending: false })}
        className={`mt-4 ${primary}`}
      >
        Checkout with M-Pesa
      </button>
    );
  }

  if (step.kind === "waiting") {
    return (
      <div role="status" className="mt-4 border-2 border-void p-4">
        <p className="display text-3xl">Check your phone.</p>
        <p className="mt-2">
          Enter your M-Pesa PIN to pay <strong>{formatKsh(step.amount)}</strong>. This updates by itself once it goes
          through.
        </p>
        <p className="mt-3 text-sm text-dim-studio">No prompt after a minute? Start over and send it again.</p>
        <button
          type="button"
          onClick={() => setStep({ kind: "details", error: null, sending: false })}
          className="mt-3 min-h-11 text-sm font-semibold underline underline-offset-4"
        >
          Start over
        </button>
      </div>
    );
  }

  if (step.kind === "failed" || step.kind === "timeout") {
    return (
      <div role="alert" className="mt-4 border-2 border-void p-4">
        <p className="font-semibold">
          {step.kind === "failed" ? step.message : "We haven't heard back from M-Pesa yet."}
        </p>
        <p className="mt-2 text-sm">
          {step.kind === "failed" ? (
            "Nothing was charged. Your bag is still here."
          ) : (
            <>
              If money left your account, keep the M-Pesa SMS and{" "}
              <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                message us on Instagram
              </a>
              .
            </>
          )}
        </p>
        <button type="button" onClick={() => setStep({ kind: "details", error: null, sending: false })} className={`mt-4 ${primary}`}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={send} noValidate className="mt-4 flex flex-col gap-3">
      <p className="display text-3xl">Pay with M-Pesa</p>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Name
        <input className={field} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        M-Pesa number
        <input
          className={field}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0712 345 678"
          aria-describedby={`${id}-phone`}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <span id={`${id}-phone`} className="font-normal text-dim-studio">
          The payment prompt goes to this number.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Delivery address
        <textarea
          className={`${field} min-h-20 py-2`}
          autoComplete="street-address"
          placeholder="Area, street and building"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </label>
      <p className="text-sm text-dim-studio">
        Includes {formatKsh(site.deliveryFee)} delivery. We&apos;ll call your number to arrange it.
      </p>
      {step.error && (
        <p role="alert" className="border-2 border-void px-3 py-2 text-sm font-semibold">
          {step.error}
        </p>
      )}
      <button type="submit" disabled={step.sending} className={primary}>
        {step.sending ? "Sending prompt…" : `Send M-Pesa prompt for ${formatKsh(subtotal + site.deliveryFee)}`}
      </button>
      <button
        type="button"
        onClick={() => setStep({ kind: "bag" })}
        className="min-h-11 text-sm font-semibold underline underline-offset-4"
      >
        Back to bag
      </button>
    </form>
  );
}
