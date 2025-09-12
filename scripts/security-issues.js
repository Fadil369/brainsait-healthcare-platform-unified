#!/usr/bin/env node
/*
 Create GitHub issues for newly routed security items under .security/pipelines.

 Requires env:
  - GITHUB_TOKEN (provided automatically in Actions as secrets.GITHUB_TOKEN)
  - GITHUB_REPOSITORY (owner/repo) — available in Actions; locally you can set it.
*/

const fs = require('fs');
const path = require('path');

const pipelinesDir = path.join('.security', 'pipelines');
const ownersCfgPath = path.join('.security', 'owners.json');
const resolvedCfgPath = path.join('.security', 'resolved.json');

// Optional triage to derive severity label
let triage;
try { triage = require('./lib/security-autoresponder'); } catch { triage = null; }

function listFilesRec(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRec(p));
    else if (entry.isFile() && p.endsWith('.json')) out.push(p);
  }
  return out;
}

function parseChannelAndCategory(filePath) {
  const rel = path.relative(pipelinesDir, filePath); // e.g., nphies/claims/2025-01-01/abc.json
  const parts = rel.split(path.sep);
  const channel = parts[0] || 'unknown';
  const category = parts.length > 2 ? parts[1] : 'general';
  return { channel, category };
}

function readJSON(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
}

async function githubFetch(url, init = {}) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not set');
  const headers = { authorization: `Bearer ${token}`, accept: 'application/vnd.github+json' };
  const res = await fetch(url, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }
  return res;
}

async function ensureLabels(owner, repo, desired) {
  const existingRes = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/labels?per_page=100`);
  const existing = new Set((await existingRes.json()).map((l) => l.name.toLowerCase()));
  for (const name of desired) {
    if (!name) continue;
    if (existing.has(name.toLowerCase())) continue;
    await githubFetch(`https://api.github.com/repos/${owner}/${repo}/labels`, {
      method: 'POST',
      body: JSON.stringify({ name, color: 'ededed', description: 'Auto-created by security channels pipeline' }),
    });
    existing.add(name.toLowerCase());
  }
}

async function findIssueByTitle(owner, repo, title) {
  const q = encodeURIComponent(`repo:${owner}/${repo} in:title "${title}" state:open`);
  const res = await githubFetch(`https://api.github.com/search/issues?q=${q}`);
  const data = await res.json();
  return (data.items || [])[0] || null;
}

function buildTitle(filePath, subject, channel, category) {
  const slug = filePath.replace(/[\\/]/g, ':');
  const base = subject ? subject.slice(0, 80) : path.basename(filePath);
  return `[Security][${channel}/${category}] Routed: ${base} | ${slug}`;
}

function buildBody(filePath, item, channel, category) {
  const lines = [
    '**Summary**: Routed security item requiring triage.',
    `- Channel: ${channel}`,
    `- Category: ${category}`,
    `- Routed Path: ${filePath}`,
    `- Reporter: ${item.from || 'n/a'}`,
    `- Subject: ${item.subject || 'n/a'}`,
    '',
    '**Notes**',
    '- Do not paste PHI/PII or secrets in this issue.',
    '- Reference logs and IDs only; use secure channels for sensitive material.',
  ];
  return lines.join('\n');
}

(async () => {
  try {
    const repoFull = process.env.GITHUB_REPOSITORY || '';
    const [owner, repo] = repoFull.split('/');
    if (!owner || !repo) throw new Error('GITHUB_REPOSITORY not set (expected owner/repo)');

    const files = listFilesRec(pipelinesDir);
    let created = 0;
    const ownersCfg = fs.existsSync(ownersCfgPath) ? JSON.parse(fs.readFileSync(ownersCfgPath, 'utf8')) : {};
    for (const f of files) {
      const item = readJSON(f);
      const { channel, category } = parseChannelAndCategory(f);
      const title = buildTitle(f, item.subject, channel, category);
      const existing = await findIssueByTitle(owner, repo, title);
      if (existing) continue;

      const labels = ['security', `channel:${channel}`, `category:${category}`];
      // Add severity label if derivable
      try {
        if (triage && (item.subject || item.body)) {
          const res = triage.autoReply({ subject: item.subject, body: item.body });
          if (res && res.severity) labels.push(`severity:${res.severity}`);
        }
      } catch {}
      await ensureLabels(owner, repo, labels);
      // Resolve assignees from owners mapping
      const map = (ownersCfg[channel] && (ownersCfg[channel][category] || ownersCfg[channel]['*'])) || (ownersCfg['*'] && (ownersCfg['*'][category] || ownersCfg['*']['*'])) || {};
      const assignees = Array.isArray(map.assignees) ? map.assignees : [];

      const createRes = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        body: JSON.stringify({
          title,
          body: buildBody(f, item, channel, category),
          labels,
          assignees,
        }),
      });
      const issue = await createRes.json();
      // Mention team (if configured) via a comment; issues cannot be assigned to teams
      if (map.team) {
        try {
          await githubFetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issue.number}/comments`, {
            method: 'POST',
            body: JSON.stringify({ body: `Paging ${map.team} for visibility.` }),
          });
        } catch {}
      }
      created++;
    }
    // eslint-disable-next-line no-console
    console.log(`Created ${created} issue(s).`);

    // Auto-close pass: close open issues whose routed file is gone or marked resolved
    const searchQ = encodeURIComponent(`repo:${owner}/${repo} label:security state:open in:title Routed:`);
    const openRes = await githubFetch(`https://api.github.com/search/issues?q=${searchQ}`);
    const openIssues = (await openRes.json()).items || [];
    const resolvedCfg = fs.existsSync(resolvedCfgPath) ? JSON.parse(fs.readFileSync(resolvedCfgPath, 'utf8')) : { files: [], ids: [] };
    for (const it of openIssues) {
      const title = it.title || '';
      const slugPart = title.split('|').pop()?.trim() || '';
      if (!slugPart) continue;
      const filePath = slugPart.replace(/:/g, path.sep);
      let shouldClose = false;
      if (!fs.existsSync(filePath)) {
        shouldClose = true;
      } else {
        const data = readJSON(filePath);
        if (data.status && String(data.status).toLowerCase() === 'resolved') shouldClose = true;
        if (Array.isArray(resolvedCfg.files) && resolvedCfg.files.includes(filePath)) shouldClose = true;
        const id = data.id || path.basename(filePath, '.json');
        if (Array.isArray(resolvedCfg.ids) && resolvedCfg.ids.includes(id)) shouldClose = true;
      }
      if (shouldClose) {
        try {
          await githubFetch(`https://api.github.com/repos/${owner}/${repo}/issues/${it.number}/comments`, {
            method: 'POST',
            body: JSON.stringify({ body: 'Closing as routed artifact is removed or marked resolved.' }),
          });
        } catch {}
        try {
          await githubFetch(`https://api.github.com/repos/${owner}/${repo}/issues/${it.number}`, {
            method: 'PATCH',
            body: JSON.stringify({ state: 'closed' }),
          });
        } catch {}
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Issue creation failed:', e.message || e);
    process.exitCode = 1;
  }
})();
