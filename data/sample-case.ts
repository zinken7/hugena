export type Claim = { claim: string; context: string; constraints: string; decision: string; category: string };
export type Review = { verdict: string; finding: string; evidence: string; next: string };

// One source for the example form, claim brief, report and downloadable PDFs.
// All rates below are invented for demonstration; they are not provider quotes.
export const sampleCase = {
  id: 'PP-001',
  date: '3 November 2026',
  claim: {
    claim: 'This app can support 5,000 monthly active users for under A$50/month.',
    context: 'A founder is planning a Next.js community app with hosted authentication, a database and file storage. The AI estimate specifies 5,000 monthly active users but supplies no request volume, file sizes, provider quotes or load-test results.',
    constraints: 'Monthly infrastructure budget: strictly below A$50, including GST. Scope: app hosting, authentication, database, file storage and outbound data transfer. Excludes development, domain registration, transactional email and paid AI APIs.',
    decision: 'Can I commit to this architecture and its monthly budget before launching?',
    category: 'Cost estimate',
  } satisfies Claim,
  review: {
    verdict: 'Insufficient evidence',
    finding: 'A user count does not establish a monthly bill or prove capacity. Under the invented rates in this example, low usage costs A$41.80 per month including GST, while higher usage costs A$85.80. Both scenarios have 5,000 monthly active users. The claim is possible in one model but is not established for the planned app.',
    evidence: 'E1: the sample claim and founder brief. E2: two explicitly assumed usage scenarios. E3: an invented rate card, used only to demonstrate the calculation. No provider quote, production measurements or load test was supplied.',
    next: 'Measure requests, stored data and outbound transfer in a pilot. Obtain dated provider quotes, calculate the full bill including GST and verify capacity before committing to the A$50 budget.',
  } satisfies Review,
  users: 5000,
  budget: 50,
  gst: 0.10,
  rates: { base: 20, requestsPerMillion: 2, storagePerGb: 0.20, transferPerGb: 0.10 },
  scenarios: [
    { id: 'low', label: 'Low usage', requestsPerUser: 100, storageGb: 10, transferGb: 150 },
    { id: 'high', label: 'Higher usage', requestsPerUser: 1000, storageGb: 40, transferGb: 400 },
  ],
} as const;

export const aud = (amount: number) => `A$${amount.toFixed(2)}`;
export const sampleScenarios = sampleCase.scenarios.map(s => {
  const requests = sampleCase.users * s.requestsPerUser;
  const costs = [sampleCase.rates.base, requests / 1_000_000 * sampleCase.rates.requestsPerMillion,
    s.storageGb * sampleCase.rates.storagePerGb, s.transferGb * sampleCase.rates.transferPerGb];
  const subtotal = costs.reduce((sum, cost) => sum + cost, 0);
  const tax = Math.round(subtotal * sampleCase.gst * 100) / 100;
  return { ...s, requests, costs, subtotal, tax, total: Math.round((subtotal + tax) * 100) / 100 };
});
