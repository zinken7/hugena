import { checkPaidSession } from '../../../data/checkout';
import { type VerifiedPayment, parseRequestNotice, requestEmail } from '../../../data/notify';
import { parseCheckoutMode } from '../../../data/payments';

// Emails Hugena's inbox when a customer sends a claim of their own.
// Needs RESEND_API_KEY and HUGENA_NOTIFY_EMAIL; HUGENA_NOTIFY_FROM is optional.
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) return Response.json({ error: 'forbidden' }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: 'invalid' }, { status: 400 }); }
  const notice = parseRequestNotice(body);
  if (!notice) return Response.json({ error: 'invalid' }, { status: 400 });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.HUGENA_NOTIFY_EMAIL;
  if (!key || !to) return Response.json({ error: 'not_configured' }, { status: 503 });

  // With checkout on, only requests Stripe confirms as paid are emailed.
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  let verified: VerifiedPayment | undefined;
  if (notice.payment.status === 'paid') {
    if (!stripeKey || !notice.payment.sessionId) return Response.json({ error: 'payment_not_verified' }, { status: 402 });
    const lookup = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(notice.payment.sessionId)}`, { headers: { Authorization: `Bearer ${stripeKey}` } });
    const check = checkPaidSession(lookup.ok ? await lookup.json().catch(() => null) : null, notice.requestId);
    if (!check.ok) {
      console.error('Stripe did not confirm payment for request', notice.requestId, lookup.status, check.reason);
      return Response.json({ error: 'payment_not_verified' }, { status: 402 });
    }
    verified = { amountTotal: check.amountTotal, currency: check.currency };
  } else if (stripeKey && parseCheckoutMode(process.env.NEXT_PUBLIC_STRIPE_CHECKOUT)) {
    return Response.json({ error: 'payment_required' }, { status: 402 });
  }

  const email = requestEmail(notice, new URL(request.url).origin, verified);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    // The idempotency key stops a retried request from sending the same email twice.
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `hugena-${notice.requestId}` },
    body: JSON.stringify({ from: process.env.HUGENA_NOTIFY_FROM || 'Hugena <onboarding@resend.dev>', to: [to], reply_to: notice.customerEmail, subject: email.subject, text: email.text, html: email.html }),
  });
  if (!response.ok) {
    console.error('Resend refused the request email', response.status, (await response.text()).slice(0, 500));
    return Response.json({ error: 'send_failed' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
