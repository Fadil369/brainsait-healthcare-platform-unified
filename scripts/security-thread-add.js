#!/usr/bin/env node
/*
 Append a new follow-up thread to the local store from stdin JSON.
 Usage:
   echo '{"subject":"...","from":"...","to":"security@brainsait.com","body":"...","messageId":"<id>"}' | node scripts/security-thread-add.js
*/

const fs = require('fs');
const path = require('path');
const { autoReply } = require('./lib/security-autoresponder');
const { detectNphiesCategory } = require('./lib/nphies-templates');
const { detectBankingCategory } = require('./lib/banking-templates');
const { detectRCMCategory } = require('./lib/rcm-templates');

async function readStdinJson() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => {
      try { resolve(JSON.parse(data)); } catch { resolve(null); }
    });
    if (process.stdin.isTTY) resolve(null);
  });
}

function loadStore(storePath) {
  try { return JSON.parse(fs.readFileSync(storePath, 'utf8')); } catch { return []; }
}

function saveStore(storePath, data) {
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
}

(async () => {
  const evt = (await readStdinJson()) || {};
  const storePath = process.env.SECURITY_FOLLOWUPS_FILE || path.join('.security', 'followups.json');
  const result = autoReply(evt);
  const store = loadStore(storePath);
  const id = evt.messageId || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  if (!store.find((t) => t.id === id)) {
    const text = `${evt.subject || ''} ${evt.body || ''}`;
    const nphiesCategory = detectNphiesCategory(text);
    const bankingCategory = detectBankingCategory(text);
    const rcmCategory = detectRCMCategory(text);
    store.push({ id, createdAt: new Date().toISOString(), event: evt, severity: result.severity, nphiesCategory, bankingCategory, rcmCategory, followUpsSent: [] });
    saveStore(storePath, store);
  }
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ok: true, id, severity: result.severity }, null, 2));
})();
