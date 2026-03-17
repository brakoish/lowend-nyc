#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — Resident Advisor (Playwright)

Uses Playwright to render RA's React site and extract event data
"""

import os
import json
import re
from datetime import datetime, timedelta
from typing import List, Optional
from dataclasses import dataclass

from models import Event, Venue, NYC_VENUES, detect_genre

# RA Venue IDs (need to be looked up)
RA_VENUE_IDS = {
    'Knockdown Center': 131393,
    'Brooklyn Mirage': 106887,
    'Basement': 131837,
    'Elsewhere': 106886,
    'Nowadays': 106888,
    # Add more as needed
}

class RAScraper:
    """Resident Advisor scraper using Playwright"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.browser = None
        self.page = None
        
    def _init_browser(self):
        """Initialize Playwright browser"""
        try:
            from playwright.sync_api import sync_playwright
            self.pw = sync_playwright().start()
            self.browser = self.pw.chromium.launch(headless=self.headless)
            self.page = self.browser.new_page()
            # Set viewport to avoid mobile detection
            self.page.set_viewport_size({'width': 1280, 'height': 800})
        except ImportError:
            print("Playwright not installed. Run: pip install playwright && playwright install")
            raise
    
    def _close_browser(self):
        """Close browser"""
        if self.browser:
            self.browser.close()
        if hasattr(self, 'pw'):
            self.pw.stop()
    
    def _wait_for_content(self, selector: str, timeout: int = 10000):
        """Wait for React to render content"""
        try:
            self.page.wait_for_selector(selector, timeout=timeout)
            return True
        except:
            return False
    
    def scrape_venue(self, venue_id: int, days_ahead: int = 30) -> List[dict]:
        """Scrape events for a specific venue"""
        if not self.page:
            self._init_browser()
        
        url = f"https://ra.co/events/us/newyork?venue={venue_id}"
        print(f"  Loading {url}...")
        
        try:
            self.page.goto(url, wait_until='networkidle')
            
            # Wait for event list to load
            if not self._wait_for_content('[data-testid="event-list"]', timeout=15000):
                # Try alternative selectors
                if not self._wait_for_content('a[href*="/events/"]', timeout=5000):
                    print("    No events found or page structure changed")
                    return []
            
            # Extract events using page.evaluate
            events = self.page.evaluate("""
                () => {
                    const events = [];
                    
                    // Try multiple selectors for event cards
                    const selectors = [
                        '[data-testid="event-list"] > div',
                        '[data-testid="event-card"]',
                        'a[href*="/events/"]',
                        'article',
                        '.event-card',
                    ];
                    
                    let cards = [];
                    for (const selector of selectors) {
                        cards = document.querySelectorAll(selector);
                        if (cards.length > 0) break;
                    }
                    
                    cards.forEach(card => {
                        try {
                            // Extract title
                            const titleEl = card.querySelector('h3, h2, .title, [data-testid="event-title"]');
                            const title = titleEl ? titleEl.textContent.trim() : '';
                            
                            // Extract date
                            const dateEl = card.querySelector('time, .date, [data-testid="event-date"]');
                            const date = dateEl ? dateEl.getAttribute('datetime') || dateEl.textContent.trim() : '';
                            
                            // Extract link
                            const linkEl = card.tagName === 'A' ? card : card.querySelector('a[href*="/events/"]');
                            const link = linkEl ? linkEl.href : '';
                            
                            // Extract venue
                            const venueEl = card.querySelector('.venue, [data-testid="venue-name"]');
                            const venue = venueEl ? venueEl.textContent.trim() : '';
                            
                            if (title && date) {
                                events.push({
                                    title,
                                    date,
                                    link,
                                    venue,
                                    raw: card.innerHTML.substring(0, 500) // Debug info
                                });
                            }
                        } catch (e) {
                            // Skip problematic cards
                        }
                    });
                    
                    return events;
                }
            """)
            
            return events
            
        except Exception as e:
            print(f"    Error scraping: {e}")
            return []
    
    def parse_ra_date(self, date_str: str) -> Optional[str]:
        """Parse RA date formats"""
        # RA uses various formats: "Fri, 21 Mar", "21 March 2026", etc.
        date_str = date_str.strip()
        
        # Try to extract date
        patterns = [
            r'(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})',
            r'(\d{4})-(\d{2})-(\d{2})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, date_str, re.IGNORECASE)
            if match:
                try:
                    if len(match.groups()) == 3 and match.group(3).isdigit():
                        # Year is last
                        day, month_str, year = match.groups()
                        month_num = datetime.strptime(month_str[:3], '%b').month
                        return f"{year}-{month_num:02d}-{int(day):02d}"
                    else:
                        # ISO format
                        return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
                except:
                    continue
        
        return None
    
    def scrape_all_venues(self, days_ahead: int = 30) -> List[Event]:
        """Scrape all configured venues"""
        all_events = []
        now = datetime.now()
        
        try:
            self._init_browser()
            
            for venue_name, venue_id in RA_VENUE_IDS.items():
                print(f"\nScraping {venue_name} (ID: {venue_id})...")
                
                raw_events = self.scrape_venue(venue_id, days_ahead)
                print(f"  Found {len(raw_events)} raw events")
                
                for raw in raw_events:
                    # Parse date
                    date = self.parse_ra_date(raw.get('date', ''))
                    if not date:
                        continue
                    
                    try:
                        event_date = datetime.strptime(date, '%Y-%m-%d')
                        if event_date < now:
                            continue
                        
                        days_until = (event_date - now).days
                        
                        # Extract artists from title
                        title = raw.get('title', '')
                        artists = self._extract_artists(title)
                        
                        # Find venue object
                        venue_obj = next((v for v in NYC_VENUES if v.name == venue_name), None)
                        if not venue_obj:
                            venue_obj = Venue(venue_name, "Brooklyn")
                        
                        event = Event(
                            id=f"ra-{venue_id}-{date}-{title[:20].lower().replace(' ', '-')}",
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
                        print(f"    Error processing event: {e}")
            
        finally:
            self._close_browser()
        
        # Sort by date
        all_events.sort(key=lambda e: e.date)
        return all_events
    
    def _extract_artists(self, title: str) -> List[str]:
        """Extract artist names from event title"""
        # Common RA patterns
        separators = [' at ', ' @ ', ' - ', ' – ', ' — ', ': ', ' + ', ', ', ' b2b ', ' B2B ', ' & ']
        
        for sep in separators:
            if sep in title:
                parts = title.split(sep)
                artist_part = parts[0]
                # Clean up
                artists = re.split(r', | & |\+ | and ', artist_part)
                return [a.strip() for a in artists if a.strip() and len(a.strip()) > 1]
        
        return [title.strip()]

def scrape_ra(days_ahead: int = 30) -> List[Event]:
    """Convenience function to scrape RA"""
    scraper = RAScraper(headless=True)
    return scraper.scrape_all_venues(days_ahead)

if __name__ == "__main__":
    print("Testing Resident Advisor scraper...")
    print("NOTE: This requires Playwright to be installed:")
    print("  pip install playwright && playwright install chromium\n")
    
    try:
        events = scrape_ra(30)
        print(f"\n{'='*50}")
        print(f"Found {len(events)} events from RA")
        print(f"{'='*50}")
        for e in events[:10]:
            print(f"  {e.date}: {e.title} @ {e.venue}")
    except Exception as e:
        print(f"Error: {e}")
        print("\nMake sure Playwright is installed:")
        print("  pip install playwright")
        print("  playwright install chromium")
