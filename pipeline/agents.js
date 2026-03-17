/**
 * agents.js — Agent spawning logic for writer and editor
 * 
 * Creates article drafts using the appropriate template and topic.
 * In production, this spawns OpenClaw subagents. For now, it generates
 * drafts locally using templates.
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'content', 'templates');
const ARTICLES_DIR = path.join(__dirname, '..', 'content', 'articles');

// Template mapping
const TEMPLATE_MAP = {
  'artist-profile': 'artist-profile-engagement.mdx',
  'event-preview': 'event-preview-engagement.mdx',
  'venue-spotlight': 'venue-spotlight-engagement.mdx',
  'scene-analysis': 'scene-analysis-engagement.mdx',
  'list-format': 'list-format-engagement.mdx',
  'hot-take': 'hot-take-debate.mdx',
  'editorial': 'editorial-template.mdx',
  'event-recap': 'event-template.mdx',
};

/**
 * Generate a writing brief for the agent
 */
function generateBrief(row) {
  const templateKey = row.template || row.type || 'event-preview';
  const template = TEMPLATE_MAP[templateKey] || 'event-template.mdx';
  let templateContent = '';

  try {
    templateContent = fs.readFileSync(
      path.join(TEMPLATES_DIR, template), 'utf-8'
    );
  } catch {
    console.warn(`Template not found: ${template}`);
  }

  const displayTitle = row.headline || row.topic;
  const displayVenue = row.venue || 'TBD';
  const displayArtists = row.artists || '';

  return `
# Writing Brief — LOWEND NYC

## Assignment
Write an article for LOWEND NYC about: **${displayTitle}**

## Angle
${row.angle || 'Cover this topic with your own editorial perspective.'}

## Event Details
- **Venue**: ${displayVenue}
- **Artists**: ${displayArtists}
- **Event Date**: ${row.eventDate || 'TBD'}

## Template
Use this template structure as a guide:
${templateContent}

## Voice Guidelines
- First-person perspective: "I was in the room" energy (even for previews — project authority)
- Opinionated: Take sides, make predictions, rate things
- Specific: Name tracks, describe sounds, reference previous shows
- NYC-focused: This is a New York publication
- Underground-leaning: We respect the scene, not just the headliners

## Genre Context
${row.genre || 'Electronic music (techno, house, garage, bass)'}

## Technical Requirements
- Use MDX format with proper frontmatter (title, slug, date, venue, genre, artist, excerpt, image)
- Slug: ${row.slug}
- Include engagement prompt at the end (question for comments)
- Excerpt should be 100-160 characters
- Title should be under 60 characters

## Research Notes
- Check Resident Advisor, Bandsintown, artist socials for facts
- Verify venue details (location, capacity, sound system)
- Listen to recent releases/mixes from featured artists
- Check for upcoming NYC dates
- EDMTrain Link: ${row.edmtrainLink || 'Search EDMTrain for event details'}

## Priority: ${row.priority}
`;
}

/**
 * Generate an editing brief for the editor agent
 */
function generateEditBrief(row, draftContent) {
  const displayTitle = row.headline || row.topic;
  return `
# Editing Brief — LOWEND NYC

## Assignment
Edit and improve this article for LOWEND NYC.

## Article
${displayTitle}

## Draft Content
${draftContent}

## Editing Checklist

### Accuracy
- [ ] Verify artist names and spellings
- [ ] Check venue names and locations
- [ ] Verify dates and times
- [ ] Confirm genre classifications
- [ ] Check links and URLs

### Humanizer Check (MANDATORY)
Run the draft through the humanizer analysis:
\`\`\`bash
cd ~/.openclaw/workspace-lowend-nyc/skills/humanizer
node src/cli.js analyze -f [draft file]
\`\`\`

If score is above 40/100, rewrite flagged sections. Target: under 30/100.

Key patterns to eliminate:
- **ZERO EM DASHES (—)**: Replace ALL with periods, commas, or colons. No exceptions.
- Tier 1 AI vocabulary: "delve", "tapestry", "vibrant", "crucial", "robust", "seamless", "comprehensive", "landscape"
- Filler: "In order to", "Due to the fact that", "It is worth noting"  
- Significance inflation: "marking a pivotal moment", "reshaping the landscape"
- Generic conclusions: "The future looks bright", "Exciting times"
- Sycophantic tone, chatbot artifacts
- Excessive boldface and rule-of-three patterns
- Formulaic structure ("Despite challenges... continues to thrive")

### Style
- [ ] Voice is first-person, opinionated, authoritative
- [ ] Humanizer score under 30/100
- [ ] Specific details, not generic descriptions
- [ ] Strong opening hook
- [ ] Clear verdict/opinion at the end
- [ ] Sentence length varies (short punchy + longer flowing)
- [ ] Has actual personality — not sterile or press-release tone

### SEO
- [ ] Title under 60 characters
- [ ] Excerpt 100-160 characters
- [ ] Proper frontmatter fields
- [ ] Genre tags accurate

### Engagement
- [ ] Engagement prompt at end (question for readers)
- [ ] Strong opinions that invite discussion
- [ ] Shareable pull quotes

### Technical
- [ ] Valid MDX format
- [ ] Proper frontmatter YAML
- [ ] No broken markdown
- [ ] Image references valid

## Output
Return the complete edited article in MDX format.
Mark any unverifiable claims with [NEEDS VERIFICATION].
`;
}

/**
 * Save draft to file
 */
function saveDraft(slug, content) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Draft saved: ${filePath}`);
  return filePath;
}

/**
 * Read draft from file
 */
function readDraft(slug) {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return null;
}

module.exports = {
  generateBrief,
  generateEditBrief,
  saveDraft,
  readDraft,
  TEMPLATE_MAP,
};
