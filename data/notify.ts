// The request email Hugena sends to its own inbox when a customer sends a claim of their own.
// parseRequestNotice validates what the browser posts; requestEmail formats the message.
export type RequestNotice = {
  requestId: string;
  customerEmail: string;
  claim: { claim: string; context: string; constraints: string; decision: string; category: string };
  adviser: { id: string; name: string; role: string; provider: 'platform' | 'external'; feeCents: number };
  report: 'Brief report' | 'Comprehensive report';
  payment: { status: 'paid' | 'unpaid'; ref?: string; sessionId?: string };
};

export const emailPattern = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const idPattern = /^[\w-]{1,255}$/;
const text = (value: unknown, max: number, required = false) =>
  typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0);

export function parseRequestNotice(body: unknown): RequestNotice | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as RequestNotice;
  const c = b.claim, a = b.adviser, p = b.payment;
  if (!text(b.requestId, 255, true) || !idPattern.test(b.requestId)) return null;
  const customerEmail = typeof b.customerEmail === 'string' ? b.customerEmail.trim() : '';
  if (customerEmail.length > 254 || !emailPattern.test(customerEmail)) return null;
  if (!c || typeof c !== 'object' || !text(c.claim, 20000, true) || !text(c.context, 4000) || !text(c.constraints, 4000) || !text(c.decision, 4000) || !text(c.category, 60, true)) return null;
  if (!a || typeof a !== 'object' || !text(a.id, 120, true) || !text(a.name, 120, true) || !text(a.role, 120, true) || !['platform', 'external'].includes(a.provider) || !Number.isSafeInteger(a.feeCents) || a.feeCents <= 0) return null;
  if (b.report !== 'Brief report' && b.report !== 'Comprehensive report') return null;
  if (!p || typeof p !== 'object' || !['paid', 'unpaid'].includes(p.status)) return null;
  if ((p.ref !== undefined && !(typeof p.ref === 'string' && idPattern.test(p.ref))) || (p.sessionId !== undefined && !(typeof p.sessionId === 'string' && idPattern.test(p.sessionId)))) return null;
  return {
    requestId: b.requestId, customerEmail,
    claim: { claim: c.claim.trim(), context: c.context.trim(), constraints: c.constraints.trim(), decision: c.decision.trim(), category: c.category },
    adviser: { id: a.id, name: a.name, role: a.role, provider: a.provider, feeCents: a.feeCents },
    report: b.report,
    payment: { status: p.status, ...(p.ref ? { ref: p.ref } : {}), ...(p.sessionId ? { sessionId: p.sessionId } : {}) },
  };
}

const aud = (cents: number) => `A$${(cents / 100).toFixed(2)}`;
const escape = (value: string) => value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);

export type VerifiedPayment = { amountTotal: number; currency: string };

const paidAmount = (v: VerifiedPayment) => v.currency === 'AUD' ? aud(v.amountTotal) : `${(v.amountTotal / 100).toFixed(2)} ${v.currency}`;

export function requestEmail(n: RequestNotice, site: string, verified?: VerifiedPayment) {
  const session = n.payment.sessionId ? ` (session ${n.payment.sessionId})` : '';
  const paid = n.payment.status === 'paid'
    ? `${verified ? `Paid ${paidAmount(verified)} incl. any tax, verified with Stripe` : 'Paid through Stripe'}${session}. Client reference: ${n.payment.ref ?? n.requestId}.`
    : 'Not paid: Stripe checkout was off when this request was sent.';
  const rows: [string, string][] = [
    ['Request', n.requestId],
    ['Customer email', n.customerEmail],
    ['Category', n.claim.category],
    ['Adviser', `${n.adviser.name}, ${n.adviser.role} (${n.adviser.provider === 'platform' ? 'Hugena adviser' : 'external adviser'})`],
    ['Fee and report', `${aud(n.adviser.feeCents)} · ${n.report}`],
    ['Payment', paid],
  ];
  const sections: [string, string][] = [
    ['AI output to check', n.claim.claim],
    ['Background', n.claim.context || 'Not given'],
    ['Constraints', n.claim.constraints || 'Not given'],
    ['Decision that depends on it', n.claim.decision || 'Not given'],
  ];
  const subject = `New Hugena request: ${n.claim.category} · ${n.report} · ${n.adviser.name}`;
  const textBody = [
    `A customer sent a claim to check on ${site}.`, '',
    ...rows.map(([k, v]) => `${k}: ${v}`), '',
    ...sections.flatMap(([k, v]) => [`${k}:`, v, '']),
    `Reply to this email to reach the customer (${n.customerEmail}).`,
  ].join('\n');
  const html = `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0d0c14;line-height:1.5">
<p>A customer sent a claim to check on <a href="${escape(site)}">${escape(site)}</a>.</p>
<table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#6a6c78;vertical-align:top">${escape(k)}</td><td style="padding:4px 0">${escape(v)}</td></tr>`).join('')}</table>
${sections.map(([k, v]) => `<h3 style="margin:20px 0 6px;font-size:15px">${escape(k)}</h3><div style="white-space:pre-wrap;padding:12px 14px;background:#f7f7fa;border-radius:10px">${escape(v)}</div>`).join('\n')}
<p style="margin-top:20px;color:#6a6c78">Reply to this email to reach the customer.</p></div>`;
  return { subject, text: textBody, html };
}
