# PitchProof

Human verification for AI-generated claims. A responsive Next.js prototype.

## Run

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

For production rendering: `npm run build` then `npm start`.

## Customer journey

1. Share one AI-generated claim, its context, constraints and the decision at stake.
2. Compare standard and external advisers. Read short sample opinions about the hosting-cost example before choosing an adviser.
3. Confirm the chosen adviser, scope and fee. Create a local demo request.
4. The request remains awaiting review. The simulated adviser desk accepts a conclusion, finding, evidence and next step.
5. View or print the scoped report. The sample report remains clearly separate from custom submissions.

The concrete homepage example asks whether 5,000 active users establish a hosting cost below A$50/month. The illustrative assessment explains the missing usage assumptions; it does not claim a verified current provider price.

## Adviser network

Standard advisers are supplied by PitchProof. External adviser profiles can be added with expertise, a biography, fee and sample opinion. All availability labels mean available for demo selection, not live online status.

For external advisers only, a completed and paid case allocates 10% of the agreed fee to PitchProof and 90% to the adviser. A$200 becomes A$20 commission and A$180 retained. Commission uses integer cents and rounds to the nearest cent. It is deducted from the adviser fee, not added to the client price. Completion/payment status is independent of the report conclusion: an inconclusive finding can still be a delivered review.

## Persistence and limits

The current claim, chosen adviser, request, assessment and payment simulation are saved under `pitchproof-claims-v2`. External profiles use `pitchproof-external-advisers-v1`. The original idea-review prototype's data is not migrated or deleted. One current case is stored; this is not a multi-case ledger. Storage failures show a notice and allow continued in-memory use.

No real adviser is contacted. No account, payment, automatic verification, live opinion or independently verified credential is created. Reports entered at the adviser desk are user-entered demo assessments. Production launch requires authenticated customer/adviser roles, persistent cases, genuine adviser availability and replies, verified credentials, payment processing and trusted settlement events.

## Verification

```sh
npm run build
npm run typecheck
node --test tests/advisers.test.mjs
```

Browser tests use installed Microsoft Edge. Start `npm run start -- --port 3100` in another terminal, then run `npx playwright test`. Tests cover external profile/opinion creation, adviser choice, request confirmation, review/report flow, persistence, commission, and mobile overflow. Screenshots are saved to ignored `artifacts/`.
