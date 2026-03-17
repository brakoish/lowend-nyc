/**
 * researcher.js — Research agent for LOWEND NYC pipeline
 * 
 * Gathers facts about artists, venues, and events before the writer gets involved.
 * Output: structured research brief with verified data and sources.
 */

const fs = require('fs');
const path = require('path');

const BRIEFS_DIR = path.join(__dirname, 'briefs');

/**
 * Generate a research task based on topic and template type
 */
function generateResearchTask(row) {
  const tasks = {
    'artist-profile': generateArtistResearchTask,
    'event-preview': generateEventResearchTask,
    'venue-spotlight': generateVenueResearchTask,
    'scene-analysis': generateSceneResearchTask,
    'list-format': generateListResearchTask,
    'hot-take': generateHotTakeResearchTask,
    'editorial': generateEditorialResearchTask,
    'event-recap': generateEventResearchTask,
  };

  const taskFn = tasks[row.template] || generateGenericResearchTask;
  return taskFn(row);
}

function generateArtistResearchTask(row) {
  // Extract artist name from topic
  const artistName = extractArtistName(row.topic);

  return `
# Research Task — LOWEND NYC

## Subject
**${row.topic}**
Angle: ${row.angle || 'Artist profile'}

## Artist to Research: ${artistName}

### Required Data Points

**Identity**
- [ ] Full/real name (if publicly known)
- [ ] Origin city/country
- [ ] Current base
- [ ] Active since (year)
- [ ] Age (if publicly known)
- [ ] Pronouns (if stated publicly)

**Music**
- [ ] Primary genre(s) — be specific (not just "techno" — what kind?)
- [ ] Label affiliations (current and past)
- [ ] Notable releases (last 2 years minimum, with dates)
- [ ] Most streamed/popular tracks (with play counts if available)
- [ ] Production style — what makes their sound distinct?
- [ ] Any aliases or side projects

**Career**
- [ ] Breakthrough moment — what put them on the map?
- [ ] Major festival appearances (list with years)
- [ ] Residencies (current or past)
- [ ] Notable collaborations
- [ ] Awards or chart positions
- [ ] Any controversy or notable public moments

**NYC Connections**
- [ ] Previous NYC shows (venues, dates, promoters)
- [ ] Upcoming NYC dates
- [ ] Any NYC-specific relationships (labels, collectives, venues)

**Social & Following**
- [ ] Instagram followers + handle
- [ ] SoundCloud followers + handle
- [ ] Spotify monthly listeners
- [ ] Beatport chart positions
- [ ] Resident Advisor profile URL
- [ ] Other relevant platforms

**Quotes**
- [ ] Find 2-3 notable quotes from interviews, podcasts, or social media
- [ ] Source each quote with link

**Context**
- [ ] What's happening in their genre right now?
- [ ] Who are their peers/contemporaries?
- [ ] What's their current trajectory — rising, peaking, evolving?

### Sources to Check
1. Resident Advisor (ra.co/dj/${artistName.toLowerCase().replace(/\s+/g, '')})
2. Spotify artist page
3. SoundCloud
4. Beatport
5. Instagram
6. Recent interviews (YouTube, podcasts, press)
7. Bandcamp (if applicable)
8. Discogs

### Output Format

Return a structured research brief in this format:

\`\`\`markdown
# Research Brief: ${artistName}

## Quick Facts
- **Real Name**: 
- **Origin**: 
- **Based**: 
- **Active Since**: 
- **Genre**: 
- **Labels**: 
- **Spotify Monthly Listeners**: 
- **Instagram**: @handle (X followers)

## Discography Highlights
1. "Track Name" (Year) — Label — [context]
2. "Track Name" (Year) — Label — [context]
3. "Track Name" (Year) — Label — [context]

## Career Timeline
- YYYY: [milestone]
- YYYY: [milestone]
- YYYY: [milestone]

## NYC History
- [Date]: [Venue] — [Promoter] — [context]

## Notable Quotes
> "Quote" — Source, Date

## Current Moment
[What they're doing right now — touring, releasing, etc.]

## Scene Context
[Where they fit in the broader landscape]

## Sources
- [URL 1]
- [URL 2]
\`\`\`

### Important
- Only include VERIFIED facts with sources
- Mark anything uncertain with [UNVERIFIED]
- Do NOT fabricate quotes, stats, or dates
- If data isn't available, say so — don't guess
`;
}

function generateEventResearchTask(row) {
  return `
# Research Task — LOWEND NYC

## Subject
**${row.topic}**
Angle: ${row.angle || 'Event preview/coverage'}

### Required Data Points

**Event Details**
- [ ] Full event name
- [ ] Date and time
- [ ] Venue name and address
- [ ] Promoter/presenter
- [ ] Ticket price and link
- [ ] Age restriction
- [ ] Lineup (full, with set times if available)

**Headliner Research**
- [ ] Bio summary (origin, genre, notable releases)
- [ ] Recent touring activity
- [ ] Previous NYC appearances
- [ ] Current releases or projects
- [ ] Social handles and follower counts

**Support Acts**
- [ ] Brief bio for each
- [ ] Why they fit this bill

**Venue Context**
- [ ] Venue capacity
- [ ] Sound system details
- [ ] Neighborhood and transit options
- [ ] Recent notable shows at this venue

**Promoter Context**
- [ ] Who's behind this event?
- [ ] Their track record — other notable events
- [ ] Their booking philosophy

### Sources to Check
1. Event page (RA, DICE, Eventbrite, venue website)
2. Artist socials for tour announcements
3. Promoter socials
4. Previous coverage of this venue/promoter

### Output Format
Return structured research brief with all verified facts and source URLs.
Mark anything uncertain with [UNVERIFIED].
`;
}

function generateVenueResearchTask(row) {
  return `
# Research Task — LOWEND NYC

## Subject
**${row.topic}**
Angle: ${row.angle || 'Venue spotlight'}

### Required Data Points

**Venue Identity**
- [ ] Full name and address
- [ ] Neighborhood and borough
- [ ] Year opened
- [ ] Capacity (main room + any additional rooms)
- [ ] Owner/operator names
- [ ] Parent company (if any)

**Physical Space**
- [ ] Sound system (brand, configuration)
- [ ] Room layout (single room, multi-room, outdoor?)
- [ ] Notable design/architectural features
- [ ] Recent renovations or changes

**Programming**
- [ ] Booking philosophy — what genres, what level of artist?
- [ ] Regular nights/residencies
- [ ] Notable past headliners (last 2 years)
- [ ] Upcoming calendar highlights
- [ ] Associated promoters

**History**
- [ ] What was the space before?
- [ ] Key milestones in the venue's history
- [ ] Any controversies (noise complaints, closures, incidents)
- [ ] Community response — how is it perceived?

**Practical Info**
- [ ] Transit options
- [ ] Cover charge range
- [ ] Crowd description
- [ ] Drink prices (approximate)
- [ ] Door policy

### Sources to Check
1. Venue website
2. RA venue page
3. Google Maps reviews
4. Local press coverage
5. Social media

### Output Format
Return structured research brief with verified facts and sources.
`;
}

function generateSceneResearchTask(row) {
  return `
# Research Task — LOWEND NYC

## Subject
**${row.topic}**
Angle: ${row.angle || 'Scene analysis'}

### Required Data Points
- [ ] Key statistics (venue openings/closings, event frequency, ticket prices)
- [ ] Notable quotes from promoters, DJs, venue owners
- [ ] Specific examples supporting the thesis
- [ ] Counter-examples or opposing viewpoints
- [ ] Historical context — how did we get here?
- [ ] Comparable situations in other cities

### Sources to Check
1. RA editorial
2. Local press (Time Out NY, Brooklyn Paper, etc.)
3. Social media discussions
4. Industry publications (DJ Mag, Mixmag, etc.)

### Output Format
Return structured research brief with data points, quotes, and sources.
`;
}

function generateListResearchTask(row) {
  return `
# Research Task — LOWEND NYC

## Subject
**${row.topic}**
Angle: ${row.angle || 'List/roundup'}

### Required Data Points
- [ ] Research each item thoroughly — release date, label, context
- [ ] Verify all names, spellings, dates
- [ ] Find streaming/purchase links
- [ ] Get play counts or chart positions where relevant
- [ ] Identify what connects the items thematically

### Output Format
Return structured research brief with verified data for each list item.
`;
}

function generateHotTakeResearchTask(row) {
  return `
# Research Task — LOWEND NYC

## Subject
**${row.topic}**
Angle: ${row.angle || 'Opinion/debate piece'}

### Required Data Points
- [ ] Facts supporting the main argument
- [ ] Facts supporting the counter-argument
- [ ] Quotes from relevant figures on both sides
- [ ] Specific examples and data points
- [ ] Historical precedent or comparable situations
- [ ] Financial data if relevant (ticket prices, revenue, ownership)

### Sources to Check
1. Public records, press releases
2. Industry publications
3. Social media statements from involved parties
4. Local press coverage
5. Community discussions (Reddit, forums)

### Output Format
Return structured research brief with evidence for BOTH sides of the argument.
Mark opinion vs fact clearly.
`;
}

function generateEditorialResearchTask(row) {
  return generateHotTakeResearchTask(row);
}

function generateGenericResearchTask(row) {
  return `
# Research Task — LOWEND NYC

## Subject
**${row.topic}**
Angle: ${row.angle || 'General coverage'}

### Required Data Points
- [ ] All relevant facts, names, dates, locations
- [ ] Social media handles and follower counts
- [ ] Notable quotes from interviews or public statements
- [ ] Context within the NYC electronic music scene
- [ ] Source URLs for all claims

### Output Format
Return structured research brief with verified facts and sources.
`;
}

/**
 * Extract artist name from topic string
 */
function extractArtistName(topic) {
  // Common patterns: "Artist Name: subtitle", "Artist Name Is...", "Artist Name at Venue"
  const patterns = [
    /^([^:]+?):/,           // "Artist: ..."
    /^(.+?)\s+Is\s/i,      // "Artist Is ..."
    /^(.+?)\s+at\s/i,      // "Artist at ..."
    /^(.+?)\s+Brought/i,   // "Artist Brought ..."
    /^(.+?)\s+Turns/i,     // "Artist Turns ..."
    /^(.+?)['']s\s/,       // "Artist's ..."
  ];

  for (const pattern of patterns) {
    const match = topic.match(pattern);
    if (match) return match[1].trim();
  }

  // Fallback: first 3 words
  return topic.split(' ').slice(0, 3).join(' ');
}

/**
 * Save research brief to file
 */
function saveResearchBrief(slug, content) {
  if (!fs.existsSync(BRIEFS_DIR)) {
    fs.mkdirSync(BRIEFS_DIR, { recursive: true });
  }
  const filePath = path.join(BRIEFS_DIR, `${slug}-research.md`);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Research task saved: ${filePath}`);
  return filePath;
}

/**
 * Read research brief
 */
function readResearchBrief(slug) {
  const filePath = path.join(BRIEFS_DIR, `${slug}-research.md`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return null;
}

module.exports = {
  generateResearchTask,
  saveResearchBrief,
  readResearchBrief,
  extractArtistName,
};
