# LOWEND NYC Event Scraper — Implementation Plan

## Research Summary

### Resident Advisor
- **Status**: No official public API
- **Website**: React-based, requires JavaScript rendering
- **Options**:
  1. **Playwright/Selenium** — Full browser automation, can scrape rendered content
  2. **Apify actor** — Pre-built RA scraper available (paid but reliable)
  3. **Unofficial API** — Community reverse-engineered endpoints (fragile)

### Bandsintown
- **Status**: Has official API (requires artist focus, not venue focus)
- **Best for**: Tracking specific artists, not venue calendars
- **Limitation**: API designed for artists, not venue event discovery

### Songkick
- **Status**: Has official API with venue support
- **Best for**: Venue-based event discovery
- **Requirement**: API key needed

### Venue Websites
- **Status**: Static HTML, easier to scrape
- **Best for**: Reliable, direct source
- **Approach**: Individual scrapers per venue

## Recommended Approach: Hybrid

### Phase 1: Songkick API (Primary)
- Get API key from Songkick
- Query by venue ID for each NYC venue
- Clean, structured data
- Rate limits: reasonable

### Phase 2: Venue Direct Scraping (Backup)
- Scrape venue websites directly
- More reliable than RA
- No API key needed
- Custom parsers per venue

### Phase 3: Resident Advisor (Supplemental)
- Use Playwright for JS rendering
- Capture events not on other platforms
- Slower, more resource-intensive

## Implementation

### Songkick API Setup
1. Sign up at https://www.songkick.com/developer
2. Get API key
3. Find venue IDs for NYC venues
4. Query: `GET /api/3.0/venues/{venue_id}/calendar.json`

### Venue IDs to Find
- Knockdown Center
- Brooklyn Mirage / Elsewhere
- Basement
- Nowadays
- 99 Scott
- Superior Ingredients
- Good Room
- Public Records

### Data Fields to Capture
```json
{
  "title": "Event name",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "venue": "Venue name",
  "artists": ["Artist 1", "Artist 2"],
  "genre": ["detected genres"],
  "ticket_url": "...",
  "price": "...",
  "age": "21+"
}
```

## Next Steps

1. **Get Songkick API key** (free, immediate)
2. **Test venue queries** with a few venues
3. **Build Python scraper** using requests
4. **Add venue direct scraping** as fallback
5. **Schedule daily runs** via cron/GitHub Actions

## Files Created
- `scripts/scrape_events.py` — Main scraper (placeholder)
- `scripts/scrape_songkick.py` — Songkick API implementation (to build)
- `scripts/scrape_venues.py` — Direct venue scraping (to build)

## API Keys Needed
- Songkick: https://www.songkick.com/developer/getting-started

## Notes
- RA scraping is possible but fragile — use as last resort
- Venue websites are surprisingly reliable
- Start with Songkick, expand from there
