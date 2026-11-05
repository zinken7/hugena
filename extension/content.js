// Hugena content script. Adds a paper-plane button at the end of the action row
// under each AI answer. Clicking it opens Hugena with the whole answer filled in.
// The answer travels in the URL fragment (#import=...), which browsers never send
// to a server. Nothing is read from the page until the button is clicked.
(() => {
  const DEFAULT_URL = 'http://localhost:3000';
  const MAX_LENGTH = 20000;
  const SITES = [
    { host: /(^|\.)claude\.ai$/, name: 'Claude', answer: '.font-claude-response, .font-claude-message, [data-testid="assistant-message"]' },
    { host: /(^|\.)chatgpt\.com$/, name: 'ChatGPT', answer: '[data-message-author-role="assistant"]' },
    { host: /(^|\.)gemini\.google\.com$/, name: 'Gemini', answer: 'message-content, .model-response-text' },
  ];
  const COPY = 'button[data-testid*="copy" i], button[aria-label*="copy" i]';
  const site = SITES.find(s => s.host.test(location.hostname));
  if (!site) return;

  let hugenaUrl = DEFAULT_URL;
  try {
    chrome.storage.sync.get({ hugenaUrl: DEFAULT_URL }, value => { hugenaUrl = value.hugenaUrl || DEFAULT_URL; });
    chrome.storage.onChanged.addListener(changes => { if (changes.hugenaUrl) hugenaUrl = changes.hugenaUrl.newValue || DEFAULT_URL; });
  } catch { /* storage unavailable: keep the default */ }

  const PLANE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>';
  const DONE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  const handled = new WeakSet();

  const outsideAnswers = button => !button.closest(site.answer);
  const buttonsIn = el => el.querySelectorAll('button').length;

  // The action row is the closest ancestor of the copy button that holds several buttons.
  function actionRowFor(copy) {
    let row = copy.parentElement;
    for (let i = 0; row && i < 4 && buttonsIn(row) < 2; i++) row = row.parentElement;
    return row && buttonsIn(row) >= 2 ? row : null;
  }

  // The answer for a row is found in the smallest ancestor that contains exactly one
  // answer and no other action-row copy button, so user messages and other turns are skipped.
  function answerFor(row) {
    let scope = row.parentElement;
    for (let i = 0; scope && i < 8; i++, scope = scope.parentElement) {
      const answers = scope.querySelectorAll(site.answer);
      const rowCopies = [...scope.querySelectorAll(COPY)].filter(outsideAnswers);
      if (rowCopies.length > 1 || answers.length > 1) return null;
      if (answers.length === 1) return answers[0];
    }
    return null;
  }

  function send(answer, button) {
    const text = answer.innerText.trim().slice(0, MAX_LENGTH);
    if (!text) return;
    const payload = encodeURIComponent(JSON.stringify({ v: 1, source: site.name, text }));
    window.open(`${hugenaUrl.replace(/\/+$/, '')}/review#import=${payload}`, '_blank', 'noopener');
    button.innerHTML = DONE;
    button.setAttribute('aria-label', 'Sent to Hugena');
    setTimeout(() => { button.innerHTML = PLANE; button.setAttribute('aria-label', 'Send to Hugena'); }, 1600);
  }

  function addButton(copy) {
    if (handled.has(copy)) return;
    handled.add(copy);
    if (!outsideAnswers(copy)) return; // copy buttons on code blocks inside an answer
    const row = actionRowFor(copy);
    if (!row || row.querySelector('[data-hugena-send]')) return;
    const answer = answerFor(row);
    if (!answer) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `${copy.className} hugena-send`.trim();
    button.dataset.hugenaSend = '';
    button.title = 'Send to Hugena';
    button.setAttribute('aria-label', 'Send to Hugena');
    button.innerHTML = PLANE;
    button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); send(answer, button); });
    row.appendChild(button);
  }

  let queued = false;
  function scan() {
    queued = false;
    document.querySelectorAll(COPY).forEach(addButton);
  }
  new MutationObserver(() => { if (!queued) { queued = true; setTimeout(scan, 250); } })
    .observe(document.body, { childList: true, subtree: true });
  scan();
})();
