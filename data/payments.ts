// Payments run through Stripe Checkout: app/api/checkout/route.ts creates a session priced for the chosen adviser.
// NEXT_PUBLIC_STRIPE_CHECKOUT ('live' or 'test') turns the "Pay with Stripe" step on. Unset keeps the unpaid demo
// submission. Stripe sends the customer back to /review?paid={CHECKOUT_SESSION_ID} or /review?cancelled=1.
export type Payment = { status: 'pending' | 'paid'; ref: string; sessionId?: string };
export type CheckoutMode = 'live' | 'test';

export const parseCheckoutMode = (raw: string | undefined): CheckoutMode | null => raw === 'live' || raw === 'test' ? raw : null;
export const checkoutMode = parseCheckoutMode(process.env.NEXT_PUBLIC_STRIPE_CHECKOUT);

export function isPayment(value: unknown): value is Payment {
  if (!value || typeof value !== 'object') return false;
  const p = value as Payment;
  return (p.status === 'pending' || p.status === 'paid') && typeof p.ref === 'string' && /^[\w-]{1,200}$/.test(p.ref)
    && (p.sessionId === undefined || (typeof p.sessionId === 'string' && /^[\w-]{1,255}$/.test(p.sessionId)));
}
