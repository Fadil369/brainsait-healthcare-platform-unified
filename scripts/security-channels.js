#!/usr/bin/env node
/*
 Channels pipeline router for security inbox items.

 Reads: .security/inbox/*.json (parsed inbound messages, PHI-free)
 Routes: .security/pipelines/<channel>/YYYY-MM-DD/<id>.json

 Config: .security/channels.json maps keywords -> channels.
*/

const fs = require('fs');
const path = require('path');

const { detectNphiesCategory } = require('./lib/nphies-templates');
const { detectBankingCategory } = require('./lib/banking-templates');
const { detectRCMCategory } = require('./lib/rcm-templates');

const inboxDir = path.join('.security', 'inbox');
const pipelinesDir = path.join('.security', 'pipelines');
const channelsCfgPath = path.join('.security', 'channels.json');

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function listInbox() {
  if (!fs.existsSync(inboxDir)) return [];
  return fs.readdirSync(inboxDir).filter((f) => f.endsWith('.json')).map((f) => path.join(inboxDir, f));
}

function loadChannels() {
  if (!fs.existsSync(channelsCfgPath)) return {};
  return loadJSON(channelsCfgPath);
}

function detectChannels(item, cfg) {
  const text = `${item.subject || ''} ${item.body || ''}`.toLowerCase();
  const matches = [];
  for (const [ch, kws] of Object.entries(cfg)) {
    if (kws.some((k) => text.includes(String(k).toLowerCase()))) matches.push(ch);
  }
  return matches.length ? matches : ['unclassified'];
}

function routeItem(itemPath, cfg) {
  const item = loadJSON(itemPath);
  const channels = detectChannels(item, cfg);
  const id = item.id || path.basename(itemPath, '.json');
  const date = new Date().toISOString().slice(0, 10);
  const outPaths = [];
  for (const ch of channels) {
    // NPHIES sub-routing
    let sub = undefined;
    if (ch === 'nphies') {
      sub = detectNphiesCategory(`${item.subject || ''} ${item.body || ''}`);
    } else if (ch === 'payments' || ch === 'payers' || ch === 'banking') {
      // Banking sub-routing: payments/payers often correlate with banking concerns
      sub = detectBankingCategory(`${item.subject || ''} ${item.body || ''}`);
      if (sub !== 'other') {
        // normalize channel folder name to 'banking'
        const dir = path.join(pipelinesDir, 'banking', sub, date);
        fs.mkdirSync(dir, { recursive: true });
        const out = path.join(dir, `${id}.json`);
        fs.writeFileSync(out, JSON.stringify(item, null, 2));
        outPaths.push(out);
        continue;
      }
    } else if (ch === 'billing' || ch === 'claims' || ch === 'denials' || ch === 'rcm') {
      sub = detectRCMCategory(`${item.subject || ''} ${item.body || ''}`);
      if (sub !== 'other') {
        const dir = path.join(pipelinesDir, 'rcm', sub, date);
        fs.mkdirSync(dir, { recursive: true });
        const out = path.join(dir, `${id}.json`);
        fs.writeFileSync(out, JSON.stringify(item, null, 2));
        outPaths.push(out);
        continue;
      }
    }
    const dir = sub && sub !== 'other' ? path.join(pipelinesDir, ch, sub, date) : path.join(pipelinesDir, ch, date);
    fs.mkdirSync(dir, { recursive: true });
    const out = path.join(dir, `${id}.json`);
    fs.writeFileSync(out, JSON.stringify(item, null, 2));
    outPaths.push(out);
  }
  return { id, channels, outPaths };
}

(function main() {
  const files = listInbox();
  const cfg = loadChannels();
  const results = files.map((f) => routeItem(f, cfg));
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ processed: results.length, results }, null, 2));
})();
