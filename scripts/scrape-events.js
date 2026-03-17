#!/usr/bin/env node
/**
 * LOWEND NYC Event Scraper
 * 
 * Scrapes upcoming electronic music events from multiple sources
 * Outputs to JSON for editorial calendar import
 * 
 * Usage: node scrape-events.js [--days 30] [--output events.json]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  daysAhead: 30,
  venues: [
    { name: 'Knockdown Center', city: 'Queens', raId: '131393' },
    { name: 'Brooklyn Mirage', city: 'Brooklyn', raId: '106887' },
    { name: 'Basement', city: 'Brooklyn', raId: '131837' },
    { name: 'Elsewhere', city: 'Brooklyn', raId: '106886' },
    { name: 'Nowadays', city: 'Queens', raId: '106888' },
    { name: '99 Scott', city: 'Brooklyn', raId: '131394' },
    { name: 'Superior Ingredients', city: 'Brooklyn', raId: '131395' },
    { name: 'Le Bain', city: 'Manhattan', raId: '106889' },
  ],
  genres: {
    'techno': ['techno', 'industrial', 'melodic techno', 'hard techno'],
    'house': ['house', 'deep house', 'progressive house', 'bass house', 'ghetto house'],
    'garage': ['garage', 'uk garage', 'bassline', 'speed garage'],
    'bass': ['dubstep', 'trap', 'bass', 'future bass', 'halftime'],
    'dnb': ['drum and bass', 'dnb', 'jungle', 'liquid', 'neuro'],
    'ambient': ['ambient', 'experimental', 'downtempo'],
  }
};

// Parse command line args
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { days: CONFIG.daysAhead, output: 'events-scraped.json' };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--days' && args[i + 1]) {
      options.days = parseInt(args[i + 1]);
      i++;
    }
    if (args[i] === '--output' && args[i + 1]) {
      options.output = args[i + 1];
      i++;
    }
  }
  return options;
}

// Detect genre from event data
function detectGenre(title, description = '', artists = []) {
  const text = `${title} ${description} ${artists.join(' ')}`.toLowerCase();
  const detected = [];
  
  for (const [genre, keywords] of Object.entries(CONFIG.genres)) {
    if (keywords.some(kw => text.includes(kw))) {
      detected.push(genre);
    }
  }
  
  return detected.length > 0 ? detected : ['electronic'];
}

// Create event object
function createEvent(data) {
  const now = new Date();
  const eventDate = new Date(data.date);
  const daysUntil = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
  
  return {
    id: `${data.venue.slug}-${data.date}-${data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`.slice(0, 50),
    title: data.title,
    date: data.date,
    time: data.time || 'TBD',
    venue: data.venue.name,
    venueCity: data.venue.city,
    artists: data.artists || [],
    headliner: data.artists?.[0] || 'TBD',
    genre: detectGenre(data.title, data.description, data.artists),
    description: data.description || '',
    ticketUrl: data.ticketUrl || '',
    price: data.price || 'TBD',
    age: data.age || '21+',
    daysUntil,
    status: daysUntil > 7 ? 'upcoming' : 'soon',
    scrapedAt: now.toISOString(),
    // Editorial fields (to be filled manually)
    assignedTo: '',
    coverageType: '', // 'preview', 'recap', 'profile', 'none'
    draftDue: '',
    publishDate: '',
    priority: daysUntil < 14 ? 'high' : 'normal',
    notes: ''
  };
}

// Mock scraper for Resident Advisor (replace with actual fetch)
async function scrapeResidentAdvisor(venue, days) {
  // TODO: Implement actual RA scraping
  // For now, return placeholder structure
  console.log(`Scraping ${venue.name}...`);
  
  // This would be: fetch(`https://ra.co/events/us/newyork?venue=${venue.raId}`)
  // Then parse HTML with cheerio or similar
  
  return []; // Return empty for now
}

// Scrape Bandsintown (alternative source)
async function scrapeBandsintown(venue, days) {
  // TODO: Implement BIT scraping
  console.log(`Checking Bandsintown for ${venue.name}...`);
  return [];
}

// Main scrape function
async function scrapeAll(options) {
  const allEvents = [];
  
  console.log(`Scraping events for next ${options.days} days...\n`);
  
  for (const venue of CONFIG.venues) {
    try {
      const raEvents = await scrapeResidentAdvisor(venue, options.days);
      const bitEvents = await scrapeBandsintown(venue, options.days);
      
      allEvents.push(...raEvents, ...bitEvents);
    } catch (err) {
      console.error(`Error scraping ${venue.name}:`, err.message);
    }
  }
  
  // Sort by date
  allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return allEvents;
}

// Export to different formats
function exportEvents(events, outputPath) {
  const ext = path.extname(outputPath).toLowerCase();
  
  if (ext === '.json') {
    fs.writeFileSync(outputPath, JSON.stringify(events, null, 2));
  } else if (ext === '.csv') {
    // Simple CSV export
    const headers = Object.keys(events[0] || {}).join(',');
    const rows = events.map(e => 
      Object.values(e).map(v => 
        Array.isArray(v) ? `"${v.join(', ')}"` : `"${v}"`
      ).join(',')
    );
    fs.writeFileSync(outputPath, [headers, ...rows].join('\n'));
  }
  
  console.log(`\nExported ${events.length} events to ${outputPath}`);
}

// Generate editorial calendar template
function generateCalendarTemplate(events, outputPath) {
  const template = {
    generatedAt: new Date().toISOString(),
    instructions: {
      coverageType: 'preview = before event, recap = after event, profile = artist feature, none = skip',
      priority: 'high = next 2 weeks, normal = beyond',
      status: 'idea → assigned → draft → editing → scheduled → published'
    },
    events: events
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2));
  console.log(`Calendar template saved to ${outputPath}`);
}

// Main
async function main() {
  const options = parseArgs();
  
  console.log('╔════════════════════════════════════╗');
  console.log('║   LOWEND NYC Event Scraper         ║');
  console.log('╚════════════════════════════════════╝\n');
  
  // For now, create sample data structure
  // Replace with actual scraping implementation
  const sampleEvents = [
    createEvent({
      title: 'Sample Event - Replace with Real Scraper',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      venue: CONFIG.venues[0],
      artists: ['Artist Name'],
      description: 'This is a placeholder. Implement actual scraping.',
      ticketUrl: 'https://example.com/tickets'
    })
  ];
  
  exportEvents(sampleEvents, options.output);
  generateCalendarTemplate(sampleEvents, options.output.replace('.json', '-calendar.json'));
  
  console.log('\n✓ Done!');
  console.log('\nNext steps:');
  console.log('1. Implement actual scraping in scrapeResidentAdvisor()');
  console.log('2. Add API keys if needed');
  console.log('3. Run: node scrape-events.js --days 14 --output events.json');
  console.log('4. Import to Google Sheets or Notion');
}

main().catch(console.error);
