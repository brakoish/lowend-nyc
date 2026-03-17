#!/usr/bin/env node
/**
 * orchestrator.js — Main pipeline controller for LOWEND NYC
 * 
 * Commands:
 *   check    - Check for new/changed topics, send notifications
 *   process  - Process approved topics (generate briefs, spawn agents)
 *   publish  - Publish scheduled articles to GitHub
 *   run      - Run full pipeline (check + process + publish)
 *   setup    - Set up Google Sheet structure
 *   summary  - Send daily summary notification
 *   add      - Add a new topic
 *   test     - Test connections
 *   bridge   - Import events from scout to pipeline
 */

const dotenvPath = require('path').join(__dirname, '.env');
try {
  require('dotenv').config({ path: dotenvPath });
} catch (e) {
  // dotenv optional — env vars can be set externally
}

const { SheetsClient, STATUS } = require('./sheets');
const { GitHubClient } = require('./github');
const { Notifier } = require('./notify');
const { generateBrief, generateEditBrief, saveDraft, readDraft } = require('./agents');
const { generateResearchTask, saveResearchBrief, readResearchBrief } = require('./researcher');
const fs = require('fs');
const path = require('path');

// ─── Configuration ───

const env = globalThis.process.env || {};

const config = {
  google: {
    credentials: env.GOOGLE_CREDENTIALS_PATH || '',
    sheetId: env.GOOGLE_SHEET_ID || '',
  },
  github: {
    token: env.GITHUB_TOKEN || '',
    repo: env.GITHUB_REPO || 'brakoish/lowend-nyc',
    branch: env.GITHUB_BRANCH || 'main',
  },
  discord: {
    webhookUrl: env.DISCORD_WEBHOOK_URL || '',
  },
  pipeline: {
    publishHour: parseInt(env.PIPELINE_PUBLISH_HOUR || '9'),
    timezone: env.PIPELINE_TIMEZONE || 'America/New_York',
  },
};

// ─── Initialize Clients ───

let sheets, github, notify;

async function initClients() {
  // Google Sheets
  if (config.google.credentials && config.google.sheetId) {
    const resolvedPath = config.google.credentials.replace('~', globalThis.process.env.HOME);
    if (fs.existsSync(resolvedPath)) {
      sheets = await new SheetsClient(resolvedPath, config.google.sheetId).init();
    } else {
      console.warn(`Google credentials not found at ${resolvedPath}`);
      console.warn('Sheets integration disabled. See README for setup.');
    }
  } else {
    console.warn('Google Sheet not configured. Set GOOGLE_CREDENTIALS_PATH and GOOGLE_SHEET_ID.');
  }

  // GitHub
  if (config.github.token) {
    github = new GitHubClient(config.github.token, config.github.repo, config.github.branch);
  } else {
    console.warn('GitHub token not configured. Publishing disabled.');
  }

  // Discord
  notify = new Notifier(config.discord.webhookUrl);
}

// ─── Commands ───

/**
 * CHECK: Look for status changes and send notifications
 */
async function check() {
  if (!sheets) {
    console.log('Sheets not configured. Skipping check.');
    return;
  }

  console.log('\n🔍 Checking pipeline...');

  const rows = await sheets.getAllRows();
  const stats = {
    ideas: 0,
    approved: 0,
    researching: 0,
    researchDone: 0,
    writing: 0,
    editing: 0,
    pendingApproval: 0,
    scheduled: 0,
    published: 0,
  };

  rows.forEach(row => {
    switch (row.status) {
      case STATUS.IDEA: stats.ideas++; break;
      case STATUS.APPROVED: stats.approved++; break;
      case STATUS.RESEARCHING: stats.researching++; break;
      case STATUS.RESEARCH_DONE: stats.researchDone++; break;
      case STATUS.WRITING: stats.writing++; break;
      case STATUS.EDITING: stats.editing++; break;
      case STATUS.PENDING_APPROVAL: stats.pendingApproval++; break;
      case STATUS.SCHEDULED: stats.scheduled++; break;
      case STATUS.PUBLISHED: stats.published++; break;
    }
  });

  console.log(`  Ideas: ${stats.ideas}`);
  console.log(`  Approved: ${stats.approved}`);
  console.log(`  Writing: ${stats.writing}`);
  console.log(`  Pending Review: ${stats.pendingApproval}`);
  console.log(`  Scheduled: ${stats.scheduled}`);
  console.log(`  Published: ${stats.published}`);

  // Notify about items needing attention
  if (stats.ideas > 0) {
    const ideas = rows.filter(r => r.status === STATUS.IDEA);
    for (const idea of ideas) {
      await notify.newTopic(idea.topic, idea.angle, idea.rowNumber);
    }
  }

  if (stats.pendingApproval > 0) {
    const pending = rows.filter(r => r.status === STATUS.PENDING_APPROVAL);
    for (const article of pending) {
      await notify.draftReady(article.topic, article.slug, article.rowNumber);
    }
  }

  return stats;
}

/**
 * PROCESS: Handle approved topics — generate briefs, spawn agents
 */
async function processTopics() {
  if (!sheets) {
    console.log('Sheets not configured. Skipping process.');
    return;
  }

  console.log('\n⚙️  Processing pipeline...');

  // Ensure briefs directory exists
  const briefsDir = path.join(__dirname, 'briefs');
  if (!fs.existsSync(briefsDir)) {
    fs.mkdirSync(briefsDir, { recursive: true });
  }

  // ─── Step 1: APPROVED → RESEARCHING ───
  const approved = await sheets.getRowsByStatus(STATUS.APPROVED);

  for (const row of approved) {
    console.log(`\n  🔬 Researching: "${row.topic}"`);

    // Generate research task
    const researchTask = generateResearchTask(row);
    const taskPath = saveResearchBrief(row.slug, researchTask);
    console.log(`    Research task saved: ${taskPath}`);

    // Update status
    await sheets.updateStatus(row.rowNumber, STATUS.RESEARCHING);

    // Notify
    await notify.topicApproved(row.topic, 'researcher');

    console.log(`    Status → RESEARCHING`);
    console.log(`    ⚡ Research task ready — researcher agent will gather facts`);
  }

  // ─── Step 2: RESEARCH_DONE → WRITING ───
  const researched = await sheets.getRowsByStatus(STATUS.RESEARCH_DONE);

  for (const row of researched) {
    console.log(`\n  ✍️  Writing: "${row.topic}"`);

    // Read the completed research brief
    const researchBrief = readResearchBrief(row.slug);

    // Generate writing brief (includes template + research)
    const brief = generateBrief(row);
    
    // Combine writing brief with research findings
    let fullBrief = brief;
    if (researchBrief) {
      fullBrief += `\n\n---\n\n# RESEARCH FINDINGS\n\nThe following research has been gathered and verified. Use these facts in your article.\n\n${researchBrief}`;
    }

    const briefPath = path.join(briefsDir, `${row.slug}-writing-brief.md`);
    fs.writeFileSync(briefPath, fullBrief, 'utf-8');
    console.log(`    Writing brief saved: ${briefPath}`);

    // Update status
    await sheets.updateStatus(row.rowNumber, STATUS.WRITING);
    await sheets.setWriter(row.rowNumber, 'lowend-nyc-writer');

    console.log(`    Status → WRITING`);
    console.log(`    ⚡ Writer brief ready with research — writer agent will draft article`);
  }

  // Get drafts ready for editing
  const draftsReady = await sheets.getRowsByStatus(STATUS.DRAFT_READY);

  for (const row of draftsReady) {
    console.log(`\n  Editing: "${row.topic}"`);

    const draftContent = readDraft(row.slug);
    if (!draftContent) {
      console.log(`    ⚠️ Draft file not found for slug: ${row.slug}`);
      continue;
    }

    // Generate editing brief
    const editBrief = generateEditBrief(row, draftContent);
    const editBriefPath = path.join(__dirname, 'briefs', `${row.slug}-edit-brief.md`);
    fs.writeFileSync(editBriefPath, editBrief, 'utf-8');
    console.log(`    Edit brief saved: ${editBriefPath}`);

    // Update status
    await sheets.updateStatus(row.rowNumber, STATUS.EDITING);
    await sheets.setEditor(row.rowNumber, 'lowend-nyc-editor');

    console.log(`    Status → EDITING`);
  }

  if (approved.length === 0 && draftsReady.length === 0) {
    console.log('  No topics to process.');
  }
}

/**
 * PUBLISH: Commit scheduled articles to GitHub
 */
async function publish() {
  if (!sheets || !github) {
    console.log('Sheets or GitHub not configured. Skipping publish.');
    return;
  }

  console.log('\n🚀 Publishing scheduled articles...');

  const ready = await sheets.getReadyToPublish();

  if (ready.length === 0) {
    console.log('  No articles scheduled for today.');
    return;
  }

  for (const row of ready) {
    console.log(`\n  Publishing: "${row.topic}" (${row.slug})`);

    // Read the draft
    const content = readDraft(row.slug);
    if (!content) {
      console.log(`    ⚠️ Draft not found: ${row.slug}`);
      await notify.pipelineError('publish', `Draft not found for ${row.slug}`);
      continue;
    }

    try {
      // Commit to GitHub
      await github.publishArticle(row.slug, content);

      // Update status
      await sheets.updateStatus(row.rowNumber, STATUS.PUBLISHED);

      // Notify
      await notify.articlePublished(row.topic, row.slug);

      console.log(`    ✅ Published!`);
    } catch (error) {
      console.error(`    ❌ Publish failed: ${error.message}`);
      await notify.pipelineError('publish', error.message);
    }
  }
}

/**
 * SETUP: Initialize the Google Sheet structure
 */
async function setup() {
  if (!sheets) {
    console.log('Sheets not configured. Cannot setup.');
    return;
  }

  console.log('\n📋 Setting up Google Sheet...');
  await sheets.setupSheet();
  console.log('  ✅ Sheet structure created');
}

/**
 * ADD: Add a new topic to the pipeline
 */
async function addTopic(topic, angle, template, genre, priority) {
  if (!sheets) {
    console.log('Sheets not configured. Cannot add topic.');
    return;
  }

  await sheets.addTopic(topic, angle, template, genre, priority);
  await notify.newTopic(topic, angle, 'new');
}

/**
 * SUMMARY: Send daily pipeline summary
 */
async function summary() {
  const stats = await check();
  if (stats) {
    await notify.dailySummary({
      ...stats,
      publishedToday: 0,
      totalPublished: stats.published,
    });
  }
}

/**
 * RUN: Full pipeline cycle
 */
async function run() {
  console.log('═══════════════════════════════════════');
  console.log('  LOWEND NYC Editorial Pipeline');
  console.log('═══════════════════════════════════════');

  await check();
  await processTopics();
  await publish();

  console.log('\n═══════════════════════════════════════');
  console.log('  Pipeline cycle complete');
  console.log('═══════════════════════════════════════');
}

/**
 * TEST: Verify all connections
 */
async function test() {
  console.log('\n🧪 Testing pipeline connections...\n');

  // Test Google Sheets
  if (sheets) {
    try {
      const rows = await sheets.getAllRows();
      console.log(`  ✅ Google Sheets: Connected (${rows.length} rows)`);
    } catch (error) {
      console.log(`  ❌ Google Sheets: ${error.message}`);
    }
  } else {
    console.log('  ⚠️ Google Sheets: Not configured');
  }

  // Test GitHub
  if (github) {
    try {
      const exists = await github.articleExists('ayybo-knockdown-center');
      console.log(`  ✅ GitHub: Connected (test article ${exists ? 'exists' : 'not found'})`);
    } catch (error) {
      console.log(`  ❌ GitHub: ${error.message}`);
    }
  } else {
    console.log('  ⚠️ GitHub: Not configured');
  }

  // Test Discord
  if (config.discord.webhookUrl) {
    try {
      await notify.send('🧪 Pipeline test notification — if you see this, Discord is working!');
      console.log('  ✅ Discord: Notification sent');
    } catch (error) {
      console.log(`  ❌ Discord: ${error.message}`);
    }
  } else {
    console.log('  ⚠️ Discord: Not configured');
  }

  console.log('\nDone.');
}

// ─── CLI ───

async function main() {
  const command = globalThis.process.argv[2] || 'run';
  const args = globalThis.process.argv.slice(3);

  await initClients();

  switch (command) {
    case 'check':
      await check();
      break;
    case 'process':
      await processTopics();
      break;
    case 'publish':
      await publish();
      break;
    case 'run':
      await run();
      break;
    case 'setup':
      await setup();
      break;
    case 'summary':
      await summary();
      break;
    case 'add':
      if (args.length < 2) {
        console.log('Usage: node orchestrator.js add "Topic" "Angle" [template] [genre] [priority]');
        globalThis.process.exit(1);
      }
      await addTopic(args[0], args[1], args[2] || 'event-preview', args[3] || 'Electronic', args[4] || 'Normal');
      break;
    case 'test':
      await test();
      break;
    case 'bridge':
      // Import events from scout
      const { execSync } = require('child_process');
      try {
        execSync('node scout-bridge.js --days 14 --min-priority high', {
          cwd: __dirname,
          stdio: 'inherit'
        });
      } catch (e) {
        console.log('Bridge failed or no events to import');
      }
      break;
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Available: check, process, publish, run, setup, summary, add, test, bridge');
      globalThis.process.exit(1);
  }
}

main().catch(error => {
  console.error('Pipeline error:', error);
  globalThis.process.exit(1);
});
