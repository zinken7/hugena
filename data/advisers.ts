export type Specialty = 'business' | 'technical' | 'ux';
export type Adviser = {
  opinion?: string; id: string; name: string; role: string; initials: string; expertise: string[];
  description: string; color: string; specialty: Specialty;
  provider: 'platform' | 'external'; feeCents: number;
};
export type CaseStatus = 'open' | 'completed' | 'paid';
export function isAdviser(value: unknown): value is Adviser {
  if (!value || typeof value !== 'object') return false;
  const a = value as Adviser;
  return ['id', 'name', 'role', 'initials', 'description'].every(key => typeof a[key as keyof Adviser] === 'string' && String(a[key as keyof Adviser]).trim().length > 0)
    && (a.opinion === undefined || typeof a.opinion === 'string')
    && ['peach', 'blue', 'purple'].includes(a.color)
    && ['business', 'technical', 'ux'].includes(a.specialty)
    && ['platform', 'external'].includes(a.provider)
    && Array.isArray(a.expertise) && a.expertise.every(tag => typeof tag === 'string')
    && Number.isSafeInteger(a.feeCents) && a.feeCents > 0 && a.feeCents <= 100000000;
}
export function settlement(adviser: Pick<Adviser, 'provider' | 'feeCents'>, status: CaseStatus) {
  const commissionCents = adviser.provider === 'external' && status === 'paid' ? Math.round(adviser.feeCents / 10) : 0;
  return { commissionCents, adviserCents: status === 'paid' ? adviser.feeCents - commissionCents : 0 };
}
export const money = (cents: number) => `A$${(cents / 100).toFixed(2)}`;
// Every Hugena adviser charges this fee per review.
export const platformFeeCents = 100;
export const externalExample: Adviser = {
  id: 'external-taylor', name: 'Taylor Brooks', role: 'Independent Business Adviser', initials: 'TB',
  expertise: ['Go-to-market', 'Pricing strategy'], description: 'Independent adviser for finding first customers, setting prices and planning a launch.',
  color: 'purple', specialty: 'business', provider: 'external', feeCents: 200,
};

// The fees the server charges at checkout, by adviser id. The browser's copy of a fee is never trusted for these.
export const catalogFees: Record<string, number> = { business: platformFeeCents, technical: platformFeeCents, ux: platformFeeCents, [externalExample.id]: externalExample.feeCents };

// The fee sets the report: under A$2 gets the brief report, A$2 or more the comprehensive report.
export const comprehensiveReportFromCents = 200;
export const reportFormat = (feeCents: number) => feeCents >= comprehensiveReportFromCents
  ? { kind: 'comprehensive', label: 'Comprehensive report' } as const
  : { kind: 'brief', label: 'Brief report' } as const;
