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

The sample claim at `/example` and its ready-made nine-page report at `/example/report` share `data/sample-case.ts` with the form's "Use the example" action. Both documents have downloadable PDFs. The format takes inspiration from the supplied reference PDF: dark covers, large headings, comparison charts, evidence cards and short numbered sections. The content is specific to the hosting-cost claim; all usage and price assumptions are explicitly fictional. The two scenarios calculate A$41.80 and A$85.80 including assumed GST, supporting an "Insufficient evidence" finding. Opening the sample never overwrites a customer draft or publishes an assessment for a custom claim.

Adviser opinions relate to the shared hosting-cost example, not automatically to the customer's claim. Custom claims never receive an automatic fabricated verdict.

A second example, PP-002, is available at `/example/quick` with its two-page report at `/example/quick/report`. Its total report price is A$10.00, separate from development and hosting costs. The service-booking MVP has five eight-hour working days with named tasks, hour estimates and daily acceptance checks: 36 hours of planned work plus a four-hour fix reserve. The estimates are illustrative and do not constitute a delivery commitment. The original nine-page report remains available.

Export only the new pair with `node scripts/export-sample-pdfs.mjs --case=PP-002`. Set `SAMPLE_BASE_URL` if the preview uses a different port; browser tests accept `PLAYWRIGHT_BASE_URL`. Restart the preview after first creating public PDF files so it discovers the download paths.

To refresh downloadable PDFs after changing the sample, start the production build on port 3100 and run `node scripts/export-sample-pdfs.mjs`. The script prints the same page components as the website, checks footer overlap, and writes the served files to `public/samples/` (with delivery copies in `output/pdf/`). Render and visually review the PDFs before shipping. The source reference PDF is a format example only; its business figures and branding are not reused.

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
