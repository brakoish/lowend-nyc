# LOWEND NYC System Audit & Patch Plan

**Date:** 2026-03-17
**Auditor:** lowend-nyc agent

---

## Current System State

### ✅ WORKING

| Component | Status | Notes |
|-----------|--------|-------|
| Google Sheets API | ✅ | Connected, 1 row active |
| GitHub API | ✅ | Connected |
| Discord Notifications | ✅ | Working |
| Scout (event scrapers) | ⚠️ | Python scripts exist but not integrated |
| Orchestrator | ✅ | Status management works |
| Research Brief Generator | ✅ | Creates research tasks |
| Writing Brief Generator | ✅ | Creates writing briefs |
| Edit Brief Generator | ✅ | Creates editing briefs |

### ❌ BROKEN / MISSING

| Component | Issue | Priority |
|-----------|-------|----------|
| **Research Executor** | Only does Brave search, doesn't spawn AI agent | HIGH |
| **Writing Executor** | Creates placeholder, doesn't spawn writer agent | HIGH |
| **Editing Executor** | Runs humanizer but doesn't spawn editor agent | HIGH |
| **Scout → Pipeline Bridge** | No connection between scrapers and Google Sheet | HIGH |
| **Article Directory** | Draft exists in briefs/ but not in content/articles/ | MEDIUM |
| **Cron/Automation** | No scheduled execution | MEDIUM |
| **Image Handling** | No automated image download/optimization | LOW |

---

## Active Article Status

**Taiki Nulight: The Blueprint Interview**
- Status: DRAFT_READY (in Sheet)
- Research: ✅ Complete (`taiki-nulight-blueprint-research-complete.md`)
- Draft: ✅ Written (`taiki-nulight-blueprint-draft.md`)
- Edit Brief: ✅ Generated (`taiki-nulight-blueprint-edit-brief.md`)
- Location: `briefs/` (should be in `content/articles/`)
- **Next Step:** Move to EDITING status, run editor agent

---

## Required Patches

### 1. Fix Agent Spawning (CRITICAL)

The `execute-pipeline.js` has placeholder functions. Need to implement actual OpenClaw subagent spawning:

```javascript
// execute-pipeline.js - executeResearch()
// CURRENT: Just does web search
// NEEDS: Spawn research agent with web_search tool access

// execute-pipeline.js - executeWriting()
// CURRENT: Creates placeholder frontmatter
// NEEDS: Spawn writer agent with research + brief

// execute-pipeline.js - executeEditing()
// CURRENT: Runs humanizer, moves to PENDING_APPROVAL
// NEEDS: Spawn editor agent to actually edit
```

### 2. Create Scout Bridge

New file: `pipeline/scout-bridge.js`
- Reads `events.json` from scout
- Filters for high-priority events (next 14 days)
- Adds to Google Sheet as IDEA status
- Pre-fills: topic, angle, template=event-preview, genre

### 3. Fix Article Path

The draft is in `briefs/` but should be in `content/articles/`:
- Move: `briefs/taiki-nulight-blueprint-draft.md` → `content/articles/taiki-nulight-blueprint.mdx`
- Update file extension: `.md` → `.mdx`

### 4. Add Cron Automation

New file: `pipeline/cron.sh`
```bash
#!/bin/bash
cd ~/Projects/lowend-nyc/pipeline
node orchestrator.js check
node execute-pipeline.js
node orchestrator.js publish
```

Add to crontab:
```
*/30 * * * * ~/Projects/lowend-nyc/pipeline/cron.sh
```

### 5. Complete Current Article

For Taiki Nulight article:
1. Move draft to correct location
2. Update Sheet status: DRAFT_READY → EDITING
3. Run execute-pipeline.js to trigger editing
4. Or manually spawn editor agent

---

## Agent Architecture (Target State)

```
┌─────────────┐
│    SCOUT    │  ← Python scrapers (scripts/)
│  (discovers)│
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   BRIDGE    │────▶│GOOGLE SHEET │
│  (imports)  │     │  (IDEA...)  │
└─────────────┘     └──────┬──────┘
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ RESEARCHER  │    │   WRITER    │    │   EDITOR    │
│  (subagent) │    │  (subagent) │    │  (subagent) │
│  web_search │    │  writes MDX │    │ humanizer   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  PUBLISHER  │
                    │  (GitHub)   │
                    └─────────────┘
```

---

## Files to Create/Modify

### New Files:
1. `pipeline/scout-bridge.js` - Connect scout to pipeline
2. `pipeline/cron.sh` - Automation script
3. `pipeline/AGENTS.md` - Agent spawning documentation

### Modify:
1. `pipeline/execute-pipeline.js` - Implement actual agent spawning
2. `pipeline/orchestrator.js` - Add `bridge` command
3. `pipeline/README.md` - Update with full architecture

### Move:
1. `briefs/taiki-nulight-blueprint-draft.md` → `content/articles/taiki-nulight-blueprint.mdx`

---

## Immediate Actions Needed

1. **Fix Taiki Nulight article** - Move to correct location, trigger editing
2. **Implement agent spawning** - Researcher, Writer, Editor need to spawn subagents
3. **Connect scout to pipeline** - Auto-import discovered events
4. **Set up cron** - Automate pipeline execution

---

## Questions for Will

1. Do you want the agents to spawn as OpenClaw subagents (separate sessions) or run inline?
2. Should the scout auto-import ALL events or just high-priority ones?
3. What's the budget for API calls (Brave, web search, AI generation)?
4. Do you want manual approval at each stage or auto-flow?
