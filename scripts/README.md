# LOWEND NYC Event Scraper — Complete

## What Was Built

A multi-source event scraper for NYC electronic music venues with three implementations:

### 1. Songkick API (`scrape_songkick.py`)
- **Best for**: Reliable, structured data
- **Requires**: Free API key from songkick.com/developer
- **Data quality**: High — official API
- **Maintenance**: Low — API is stable

### 2. Direct Venue Scraping (`scrape_venues.py`)
- **Best for**: No API key needed
- **Requires**: Nothing
- **Data quality**: Medium — depends on HTML structure
- **Maintenance**: High — breaks when sites update

### 3. Unified Interface (`scrape_events.py`)
- **Best for**: Daily use
- **Usage**: One command, tries all sources
- **Features**: Deduplication, genre detection, priority scoring

## Quick Start

```bash
# Generate sample data (no setup needed)
python3 scripts/scrape_events.py --source sample --days 30

# Get real data (requires Songkick API key)
export SONGKICK_API_KEY='your_key_here'
python3 scripts/scrape_events.py --source songkick --days 30

# Try all sources
python3 scripts/scrape_events.py --source all --days 30 --output events.json

# Export to CSV for Google Sheets
python3 scripts/scrape_events.py --source songkick --days 30 --output events.csv
```

## To Get Real Data

1. **Sign up at Songkick**: https://www.songkick.com/developer/getting-started
2. **Request API key** (free for personal use)
3. **Set environment variable**:
   ```bash
   export SONGKICK_API_KEY='your_key'
   ```
4. **Look up venue IDs** (one-time setup):
   ```bash
   python3 scripts/scrape_events.py --source songkick --lookup
   ```
5. **Update venue IDs** in `scripts/models.py`
6. **Run scraper**:
   ```bash
   python3 scripts/scrape_events.py --source songkick --days 30
   ```

## Output Format

The scraper exports events with editorial fields:

```json
{
  "id": "sk-12345",
  "title": "Charlotte de Witte at Brooklyn Mirage",
  "date": "2026-03-22",
  "time": "22:00",
  "venue": "Brooklyn Mirage",
  "venue_city": "Brooklyn",
  "artists": ["Charlotte de Witte", "Enrico Sangiuliano"],
  "headliner": "Charlotte de Witte",
  "genre": ["techno"],
  "ticket_url": "https://...",
  "price": "TBD",
  "age": "21+",
  "days_until": 5,
  "status": "soon",
  "priority": "high",
  // Editorial fields (fill manually):
  "assigned_to": "",
  "coverage_type": "",
  "draft_due": "",
  "publish_date": ""
}
```

## Editorial Workflow

1. **Scrape events** → `events.json`
2. **Import to Google Sheets** (File → Import → JSON/CSV)
3. **Assign writers** to high-priority events (next 2 weeks)
4. **Set coverage type**: preview, recap, profile, or none
5. **Set deadlines**: draft due, publish date
6. **Track status**: idea → assigned → draft → editing → scheduled → published

## Automation Options

- **GitHub Actions**: Run daily, commit to repo
- **Cron job**: `0 9 * * * cd ~/Projects/lowend-nyc && python3 scripts/scrape_events.py --source songkick`
- **Google Sheets API**: Push directly to sheet instead of file

## Files Created

```
scripts/
├── models.py              # Shared data models
├── scrape_events.py       # Unified interface
├── scrape_songkick.py     # Songkick API scraper
├── scrape_venues.py       # Direct venue scraper
└── SCRAPER_PLAN.md        # Implementation research
```

## Research Summary

| Source | API? | Reliability | Setup | Best For |
|--------|------|-------------|-------|----------|
| Songkick | Yes | High | API key | Primary source |
| Bandsintown | Yes | Medium | API key | Artist tracking |
| Resident Advisor | No | Low | Complex | Supplemental |
| Venue websites | No | Medium | None | Fallback |

**Recommendation**: Use Songkick as primary, venue scraping as backup, RA only if needed.

## Next Steps

1. Get Songkick API key
2. Look up venue IDs
3. Test with real data
4. Set up daily automation
5. Import to Google Sheets for editorial tracking
