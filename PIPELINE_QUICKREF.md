# LOWEND NYC Pipeline Quick Reference

## Commands

```bash
cd ~/Projects/lowend-nyc/pipeline

# Check pipeline status
node orchestrator.js check

# Process approved topics (generate briefs)
node orchestrator.js process

# Import events from scout
node orchestrator.js bridge

# Publish scheduled articles
node orchestrator.js publish

# Run full cycle
node orchestrator.js run

# Add new topic manually
node orchestrator.js add "Topic Name" "Angle description" [template] [genre] [priority]

# Test connections
node orchestrator.js test
```

## Pipeline Status Flow

```
IDEA → APPROVED → RESEARCHING → RESEARCH_DONE → WRITING → DRAFT_READY → EDITING → PENDING_APPROVAL → SCHEDULED → PUBLISHED
       ↑                                                                                          ↓
       └──────────────────────────────────────── DENIED (or back to IDEA) ─────────────────────────┘
```

## Agent Responsibilities

| Agent | Trigger | Action |
|-------|---------|--------|
| **Scout** | Manual / Cron | Discovers events via `scripts/scrape_events.py` |
| **Bridge** | `orchestrator.js bridge` | Imports events to Google Sheet |
| **Orchestrator** | `check`, `process`, `publish` | Manages status, generates briefs |
| **Researcher** | Status: RESEARCHING | Gathers facts, interviews, images |
| **Writer** | Status: WRITING | Drafts article from research |
| **Editor** | Status: EDITING | Humanizes, fact-checks, polishes |
| **Publisher** | Status: SCHEDULED | Commits to GitHub, triggers deploy |

## File Locations

| Type | Location |
|------|----------|
| Research tasks | `pipeline/briefs/{slug}-research.md` |
| Research findings | `pipeline/briefs/{slug}-research-complete.md` |
| Writing briefs | `pipeline/briefs/{slug}-writing-brief.md` |
| Edit briefs | `pipeline/briefs/{slug}-edit-brief.md` |
| Article drafts | `content/articles/{slug}.mdx` |
| Event data | `content/events.json` |

## Current Article Status

Check the Google Sheet for real-time status.

## Automation

Cron runs every 30 minutes:
```bash
*/30 * * * * ~/Projects/lowend-nyc/pipeline/cron.sh
```

## Manual Workflow

1. **Scout discovers events** → `python3 scripts/scrape_events.py --source ra --days 30`
2. **Import to pipeline** → `node orchestrator.js bridge`
3. **Review ideas** in Google Sheet → Approve (set status to APPROVED)
4. **Process topics** → `node orchestrator.js process` (generates briefs)
5. **Execute work** (me) → Check HEARTBEAT, do research/writing/editing
6. **Review drafts** in Google Sheet → Approve (set status to SCHEDULED)
7. **Publish** → `node orchestrator.js publish` or wait for cron
