# PitchProof

**Challenge your idea before the real world does.**

A responsive, four-screen MVP built with Next.js, TypeScript, Tailwind CSS, and Lucide icons. All interactions are local; no accounts, database, payment integration, or AI service is required.

## Run locally

Use Node.js 20.9 or newer (Node.js 24 recommended) and npm.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Installing dependencies requires internet access; running the prototype does not require external services.

For a production build:

```bash
npm run build
npm start
```

Type-check with `npm run typecheck`.

## Two-minute demo

1. On Home, click **Get Your Idea Reviewed**.
2. Enter a project name, problem, solution, and target users, or click **Use a sample idea**. Submit the form.
3. Choose a standard PitchProof adviser or an external adviser. Filter profiles or add an external demo profile with expertise, biography, and a case fee. Prices are illustrative; nothing is charged.
4. Read the clearly labelled example report and tick the improvement tasks. Refresh to demonstrate saved progress. Use **Change reviewer** to explore a different perspective.

The Home navigation's **Example review** opens the sample project and resets its task checklist. **Start a new idea** clears the current project and checklist. The prototype stores one project at a time. Drafts, reviewer choice, current screen, and task completion are saved under `pitchproof-demo-v1` in localStorage; clear that key in browser developer tools to reset everything. If browser storage is blocked, the app continues in memory and displays a notice.

## Source map

- `app/page.tsx` — four-screen interactive flow and local persistence
- `app/globals.css` — responsive visual design and Tailwind entry point
- `app/layout.tsx` — document metadata and application shell
- `data/demo.json` — fictional profiles, sample idea, and three prewritten reports

Review content is selected by reviewer type, not generated from the submitted idea. All reviewers are fictional. No submission is sent anywhere. System fonts and initials avatars keep the experience self-contained.

## Adviser network and success commission

Standard advisers are supplied by PitchProof and are exempt from the external-adviser commission. External advisers contribute 10% of their agreed fee for a successful case and retain 90%; this is not an additional client charge. The prototype assumes success means a completed, paid engagement. An A$200 external case therefore allocates A$20 to PitchProof and A$180 to the adviser. Values use integer cents, with commission rounded to the nearest cent.

On the feedback screen, use **Demo case status** to move between in progress, completed awaiting payment, and successful (completed and paid). Only the last status incurs commission. Checklist completion is independent of case success. Changing advisers, resubmitting an idea, or starting a new idea resets case status.

External profiles are saved under `pitchproof-external-advisers-v1` in localStorage. The chosen profile and case status are saved with the current project. Adding a profile does not create an adviser account or invite anyone. All reports remain prewritten examples selected by specialty. This is a local simulation, with no real payment collection, commission enforcement, payouts, or multi-case ledger.

Run commission and stored-profile validation checks with `node --test tests/advisers.test.mjs` (Node.js 24).
