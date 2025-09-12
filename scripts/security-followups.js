#!/usr/bin/env node
/*
 Scheduled follow-up sender based on plan from SecurityAutoResponder.

 Store: a workspace JSON file tracking threads.
  .security/followups.json example entry:
   {
     "id": "abc-123",
     "createdAt": "2025-01-01T00:00:00.000Z",
     "event": { "subject": "XSS", "from": "r@example.com", "to": "security@brainsait.com", "body": "..." },
     "severity": "high",
     "followUpsSent": []
   }

 Env:
  SECURITY_FOLLOWUPS_FILE (default: .security/followups.json)
  SECURITY_SENDER=ses|gmail (optional)
  SEND=1 to actually send (requires provider deps/creds)
*/

const fs = require('fs');
const path = require('path');
const { planFollowUps } = require('./lib/security-autoresponder');
const { buildFollowUpText: buildNphiesFollow } = require('./lib/nphies-templates');
const { buildFollowUpText: buildBankingFollow } = require('./lib/banking-templates');
const { buildFollowUpText: buildRCMFollow } = require('./lib/rcm-templates');

const storePath = process.env.SECURITY_FOLLOWUPS_FILE || path.join('.security', 'followups.json');

function loadStore() {
  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStore(data) {
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
}

function isDue(baseISO, hours) {
  const base = new Date(baseISO).getTime();
  const due = base + hours * 3600 * 1000;
  return Date.now() >= due;
}

function makeFollowUpText(severity, nphiesCategory, bankingCategory, rcmCategory) {
  if (nphiesCategory && nphiesCategory !== 'other') return buildNphiesFollow(nphiesCategory, severity);
  if (bankingCategory && bankingCategory !== 'other') return buildBankingFollow(bankingCategory, severity);
  if (rcmCategory && rcmCategory !== 'other') return buildRCMFollow(rcmCategory, severity);
  return [
    'Hello,',
    '',
    `We are following up on your security report. Current status: triage in progress for ${String(severity).toUpperCase()}.`,
    'We will share remediation details as they become available.',
    '',
    '— BrainSAIT Security Team',
  ].join('\n');
}

async function sendSES(params) {
  let SESClient, SendEmailCommand;
  ({ SESClient, SendEmailCommand } = require('@aws-sdk/client-ses'));
  const client = new SESClient({});
  await client.send(new SendEmailCommand(params));
}

async function sendGmail(payload) {
  const google = require('googleapis').google;
  const auth = new google.auth.GoogleAuth({ scopes: ['https://www.googleapis.com/auth/gmail.send'] });
  const authClient = await auth.getClient();
  const gmail = google.gmail({ version: 'v1', auth: authClient });
  await gmail.users.messages.send({ userId: 'me', requestBody: payload });
}

(async () => {
  const threads = loadStore();
  const provider = (process.env.SECURITY_SENDER || '').toLowerCase();
  const doSend = process.env.SEND === '1';

  const updates = [];
  for (const t of threads) {
    const plan = planFollowUps(t.severity || 'unknown');
    const sent = new Set(t.followUpsSent || []);
    for (let i = 0; i < plan.length; i++) {
      if (sent.has(i)) continue;
      if (!isDue(t.createdAt, plan[i].inHours)) continue;
      const subject = `[BrainSAIT Security] Follow-up on your report`;
      const text = makeFollowUpText(t.severity || 'unknown', t.nphiesCategory, t.bankingCategory, t.rcmCategory);
      const to = t.event?.from;
      const initialReply = { to, cc: process.env.SECURITY_ESCALATE_TO?.split(',').map(s=>s.trim()).filter(Boolean), subject, text };

      // Print intended action
      // eslint-disable-next-line no-console
      console.log(JSON.stringify({ id: t.id, followUpIndex: i, provider: provider || 'dry-run', to, subject }, null, 2));

      if (doSend) {
        if (provider === 'ses') {
          if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            // eslint-disable-next-line no-console
            console.log('SES not configured (missing AWS credentials); skipping send.');
          } else {
          try {
            const params = {
              Source: process.env.SECURITY_AUTOREPLY_FROM || 'security@brainsait.com',
              Destination: { ToAddresses: [to], CcAddresses: initialReply.cc || [] },
              Message: { Subject: { Data: subject }, Body: { Text: { Data: text } } },
            };
            await sendSES(params);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('SES send failed:', e.message || e);
          }
          }
        } else if (provider === 'gmail') {
          try {
            const payload = (function () {
              const from = process.env.SECURITY_AUTOREPLY_FROM || 'security@brainsait.com';
              const headers = [
                `From: ${from}`,
                `To: ${to}`,
                initialReply.cc && initialReply.cc.length ? `Cc: ${initialReply.cc.join(', ')}` : undefined,
                `Subject: ${subject}`,
                'MIME-Version: 1.0',
                'Content-Type: text/plain; charset=UTF-8',
                '',
                text,
              ].filter(Boolean).join('\r\n');
              return { raw: Buffer.from(headers).toString('base64') };
            })();
            await sendGmail(payload);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Gmail send failed:', e.message || e);
          }
        }
      }
      // Mark sent
      t.followUpsSent = Array.from(new Set([...(t.followUpsSent || []), i]));
      updates.push({ id: t.id, followUpIndex: i });
    }
  }
  saveStore(threads);
  // eslint-disable-next-line no-console
  console.log(`Processed ${updates.length} follow-up(s).`);
})();
