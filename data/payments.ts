// Stripe Payment Links, one per adviser fee. Set NEXT_PUBLIC_STRIPE_PAYMENT_LINKS at build time to a
// JSON object keyed by the fee in cents, e.g. {"100":"https://buy.stripe.com/…","200":"https://buy.stripe.com/…"}.
// A fee without a link falls back to the unpaid demo submission.
// In Stripe, set each link's "After payment" redirect to <site>/review?paid={CHECKOUT_SESSION_ID}.
export type Payment = { status: 'pending' | 'paid'; ref: string; sessionId?: string };

export function parsePaymentLinks(raw: string | undefined): Record<string, string> {
  try {
    const value: unknown = JSON.parse(raw || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([fee, url]) => /^\d+$/.test(fee) && typeof url === 'string' && /^https:\/\/buy\.stripe\.com\/[\w-]+$/.test(url)));
  } catch {
    return {};
  }
}

const links = parsePaymentLinks(process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINKS);

export const paymentLinkFor = (feeCents: number): string | null => links[String(feeCents)] ?? null;
export const isTestLink = (url: string) => /^https:\/\/buy\.stripe\.com\/test_/.test(url);

// client_reference_id lets the merchant match the Stripe payment to the Hugena request;
// prefilled_email saves the customer typing their email again at checkout.
export function checkoutUrl(link: string, ref: string, email?: string) {
  const url = new URL(link);
  url.searchParams.set('client_reference_id', ref);
  if (email) url.searchParams.set('prefilled_email', email);
  return url.toString();
}

export function isPayment(value: unknown): value is Payment {
  if (!value || typeof value !== 'object') return false;
  const p = value as Payment;
  return (p.status === 'pending' || p.status === 'paid') && typeof p.ref === 'string' && /^[\w-]{1,200}$/.test(p.ref)
    && (p.sessionId === undefined || (typeof p.sessionId === 'string' && /^[\w-]{1,255}$/.test(p.sessionId)));
}
