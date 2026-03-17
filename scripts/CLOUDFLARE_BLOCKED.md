# LOWEND NYC Event Scraper — Cloudflare Blocked

## Problem

Resident Advisor uses Cloudflare bot protection. The Playwright scraper is being blocked with:
> "Sorry, you have been blocked"

## Solutions (Ranked by Effort)

### 1. Stealth Playwright (Quick Try)

Use playwright-stealth to mask headless browser:

```bash
pip install playwright-stealth
```

Then modify `scrape_ra.py`:

```python
from playwright.sync_api import sync_playwright
from playwright_stealth import stealth_sync

# ... in _init_browser:
self.browser = self.pw.chromium.launch(headless=True)
self.page = self.browser.new_page()
stealth_sync(self.page)  # Add this line
```

**Success rate**: 50% — Cloudflare is sophisticated

### 2. Apify Actor (Recommended)

Apify provides managed scraping with residential proxies:

```python
# Use Apify's RA scraper actor
import requests

APIFY_TOKEN = 'your_apify_token'
run = requests.post(
    'https://api.apify.com/v2/acts/augeas~resident-advisor/runs',
    headers={'Authorization': f'Bearer {APIFY_TOKEN}'},
    json={
        'startUrls': [{'url': 'https://ra.co/events/us/newyork?venue=131393'}],
        'maxItems': 100,
    }
).json()
```

**Cost**: ~$5-10/month for basic usage
**Success rate**: 95%+

### 3. Manual Cookie/Session

1. Open RA in your browser
2. Export cookies (using EditThisCookie extension)
3. Load cookies into Playwright

```python
# Load saved cookies
cookies = json.load(open('ra_cookies.json'))
page.context.add_cookies(cookies)
```

**Success rate**: 80% — cookies expire

### 4. Residential Proxy + Playwright

Route traffic through residential IP:

```python
browser = self.pw.chromium.launch(
    proxy={'server': 'http://user:pass@proxy-provider.com:8080'}
)
```

**Cost**: $10-50/month for proxy service
**Success rate**: 90%+

### 5. Accept Reality: Manual + Venue Scrapers

Since automated scraping is unreliable:

1. **Use venue scrapers** as primary (update selectors as needed)
2. **Manual curation** for high-priority events
3. **Writer submissions** — writers add events they plan to cover
4. **Promoter outreach** — direct relationships for event lists

## Recommendation

For LOWEND NYC, I recommend **Option 5** (pragmatic) with **Option 2** (Apify) if budget allows:

### Immediate (Free)
- Fix and use venue scrapers for reliable sources
- Create manual submission form for promoters/writers
- Check RA manually for major events

### If Budget Allows ($10-20/month)
- Apify actor for automated RA scraping
- Residential proxy backup

## Updated Plan

1. **Fix venue scrapers** — Knockdown Center, Nowadays, Public Records, Good Room
2. **Create submission form** — Google Form or simple web form
3. **Manual RA checks** — Weekly manual scrape of high-priority venues
4. **Consider Apify** — If automation is critical

Want me to:
- Try stealth Playwright (quick test)?
- Build the submission form?
- Focus on fixing venue scrapers?
