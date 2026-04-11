#!/usr/bin/env node
/**
 * Ministry Router — GitHub Actions event handler for the Matrix ecosystem.
 *
 * Requires Node.js ≥ 18 (built-in fetch).
 *
 * Usage:
 *   node Ministry/Integration/index.mjs \
 *     --event "$GITHUB_EVENT_NAME" \
 *     --payload "$GITHUB_EVENT_PATH"
 */

const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(`Ministry Router requires Node.js >= 18 (found ${process.versions.node})`);
  process.exit(1);
}

import { readFileSync } from 'fs';
import { argv, env, exit } from 'process';

// ---------------------------------------------------------------------------
// CLI argument parser
// ---------------------------------------------------------------------------
function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      result[args[i].slice(2)] = args[i + 1];
      i++;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// GitHub REST API helper (uses built-in fetch, available in Node ≥ 18)
// ---------------------------------------------------------------------------
async function githubApi(method, path, body) {
  const token = env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN environment variable is not set');

  const url = `https://api.github.com${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${method} ${path} → ${res.status}: ${text}`);
  }

  return res.status !== 204 ? res.json() : null;
}

// ---------------------------------------------------------------------------
// Label helpers
// ---------------------------------------------------------------------------

// Ensure a label exists in the repo, creating it if necessary.
async function ensureLabel(owner, repo, name, color = 'ededed') {
  try {
    await githubApi('GET', `/repos/${owner}/${repo}/labels/${encodeURIComponent(name)}`);
  } catch {
    // Label doesn't exist — create it.
    try {
      await githubApi('POST', `/repos/${owner}/${repo}/labels`, { name, color });
      console.log(`Created label "${name}"`);
    } catch (err) {
      console.warn(`Could not create label "${name}": ${err.message}`);
    }
  }
}

// Add labels to an issue or PR (issues and PRs share the same labels endpoint).
async function addLabels(owner, repo, number, labels) {
  if (labels.length === 0) return;
  for (const label of labels) {
    await ensureLabel(owner, repo, label);
  }
  await githubApi('POST', `/repos/${owner}/${repo}/issues/${number}/labels`, { labels });
  console.log(`Added labels [${labels.join(', ')}] to #${number}`);
}

// Infer relevant labels from free-form text.
function detectLabels(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const labels = [];

  if (/amazing[\s-]grace/.test(lower)) labels.push('amazing-grace');
  if (/ministry|minister/.test(lower)) labels.push('ministry');
  if (/security|vulnerability|exploit/.test(lower)) labels.push('security');
  if (/branding|brand/.test(lower)) labels.push('branding');
  if (/\blore\b|story|narrative/.test(lower)) labels.push('lore');
  if (/readme|documentation|\bdocs?\b/.test(lower)) labels.push('documentation');
  if (/\bbug\b|broken|crash/.test(lower)) labels.push('bug');
  if (/enhancement|feature request/.test(lower)) labels.push('enhancement');
  if (/partner[\s-]domain/.test(lower)) labels.push('partner-domain');
  if (/star[\s-]piece/.test(lower)) labels.push('star-piece');
  if (/gamif/.test(lower)) labels.push('gamification');

  return [...new Set(labels)];
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleIssues(payload) {
  const { action, issue, repository } = payload;
  const owner = repository.owner.login;
  const repo = repository.name;

  console.log(`issues event: action=${action}, issue=#${issue.number} ("${issue.title}")`);

  if (action === 'opened' || action === 'edited') {
    const labels = detectLabels(`${issue.title} ${issue.body}`);
    await addLabels(owner, repo, issue.number, labels).catch((err) =>
      console.warn(`Label operation skipped: ${err.message}`)
    );
  }
}

async function handlePullRequest(payload) {
  const { action, pull_request, repository } = payload;
  const owner = repository.owner.login;
  const repo = repository.name;

  console.log(`pull_request event: action=${action}, PR=#${pull_request.number} ("${pull_request.title}")`);

  if (action === 'opened' || action === 'edited') {
    const labels = detectLabels(`${pull_request.title} ${pull_request.body}`);
    await addLabels(owner, repo, pull_request.number, labels).catch((err) =>
      console.warn(`Label operation skipped: ${err.message}`)
    );
  }
}

async function handleIssueComment(payload) {
  const { action, comment, issue } = payload;
  console.log(
    `issue_comment event: action=${action}, issue=#${issue.number}, ` +
    `commenter=${comment.user.login}`
  );
}

async function handlePullRequestReview(payload) {
  const { action, review, pull_request } = payload;
  console.log(
    `pull_request_review event: action=${action}, PR=#${pull_request.number}, ` +
    `reviewer=${review.user.login}, state=${review.state}`
  );
}

// ---------------------------------------------------------------------------
// Main router
// ---------------------------------------------------------------------------
async function main() {
  const args = parseArgs(argv.slice(2));
  const eventName = args.event;
  const payloadPath = args.payload;

  if (!eventName || !payloadPath) {
    console.error('Usage: node Ministry/Integration/index.mjs --event <name> --payload <path>');
    exit(1);
  }

  console.log(`Ministry Router: received event "${eventName}"`);

  let payload;
  try {
    payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
  } catch (err) {
    console.error(`Failed to read payload from "${payloadPath}": ${err.message}`);
    exit(1);
  }

  try {
    switch (eventName) {
      case 'issues':
        await handleIssues(payload);
        break;
      case 'pull_request':
        await handlePullRequest(payload);
        break;
      case 'issue_comment':
        await handleIssueComment(payload);
        break;
      case 'pull_request_review':
        await handlePullRequestReview(payload);
        break;
      default:
        console.log(`Ministry Router: no handler registered for event "${eventName}"`);
    }
    console.log('Ministry Router: completed successfully');
  } catch (err) {
    console.error(`Ministry Router error: ${err.message}`);
    exit(1);
  }
}

main();
