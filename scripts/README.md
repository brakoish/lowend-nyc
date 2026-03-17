# LOWEND NYC Event Scraper — Complete System

## Architecture

Three scraper implementations for redundancy:

1. **Venue Scrapers** (`scrape_venues.py`) — Direct website scraping
2. **Resident Advisor** (`scrape_ra.py`) — Playwright-based React site scraping
3. **Sample Data** (`scrape_events.py`) — For testing

## Quick Start

```bash
# Test with sample data (works immediately)
python3 scripts/scrape_events.py --source sample --days 30

# Scrape venue websites (may fail due to site changes/blocks)
python3 scripts/scrape_events.py --source venues --days 30

# Scrape Resident Advisor (most reliable, requires setup)
python3 scripts/scrape_events.py --source ra --days 30

# Use all sources
python3 scripts/scrape_events.py --source all --days 30 --output events.json
```

## Resident Advisor Scraper (Recommended)

RA has the most comprehensive electronic music listings but uses React (requires browser automation).

### Setup

```bash
# Install Playwright
pip install playwright

# Install browser binaries
playwright install chromium

# Test
python3 scripts/scrape_events.py --source ra --days 30
```

### How It Works

1. Launches headless Chromium browser
2. Navigates to RA venue page
3. Waits for React to render event list
4. Extracts event data via JavaScript evaluation
5. Parses dates, titles, artist names
6. Outputs structured events

### RA Venue IDs

Edit `scripts/scrape_ra.py` to add more venues:

```python
RA_VENUE_IDS = {
    'Knockdown Center': 131393,
    'Brooklyn Mirage': 106887,
    'Basement': 131837,
    'Elsewhere': 106886,
    'Nowadays': 106888,
    # Find more: https://ra.co/venues/
}
```

## Venue Direct Scrapers

Individual scrapers for specific venues. These are fragile — websites change.

### Current Status

| Venue | Status | Notes |
|-------|--------|-------|
| Knockdown Center | 🔴 Blocked | Connection refused |
| Nowadays | 🔴 404 | URL structure changed |
| Good Room | 🔴 SSL Error | Certificate issue |
| Public Records | 🟡 No events | May need selector update |
| Elsewhere | 🟡 No events | May need selector update |
| Basement | 🟡 Minimal | Events primarily on RA |

### When They Work

Venue scrapers are useful when:
- RA doesn't list the event
- You need data RA doesn't have (exact set times, etc.)
- RA is down or blocked

## Output Format

```json
{
  "id": "ra-131393-2026-03-22-charlotte-de-witte",
  "title": "Charlotte de Witte at Brooklyn Mirage",
  "date": "2026-03-22",
  "time": "22:00",
  "venue": "Brooklyn Mirage",
  "venue_city": "Brooklyn",
  "artists": ["Charlotte de Witte", "Enrico Sangiuliano"],
  "headliner": "Charlotte de Witte",
  "genre": ["techno"],
  "ticket_url": "https://ra.co/events/...",
  "price": "TBD",
  "age": "21+",
  "days_until": 5,
  "status": "soon",
  "priority": "high",
  "assigned_to": "",
  "coverage_type": "",
  "draft_due": "",
  "publish_date": ""
}
```

## Editorial Workflow

1. **Run scraper** → `events.json`
2. **Import to Google Sheets** (File → Import → JSON)
3. **Assign writers** to high-priority events (next 2 weeks)
4. **Set coverage type**: preview, recap, profile, none
5. **Track status**: idea → assigned → draft → editing → scheduled → published

## Automation

### Daily Scrape with Cron

```bash
# Edit crontab
crontab -e

# Add daily at 9am
0 9 * * * cd ~/Projects/lowend-nyc && python3 scripts/scrape_events.py --source ra --days 30 --output content/events.json
```

### GitHub Actions

```yaml
# .github/workflows/scrape.yml
name: Daily Event Scrape
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install playwright && playwright install chromium
      - run: python3 scripts/scrape_events.py --source ra --days 30
      - run: git add content/events.json && git commit -m "Daily event scrape" && git push
```

## Files

```
scripts/
├── models.py              # Shared data models (Event, Venue)
├── scrape_events.py       # Unified CLI interface
├── scrape_ra.py           # Resident Advisor scraper (Playwright)
├── scrape_venues.py       # Direct venue scrapers
└── README.md              # This file
```

## Troubleshooting

### RA Scraper Returns No Events

1. Check if RA structure changed:
   ```bash
   python3 -c "from scrape_ra import RAScraper; r=RAScraper(headless=False); r._init_browser(); r.page.goto('https://ra.co/events/us/newyork?venue=131393'); input('Press enter to close')"
   ```
2. Update selectors in `scrape_ra.py`

### Venue Scrapers Fail

This is expected. Venues change their sites. Options:
1. Use RA scraper instead (recommended)
2. Update selectors in `scrape_venues.py`
3. Use manual submission form

### Rate Limiting

RA may block frequent requests. Solutions:
- Add delays between requests
- Use proxy rotation
- Reduce scrape frequency (daily is plenty)

## Future Improvements

- [ ] Add Apify integration (managed scraping)
- [ ] Build manual submission form for promoters
- [ ] Add event change detection (alert on new events)
- [ ] Integrate with Google Sheets API (push directly)
- [ ] Add image scraping for event artwork
