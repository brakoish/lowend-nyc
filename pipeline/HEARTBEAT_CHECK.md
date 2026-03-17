# LOWEND NYC Pipeline — Heartbeat Check

When this agent wakes up (heartbeat or user message), check the editorial pipeline:

1. Read the Google Sheet for any items in actionable states
2. Execute the next step for each item
3. Update the sheet and notify via Discord

## Actionable States

### RESEARCHING → Execute research → RESEARCH_DONE
- Read the research task from `pipeline/briefs/{slug}-research.md`
- Use web_search to gather facts, interviews, images
- Save completed research to `pipeline/briefs/{slug}-research-complete.md`
- Update sheet status to RESEARCH_DONE

### RESEARCH_DONE → (Cron moves to WRITING automatically)

### WRITING → Execute writing → DRAFT_READY  
- Read writing brief from `pipeline/briefs/{slug}-writing-brief.md`
- Read completed research from `pipeline/briefs/{slug}-research-complete.md`
- Write the article using the template + research
- Save to `content/articles/{slug}.mdx`
- Update sheet status to DRAFT_READY, set draft link

### DRAFT_READY → (Cron moves to EDITING automatically)

### EDITING → Execute editing → PENDING_APPROVAL
- Read draft from `content/articles/{slug}.mdx`
- Run humanizer: `node ~/.openclaw/workspace-lowend-nyc/skills/humanizer/src/cli.js analyze -f [file]`
- If score > 30, rewrite flagged sections
- Fact-check against research brief
- Save edited version
- Update sheet status to PENDING_APPROVAL
- Send Discord notification for Will's review

### PENDING_APPROVAL → Will approves → SCHEDULED
### SCHEDULED → Cron publishes → PUBLISHED
