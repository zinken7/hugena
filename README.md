# PitchProof

A focused human review of an AI-generated claim. The homepage uses a large, direct hero and a claim-to-review example.

## Run locally

Use Node.js 24:

```sh
npm ci
npm run dev
```

Production rendering: `npm run build`, then `npm start`.

## Local links

After `npm run dev`, open:

- [Homepage](http://localhost:3000/)
- [Customer workspace](http://localhost:3000/review)
- [Reviewer workspace](http://localhost:3000/reviewers)

For the production preview on port 3100, run `npm run build` followed by `npm run start -- --port 3100`, then open:

- [Preview homepage](http://localhost:3100/)
- [Preview customer workspace](http://localhost:3100/review)
- [Preview reviewer workspace](http://localhost:3100/reviewers)

These links work on the computer running the local server. They are not public deployment links. If the terminal reports a different port, use that port instead.

## Separate paths

- `/`: brief product introduction, three-step explanation, and separate customer/reviewer entry points.
- `/review`: customer workspace. Share a claim, compare adviser sample opinions and prices, confirm the request, track its status, and read the published report. Customers do not see assessment editors, adviser creation, or commission controls.
- `/reviewers`: reviewer workspace. View assigned requests, manage adviser profiles, draft and publish an evidence-based assessment, and inspect simulated commission. Reviewers do not choose advisers from this workspace.

Submission ends on a read-only customer status page. A report becomes available only after publication in the reviewer workspace. The draft assessment is saved separately from the published report. Navigate back to the customer portal or reload to see the publication.

The sample report is illustrative. Adviser opinions relate to the shared hosting-cost example, not automatically to the customer's claim. Custom claims never receive an automatic fabricated verdict.

## Commercial model

Standard advisers are supplied by PitchProof. External advisers pay 10% of their fee on a completed, paid case and retain 90%. A$200 allocates A$20 to PitchProof and A$180 to the adviser. Integer cents and nearest-cent commission rounding preserve the fee total. This is not an added customer charge. The commercial model appears in reviewer tools; customers see the total review price.

## Verification

```sh
npm run build
npm run typecheck
node --test tests/advisers.test.mjs
```

With Microsoft Edge installed, start `npm run start -- --port 3100`, then run `npx playwright test`. The suite covers separate customer/reviewer controls, submission, draft restoration, publication, report viewing, external-adviser onboarding, commission, mobile overflow, and automated WCAG A/AA checks on the three entry pages. Screenshot artifacts are ignored by Git. Automated checks are not a complete accessibility certification.

## Production boundary

This is a polished frontend preview, not a live marketplace. Separate routes provide UX separation, not authentication or authorization. The same device can open either portal. Profiles, availability, assessments and payment statuses are demonstration data. No real adviser is contacted or paid.

The single current case and assessment draft are stored in `pitchproof-claims-v2`; external profiles use `pitchproof-external-advisers-v1`. Starting another claim asks before replacing the current request. Original idea-demo data remains untouched. Storage failures show a notice.

Before public launch, add authenticated customer/adviser accounts, server-side ownership and permissions, a persistent multi-case database, real availability and messaging, verified reviewer credentials, notifications, and trusted payment/commission processing. Browser payment flags must never trigger real transfers.
