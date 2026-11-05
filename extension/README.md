# Hugena Chrome extension

Adds a paper-plane button at the end of the action row under each AI answer on claude.ai, chatgpt.com and gemini.google.com. Clicking it opens Hugena's customer workspace in a new tab with the whole answer in the claim field.

## Install (unpacked)

1. Start Hugena (`npm run dev` serves it on http://localhost:3000).
2. Open `chrome://extensions`, turn on **Developer mode** and click **Load unpacked**.
3. Choose this `extension/` folder.
4. If Hugena runs somewhere else (for example the preview on port 3100), open the extension's **Details → Extension options** and change the Hugena address.

## How it works

- `content.js` looks for each answer's copy button, takes the row of buttons it sits in, and appends the Hugena button to the end of that row. It copies the class names of the site's copy button so the new button matches the site's style.
- Copy buttons inside an answer (on code blocks) and on your own messages are skipped. An answer is only matched when the surrounding container holds exactly one answer and one action row.
- On click, the answer's visible text (up to 20,000 characters) is put in the URL fragment: `/review#import=<encoded JSON>`. Browsers don't send the fragment to any server. Hugena reads it once, fills the claim form and removes it from the address bar.
- The extension only needs the `storage` permission, for the Hugena address. It reads nothing from the page until you click the button.

## Keeping it working

The AI sites change their markup from time to time. The selectors for each site are in the `SITES` list at the top of `content.js`. `tests/browser/extension.spec.ts` checks the matching logic against small pages shaped like each site; it does not load the real sites, so check the button by hand on each site after they change their layout.
