#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — Alternative Solutions

Since direct scraping is blocked, here are working alternatives:

1. ScrapingBee API (cheaper than Apify)
2. ScrapingAnt API  
3. Bright Data (residential proxies)
4. Manual RA API (unofficial, fragile)
"""

import os
import json
import urllib.request
from datetime import datetime, timedelta
from typing import List

from models import Event, Venue, NYC_VENUES, detect_genre

# ==================== OPTION 1: ScrapingBee ====================

SCRAPINGBEE_API_KEY = os.environ.get('SCRAPINGBEE_API_KEY')

def scrape_with_scrapingbee(url: str) -> str:
    """Scrape using ScrapingBee API"""
    if not SCRAPINGBEE_API_KEY:
        raise ValueError("SCRAPINGBEE_API_KEY not set")
    
    api_url = f"https://app.scrapingbee.com/api/v1/?api_key={SCRAPINGBEE_API_KEY}&url={urllib.parse.quote(url)}&render_js=true&premium_proxy=true"
    
    req = urllib.request.Request(api_url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    with urllib.request.urlopen(req, timeout=60) as response:
        return response.read().decode('utf-8')

# ==================== OPTION 2: ScrapingAnt ====================

SCRAPINGANT_API_KEY = os.environ.get('SCRAPINGANT_API_KEY')

def scrape_with_scrapingant(url: str) -> str:
    """Scrape using ScrapingAnt API"""
    if not SCRAPINGANT_API_KEY:
        raise ValueError("SCRAPINGANT_API_KEY not set")
    
    api_url = f"https://api.scrapingant.com/v2/general?url={urllib.parse.quote(url)}&x-api-key={SCRAPINGANT_API_KEY}&browser=true&proxy_country=US"
    
    req = urllib.request.Request(api_url)
    
    with urllib.request.urlopen(req, timeout=60) as response:
        return response.read().decode('utf-8')

# ==================== OPTION 3: Unofficial RA API ====================

def scrape_ra_unofficial(venue_id: int) -> List[dict]:
    """
    Try to use RA's unofficial/internal API
    This is fragile and may break at any time
    """
    import re
    
    url = f"https://ra.co/events/us/newyork?venue={venue_id}"
    
    # Try with premium proxy service
    try:
        if SCRAPINGBEE_API_KEY:
            html = scrape_with_scrapingbee(url)
        elif SCRAPINGANT_API_KEY:
            html = scrape_with_scrapingant(url)
        else:
            print("No proxy service configured")
            return []
        
        # Parse events from HTML
        events = []
        
        # Look for event data in script tags
        json_pattern = r'window\.__INITIAL_STATE__\s*=\s*({.*?});'
        matches = re.findall(json_pattern, html, re.DOTALL)
        
        for match in matches:
            try:
                data = json.loads(match)
                # Extract events from initial state
                # RA's structure changes, this is a guess
                if 'events' in data:
                    for event in data['events']:
                        events.append({
                            'title': event.get('title', ''),
                            'date': event.get('date', ''),
                            'url': f"https://ra.co/events/{event.get('id', '')}",
                        })
            except:
                continue
        
        # Fallback: regex extraction
        if not events:
            event_pattern = r'<a[^>]*href="(/events/\d+)"[^>]*>.*?<h[^>]*>(.*?)</h[^>]*>'
            matches = re.findall(event_pattern, html, re.DOTALL | re.IGNORECASE)
            for path, title in matches:
                events.append({
                    'title': re.sub(r'<[^>]+>', '', title).strip(),
                    'url': f"https://ra.co{path}",
                })
        
        return events
        
    except Exception as e:
        print(f"Error: {e}")
        return []

# ==================== MAIN INTERFACE ====================

def scrape_with_service(service: str, days_ahead: int = 30) -> List[Event]:
    """Scrape using configured service"""
    
    venues = {
        'Knockdown Center': 131393,
        'Brooklyn Mirage': 106887,
        'Basement': 131837,
        'Elsewhere': 106886,
        'Nowadays': 106888,
    }
    
    all_events = []
    now = datetime.now()
    
    for venue_name, venue_id in venues.items():
        print(f"\nScraping {venue_name} via {service}...")
        
        raw_events = scrape_ra_unofficial(venue_id)
        print(f"  Found {len(raw_events)} events")
        
        for raw in raw_events:
            try:
                # Parse date from title or use placeholder
                title = raw.get('title', '')
                
                # Try to extract date
                import re
                date_match = re.search(r'(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)', title, re.I)
                if date_match:
                    day = date_match.group(1)
                    month = datetime.strptime(date_match.group(2)[:3], '%b').month
                    date = f"{now.year}-{month:02d}-{int(day):02d}"
                else:
                    continue
                
                event_date = datetime.strptime(date, '%Y-%m-%d')
                if event_date < now or event_date > now + timedelta(days=days_ahead):
                    continue
                
                days_until = (event_date - now).days
                artists = [title.split(' at ')[0].strip()] if ' at ' in title else [title]
                
                venue_obj = next((v for v in NYC_VENUES if v.name == venue_name), 
                               Venue(venue_name, "Brooklyn"))
                
                event = Event(
                    id=f"{service}-{venue_id}-{date}-{title[:15].lower().replace(' ', '-')}",
                    title=title,
                    date=date,
                    time='TBD',
                    venue=venue_obj.name,
                    venue_city=venue_obj.city,
                    artists=artists,
                    headliner=artists[0],
                    genre=detect_genre(title),
                    description='',
                    ticket_url=raw.get('url', ''),
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
    
    all_events.sort(key=lambda e: e.date)
    return all_events

if __name__ == "__main__":
    print("="*60)
    print("LOWEND NYC Event Scraper — Alternative Solutions")
    print("="*60)
    print("\nOptions (pick one):")
    print("\n1. ScrapingBee (recommended)")
    print("   - Sign up: https://www.scrapingbee.com")
    print("   - Cost: ~$49/month for 100k API credits")
    print("   - Set: export SCRAPINGBEE_API_KEY='your_key'")
    print("\n2. ScrapingAnt")
    print("   - Sign up: https://scrapingant.com")
    print("   - Cost: Free tier available, ~$19/month paid")
    print("   - Set: export SCRAPINGANT_API_KEY='your_key'")
    print("\n3. Apify (already created scrape_apify.py)")
    print("   - Sign up: https://apify.com")
    print("   - Cost: ~$5-10/month")
    print("   - Set: export APIFY_TOKEN='your_token'")
    print("\n4. Bright Data (most reliable)")
    print("   - Sign up: https://brightdata.com")
    print("   - Cost: ~$15/month starter")
    print("   - Best residential proxy network")
    print("\n" + "="*60)
    
    # Check what's configured
    if SCRAPINGBEE_API_KEY:
        print("\n✓ ScrapingBee configured")
        service = 'scrapingbee'
    elif SCRAPINGANT_API_KEY:
        print("\n✓ ScrapingAnt configured")
        service = 'scrapingant'
    else:
        print("\n✗ No proxy service configured")
        print("Set one of the environment variables above to scrape")
        exit(1)
    
    events = scrape_with_service(service, 30)
    
    from models import export_to_json
    export_to_json(events, f'events-{service}.json')
    
    print(f"\nFound {len(events)} events")
