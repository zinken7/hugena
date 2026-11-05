import { catalogFees, reportFormat } from '../../../data/advisers';
import { chargeFor, checkoutSessionParams, parseCheckoutRequest } from '../../../data/checkout';

// Creates a Stripe Checkout Session for one request, priced from the server's adviser catalogue.
// Needs STRIPE_SECRET_KEY. STRIPE_MANAGED_PAYMENTS=true or STRIPE_AUTOMATIC_TAX=true choose how tax is handled;
// STRIPE_TAX_CODE sets the product tax code.
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: 'invalid' }, { status: 400 }); }
  const checkout = parseCheckoutRequest(body);
  if (!checkout) return Response.json({ error: 'invalid' }, { status: 400 });
  const charge = chargeFor(checkout.adviser, catalogFees);
  if (!charge) return Response.json({ error: 'unknown_adviser' }, { status: 400 });

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return Response.json({ error: 'not_configured' }, { status: 503 });

  const params = checkoutSessionParams(checkout, charge, {
    origin: new URL(request.url).origin,
    reportLabel: reportFormat(charge.feeCents).label,
    managedPayments: process.env.STRIPE_MANAGED_PAYMENTS === 'true',
    automaticTax: process.env.STRIPE_AUTOMATIC_TAX === 'true',
    taxCode: process.env.STRIPE_TAX_CODE || undefined,
  });
  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': `hugena-checkout-${checkout.requestId}` },
    body: params,
  });
  const session = await response.json().catch(() => null) as { id?: string; url?: string; error?: unknown } | null;
  if (!response.ok || typeof session?.url !== 'string') {
    console.error('Stripe refused the Checkout Session', response.status, JSON.stringify(session?.error ?? session).slice(0, 500));
    return Response.json({ error: 'checkout_failed' }, { status: 502 });
  }
  return Response.json({ id: session.id, url: session.url });
}
