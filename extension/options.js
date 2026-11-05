const DEFAULT_URL = 'http://localhost:3000';
const input = document.getElementById('url');
const status = document.getElementById('status');

chrome.storage.sync.get({ hugenaUrl: DEFAULT_URL }, value => { input.value = value.hugenaUrl; });

document.getElementById('settings').addEventListener('submit', event => {
  event.preventDefault();
  const url = input.value.trim().replace(/\/+$/, '');
  chrome.storage.sync.set({ hugenaUrl: url }, () => {
    status.textContent = 'Saved';
    setTimeout(() => { status.textContent = ''; }, 1500);
  });
});
