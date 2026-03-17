#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — Resident Advisor (Basic Playwright)

Uses Playwright with manual evasion techniques
"""

import json
import re
from datetime import datetime, timedelta
from typing import List, Optional

from models import Event, Venue, NYC_VENUES, detect_genre

# RA Venue IDs
RA_VENUE_IDS = {
    'Knockdown Center': 131393,
    'Brooklyn Mirage': 106887,
    'Basement': 131837,
    'Elsewhere': 106886,
    'Nowadays': 106888,
}

class RAScraper:
    """Resident Advisor scraper using Playwright"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.browser = None
        self.page = None
        
    def _init_browser(self):
        """Initialize browser with evasion"""
        from playwright.sync_api import sync_playwright
        
        self.pw = sync_playwright().start()
        
        # Launch with evasion args
        self.browser = self.pw.chromium.launch(
            headless=self.headless,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--disable-site-isolation-trials',
            ]
        )
        
        # Create context with realistic settings
        context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.0',
            locale='en-US',
            timezone_id='America/New_York',
            permissions=['notifications'],
        )
        
        self.page = context.new_page()
        
        # Inject stealth scripts before any navigation
        self.page.add_init_script("""
            // Delete webdriver property
            delete Object.getPrototypeOf(navigator).webdriver;
            
            // Add chrome runtime
            window.chrome = { runtime: {} };
            
            // Add notification permission
            const originalNotification = window.Notification;
            Object.defineProperty(window, 'Notification', {
                get: function() {
                    return originalNotification;
                }
            });
        """)
    
    def _close_browser(self):
        """Close browser"""
        if self.browser:
            self.browser.close()
        if hasattr(self, 'pw'):
            self.pw.stop()
    
    def scrape_venue(self, venue_id: int, venue_name: str) -> List[dict]:
        """Scrape events for a specific venue"""
        url = f"https://ra.co/events/us/newyork?venue={venue_id}"
        print(f"  Loading {venue_name}...")
        
        try:
            # Navigate
            self.page.goto(url, wait_until='domcontentloaded', timeout=30000)
            
            # Wait for content
            self.page.wait_for_timeout(8000)
            
            # Check for blocks
            content = self.page.content()
            if 'cloudflare' in content.lower() or 'blocked' in content.lower():
                print(f"    ⚠️  Blocked by Cloudflare")
                return []
            
            # Try to find events
            # RA uses React, so we need to wait for hydration
            event_links = self.page.locator('a[href*="/events/"]').all()
            
            events = []
            for link in event_links[:20]:  # Limit to first 20
                try:
                    href = link.get_attribute('href')
                    if not href or '/events/' not in href:
                        continue
                    
                    # Get text content
                    text = link.text_content().strip()
                    if not text or len(text) < 5:
                        continue
                    
                    # Try to find parent for more context
                    parent = link.locator('xpath=..')
                    
                    events.append({
                        'title': text[:200],
                        'link': href if href.startswith('http') else f"https://ra.co{href}",
                        'raw': text,
                    })
                except:
                    continue
            
            # Remove duplicates by link
            seen = set()
            unique = []
            for e in events:
                if e['link'] not in seen:
                    seen.add(e['link'])
                    unique.append(e)
            
            return unique
            
        except Exception as e:
            print(f"    Error: {e}")
            return []
    
    def parse_date_from_title(self, title: str) -> Optional[str]:
        """Try to extract date from event title"""
        # Look for date patterns
        patterns = [
            r'(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, title, re.IGNORECASE)
            if match:
                try:
                    day = match.group(1)
                    month = datetime.strptime(match.group(2)[:3], '%b').month
                    year = datetime.now().year
                    return f"{year}-{month:02d}-{int(day):02d}"
                except:
                    continue
        return None
    
    def _extract_artists(self, title: str) -> List[str]:
        """Extract artist names"""
        separators = [' at ', ' @ ', ' - ', ' – ', ' — ', ': ']
        for sep in separators:
            if sep in title:
                return [title.split(sep)[0].strip()]
        return [title.strip()]
    
    def scrape_all_venues(self, days_ahead: int = 30) -> List[Event]:
        """Scrape all venues"""
        all_events = []
        now = datetime.now()
        
        try:
            self._init_browser()
            
            for venue_name, venue_id in RA_VENUE_IDS.items():
                raw_events = self.scrape_venue(venue_id, venue_name)
                print(f"    Found {len(raw_events)} potential events")
                
                for raw in raw_events:
                    title = raw.get('title', '')
                    
                    # Try to parse date from title or use placeholder
                    date = self.parse_date_from_title(title)
                    if not date:
                        # Skip if we can't determine date
                        continue
                    
                    try:
                        event_date = datetime.strptime(date, '%Y-%m-%d')
                        if event_date < now or event_date > now + timedelta(days=days_ahead):
                            continue
                        
                        days_until = (event_date - now).days
                        artists = self._extract_artists(title)
                        
                        venue_obj = next((v for v in NYC_VENUES if v.name == venue_name), 
                                       Venue(venue_name, "Brooklyn"))
                        
                        event = Event(
                            id=f"ra-{venue_id}-{date}-{title[:15].lower().replace(' ', '-').replace('/', '-')}",
                            title=title,
                            date=date,
                            time='TBD',
                            venue=venue_obj.name,
                            venue_city=venue_obj.city,
                            artists=artists,
                            headliner=artists[0] if artists else 'TBD',
                            genre=detect_genre(title),
                            description='',
                            ticket_url=raw.get('link', ''),
                            price='TBD',
                            age='21+',
                            days_until=days_until,
                            status='soon' if days_until < 7 else 'upcoming',
                            scraped_at=now.isoformat(),
                            priority='high' if days_until < 14 else 'normal'
                        )
                        all_events.append(event)
                        
                    except Exception as e:
                        pass
                        
        finally:
            self._close_browser()
        
        all_events.sort(key=lambda e: e.date)
        return all_events

def scrape_ra(days_ahead: int = 30) -> List[Event]:
    scraper = RAScraper(headless=True)
    return scraper.scrape_all_venues(days_ahead)

if __name__ == "__main__":
    print("Testing RA scraper...")
    events = scrape_ra(30)
    print(f"\nFound {len(events)} events")
    for e in events[:10]:
        print(f"  {e.date}: {e.title[:60]}")
