// Stripe Checkout for Hugena requests. The server prices each session from its own adviser catalogue,
// so a customer can't lower the fee from the browser. These are pure functions; the API routes call Stripe.
export type CheckoutRequest = {
  requestId: string;
  customerEmail?: string;
  category: string;
  example: boolean;
  adviser: { id: string; name: string; provider: 'platform' | 'external'; feeCents: number };
};
export type Charge = { feeCents: number; source: 'catalog' | 'profile' };

export const minChargeCents = 50; // Stripe's minimum charge in AUD
export const maxChargeCents = 99_999_999;
const idPattern = /^[\w-]{1,200}$/;
const emailPattern = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

export function parseCheckoutRequest(body: unknown): CheckoutRequest | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as CheckoutRequest;
  const a = b.adviser;
  if (typeof b.requestId !== 'string' || !idPattern.test(b.requestId)) return null;
  if (typeof b.category !== 'string' || !b.category.trim() || b.category.length > 60) return null;
  if (typeof b.example !== 'boolean') return null;
  const email = typeof b.customerEmail === 'string' ? b.customerEmail.trim() : '';
  if (email && (email.length > 254 || !emailPattern.test(email))) return null;
  if (!a || typeof a !== 'object' || typeof a.id !== 'string' || !idPattern.test(a.id) || typeof a.name !== 'string' || !a.name.trim() || a.name.length > 120
    || (a.provider !== 'platform' && a.provider !== 'external') || !Number.isSafeInteger(a.feeCents)) return null;
  return { requestId: b.requestId, category: b.category.trim(), example: b.example, ...(email ? { customerEmail: email } : {}),
    adviser: { id: a.id, name: a.name.trim(), provider: a.provider, feeCents: a.feeCents } };
}

// Listed advisers are charged their catalogue fee whatever the browser sent. Advisers who signed up in a
// browser only exist there, so their profile fee is used, within Stripe's limits, and marked as such.
export function chargeFor(adviser: CheckoutRequest['adviser'], catalog: Record<string, number>): Charge | null {
  const listed = catalog[adviser.id];
  if (listed !== undefined) return { feeCents: listed, source: 'catalog' };
  if (adviser.provider !== 'external' || !adviser.id.startsWith('external-')) return null;
  if (adviser.feeCents < minChargeCents || adviser.feeCents > maxChargeCents) return null;
  return { feeCents: adviser.feeCents, source: 'profile' };
}

export type SessionOptions = { origin: string; reportLabel: string; managedPayments: boolean; automaticTax: boolean; taxCode?: string };

export function checkoutSessionParams(req: CheckoutRequest, charge: Charge, opts: SessionOptions) {
  const p = new URLSearchParams();
  const item = 'line_items[0]';
  p.set('mode', 'payment');
  p.set('submit_type', 'pay');
  p.set(`${item}[quantity]`, '1');
  p.set(`${item}[price_data][currency]`, 'aud');
  p.set(`${item}[price_data][unit_amount]`, String(charge.feeCents));
  p.set(`${item}[price_data][tax_behavior]`, 'exclusive');
  p.set(`${item}[price_data][product_data][name]`, `Hugena ${opts.reportLabel.toLowerCase()} by ${req.adviser.name}`);
  p.set(`${item}[price_data][product_data][description]`, `Expert review of an AI answer · ${req.category}`);
  if (opts.taxCode) p.set(`${item}[price_data][product_data][tax_code]`, opts.taxCode);
  p.set('success_url', `${opts.origin}/review?paid={CHECKOUT_SESSION_ID}`);
  p.set('cancel_url', `${opts.origin}/review?cancelled=1`);
  p.set('client_reference_id', req.requestId);
  if (req.customerEmail) p.set('customer_email', req.customerEmail);
  const metadata: Record<string, string> = { request_id: req.requestId, adviser_id: req.adviser.id, adviser_name: req.adviser.name,
    report: opts.reportLabel, category: req.category, price_source: charge.source, example: req.example ? 'yes' : 'no' };
  for (const [key, value] of Object.entries(metadata)) p.set(`metadata[${key}]`, value.slice(0, 500));
  // Managed Payments computes tax itself and rejects automatic_tax, so the two are exclusive. It is always set
  // explicitly: an account can switch Managed Payments on by default, and then it would apply to every session.
  p.set('managed_payments[enabled]', opts.managedPayments ? 'true' : 'false');
  if (!opts.managedPayments && opts.automaticTax) p.set('automatic_tax[enabled]', 'true');
  return p;
}

export type PaidSession = { ok: true; amountTotal: number; currency: string; customerEmail?: string } | { ok: false; reason: string };

// A request counts as paid only when Stripe says this session is paid and it belongs to this request.
export function checkPaidSession(session: unknown, requestId: string): PaidSession {
  if (!session || typeof session !== 'object') return { ok: false, reason: 'session_not_found' };
  const s = session as { object?: string; mode?: string; payment_status?: string; client_reference_id?: string | null; amount_total?: number | null; currency?: string | null; customer_details?: { email?: string | null } | null };
  if (s.object !== 'checkout.session' || s.mode !== 'payment') return { ok: false, reason: 'not_a_payment_session' };
  if (s.client_reference_id !== requestId) return { ok: false, reason: 'different_request' };
  if (s.payment_status !== 'paid') return { ok: false, reason: 'not_paid' };
  return { ok: true, amountTotal: s.amount_total ?? 0, currency: (s.currency ?? 'aud').toUpperCase(), ...(s.customer_details?.email ? { customerEmail: s.customer_details.email } : {}) };
}
