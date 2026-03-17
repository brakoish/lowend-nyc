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
  const template = TEMPLATE_MAP[row.template] || 'event-template.mdx';
  let templateContent = '';

  try {
    templateContent = fs.readFileSync(
      path.join(TEMPLATES_DIR, template), 'utf-8'
    );
  } catch {
    console.warn(`Template not found: ${template}`);
  }

  return `
# Writing Brief — LOWEND NYC

## Assignment
Write an article for LOWEND NYC about: **${row.topic}**

## Angle
${row.angle || 'Cover this topic with your own editorial perspective.'}

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

## Priority: ${row.priority}
## Deadline: ${row.draftDue || 'ASAP'}
`;
}

/**
 * Generate an editing brief for the editor agent
 */
function generateEditBrief(row, draftContent) {
  return `
# Editing Brief — LOWEND NYC

## Assignment
Edit and improve this article for LOWEND NYC.

## Draft Content
${draftContent}

## Editing Checklist

### Accuracy
- [ ] Verify artist names and spellings
- [ ] Check venue names and locations
- [ ] Verify dates and times
- [ ] Confirm genre classifications
- [ ] Check links and URLs

### Style
- [ ] Voice is first-person, opinionated, authoritative
- [ ] No AI-sounding language (run through humanizer patterns)
- [ ] Specific details, not generic descriptions
- [ ] Strong opening hook
- [ ] Clear verdict/opinion at the end

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
