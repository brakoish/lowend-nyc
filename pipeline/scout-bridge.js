#!/usr/bin/env node
/**
 * scout-bridge.js — Connects event scraper to editorial pipeline
 * 
 * Reads events.json from scout and imports high-priority events
 * to the Google Sheet as IDEA status.
 * 
 * Usage: node scout-bridge.js [--days 14] [--min-priority high]
 */

const dotenvPath = require('path').join(__dirname, '.env');
try { require('dotenv').config({ path: dotenvPath }); } catch(e) {}

const { SheetsClient, STATUS } = require('./sheets');
const { Notifier } = require('./notify');
const fs = require('fs');
const path = require('path');

const env = globalThis.process.env || {};
let sheets, notify;

// Configuration
const CONFIG = {
  eventsFile: path.join(__dirname, '..', 'content', 'events.json'),
  calendarFile: path.join(__dirname, '..', 'content', 'events-calendar.json'),
  defaultDays: 14,
  minPriority: 'normal', // 'high' or 'normal'
};

async function init() {
  const credPath = (env.GOOGLE_CREDENTIALS_PATH || '').replace('~', env.HOME);
  if (fs.existsSync(credPath) && env.GOOGLE_SHEET_ID) {
    sheets = await new SheetsClient(credPath, env.GOOGLE_SHEET_ID).init();
  }
  notify = new Notifier(env.DISCORD_WEBHOOK_URL || '');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { 
    days: CONFIG.defaultDays, 
    minPriority: CONFIG.minPriority,
    dryRun: false 
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--days' && args[i + 1]) {
      options.days = parseInt(args[i + 1]);
      i++;
    }
    if (args[i] === '--min-priority' && args[i + 1]) {
      options.minPriority = args[i + 1];
      i++;
    }
    if (args[i] === '--dry-run') {
      options.dryRun = true;
    }
  }
  return options;
}

function loadEvents() {
  if (!fs.existsSync(CONFIG.eventsFile)) {
    console.log('No events.json found. Run scout first:');
    console.log('  python3 scripts/scrape_events.py --source ra --days 30');
    return null;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(CONFIG.eventsFile, 'utf-8'));
    return data.events || data; // Handle both {events: []} and direct array
  } catch (e) {
    console.error('Error parsing events.json:', e.message);
    return null;
  }
}

function filterEvents(events, options) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() + options.days);
  
  return events.filter(e => {
    // Date filter
    const eventDate = new Date(e.date);
    if (eventDate > cutoffDate) return false;
    
    // Priority filter
    if (options.minPriority === 'high' && e.priority !== 'high') return false;
    
    // Genre filter - only electronic music
    const electronicGenres = ['techno', 'house', 'garage', 'bass', 'dnb', 'drum and bass', 'dubstep'];
    const hasElectronicGenre = e.genre?.some(g => 
      electronicGenres.some(eg => g.toLowerCase().includes(eg))
    );
    
    return hasElectronicGenre;
  });
}

function generateTopic(event) {
  const headliner = event.headliner || event.artists?.[0] || 'TBD';
  const venue = event.venue;
  return `${headliner} at ${venue}`;
}

function generateAngle(event) {
  const daysUntil = event.days_until || 0;
  const headliner = event.headliner || event.artists?.[0];
  
  if (daysUntil <= 7) {
    return `This week: ${headliner} takes over ${event.venue}. Preview the set and what to expect.`;
  }
  if (daysUntil <= 14) {
    return `Upcoming show: ${headliner} at ${event.venue}. Worth the hype?`;
  }
  return `${headliner} at ${event.venue} — preview and analysis.`;
}

function detectTemplate(event) {
  const daysUntil = event.days_until || 0;
  
  // If event is in the past, it's a recap
  if (daysUntil < 0) return 'event-recap';
  
  // If multiple headliners or festival vibe, could be scene-analysis
  if (event.artists?.length > 3) return 'scene-analysis';
  
  // Default to preview for upcoming shows
  return 'event-preview';
}

async function getExistingTopics() {
  if (!sheets) return new Set();
  
  const rows = await sheets.getAllRows();
  return new Set(rows.map(r => r.topic.toLowerCase()));
}

async function importEvents(events, options) {
  if (!sheets) {
    console.log('Sheets not configured. Cannot import.');
    return;
  }
  
  const existingTopics = await getExistingTopics();
  let imported = 0;
  let skipped = 0;
  
  for (const event of events) {
    const topic = generateTopic(event);
    
    // Skip if already in pipeline
    if (existingTopics.has(topic.toLowerCase())) {
      console.log(`  ⏭️  Skipping (exists): ${topic}`);
      skipped++;
      continue;
    }
    
    const angle = generateAngle(event);
    const template = detectTemplate(event);
    const genre = Array.isArray(event.genre) ? event.genre.join(', ') : event.genre;
    const priority = event.priority || 'normal';
    
    if (options.dryRun) {
      console.log(`  [DRY RUN] Would add: ${topic}`);
      console.log(`    Template: ${template}, Priority: ${priority}`);
      imported++;
      continue;
    }
    
    try {
      await sheets.addTopic(topic, angle, template, genre, priority);
      console.log(`  ✅ Added: ${topic}`);
      imported++;
      
      // Small delay to avoid rate limits
      await sleep(500);
    } catch (e) {
      console.error(`  ❌ Failed to add ${topic}:`, e.message);
    }
  }
  
  console.log(`\n📊 Import complete:`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped (duplicates): ${skipped}`);
  
  if (imported > 0 && !options.dryRun) {
    await notify.send(`📥 **Scout Import**: ${imported} new events added to pipeline`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const options = parseArgs();
  await init();
  
  console.log('╔══════════════════════════════════════╗');
  console.log('║   LOWEND NYC Scout Bridge            ║');
  console.log('╚══════════════════════════════════════╝\n');
  
  console.log(`Settings:`);
  console.log(`  Days ahead: ${options.days}`);
  console.log(`  Min priority: ${options.minPriority}`);
  console.log(`  Dry run: ${options.dryRun ? 'YES' : 'NO'}\n`);
  
  // Load events
  const events = loadEvents();
  if (!events) return;
  
  console.log(`Found ${events.length} total events`);
  
  // Filter
  const filtered = filterEvents(events, options);
  console.log(`${filtered.length} events match criteria\n`);
  
  if (filtered.length === 0) {
    console.log('No events to import.');
    return;
  }
  
  // Show sample
  console.log('Sample events to import:');
  filtered.slice(0, 5).forEach(e => {
    console.log(`  • ${generateTopic(e)} (${e.date})`);
  });
  if (filtered.length > 5) {
    console.log(`  ... and ${filtered.length - 5} more`);
  }
  console.log('');
  
  // Import
  await importEvents(filtered, options);
}

main().catch(console.error);
