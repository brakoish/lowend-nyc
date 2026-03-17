#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — Songkick API Implementation

Requires: SONGKICK_API_KEY environment variable
Get one at: https://www.songkick.com/developer/getting-started
"""

import os
import json
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timedelta
from typing import List, Optional

from models import Event, Venue, NYC_VENUES, detect_genre

# Configuration
SONGKICK_API_KEY = os.environ.get('SONGKICK_API_KEY')
SONGKICK_BASE_URL = "https://api.songkick.com/api/3.0"

def songkick_request(endpoint: str, params: dict = None) -> dict:
    """Make a request to Songkick API"""
    if not SONGKICK_API_KEY:
        raise ValueError("SONGKICK_API_KEY environment variable not set")
    
    url = f"{SONGKICK_BASE_URL}/{endpoint}"
    params = params or {}
    params['apikey'] = SONGKICK_API_KEY
    
    query_string = '&'.join(f"{k}={urllib.parse.quote(str(v))}" for k, v in params.items())
    full_url = f"{url}?{query_string}"
    
    try:
        req = urllib.request.Request(full_url, headers={
            'User-Agent': 'LOWEND-NYC-Scraper/1.0'
        })
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        return {}
    except Exception as e:
        print(f"Error: {e}")
        return {}

def search_venue(venue_name: str) -> Optional[int]:
    """Search for a venue and return its Songkick ID"""
    result = songkick_request('search/venues.json', {'query': venue_name})
    
    if result.get('resultsPage', {}).get('totalEntries', 0) > 0:
        venues = result['resultsPage']['results']['venue']
        # Return first match (should be most relevant)
        venue = venues[0]
        print(f"Found: {venue['displayName']} (ID: {venue['id']}) - {venue.get('city', {}).get('displayName', 'Unknown')}")
        return venue['id']
    return None

def get_venue_events(venue_id: int, min_date: str = None, max_date: str = None) -> List[dict]:
    """Get events for a specific venue"""
    params = {}
    if min_date:
        params['min_date'] = min_date
    if max_date:
        params['max_date'] = max_date
    
    result = songkick_request(f'venues/{venue_id}/calendar.json', params)
    
    events = []
    if result.get('resultsPage', {}).get('totalEntries', 0) > 0:
        calendar = result['resultsPage']['results'].get('event', [])
        for event in calendar:
            events.append({
                'id': event.get('id'),
                'title': event.get('displayName'),
                'date': event.get('start', {}).get('date'),
                'time': event.get('start', {}).get('time', 'TBD'),
                'venue': event.get('venue', {}).get('displayName'),
                'venue_city': event.get('location', {}).get('city'),
                'artists': [p.get('artist', {}).get('displayName') for p in event.get('performance', [])],
                'ticket_url': event.get('uri', ''),
                'status': event.get('status'),
            })
    return events

def create_event_from_songkick(data: dict, venue: Venue) -> Event:
    """Create Event object from Songkick data"""
    event_date = datetime.strptime(data['date'], '%Y-%m-%d')
    now = datetime.now()
    days_until = (event_date - now).days
    
    artists = data.get('artists', [])
    title = data.get('title', '')
    
    return Event(
        id=f"sk-{data.get('id')}",
        title=title,
        date=data['date'],
        time=data.get('time', 'TBD'),
        venue=venue.name,
        venue_city=venue.city,
        artists=artists,
        headliner=artists[0] if artists else 'TBD',
        genre=detect_genre(title),
        description='',
        ticket_url=data.get('ticket_url', ''),
        price='TBD',
        age='21+',
        days_until=days_until,
        status='soon' if days_until < 7 else 'upcoming',
        scraped_at=now.isoformat(),
        priority='high' if days_until < 14 else 'normal'
    )

def lookup_all_venue_ids():
    """Find Songkick IDs for all venues"""
    print("Looking up Songkick venue IDs...\n")
    for venue in NYC_VENUES:
        venue_id = search_venue(venue.name)
        if venue_id:
            venue.songkick_id = venue_id
            print(f"  {venue.name}: {venue_id}")
        else:
            print(f"  {venue.name}: NOT FOUND")

def scrape_songkick(days_ahead: int = 30) -> List[Event]:
    """Scrape events from Songkick for all venues"""
    if not SONGKICK_API_KEY:
        print("Error: SONGKICK_API_KEY not set")
        print("Get one at: https://www.songkick.com/developer/getting-started")
        return []
    
    now = datetime.now()
    min_date = now.strftime('%Y-%m-%d')
    max_date = (now + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
    
    all_events = []
    
    for venue in NYC_VENUES:
        if not venue.songkick_id:
            print(f"Skipping {venue.name} (no Songkick ID)")
            continue
        
        print(f"Scraping {venue.name}...")
        try:
            raw_events = get_venue_events(venue.songkick_id, min_date, max_date)
            for raw_event in raw_events:
                event = create_event_from_songkick(raw_event, venue)
                all_events.append(event)
            print(f"  Found {len(raw_events)} events")
        except Exception as e:
            print(f"  Error: {e}")
    
    # Sort by date
    all_events.sort(key=lambda e: e.date)
    return all_events

if __name__ == "__main__":
    # Test the scraper
    print("Testing Songkick scraper...")
    if not SONGKICK_API_KEY:
        print("SONGKICK_API_KEY not set. Set it to test.")
    else:
        events = scrape_songkick(30)
        print(f"Found {len(events)} events")
