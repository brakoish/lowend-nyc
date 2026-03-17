#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — Direct Venue Website Scraping

Scrapes venue websites directly using requests + regex
No API keys needed, but fragile
"""

import json
import re
import urllib.request
from datetime import datetime, timedelta
from html.parser import HTMLParser
from typing import List, Optional

from models import Event, Venue, NYC_VENUES, detect_genre

class MLStripper(HTMLParser):
    """Strip HTML tags from text"""
    def __init__(self):
        super().__init__()
        self.reset()
        self.fed = []
    def handle_data(self, d):
        self.fed.append(d)
    def get_data(self):
        return ''.join(self.fed)

def strip_html(html: str) -> str:
    s = MLStripper()
    try:
        s.feed(html)
        return s.get_data()
    except:
        return html

def fetch_url(url: str, headers: dict = None) -> Optional[str]:
    """Fetch URL with error handling"""
    default_headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    if headers:
        default_headers.update(headers)
    
    try:
        req = urllib.request.Request(url, headers=default_headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read().decode('utf-8')
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None

def parse_date(date_str: str) -> Optional[str]:
    """Parse various date formats to YYYY-MM-DD"""
    formats = [
        '%Y-%m-%d',
        '%B %d, %Y',
        '%b %d, %Y',
        '%m/%d/%Y',
        '%d/%m/%Y',
        '%A, %B %d',
    ]
    
    for fmt in formats:
        try:
            parsed = datetime.strptime(date_str, fmt)
            if parsed.year == 1900:
                parsed = parsed.replace(year=datetime.now().year)
            return parsed.strftime('%Y-%m-%d')
        except:
            continue
    return None

# Venue-specific scrapers
def scrape_knockdown_center() -> List[dict]:
    """Scrape Knockdown Center events"""
    url = "https://knockdowncenter.com/events/"
    html = fetch_url(url)
    if not html:
        return []
    
    events = []
    # Look for JSON-LD structured data
    json_ld_pattern = r'<script type="application/ld\+json">(.*?)</script>'
    matches = re.findall(json_ld_pattern, html, re.DOTALL)
    
    for match in matches:
        try:
            data = json.loads(match)
            if isinstance(data, dict) and data.get('@type') == 'Event':
                events.append({
                    'title': data.get('name', ''),
                    'date': data.get('startDate', '').split('T')[0],
                    'time': data.get('startDate', '').split('T')[1][:5] if 'T' in data.get('startDate', '') else 'TBD',
                    'venue': 'Knockdown Center',
                    'artists': [data.get('name', '').split(' at ')[0]],
                    'ticket_url': data.get('url', ''),
                    'description': strip_html(data.get('description', '')),
                })
        except:
            continue
    
    return events

def scrape_elsewhere() -> List[dict]:
    """Scrape Elsewhere events"""
    return []

def scrape_nowadays() -> List[dict]:
    """Scrape Nowadays events"""
    url = "https://nowadays.nyc/events"
    html = fetch_url(url)
    if not html:
        return []
    
    events = []
    event_pattern = r'<a[^>]*href="(/events/[^"]*)"[^>]*>.*?<h[^>]*>(.*?)</h[^>]*>.*?<time[^>]*>(.*?)</time>'
    matches = re.findall(event_pattern, html, re.DOTALL | re.IGNORECASE)
    
    for match in matches:
        path, title, date_str = match
        date = parse_date(strip_html(date_str))
        if date:
            events.append({
                'title': strip_html(title),
                'date': date,
                'time': 'TBD',
                'venue': 'Nowadays',
                'artists': [strip_html(title).split(' at ')[0].split(' presents ')[-1]],
                'ticket_url': f"https://nowadays.nyc{path}",
                'description': '',
            })
    
    return events

def scrape_basement() -> List[dict]:
    """Scrape Basement events"""
    return []

# Map venues to scraper functions
VENUE_SCRAPERS = {
    'Knockdown Center': scrape_knockdown_center,
    'Elsewhere': scrape_elsewhere,
    'Nowadays': scrape_nowadays,
    'Basement': scrape_basement,
}

def scrape_all_venues(days_ahead: int = 30) -> List[Event]:
    """Scrape all venues"""
    all_events = []
    now = datetime.now()
    cutoff = now + timedelta(days=days_ahead)
    
    for venue in NYC_VENUES:
        scraper = VENUE_SCRAPERS.get(venue.name)
        if not scraper:
            print(f"No scraper for {venue.name}, skipping...")
            continue
        
        print(f"Scraping {venue.name}...")
        try:
            raw_events = scraper()
            for raw in raw_events:
                try:
                    event_date = datetime.strptime(raw['date'], '%Y-%m-%d')
                    if event_date > cutoff:
                        continue
                except:
                    continue
                
                days_until = (event_date - now).days
                artists = raw.get('artists', [])
                title = raw.get('title', '')
                
                event = Event(
                    id=f"{venue.name.lower().replace(' ', '-')}-{raw['date']}-{title[:20].lower().replace(' ', '-')}",
                    title=title,
                    date=raw['date'],
                    time=raw.get('time', 'TBD'),
                    venue=venue.name,
                    venue_city=venue.city,
                    artists=artists,
                    headliner=artists[0] if artists else 'TBD',
                    genre=detect_genre(title),
                    description=raw.get('description', ''),
                    ticket_url=raw.get('ticket_url', ''),
                    price='TBD',
                    age='21+',
                    days_until=days_until,
                    status='soon' if days_until < 7 else 'upcoming',
                    scraped_at=now.isoformat(),
                    priority='high' if days_until < 14 else 'normal'
                )
                all_events.append(event)
            
            print(f"  Found {len(raw_events)} events")
        except Exception as e:
            print(f"  Error: {e}")
    
    all_events.sort(key=lambda e: e.date)
    return all_events

if __name__ == "__main__":
    print("Testing venue scraper...")
    events = scrape_all_venues(30)
    print(f"Found {len(events)} events")
