export type Specialty = 'business' | 'technical' | 'ux';
export type Adviser = {
  id: string; name: string; role: string; initials: string; expertise: string[];
  description: string; color: string; specialty: Specialty;
  provider: 'platform' | 'external'; feeCents: number;
};
export type CaseStatus = 'open' | 'completed' | 'paid';
export function isAdviser(value: unknown): value is Adviser {
  if (!value || typeof value !== 'object') return false;
  const a = value as Adviser;
  return ['id', 'name', 'role', 'initials', 'description'].every(key => typeof a[key as keyof Adviser] === 'string' && String(a[key as keyof Adviser]).trim().length > 0)
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
export const externalExample: Adviser = {
  id: 'external-taylor', name: 'Taylor Brooks', role: 'Independent Business Adviser', initials: 'TB',
  expertise: ['Go-to-market', 'Pricing strategy'], description: 'Explore your first customers, test your pricing, and plan a focused launch with an independent adviser.',
  color: 'purple', specialty: 'business', provider: 'external', feeCents: 20000,
};
