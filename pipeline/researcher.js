/**
 * researcher.js — Research agent for LOWEND NYC pipeline
 * 
 * Gathers facts about artists, venues, and events.
 * Output: structured research brief with verified data and sources.
 * 
 * MODEL RECOMMENDATIONS:
 *   Researcher: gemini-3-flash (fast, cheap, good at web search + extraction)
 *   Writer: kimi or sonnet (creative, strong voice, long-form)
 *   Editor: haiku (fast, cheap, good at proofreading + fact-checking)
 */

const fs = require('fs');
const path = require('path');

const BRIEFS_DIR = path.join(__dirname, 'briefs');

/**
 * Model recommendations per pipeline step
 * Optimized for cost, speed, and quality per task
 */
const MODEL_CONFIG = {
  researcher: {
    model: 'gemini-3-flash',
    alias: 'google/gemini-3-flash-preview',
    reason: 'Fast, cheap, excellent at web search synthesis and data extraction. Low token cost for high-volume fact gathering.',
  },
  writer: {
    model: 'kimi',
    alias: 'moonshot/kimi-k2.5',
    reason: 'Strong creative writing, good voice/personality, handles long-form well. Cost-effective for draft generation.',
  },
  editor: {
    model: 'haiku',
    alias: 'anthropic/claude-3-5-haiku-20241022',
    reason: 'Fast, cheap, precise. Excellent for fact-checking, grammar, and style consistency. Low token usage for review tasks.',
  },
  // Alternative configs for different quality/cost tradeoffs
  alternatives: {
    writerPremium: { model: 'sonnet', alias: 'anthropic/claude-sonnet-4-20250514', reason: 'Higher quality writing, better nuance' },
    researcherDeep: { model: 'sonnet', alias: 'anthropic/claude-sonnet-4-20250514', reason: 'Better reasoning for complex research' },
  },
};

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
    'editorial': generateHotTakeResearchTask,
    'event-recap': generateEventResearchTask,
  };

  const taskFn = tasks[row.template] || generateGenericResearchTask;
  return taskFn(row);
}

function generateArtistResearchTask(row) {
  const artistName = extractArtistName(row.topic);

  return `# Research Task — LOWEND NYC
**Model**: ${MODEL_CONFIG.researcher.model} (${MODEL_CONFIG.researcher.reason})

## Subject: ${row.topic}
Angle: ${row.angle || 'Artist profile'}
Artist: ${artistName}

## INTERVIEWS & QUOTES (Priority)

Search for and extract quotes from:
- [ ] YouTube interviews (search: "${artistName} interview")
- [ ] Podcast appearances (search: "${artistName} podcast DJ")
- [ ] Magazine/blog interviews (Mixmag, DJ Mag, RA, FADER, Pitchfork)
- [ ] Social media statements (Instagram captions, Twitter threads)
- [ ] Reddit AMAs or fan Q&As
- [ ] Boiler Room / HÖR Berlin chat segments

For each interview found:
- Source name and URL
- Date published
- 2-3 best quotes (with context)
- Key topics discussed

## IDENTITY
- [ ] Full/real name (if public)
- [ ] Origin city/country
- [ ] Current base
- [ ] Active since
- [ ] Pronouns (if stated)

## MUSIC
- [ ] Primary genre(s) — be specific (sub-genre level)
- [ ] Label affiliations (current + past)
- [ ] Notable releases (last 2 years, with dates and labels)
- [ ] Most streamed tracks (Spotify play counts)
- [ ] Production style — what makes them distinct?
- [ ] Aliases or side projects

## CAREER
- [ ] Breakthrough moment
- [ ] Festival appearances (with years)
- [ ] Residencies
- [ ] Collaborations
- [ ] Any controversy or notable public moments

## NYC CONNECTIONS
- [ ] Previous NYC shows (venues, dates, promoters)
- [ ] Upcoming NYC dates
- [ ] NYC-specific relationships (labels, collectives)

## SOCIAL & FOLLOWING
- [ ] Instagram: @handle (follower count)
- [ ] SoundCloud: handle (follower count)
- [ ] Spotify: monthly listeners
- [ ] Beatport: chart positions
- [ ] RA profile URL

## IMAGES (Legal to Use)

Find images we can legally use. For each image provide: URL, source, license type.

**Priority order:**
1. **Press kit / EPK photos** — Check artist website for press/media section (usually free for editorial use)
2. **Creative Commons** — Wikimedia Commons, Flickr CC-licensed photos
3. **Official promo shots** — From label press releases (editorial use permitted)
4. **Event flyers / artwork** — From promoter social media (fair use for coverage)
5. **Album / single artwork** — From Spotify, Bandcamp, label sites (fair use for review)
6. **Venue photos** — From venue website press section
7. **RA artist photo** — From their RA profile

**Search locations:**
- [ ] Artist website → Press/Media/EPK section
- [ ] Label website → Press section
- [ ] Wikimedia Commons: "${artistName}"
- [ ] Flickr Creative Commons: "${artistName} DJ"
- [ ] Artist Instagram (note: need permission, but can reference)
- [ ] Event promoter press assets

**For each image found, note:**
- Direct URL
- Source/photographer credit
- License type (CC-BY, CC-BY-SA, press kit, fair use editorial)
- Resolution (if visible)
- Description (what's in the image)

**DO NOT use:**
- Getty Images, Shutterstock, or other paid stock (we don't have licenses)
- Uncredited random Google Images
- Fan photos without permission

## CONTEXT
- [ ] Current genre landscape — who are their peers?
- [ ] Trajectory — rising, established, evolving?
- [ ] Recent press coverage

## Sources to Check
1. Resident Advisor (ra.co/dj/${artistName.toLowerCase().replace(/\s+/g, '')})
2. Spotify artist page
3. YouTube (interviews, sets, Boiler Room)
4. SoundCloud
5. Beatport
6. Instagram
7. Mixmag, DJ Mag, FADER, Pitchfork interviews
8. Bandcamp
9. Discogs

## Output Format

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

## Interviews Found
### [Source Name] — [Date]
URL: [link]
> "Quote 1" 
> "Quote 2"
Topics: [what they discussed]

## Discography Highlights
1. "Track" (Year) — Label — [context]

## Career Timeline
- YYYY: [milestone]

## NYC History
- [Date]: [Venue] — [Promoter]

## Images Found
### [Image 1]
- URL: [direct link]
- Source: [photographer/press kit/label]
- License: [CC-BY / press kit / fair use editorial]
- Description: [what's in the image]

## Current Moment
[What they're doing now]

## Scene Context
[Where they fit]

## Sources
- [URL 1]
\`\`\`

## IMAGES (Required)

Find legally usable images for the article hero and body. Priority order:

### 1. Artist Press Photos
- [ ] Check artist website for press kit / EPK (electronic press kit)
- [ ] Check artist management site for downloadable press photos
- [ ] Look for "press" or "media" pages with download links
- [ ] Note any usage terms (credit requirements, editorial use only)

### 2. Label / PR Photos
- [ ] Check the artist's label website for press assets
- [ ] Search "[artist name] press photo" or "[artist name] EPK"
- [ ] PR agencies often host downloadable images

### 3. Event Flyers & Artwork
- [ ] Official event flyer from promoter's social media or website
- [ ] Album/EP cover art (usually fair use for editorial coverage)
- [ ] Official tour artwork

### 4. Venue Photos
- [ ] Venue website (often has gallery/press section)
- [ ] Venue's Google Maps photos (check licensing)
- [ ] Promoter's official event photos from past shows

### 5. Creative Commons / Free Sources
- [ ] Wikimedia Commons (search artist/venue name)
- [ ] Unsplash (for generic venue/crowd atmosphere shots)
- [ ] Pexels (same)

### 6. Embeddable Content
- [ ] YouTube video thumbnail (can embed, not download)
- [ ] SoundCloud player embed
- [ ] Instagram embed (with proper attribution)

### For Each Image Found, Record:
- **URL**: Direct link to image
- **Source**: Where it came from
- **License**: Press kit / CC BY / editorial use / unknown
- **Credit**: Required photo credit line
- **Resolution**: Approximate size (need minimum 1200x630 for OG)
- **Description**: What's in the image

### Image Output Format:
\`\`\`
## Images Found
### Hero Image (recommended)
- URL: [link]
- Source: [press kit / label / venue]
- License: [editorial use / CC BY / press kit]
- Credit: "Photo by [photographer] / courtesy of [source]"
- Resolution: [dimensions if known]

### Additional Images
1. [description] — [URL] — [license] — [credit]
2. [description] — [URL] — [license] — [credit]
\`\`\`

### Image Rules:
- **NEVER** use images without checking licensing
- Press kit photos are generally safe for editorial use
- Always note the required credit line
- Prefer high-resolution images (minimum 1200px wide)
- If no legal images found, note that — we'll generate or commission

**RULES**:
- Only VERIFIED facts with sources
- Mark uncertain data with [UNVERIFIED]
- Do NOT fabricate quotes
- If no interviews found, note that explicitly
- Keep output under 2500 words — concise facts, not prose
`;
}

function generateEventResearchTask(row) {
  return `# Research Task — LOWEND NYC
**Model**: ${MODEL_CONFIG.researcher.model}

## Subject: ${row.topic}
Angle: ${row.angle || 'Event coverage'}

## EVENT DETAILS
- [ ] Full event name, date, time
- [ ] Venue name, address, capacity
- [ ] Promoter/presenter
- [ ] Ticket price and link
- [ ] Full lineup with set times

## HEADLINER RESEARCH
- [ ] Bio (origin, genre, notable releases)
- [ ] Recent interviews or quotes (search YouTube, podcasts, press)
- [ ] Previous NYC shows
- [ ] Current releases/projects
- [ ] Social handles + follower counts

## SUPPORT ACTS
- [ ] Brief bio for each
- [ ] Why they fit this bill

## VENUE + PROMOTER CONTEXT
- [ ] Sound system, room layout
- [ ] Promoter's track record
- [ ] Recent notable shows here

## IMAGES
- [ ] Official event flyer (promoter socials / website)
- [ ] Headliner press photos (artist website / EPK / label)
- [ ] Venue interior shots (venue website press section)
- [ ] Support act press photos
- For each: URL, source, license, credit line, resolution

## Sources: Event page, RA, artist socials, venue site, YouTube interviews

**Output**: Structured brief under 1500 words. Verified facts + sources + image links.
`;
}

function generateVenueResearchTask(row) {
  return `# Research Task — LOWEND NYC
**Model**: ${MODEL_CONFIG.researcher.model}

## Subject: ${row.topic}
Angle: ${row.angle || 'Venue spotlight'}

## VENUE IDENTITY
- [ ] Full name, address, neighborhood
- [ ] Year opened, capacity
- [ ] Owner/operator
- [ ] Sound system details

## INTERVIEWS & QUOTES
- [ ] Owner/promoter interviews (YouTube, press, podcasts)
- [ ] Artist quotes about this venue
- [ ] Community/press coverage

## PROGRAMMING
- [ ] Booking philosophy
- [ ] Regular nights/residencies
- [ ] Notable headliners (last 2 years)
- [ ] Associated promoters

## HISTORY
- [ ] What was the space before?
- [ ] Key milestones
- [ ] Controversies or challenges

## PRACTICAL
- [ ] Transit, cover charge range, crowd vibe

## IMAGES
- [ ] Venue interior/exterior photos (venue website press section)
- [ ] Sound system / room shots
- [ ] Crowd photos from past events (promoter / photographer credits)
- [ ] Venue logo or branding assets
- For each: URL, source, license, credit line, resolution

## Sources: Venue website, RA, Google reviews, local press, YouTube, social media

**Output**: Structured brief under 1500 words. Include image links with licensing.
`;
}

function generateSceneResearchTask(row) {
  return `# Research Task — LOWEND NYC
**Model**: ${MODEL_CONFIG.researcher.model}

## Subject: ${row.topic}
Angle: ${row.angle || 'Scene analysis'}

## DATA POINTS
- [ ] Key statistics (venue activity, ticket prices, event frequency)
- [ ] Quotes from promoters, DJs, venue owners (search interviews)
- [ ] Specific examples supporting the thesis
- [ ] Counter-examples
- [ ] Historical context

## INTERVIEWS
- [ ] Search for relevant interviews on this topic
- [ ] Industry figures who've commented publicly
- [ ] Social media discussions

## Sources: RA editorial, local press, industry publications, social media, YouTube

**Output**: Structured brief under 1500 words. Data + quotes + sources.
`;
}

function generateListResearchTask(row) {
  return `# Research Task — LOWEND NYC
**Model**: ${MODEL_CONFIG.researcher.model}

## Subject: ${row.topic}
Angle: ${row.angle || 'List/roundup'}

## PER ITEM
- [ ] Full details (release date, label, artist, streaming links)
- [ ] Play counts or chart positions
- [ ] Context — why this matters

## CONNECTIONS
- [ ] What ties these items together?
- [ ] Any interviews or quotes about these items?

**Output**: Structured brief, verified data per item. Under 1500 words.
`;
}

function generateHotTakeResearchTask(row) {
  return `# Research Task — LOWEND NYC
**Model**: ${MODEL_CONFIG.researcher.model}

## Subject: ${row.topic}
Angle: ${row.angle || 'Opinion/debate'}

## EVIDENCE FOR THE ARGUMENT
- [ ] Facts, data points, examples
- [ ] Quotes from people who agree

## EVIDENCE AGAINST
- [ ] Counter-arguments with evidence
- [ ] Quotes from people who disagree

## INTERVIEWS & PUBLIC STATEMENTS
- [ ] Search for relevant interviews, press releases
- [ ] Social media statements from involved parties
- [ ] Financial data if relevant

## CONTEXT
- [ ] Historical precedent
- [ ] Comparable situations in other cities/scenes

## Sources: Press, social media, public records, industry publications

**Output**: Structured brief with evidence for BOTH sides. Under 1500 words.
`;
}

function generateGenericResearchTask(row) {
  return `# Research Task — LOWEND NYC
**Model**: ${MODEL_CONFIG.researcher.model}

## Subject: ${row.topic}
Angle: ${row.angle || 'General'}

## REQUIRED
- [ ] All relevant facts, names, dates
- [ ] Interviews or quotes (YouTube, podcasts, press)
- [ ] Social handles + follower counts
- [ ] NYC scene context
- [ ] Source URLs for all claims

**Output**: Structured brief under 1500 words.
`;
}

/**
 * Extract artist name from topic string
 */
function extractArtistName(topic) {
  const patterns = [
    /^([^:]+?):/,
    /^(.+?)\s+Is\s/i,
    /^(.+?)\s+at\s/i,
    /^(.+?)\s+Brought/i,
    /^(.+?)\s+Turns/i,
    /^(.+?)['']s\s/,
    /^(.+?)\s+and\s+the\s/i,
  ];

  for (const pattern of patterns) {
    const match = topic.match(pattern);
    if (match) return match[1].trim();
  }

  return topic.split(' ').slice(0, 3).join(' ');
}

function saveResearchBrief(slug, content) {
  if (!fs.existsSync(BRIEFS_DIR)) {
    fs.mkdirSync(BRIEFS_DIR, { recursive: true });
  }
  const filePath = path.join(BRIEFS_DIR, `${slug}-research.md`);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Research task saved: ${filePath}`);
  return filePath;
}

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
  MODEL_CONFIG,
};
