# LOWEND NYC Editorial Pipeline

## Overview

A Google Sheets-powered editorial pipeline that automates article creation from topic ideation to publication.

## Architecture

```
YOU (approve/deny)
    │
    ▼
┌─────────────────┐    ┌─────────────┐    ┌──────────────┐
│ Google Sheet     │───▶│ Pipeline    │───▶│ Writer Agent │
│ (Source of truth)│    │ Orchestrator│    │ (Creates     │
│                  │◀───│ (Node.js)   │◀───│  draft)      │
│                  │    │             │    └──────────────┘
│                  │    │             │
│                  │    │             │───▶┌──────────────┐
│                  │◀───│             │◀───│ Editor Agent │
└─────────────────┘    │             │    │ (Fact-check, │
                       │             │    │  humanize)   │
                       │             │    └──────────────┘
                       │             │
                       │             │───▶┌──────────────┐
                       │             │    │ GitHub API   │
                       └─────────────┘    │ (Publish)    │
                                          └──────────────┘
                                                │
                                          ┌─────┴──────┐
                                          │   Vercel   │
                                          │ (Auto-     │
                                          │  deploy)   │
                                          └────────────┘
```

## Setup

### 1. Google Sheets

Create a Google Sheet with the structure defined in `sheets-template.json`.
Or use the Apps Script in `apps-script.js` to auto-create the structure.

### 2. Google Service Account

1. Go to https://console.cloud.google.com
2. Create a project (or use existing)
3. Enable Google Sheets API
4. Create a Service Account
5. Download JSON credentials
6. Share your Sheet with the service account email
7. Save credentials to `~/.config/lowend-nyc/google-credentials.json`

### 3. GitHub Token

1. Go to https://github.com/settings/tokens
2. Create a Personal Access Token (classic)
3. Scope: `repo` (full control of private repos)
4. Save to `.env`

### 4. Environment Variables

```bash
# Copy the example
cp pipeline/.env.example pipeline/.env

# Fill in your values
nano pipeline/.env
```

### 5. Install Dependencies

```bash
cd pipeline
npm install
```

### 6. Run

```bash
# Check for new topics (runs once)
node pipeline/orchestrator.js check

# Process approved topics (spawns writer agents)
node pipeline/orchestrator.js process

# Publish scheduled articles
node pipeline/orchestrator.js publish

# Run full pipeline (all steps)
node pipeline/orchestrator.js run

# Set up cron for daily automation
node pipeline/orchestrator.js cron
```

## Pipeline Statuses

| Status | Meaning | Who Acts |
|--------|---------|----------|
| `IDEA` | Topic suggested | You review |
| `APPROVED` | You approved the topic | Orchestrator |
| `WRITING` | Writer agent working | Agent |
| `DRAFT_READY` | Draft complete | Orchestrator |
| `EDITING` | Editor agent working | Agent |
| `PENDING_APPROVAL` | Ready for your review | You |
| `REVISION` | Needs changes | Back to writer |
| `SCHEDULED` | Approved, waiting for date | Orchestrator |
| `PUBLISHED` | Live on site | Done |
| `DENIED` | Topic rejected | Done |

## Files

```
pipeline/
├── README.md              # This file
├── .env.example           # Environment variables template
├── package.json           # Dependencies
├── orchestrator.js        # Main pipeline controller
├── sheets.js              # Google Sheets integration
├── github.js              # GitHub API for publishing
├── agents.js              # Agent spawning logic
├── notify.js              # Discord notifications
├── apps-script.js         # Google Apps Script (paste into sheet)
└── sheets-template.json   # Sheet structure definition
```
