# Hugena

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
- [Adviser workspace](http://localhost:3000/advisers)

For the production preview on port 3100, run `npm run build` followed by `npm run start -- --port 3100`, then open:

- [Preview homepage](http://localhost:3100/)
- [Preview customer workspace](http://localhost:3100/review)
- [Preview adviser workspace](http://localhost:3100/advisers)

These links work on the computer running the local server. They are not public deployment links. If the terminal reports a different port, use that port instead.

## Separate paths

- `/`: product introduction, how it works, and separate entry points for customers and advisers.
- `/review`: customer workspace. Both workspaces show a "Demo" switch to the other side so one person can present the whole flow. Share a claim, compare adviser sample opinions and prices, confirm the request, track its status, and read the published report. Customers do not see assessment editors, adviser creation, or commission controls.
- `/advisers`: adviser workspace (`/reviewers` redirects here). The adviser is "signed in" through a demo switcher, because the prototype has no accounts. **My requests** lists only the requests customers sent to that adviser; **My profile** shows how customers see them and the terms of their offer. Independent advisers create their own profile with **Join as an external adviser**. Writing an assessment shows which report the customer paid for and the adviser's earnings, which are read-only: payment status belongs to the payment system, not the adviser.

The homepage's "Verify a claim" and "Get started" buttons open `/review?new=1`, which always starts a blank claim (the app keeps one request at a time, so this replaces the previous one). Other links to `/review`, such as "Customer portal", reopen the current request.

In the adviser workspace an adviser can import a report file (PDF or Word, up to 10 MB) while writing an assessment. With a file attached, only the verdict and key finding are required. The file is stored in the browser's IndexedDB (`app/report-files.tsx`); the assessment keeps its name and size, and the customer's report page offers it for download.

Submission ends on a read-only customer status page. A report becomes available only after publication in the adviser workspace. The draft assessment is saved separately from the published report. Navigate back to the customer portal or reload to see the publication.

"Use the example" fills the form with the hosting-cost claim from `data/sample-case.ts`. That claim has prepared reports: after the customer submits it, the status page shows "Your request is with your adviser." for two seconds and then opens the report. The adviser's fee decides which one (`reportFormat` in `data/advisers.ts`): fees under A$2 get the brief report (`app/reports/brief-report.tsx`), and fees of A$2 or more get the comprehensive report (`app/reports/comprehensive-report.tsx`). Both read their figures from `data/sample-case.ts` and offer a downloadable PDF. Any other claim waits on the status page until an adviser publishes an assessment in the adviser workspace.

Adviser opinions relate to the shared hosting-cost example, not automatically to the customer's claim. Custom claims never receive an automatic fabricated verdict.

To refresh the two PDFs after changing the example, start the production build on port 3100 and run `node scripts/export-sample-pdfs.mjs` (set `PLAYWRIGHT_CHANNEL=chrome` if Microsoft Edge isn't installed, and `SAMPLE_BASE_URL` for another port). The script walks the customer flow once per report type, checks that no page content overlaps its footer, and writes `public/samples/hugena-report-HG-001-brief.pdf` and `-comprehensive.pdf` (with copies in `output/pdf/`). Browser tests accept `PLAYWRIGHT_BASE_URL`. Render and review the PDFs before shipping.

## Chrome extension

`extension/` holds a Manifest V3 extension that adds a paper-plane button at the end of the buttons under each AI answer on claude.ai, chatgpt.com and gemini.google.com. Clicking it opens `/review` in a new tab with the whole answer in the claim field and a "Sent from …" note. The answer travels in the URL fragment, which isn't sent to the server, and Hugena removes it from the address bar after reading it (`data/import.ts`). Load it with `chrome://extensions` → Developer mode → Load unpacked → `extension/`; see `extension/README.md` for the Hugena address setting and how the button finds answers.

## Commercial model

Standard advisers are supplied by Hugena. External advisers pay 10% of their fee on a completed, paid case and retain 90%. A$2 allocates A$0.20 to Hugena and A$1.80 to the adviser. Integer cents and nearest-cent commission rounding preserve the fee total. This is not an added customer charge. The commercial model appears in adviser tools; customers see the total review price.

## Payments (Stripe Checkout)

Customers pay through Stripe Checkout before their own claim reaches the adviser. The "Use the example" claim skips Stripe: it asks for no email or payment and opens its prepared report, so the demo works without paying. `app/api/checkout/route.ts` creates a Checkout Session for the chosen adviser and returns Stripe's hosted payment page.

- **Pricing is server-side.** Listed advisers (Alex, Sam, Jordan and Taylor) are charged their fee from `catalogFees` in `data/advisers.ts`, whatever the browser sends. Advisers who signed up in a browser exist only there, so their profile fee is used within Stripe's limits (A$0.50 to A$999,999.99) and the session's metadata says `price_source: profile`.
- The session's line item names the report and adviser (for example "Hugena comprehensive report by Taylor Brooks"). `client_reference_id` and metadata carry the request id, adviser and report so each payment can be matched in Stripe.
- Stripe returns the customer to `/review?paid={CHECKOUT_SESSION_ID}` or `/review?cancelled=1`. The request is stored as pending before checkout and only sent after the paid return.
- Before emailing a paid request, `/api/requests` retrieves the Checkout Session from Stripe and checks that it is paid and belongs to that request. With checkout on, unpaid requests are refused.

Environment variables:

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_STRIPE_CHECKOUT` | build | `live` or `test` shows "Pay … with Stripe" for the customer's own claims; unset keeps the unpaid demo submission. The example claim always uses the demo submission |
| `STRIPE_SECRET_KEY` | server, secret | A restricted key with **Checkout Sessions: Write** |
| `STRIPE_MANAGED_PAYMENTS` | server | `true` lets Stripe act as merchant of record and handle tax |
| `STRIPE_AUTOMATIC_TAX` | server | `true` uses Stripe Tax instead (needs your GST registration added in Stripe Tax) |
| `STRIPE_TAX_CODE` | server | Product tax code for the line item, e.g. `txcd_20030000` |

Hugena currently runs with neither option: customers pay the adviser fee with no tax added, and the confirm step says so. If you turn on Managed Payments or Stripe Tax, update that wording in `app/workspace.tsx`.

Managed Payments only covers fully automated digital products; Stripe's eligibility rules exclude professional services and anything with human intervention, which describes an adviser's review. Check with Stripe and your accountant before relying on it.

The success redirect is trusted only after the server confirms the session with Stripe. There is still no webhook, so a customer who pays and closes the tab before returning has paid without their request being emailed; their payment shows in Stripe with the request id.

## Request emails (Resend)

When a customer sends a claim of their own (not the "Use the example" claim), the browser posts it to `/api/requests`, which emails Hugena's inbox through [Resend](https://resend.com). The confirm step asks these customers for the email address their report should go to; it is the email's reply-to address and is passed to Stripe Checkout as the customer email. Paid requests are emailed after Stripe redirects back, with the Stripe session and `client_reference_id`, so you can match the payment.

- Server environment variables: `RESEND_API_KEY` (secret), `HUGENA_NOTIFY_EMAIL` (where requests go; currently `contact@coriva.tech`, the Resend account's own address) and optionally `HUGENA_NOTIFY_FROM` (default `Hugena <onboarding@resend.dev>`).
- Resend's shared `onboarding@resend.dev` sender only delivers to the email address that owns the Resend account. To send to another inbox, verify your domain in Resend and set `HUGENA_NOTIFY_FROM`, for example `Hugena <hugena@coriva.tech>`.
- Each request is emailed once: the browser remembers that it was sent, and the request id is the Resend idempotency key, so a retry doesn't send a duplicate. If sending fails, the status page says so and offers to try again.
- Without `RESEND_API_KEY` or `HUGENA_NOTIFY_EMAIL` the endpoint answers 503 and nothing is sent. The endpoint rejects malformed bodies and posts from other sites, but has no rate limit.

## Deploy on Vercel

```sh
npx vercel@latest login
npx vercel@latest link --yes --project hugena
printf '%s' 'live' | npx vercel@latest env add NEXT_PUBLIC_STRIPE_CHECKOUT production
printf '%s' '<restricted key>' | npx vercel@latest env add STRIPE_SECRET_KEY production --sensitive
printf '%s' 'contact@coriva.tech' | npx vercel@latest env add HUGENA_NOTIFY_EMAIL production
printf '%s' '<Resend API key>' | npx vercel@latest env add RESEND_API_KEY production --sensitive
npx vercel@latest deploy --prod --yes
```

`.vercelignore` keeps tests, the extension and local artifacts out of the upload. Changing `NEXT_PUBLIC_STRIPE_CHECKOUT` needs a new deployment because the value is built into the page.

## Verification

```sh
npm run build
npm run typecheck
node --test tests/advisers.test.mjs tests/import.test.mjs
```

With Microsoft Edge installed, start `npm run start -- --port 3100`, then run `npx playwright test`. The suite covers separate customer/adviser controls, advisers seeing only their own requests, submission, draft restoration, publication, report viewing, external-adviser onboarding, commission, mobile overflow, and automated WCAG A/AA checks on the three entry pages. Screenshot artifacts are ignored by Git. Automated checks are not a complete accessibility certification.

## Production boundary

This is a polished frontend preview, not a live marketplace. Separate routes provide UX separation, not authentication or authorization. The same device can open either portal. Profiles, availability, assessments and payment statuses are demonstration data. No real adviser is contacted or paid.

The single current case and assessment draft are stored in `pitchproof-claims-v2`; external profiles use `pitchproof-external-advisers-v1`. Starting another claim asks before replacing the current request. Original idea-demo data remains untouched. Storage failures show a notice.

Before public launch, add authenticated customer/adviser accounts, server-side ownership and permissions, a persistent multi-case database, real availability and messaging, verified reviewer credentials, notifications, and trusted payment/commission processing. Browser payment flags must never trigger real transfers.
