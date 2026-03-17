# LOWEND NYC Event Scraper — Updated Plan (Songkick Unavailable)

## Status Update

**Songkick API is currently closed to new applications.**

As of the screenshot you sent, Songkick is not processing new API key requests while they make "changes and improvements."

## Alternative Approaches

### Option 1: Resident Advisor Scraping (Recommended)
- **Pros**: Most comprehensive electronic music database
- **Cons**: No official API, requires browser automation
- **Approach**: Use Playwright or Selenium to render React site
- **Difficulty**: Medium

### Option 2: Venue Direct Scraping
- **Pros**: No dependencies, direct source
- **Cons**: Each venue needs custom parser, breaks when sites update
- **Approach**: Individual scrapers per venue
- **Difficulty**: Medium (ongoing maintenance)

### Option 3: Bandsintown API
- **Pros**: Official API available
- **Cons**: Artist-focused, not venue-focused
- **Approach**: Query by artist instead of venue
- **Difficulty**: Low

### Option 4: Manual Curation + Templates
- **Pros**: Full control, highest quality
- **Cons**: Time-intensive
- **Approach**: Create submission form for writers/promoters
- **Difficulty**: Low (human effort)

## Recommended: Hybrid Approach

1. **Primary**: Resident Advisor scraping with Playwright
2. **Secondary**: Direct venue website scraping for key venues
3. **Tertiary**: Manual submission form for promoters/writers

## Implementation: RA Scraper with Playwright

```python
# Using Playwright to render RA's React site
from playwright.sync_api import sync_playwright

def scrape_ra_events(venue_id):
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"https://ra.co/events/us/newyork?venue={venue_id}")
        # Wait for React to render
        page.wait_for_selector("[data-testid='event-list']")
        # Extract event data
        events = page.evaluate("""
            () => {
                const cards = document.querySelectorAll('[data-testid="event-card"]');
                return Array.from(cards).map(card => ({
                    title: card.querySelector('h3')?.textContent,
                    date: card.querySelector('time')?.dateTime,
                    // ... extract other fields
                }));
            }
        """)
        browser.close()
        return events
```

## Quick Win: Start with Venue Scraping

While RA scraper is being built, use direct venue scraping for:
- Knockdown Center
- Nowadays
- Public Records
- Good Room

These venues have simpler HTML that's easier to scrape.

## Next Steps

1. Install Playwright: `pip install playwright && playwright install`
2. Build RA scraper
3. Add venue-specific scrapers as backup
4. Create manual submission form for edge cases

## Files to Update

- `scripts/scrape_ra.py` — New RA Playwright scraper
- `scripts/scrape_venues.py` — Enhance existing venue scrapers
- `scripts/scrape_events.py` — Update to use RA instead of Songkick
