#!/usr/bin/env node
/*
 Minimal security auto-reply sender.
 Usage:
  echo '{"subject":"XSS","from":"r@example.com","to":"security@brainsait.com","body":"..."}' | node scripts/security-send.js

 Env:
  SECURITY_SENDER=ses|gmail (default: dry-run)
  SECURITY_AUTOREPLY_FROM=security@brainsait.com
  SECURITY_ESCALATE_TO=sec-leads@brainsait.com,sec-oncall@brainsait.com
  SEND=1 to actually send (requires provider deps/creds)
*/

const fs = require('fs');
const path = require('path');
const { autoReply, buildSESSendEmailParams, buildGmailSendPayload } = require('./lib/security-autoresponder');
const { detectNphiesCategory, buildInitial: buildNphiesInitial } = require('./lib/nphies-templates');
const { detectBankingCategory, buildInitial: buildBankingInitial } = require('./lib/banking-templates');
const { detectRCMCategory, buildInitial: buildRCMInitial } = require('./lib/rcm-templates');

function loadStore(storePath) {
  try { return JSON.parse(fs.readFileSync(storePath, 'utf8')); } catch { return []; }
}

function saveStore(storePath, data) {
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
}

function appendThread(storePath, evt, severity) {
  const store = loadStore(storePath);
  const id = evt.messageId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const exists = store.find((t) => t.id === id);
  if (exists) return exists;
  const entry = {
    id,
    createdAt: new Date().toISOString(),
    event: evt,
    severity,
    followUpsSent: [],
  };
  store.push(entry);
  saveStore(storePath, store);
  return entry;
}

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

async function sendSES(params) {
  let SESClient, SendEmailCommand;
  try {
    ({ SESClient, SendEmailCommand } = require('@aws-sdk/client-ses'));
  } catch (e) {
    throw new Error('Missing @aws-sdk/client-ses. Install it to enable SES sending.');
  }
  const client = new SESClient({});
  await client.send(new SendEmailCommand(params));
}

async function sendGmail(payload) {
  let google;
  try {
    google = require('googleapis').google;
  } catch (e) {
    throw new Error('Missing googleapis. Install it to enable Gmail sending.');
  }
  const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/gmail.send'] });
  const authClient = await auth.getClient();
  const gmail = google.gmail({ version: 'v1', auth: authClient });
  const userId = 'me';
  await gmail.users.messages.send({ userId, requestBody: payload });
}

(async () => {
  const input = (await readStdinJson()) || {};
  const result = autoReply(input);
  const provider = (process.env.SECURITY_SENDER || '').toLowerCase();
  const doSend = process.env.SEND === '1';
  const storePath = process.env.SECURITY_FOLLOWUPS_FILE || path.join('.security', 'followups.json');

  // If NPHIES-related, override subject/text with NPHIES template (privacy-safe)
  const nphiesCat = detectNphiesCategory(`${input.subject || ''} ${input.body || ''}`);
  if (nphiesCat && nphiesCat !== 'other') {
    const tmpl = buildNphiesInitial(input.subject || '', input.from, nphiesCat);
    result.initialReply.subject = tmpl.subject;
    result.initialReply.text = tmpl.text;
  }

  // Banking detection (if not NPHIES-override)
  if (!nphiesCat || nphiesCat === 'other') {
    const bankingCat = detectBankingCategory(`${input.subject || ''} ${input.body || ''}`);
    if (bankingCat && bankingCat !== 'other') {
      const tmpl = buildBankingInitial(input.subject || '', input.from, bankingCat);
      result.initialReply.subject = tmpl.subject;
      result.initialReply.text = tmpl.text;
      input._bankingCategory = bankingCat; // annotate for store
    }
  }

  // RCM detection (if neither NPHIES nor banking overrides)
  if ((!nphiesCat || nphiesCat === 'other') && !input._bankingCategory) {
    const rcmCat = detectRCMCategory(`${input.subject || ''} ${input.body || ''}`);
    if (rcmCat && rcmCat !== 'other') {
      const tmpl = buildRCMInitial(input.subject || '', input.from, rcmCat);
      result.initialReply.subject = tmpl.subject;
      result.initialReply.text = tmpl.text;
      input._rcmCategory = rcmCat; // annotate for store
    }
  }

  // Always print the generated message for auditability
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ provider: provider || 'dry-run', summary: { severity: result.severity, slaHours: result.slaHours }, initialReply: result.initialReply }, null, 2));

  // Append to follow-ups store automatically
  try {
    const entry = appendThread(storePath, input, result.severity);
    if (nphiesCat && nphiesCat !== 'other') entry.nphiesCategory = nphiesCat;
    if (input._bankingCategory) entry.bankingCategory = input._bankingCategory;
    if (input._rcmCategory) entry.rcmCategory = input._rcmCategory;
  } catch (e) { /* ignore store errors */ }

  if (!doSend) return; // dry-run

  if (provider === 'ses') {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      // eslint-disable-next-line no-console
      console.log('SES not configured (missing AWS credentials); skipping send.');
    } else {
      const params = buildSESSendEmailParams(result);
      await sendSES(params);
      // eslint-disable-next-line no-console
      console.log('Sent via SES');
    }
  } else if (provider === 'gmail') {
    const payload = buildGmailSendPayload(result);
    await sendGmail(payload);
    // eslint-disable-next-line no-console
    console.log('Sent via Gmail');
  } else {
    // eslint-disable-next-line no-console
    console.log('No provider selected (SECURITY_SENDER). Skipping send.');
  }
})();
