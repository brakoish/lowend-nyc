#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — NYC Promoters & Venues

Scrapes NYC electronic music promoters and venues
Focus on: Teksupport, Gray Area, Circoloco, etc.
"""

import json
import re
import urllib.request
from datetime import datetime, timedelta
from html.parser import HTMLParser
from typing import List, Optional, Dict

from models import Event, Venue, detect_genre

class MLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.fed = []
    def handle_data(self, d):
        self.fed.append(d)
    def get_data(self):
        return ' '.join(self.fed)

def strip_html(html: str) -> str:
    s = MLStripper()
    try:
        s.feed(html)
        return ' '.join(s.get_data().split())
    except:
        return html

def fetch_url(url: str, headers: dict = None) -> Optional[str]:
    """Fetch URL"""
    default_headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
    if headers:
        default_headers.update(headers)
    
    try:
        req = urllib.request.Request(url, headers=default_headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Error: {e}")
        return None

def parse_date(date_str: str) -> Optional[str]:
    """Parse date formats"""
    date_str = date_str.strip()
    formats = [
        '%Y-%m-%d',
        '%B %d, %Y',
        '%b %d, %Y',
        '%m/%d/%Y',
        '%A, %B %d',
        '%A %B %d',
        '%b %d',
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

def extract_json_ld_events(html: str, default_venue: str = "") -> List[dict]:
    """Extract events from JSON-LD"""
    events = []
    pattern = r'<script type="application/ld\+json">(.*?)</script>'
    matches = re.findall(pattern, html, re.DOTALL)
    
    for match in matches:
        try:
            data = json.loads(match.strip())
            items = data if isinstance(data, list) else [data]
            
            for item in items:
                if item.get('@type') == 'Event':
                    start = item.get('startDate', '')
                    date = start.split('T')[0] if 'T' in start else start
                    time = start.split('T')[1][:5] if 'T' in start else 'TBD'
                    
                    venue_name = item.get('location', {}).get('name', default_venue)
                    
                    events.append({
                        'title': item.get('name', ''),
                        'date': date,
                        'time': time,
                        'venue': venue_name,
                        'artists': extract_artists_from_title(item.get('name', '')),
                        'ticket_url': item.get('url', ''),
                        'description': strip_html(item.get('description', '')),
                    })
        except:
            continue
    return events

def extract_artists_from_title(title: str) -> List[str]:
    """Extract artists from title"""
    separators = [' at ', ' @ ', ' - ', ' – ', ' — ', ': ', ' + ', ', ', ' b2b ', ' B2B ', ' & ']
    
    for sep in separators:
        if sep in title:
            parts = title.split(sep)
            artist_part = parts[0]
            artists = re.split(r', | & |\+ | and ', artist_part)
            return [a.strip() for a in artists if a.strip()]
    
    return [title.strip()]

# ==================== PROMOTER SCRAPERS ====================

def scrape_teksupport() -> List[dict]:
    """Scrape Teksupport events"""
    print("  Fetching Teksupport...")
    url = "https://teksupport.com/events"
    html = fetch_url(url)
    if not html:
        return []
    
    # Try JSON-LD first
    events = extract_json_ld_events(html, "Teksupport")
    if events:
        print(f"    Found {len(events)} events via JSON-LD")
        return events
    
    # Fallback: Parse HTML structure
    # Teksupport uses custom layout
    event_pattern = r'<a[^>]*href="(/events/[^"]*)"[^>]*>.*?<h[^>]*>(.*?)</h[^>]*>'
    matches = re.findall(event_pattern, html, re.DOTALL | re.IGNORECASE)
    
    events = []
    for match in matches:
        path, title_html = match
        title = strip_html(title_html)
        
        # Try to extract date from title or nearby
        date = parse_date(title) or datetime.now().strftime('%Y-%m-%d')
        
        events.append({
            'title': title,
            'date': date,
            'time': 'TBD',
            'venue': 'Teksupport',
            'artists': extract_artists_from_title(title),
            'ticket_url': f"https://teksupport.com{path}",
            'description': '',
        })
    
    print(f"    Found {len(events)} events")
    return events

def scrape_circoloco() -> List[dict]:
    """Scrape Circoloco events"""
    print("  Fetching Circoloco...")
    # Circoloco events are primarily on RA
    # Their website: https://circoloco.com
    url = "https://circoloco.com/events"
    html = fetch_url(url)
    if not html:
        return []
    
    events = extract_json_ld_events(html, "Circoloco")
    print(f"    Found {len(events)} events")
    return events

def scrape_schimanski() -> List[dict]:
    """Scrape Schimanski events"""
    print("  Fetching Schimanski...")
    url = "https://schimanski.com/events"
    html = fetch_url(url)
    if not html:
        return []
    
    events = extract_json_ld_events(html, "Schimanski")
    print(f"    Found {len(events)} events")
    return events

def scrape_brooklyn_storehouse() -> List[dict]:
    """Scrape Brooklyn Storehouse"""
    print("  Fetching Brooklyn Storehouse...")
    url = "https://brooklynstorehouse.com/events"
    html = fetch_url(url)
    if not html:
        return []
    
    events = extract_json_ld_events(html, "Brooklyn Storehouse")
    print(f"    Found {len(events)} events")
    return events

# ==================== VENUE SCRAPERS ====================

def scrape_knockdown_center() -> List[dict]:
    """Scrape Knockdown Center"""
    print("  Fetching Knockdown Center...")
    url = "https://knockdowncenter.com/events/"
    html = fetch_url(url)
    if not html:
        return []
    
    events = extract_json_ld_events(html, "Knockdown Center")
    print(f"    Found {len(events)} events")
    return events

def scrape_nowadays() -> List[dict]:
    """Scrape Nowadays"""
    print("  Fetching Nowadays...")
    # Try different URL patterns
    urls = [
        "https://nowadays.nyc/calendar",
        "https://nowadays.nyc/events",
    ]
    
    for url in urls:
        html = fetch_url(url)
        if html:
            events = extract_json_ld_events(html, "Nowadays")
            if events:
                print(f"    Found {len(events)} events")
                return events
    
    return []

def scrape_public_records() -> List[dict]:
    """Scrape Public Records"""
    print("  Fetching Public Records...")
    url = "https://publicrecords.nyc/calendar"
    html = fetch_url(url)
    if not html:
        return []
    
    events = extract_json_ld_events(html, "Public Records")
    print(f"    Found {len(events)} events")
    return events

def scrape_good_room() -> List[dict]:
    """Scrape Good Room"""
    print("  Fetching Good Room...")
    url = "https://goodroombk.com/calendar"
    html = fetch_url(url)
    if not html:
        return []
    
    events = extract_json_ld_events(html, "Good Room")
    print(f"    Found {len(events)} events")
    return events

def scrape_elsewhere() -> List[dict]:
    """Scrape Elsewhere"""
    print("  Fetching Elsewhere...")
    url = "https://www.elsewherebrooklyn.com/events"
    html = fetch_url(url)
    if not html:
        return []
    
    events = extract_json_ld_events(html, "Elsewhere")
    print(f"    Found {len(events)} events")
    return events

# ==================== CONFIGURATION ====================

PROMOTER_SCRAPERS = {
    'Teksupport': scrape_teksupport,
    'Circoloco': scrape_circoloco,
    'Schimanski': scrape_schimanski,
    'Brooklyn Storehouse': scrape_brooklyn_storehouse,
}

VENUE_SCRAPERS = {
    'Knockdown Center': scrape_knockdown_center,
    'Nowadays': scrape_nowadays,
    'Public Records': scrape_public_records,
    'Good Room': scrape_good_room,
    'Elsewhere': scrape_elsewhere,
}

def create_event_from_raw(raw: dict, source_name: str, source_type: str = 'venue') -> Optional[Event]:
    """Create Event from raw data"""
    try:
        event_date = datetime.strptime(raw['date'], '%Y-%m-%d')
        now = datetime.now()
        
        # Only future events within 60 days
        if event_date < now or event_date > now + timedelta(days=60):
            return None
        
        days_until = (event_date - now).days
        artists = raw.get('artists', [])
        title = raw.get('title', '')
        
        return Event(
            id=f"{source_type}-{source_name.lower().replace(' ', '-')}-{raw['date']}-{title[:15].lower().replace(' ', '-').replace('/', '-')}",
            title=title,
            date=raw['date'],
            time=raw.get('time', 'TBD'),
            venue=raw.get('venue', source_name),
            venue_city='Brooklyn' if 'brooklyn' in raw.get('venue', '').lower() else 'Queens' if 'queens' in raw.get('venue', '').lower() else 'Manhattan',
            artists=artists,
            headliner=artists[0] if artists else 'TBD',
            genre=detect_genre(title),
            description=raw.get('description', '')[:200],
            ticket_url=raw.get('ticket_url', ''),
            price='TBD',
            age='21+',
            days_until=days_until,
            status='soon' if days_until < 7 else 'upcoming',
            scraped_at=now.isoformat(),
            priority='high' if days_until < 14 else 'normal'
        )
    except Exception as e:
        return None

def scrape_all(days_ahead: int = 30) -> List[Event]:
    """Scrape all promoters and venues"""
    all_events = []
    
    print(f"\nScraping {len(PROMOTER_SCRAPERS)} promoters...")
    for name, scraper in PROMOTER_SCRAPERS.items():
        try:
            raw_events = scraper()
            for raw in raw_events:
                event = create_event_from_raw(raw, name, 'promoter')
                if event:
                    all_events.append(event)
        except Exception as e:
            print(f"    Error: {e}")
    
    print(f"\nScraping {len(VENUE_SCRAPERS)} venues...")
    for name, scraper in VENUE_SCRAPERS.items():
        try:
            raw_events = scraper()
            for raw in raw_events:
                event = create_event_from_raw(raw, name, 'venue')
                if event:
                    all_events.append(event)
        except Exception as e:
            print(f"    Error: {e}")
    
    # Sort by date
    all_events.sort(key=lambda e: e.date)
    return all_events

if __name__ == "__main__":
    print("Testing NYC promoter & venue scraper...")
    events = scrape_all(30)
    print(f"\nTotal events: {len(events)}")
    for e in events[:10]:
        print(f"  {e.date}: {e.title[:50]} @ {e.venue}")
