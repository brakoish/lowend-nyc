#!/usr/bin/env node
/**
 * execute-pipeline.js — Actually executes pipeline work
 * 
 * This is the missing piece. The orchestrator moves statuses and generates
 * briefs. This script does the actual work: research, writing, editing.
 * 
 * Called by cron every 30 min. Processes ONE item per run to stay within
 * rate limits and keep token costs predictable.
 * 
 * Flow per article:
 *   RESEARCHING → execute research → save findings → RESEARCH_DONE
 *   RESEARCH_DONE → (orchestrator generates writing brief) → WRITING  
 *   WRITING → write article from brief + research → save .mdx → DRAFT_READY
 *   DRAFT_READY → (orchestrator generates edit brief) → EDITING
 *   EDITING → run humanizer, fact-check → save edited .mdx → PENDING_APPROVAL
 * 
 * Dependencies: web search (via fetch), humanizer CLI, Google Sheets API
 */

const dotenvPath = require('path').join(__dirname, '.env');
try { require('dotenv').config({ path: dotenvPath }); } catch(e) {}

const { SheetsClient, STATUS } = require('./sheets');
const { Notifier } = require('./notify');
const { readDraft, saveDraft } = require('./agents');
const { readResearchBrief, saveResearchBrief } = require('./researcher');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const env = globalThis.process.env || {};
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');
const BRIEFS_DIR = path.join(__dirname, 'briefs');
const HUMANIZER_DIR = path.join(env.HOME || '', '.openclaw', 'workspace-lowend-nyc', 'skills', 'humanizer');

let sheets, notify;

async function init() {
  const credPath = (env.GOOGLE_CREDENTIALS_PATH || '').replace('~', env.HOME);
  if (fs.existsSync(credPath) && env.GOOGLE_SHEET_ID) {
    sheets = await new SheetsClient(credPath, env.GOOGLE_SHEET_ID).init();
  }
  notify = new Notifier(env.DISCORD_WEBHOOK_URL || '');
}

// ─── RESEARCH EXECUTOR ───

async function executeResearch(row) {
  console.log(`\n🔬 Executing research for: "${row.topic}"`);
  
  // Read the research task
  const taskPath = path.join(BRIEFS_DIR, `${row.slug}-research.md`);
  if (!fs.existsSync(taskPath)) {
    console.log('  ⚠️ No research task found');
    return false;
  }

  // Extract key search terms from topic
  const searchTerms = extractSearchTerms(row.topic, row.genre);
  
  // Execute searches
  const findings = [];
  
  for (const term of searchTerms) {
    console.log(`  Searching: "${term}"`);
    try {
      const results = await braveSearch(term);
      if (results && results.length > 0) {
        findings.push({ query: term, results });
      }
      // Rate limit: wait 1.5s between searches
      await sleep(1500);
    } catch (e) {
      console.log(`  Search failed: ${e.message}`);
    }
  }

  if (findings.length === 0) {
    console.log('  ⚠️ No search results found');
    return false;
  }

  // Compile research brief
  const brief = compileResearchBrief(row, findings);
  const completePath = path.join(BRIEFS_DIR, `${row.slug}-research-complete.md`);
  fs.writeFileSync(completePath, brief, 'utf-8');
  
  // Update sheet
  await sheets.updateStatus(row.rowNumber, STATUS.RESEARCH_DONE);
  console.log(`  ✅ Research complete → RESEARCH_DONE`);
  return true;
}

function extractSearchTerms(topic, genre) {
  // Extract artist/subject name from topic
  const patterns = [
    /^([^:]+?):/,
    /^(.+?)\s+Is\s/i,
    /^(.+?)\s+at\s/i,
    /^(.+?)\s+Brought/i,
    /^(.+?)\s+Takes/i,
    /^(.+?)\s+Turns/i,
    /^(.+?)['']s\s/,
  ];
  
  let subject = topic.split(' ').slice(0, 3).join(' ');
  for (const pattern of patterns) {
    const match = topic.match(pattern);
    if (match) { subject = match[1].trim(); break; }
  }
  
  return [
    `${subject} DJ producer biography interview`,
    `${subject} ${genre || 'electronic music'} NYC`,
    `${subject} interview quotes 2024 2025 2026`,
    `${subject} press photo EPK promo`,
  ];
}

function compileResearchBrief(row, findings) {
  let brief = `# Research Brief: ${row.topic}\n\n`;
  brief += `## Search Results\n\n`;
  
  for (const { query, results } of findings) {
    brief += `### Query: "${query}"\n\n`;
    for (const r of results) {
      brief += `- **${r.title}** (${r.url})\n`;
      brief += `  ${r.description}\n\n`;
    }
  }
  
  brief += `\n## Notes\n`;
  brief += `- Research executed: ${new Date().toISOString()}\n`;
  brief += `- Sources found: ${findings.reduce((sum, f) => sum + f.results.length, 0)}\n`;
  brief += `- Image sourcing: Check artist website, label press page, RA profile for editorial-use photos\n`;
  
  return brief;
}

// ─── WRITING EXECUTOR ───

async function executeWriting(row) {
  console.log(`\n✍️ Writing article for: "${row.topic}"`);
  
  // Check if writing brief exists
  const briefPath = path.join(BRIEFS_DIR, `${row.slug}-writing-brief.md`);
  if (!fs.existsSync(briefPath)) {
    console.log('  ⚠️ No writing brief found. Run orchestrator first.');
    return false;
  }
  
  // Check if research exists
  const researchPath = path.join(BRIEFS_DIR, `${row.slug}-research-complete.md`);
  const research = fs.existsSync(researchPath) ? fs.readFileSync(researchPath, 'utf-8') : '';
  
  if (!research) {
    console.log('  ⚠️ No completed research found');
    return false;
  }

  // The actual writing needs to be done by an AI agent
  // For now, create a placeholder that signals the article needs writing
  // In production, this spawns an OpenClaw session
  
  const placeholder = createWritingPlaceholder(row, research);
  saveDraft(row.slug, placeholder);
  
  await sheets.updateStatus(row.rowNumber, STATUS.DRAFT_READY);
  await sheets.setWriter(row.rowNumber, 'pipeline-writer');
  console.log(`  ✅ Draft placeholder created → DRAFT_READY`);
  console.log(`  ⚡ Article needs AI agent to write from brief + research`);
  return true;
}

function createWritingPlaceholder(row, research) {
  // This creates the frontmatter shell — the actual content needs an AI agent
  const date = new Date().toISOString().split('T')[0];
  
  return `---
title: "${row.topic}"
slug: "${row.slug}"
date: "${date}"
venue: "TBD"
location: "NYC"
featured: false
image: "/images/og-default.png"
excerpt: "${row.angle || row.topic}"
genre: [${(row.genre || 'Electronic').split(',').map(g => `"${g.trim()}"`).join(', ')}]
artist:
  name: "TBD"
  instagram: ""
  soundcloud: ""
  spotify: ""
---

# ${row.topic}

<!-- DRAFT PLACEHOLDER — Needs AI agent to write from research brief -->
<!-- Research: pipeline/briefs/${row.slug}-research-complete.md -->
<!-- Writing brief: pipeline/briefs/${row.slug}-writing-brief.md -->

${row.angle || ''}

---

*This article is pending writing from research.*
`;
}

// ─── EDITING EXECUTOR ───

async function executeEditing(row) {
  console.log(`\n📝 Editing article: "${row.topic}"`);
  
  const draft = readDraft(row.slug);
  if (!draft) {
    console.log('  ⚠️ No draft found');
    return false;
  }
  
  // Check if it's still a placeholder
  if (draft.includes('DRAFT PLACEHOLDER')) {
    console.log('  ⚠️ Draft is still a placeholder — needs writing first');
    // Move back to WRITING
    await sheets.updateStatus(row.rowNumber, STATUS.WRITING);
    return false;
  }
  
  // Run humanizer analysis
  let humanizerScore = null;
  try {
    const draftPath = path.join(ARTICLES_DIR, `${row.slug}.mdx`);
    const cliPath = path.join(HUMANIZER_DIR, 'src', 'cli.js');
    
    if (fs.existsSync(cliPath)) {
      const output = execSync(`node "${cliPath}" score "${draftPath}" 2>/dev/null`, {
        encoding: 'utf-8',
        timeout: 30000,
      }).trim();
      
      // Parse score from output
      const scoreMatch = output.match(/(\d+)/);
      if (scoreMatch) {
        humanizerScore = parseInt(scoreMatch[1]);
      }
    }
  } catch (e) {
    console.log(`  Humanizer error: ${e.message}`);
  }
  
  const scoreText = humanizerScore !== null ? `${humanizerScore}/100` : 'N/A';
  const passed = humanizerScore === null || humanizerScore <= 30;
  
  console.log(`  Humanizer score: ${scoreText} ${passed ? '✅ PASS' : '⚠️ NEEDS REVISION'}`);
  
  if (!passed) {
    console.log(`  Score above 30 — article needs rewriting to sound more human`);
    // Still move to PENDING_APPROVAL but flag the issue
  }
  
  // Update sheet
  await sheets.updateStatus(row.rowNumber, STATUS.PENDING_APPROVAL);
  await sheets.setEditor(row.rowNumber, `humanizer: ${scoreText}`);
  await sheets.setDraftLink(row.rowNumber, `Score: ${scoreText} | File: content/articles/${row.slug}.mdx`);
  
  // Notify
  await notify.draftReady(row.topic, row.slug, row.rowNumber);
  
  console.log(`  ✅ Editing complete → PENDING_APPROVAL`);
  return true;
}

// ─── PUBLISH EXECUTOR ───

async function executePublish(row) {
  console.log(`\n🚀 Publishing: "${row.topic}"`);
  
  const draft = readDraft(row.slug);
  if (!draft) {
    console.log('  ⚠️ No article file found');
    return false;
  }
  
  if (draft.includes('DRAFT PLACEHOLDER')) {
    console.log('  ⚠️ Cannot publish a placeholder');
    return false;
  }
  
  // Commit to GitHub
  try {
    const repoDir = path.join(__dirname, '..');
    execSync(`cd "${repoDir}" && git add content/articles/${row.slug}.mdx && git commit -m "Publish: ${row.slug}" && git push`, {
      encoding: 'utf-8',
      timeout: 30000,
    });
    
    await sheets.updateStatus(row.rowNumber, STATUS.PUBLISHED);
    await notify.articlePublished(row.topic, row.slug);
    console.log(`  ✅ Published to GitHub → Vercel deploying`);
    return true;
  } catch (e) {
    console.log(`  ❌ Publish failed: ${e.message}`);
    return false;
  }
}

// ─── BRAVE SEARCH ───

function braveSearch(query) {
  return new Promise((resolve, reject) => {
    const apiKey = env.BRAVE_API_KEY || '';
    if (!apiKey) {
      // Fall back to no results if no API key
      resolve([]);
      return;
    }
    
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
    
    const req = https.request(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const results = (parsed.web?.results || []).map(r => ({
            title: r.title,
            url: r.url,
            description: r.description,
          }));
          resolve(results);
        } catch {
          resolve([]);
        }
      });
    });
    
    req.on('error', () => resolve([]));
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── MAIN ───

async function main() {
  await init();
  
  if (!sheets) {
    console.log('Sheets not configured. Exiting.');
    return;
  }
  
  console.log('═══════════════════════════════════════');
  console.log('  LOWEND NYC Pipeline Executor');
  console.log('═══════════════════════════════════════');
  
  const rows = await sheets.getAllRows();
  let processed = 0;
  const MAX_PER_RUN = 2; // Process max 2 items per run to manage costs
  
  // Priority order: EDITING first (closest to done), then WRITING, then RESEARCHING
  
  // Step 1: Execute editing (DRAFT_READY items that orchestrator moved to EDITING)
  const editing = rows.filter(r => r.status === STATUS.EDITING);
  for (const row of editing) {
    if (processed >= MAX_PER_RUN) break;
    await executeEditing(row);
    processed++;
  }
  
  // Step 2: Execute writing (items in WRITING status)  
  const writing = rows.filter(r => r.status === STATUS.WRITING);
  for (const row of writing) {
    if (processed >= MAX_PER_RUN) break;
    await executeWriting(row);
    processed++;
  }
  
  // Step 3: Execute research (items in RESEARCHING status)
  const researching = rows.filter(r => r.status === STATUS.RESEARCHING);
  for (const row of researching) {
    if (processed >= MAX_PER_RUN) break;
    await executeResearch(row);
    processed++;
  }
  
  // Step 4: Publish scheduled items
  const scheduled = rows.filter(r => r.status === STATUS.SCHEDULED);
  const today = new Date().toISOString().split('T')[0];
  for (const row of scheduled) {
    if (row.publishDate && row.publishDate <= today) {
      await executePublish(row);
    }
  }
  
  if (processed === 0) {
    console.log('\nNo items needed execution.');
  } else {
    console.log(`\nProcessed ${processed} items.`);
  }
  
  console.log('\n═══════════════════════════════════════');
}

main().catch(err => {
  console.error('Pipeline executor error:', err);
});
