#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — Enhanced Venue Scrapers

Scrapes specific NYC venue websites with robust parsers
"""

import json
import re
import urllib.request
from datetime import datetime, timedelta
from html.parser import HTMLParser
from typing import List, Optional, Dict

from models import Event, Venue, NYC_VENUES, detect_genre

class MLStripper(HTMLParser):
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
        return ' '.join(s.get_data().split())  # Normalize whitespace
    except:
        return html

def fetch_url(url: str, headers: dict = None) -> Optional[str]:
    """Fetch URL with proper headers"""
    default_headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    if headers:
        default_headers.update(headers)
    
    try:
        req = urllib.request.Request(url, headers=default_headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
        return None

def parse_date(date_str: str) -> Optional[str]:
    """Parse various date formats"""
    date_str = date_str.strip()
    formats = [
        '%Y-%m-%d',
        '%B %d, %Y',
        '%b %d, %Y',
        '%m/%d/%Y',
        '%d/%m/%Y',
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

def extract_json_ld_events(html: str, venue_name: str) -> List[dict]:
    """Extract events from JSON-LD structured data"""
    events = []
    pattern = r'<script type="application/ld\+json">(.*?)</script>'
    matches = re.findall(pattern, html, re.DOTALL)
    
    for match in matches:
        try:
            data = json.loads(match.strip())
            # Handle both single events and arrays
            if isinstance(data, list):
                items = data
            else:
                items = [data]
            
            for item in items:
                if item.get('@type') == 'Event':
                    start = item.get('startDate', '')
                    date = start.split('T')[0] if 'T' in start else start
                    time = start.split('T')[1][:5] if 'T' in start else 'TBD'
                    
                    events.append({
                        'title': item.get('name', ''),
                        'date': date,
                        'time': time,
                        'venue': venue_name,
                        'artists': extract_artists_from_title(item.get('name', '')),
                        'ticket_url': item.get('url', ''),
                        'description': strip_html(item.get('description', '')),
                        'image': item.get('image', ''),
                    })
        except:
            continue
    
    return events

def extract_artists_from_title(title: str) -> List[str]:
    """Extract artist names from event title"""
    # Common patterns: "Artist at Venue", "Artist: Event", "Artist + Artist"
    separators = [' at ', ' @ ', ' - ', ' – ', ' — ', ': ', ' + ', ', ', ' b2b ', ' B2B ']
    
    for sep in separators:
        if sep in title:
            parts = title.split(sep)
            # First part usually contains artists
            artist_part = parts[0]
            # Split on common delimiters
            artists = re.split(r', | & |\+ | and ', artist_part)
            return [a.strip() for a in artists if a.strip()]
    
    return [title.strip()]

# ==================== VENUE-SPECIFIC SCRAPERS ====================

def scrape_knockdown_center() -> List[dict]:
    """Scrape Knockdown Center"""
    print("  Fetching Knockdown Center...")
    url = "https://knockdowncenter.com/events/"
    html = fetch_url(url)
    if not html:
        return []
    
    events = extract_json_ld_events(html, "Knockdown Center")
    print(f"    Found {len(events)} events via JSON-LD")
    return events

def scrape_nowadays() -> List[dict]:
    """Scrape Nowadays (Squarespace site)"""
    print("  Fetching Nowadays...")
    url = "https://nowadays.nyc/calendar"
    html = fetch_url(url)
    if not html:
        return []
    
    events = []
    
    # Try JSON-LD first
    json_ld_events = extract_json_ld_events(html, "Nowadays")
    if json_ld_events:
        return json_ld_events
    
    # Fallback: Parse Squarespace event structure
    # Look for event links with dates
    event_pattern = r'<a[^>]*href="(/events/[^"]*)"[^>]*>.*?<h[^>]*>(.*?)</h[^>]*>.*?<time[^>]*>(.*?)</time>'
    matches = re.findall(event_pattern, html, re.DOTALL | re.IGNORECASE)
    
    for match in matches:
        path, title_html, date_html = match
        title = strip_html(title_html)
        date_str = strip_html(date_html)
        date = parse_date(date_str)
        
        if date and title:
            events.append({
                'title': title,
                'date': date,
                'time': 'TBD',
                'venue': 'Nowadays',
                'artists': extract_artists_from_title(title),
                'ticket_url': f"https://nowadays.nyc{path}",
                'description': '',
            })
    
    print(f"    Found {len(events)} events")
    return events

def scrape_public_records() -> List[dict]:
    """Scrape Public Records"""
    print("  Fetching Public Records...")
    url = "https://publicrecords.nyc/calendar"
    html = fetch_url(url)
    if not html:
        return []
    
    events = extract_json_ld_events(html, "Public Records")
    
    if not events:
        # Fallback: Parse their custom structure
        # Public Records uses a specific calendar format
        event_cards = re.findall(r'<article[^>]*class="[^"]*event[^"]*"[^>]*>(.*?)</article>', html, re.DOTALL)
        for card in event_cards:
            title_match = re.search(r'<h[^>]*>(.*?)</h[^>]*>', card)
            date_match = re.search(r'<time[^>]*>(.*?)</time>', card)
            link_match = re.search(r'<a[^>]*href="([^"]*)"[^>]*>', card)
            
            if title_match and date_match:
                title = strip_html(title_match.group(1))
                date = parse_date(strip_html(date_match.group(1)))
                
                if date and title:
                    events.append({
                        'title': title,
                        'date': date,
                        'time': 'TBD',
                        'venue': 'Public Records',
                        'artists': extract_artists_from_title(title),
                        'ticket_url': link_match.group(1) if link_match else '',
                        'description': '',
                    })
    
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
    
    if not events:
        # Good Room uses WordPress with event custom post type
        event_pattern = r'<a[^>]*href="(https://goodroombk.com/event/[^"]*)"[^>]*>.*?<h[^>]*>(.*?)</h[^>]*>.*?<span[^>]*class="[^"]*date[^"]*"[^>]*>(.*?)</span>'
        matches = re.findall(event_pattern, html, re.DOTALL | re.IGNORECASE)
        
        events = []
        for match in matches:
            url, title_html, date_html = match
            title = strip_html(title_html)
            date = parse_date(strip_html(date_html))
            
            if date and title:
                events.append({
                    'title': title,
                    'date': date,
                    'time': 'TBD',
                    'venue': 'Good Room',
                    'artists': extract_artists_from_title(title),
                    'ticket_url': url,
                    'description': '',
                })
    
    print(f"    Found {len(events)} events")
    return events

def scrape_elsewhere() -> List[dict]:
    """Scrape Elsewhere"""
    print("  Fetching Elsewhere...")
    # Elsewhere shares system with Brooklyn Mirage
    url = "https://www.elsewherebrooklyn.com/events"
    html = fetch_url(url)
    if not html:
        return []
    
    events = extract_json_ld_events(html, "Elsewhere")
    print(f"    Found {len(events)} events")
    return events

def scrape_basement() -> List[dict]:
    """Scrape Basement"""
    print("  Fetching Basement...")
    # Basement uses Resident Advisor primarily
    # Their website is minimal, most events are on RA
    url = "https://basementny.net"
    html = fetch_url(url)
    if not html:
        return []
    
    # Look for RA links
    ra_links = re.findall(r'https://ra\.co/events/\d+', html)
    print(f"    Found {len(ra_links)} RA links (need RA scraper for details)")
    
    return []

# Map venues to scraper functions
VENUE_SCRAPERS = {
    'Knockdown Center': scrape_knockdown_center,
    'Nowadays': scrape_nowadays,
    'Public Records': scrape_public_records,
    'Good Room': scrape_good_room,
    'Elsewhere': scrape_elsewhere,
    'Basement': scrape_basement,
}

def create_event_from_raw(raw: dict, venue: Venue) -> Optional[Event]:
    """Create Event object from raw scraped data"""
    try:
        event_date = datetime.strptime(raw['date'], '%Y-%m-%d')
        now = datetime.now()
        cutoff = now + timedelta(days=60)  # Only future events
        
        if event_date < now or event_date > cutoff:
            return None
        
        days_until = (event_date - now).days
        artists = raw.get('artists', [])
        title = raw.get('title', '')
        
        return Event(
            id=f"venue-{venue.name.lower().replace(' ', '-')}-{raw['date']}-{title[:20].lower().replace(' ', '-').replace('/', '-')}",
            title=title,
            date=raw['date'],
            time=raw.get('time', 'TBD'),
            venue=venue.name,
            venue_city=venue.city,
            artists=artists,
            headliner=artists[0] if artists else 'TBD',
            genre=detect_genre(title),
            description=raw.get('description', '')[:200],  # Truncate long descriptions
            ticket_url=raw.get('ticket_url', ''),
            price='TBD',
            age='21+',
            days_until=days_until,
            status='soon' if days_until < 7 else 'upcoming',
            scraped_at=now.isoformat(),
            priority='high' if days_until < 14 else 'normal'
        )
    except Exception as e:
        print(f"    Error creating event: {e}")
        return None

def scrape_all_venues(days_ahead: int = 30, specific_venue: str = None) -> List[Event]:
    """Scrape all venues or a specific one"""
    all_events = []
    now = datetime.now()
    cutoff = now + timedelta(days=days_ahead)
    
    venues_to_scrape = [v for v in NYC_VENUES if v.name in VENUE_SCRAPERS]
    if specific_venue:
        venues_to_scrape = [v for v in venues_to_scrape if v.name.lower() == specific_venue.lower()]
    
    print(f"\nScraping {len(venues_to_scrape)} venues...\n")
    
    for venue in venues_to_scrape:
        scraper = VENUE_SCRAPERS.get(venue.name)
        if not scraper:
            continue
        
        try:
            raw_events = scraper()
            for raw in raw_events:
                event = create_event_from_raw(raw, venue)
                if event:
                    all_events.append(event)
        except Exception as e:
            print(f"  Error scraping {venue.name}: {e}")
    
    # Sort by date
    all_events.sort(key=lambda e: e.date)
    return all_events

if __name__ == "__main__":
    print("Testing enhanced venue scraper...")
    events = scrape_all_venues(30)
    print(f"\nTotal events found: {len(events)}")
    for e in events[:5]:
        print(f"  - {e.date}: {e.title} @ {e.venue}")
