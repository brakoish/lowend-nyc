#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — Apify Integration

Uses Apify platform to scrape events (handles bot detection)

Setup:
1. Sign up at https://apify.com
2. Get API token from https://console.apify.com/account/integrations
3. Set APIFY_TOKEN environment variable
"""

import os
import json
import urllib.request
import urllib.error
from datetime import datetime, timedelta
from typing import List, Optional

from models import Event, Venue, NYC_VENUES, detect_genre

APIFY_TOKEN = os.environ.get('APIFY_TOKEN')
APIFY_BASE_URL = "https://api.apify.com/v2"

# Apify Actor IDs
RA_ARTIST_ACTOR = "augeas/resident-advisor"  # Artist-focused
WEB_SCRAPER_ACTOR = "apify/web-scraper"  # Generic web scraper

def apify_request(endpoint: str, method: str = 'GET', data: dict = None) -> dict:
    """Make request to Apify API"""
    if not APIFY_TOKEN:
        raise ValueError("APIFY_TOKEN not set. Get one at https://console.apify.com/account/integrations")
    
    url = f"{APIFY_BASE_URL}/{endpoint}"
    headers = {
        'Authorization': f'Bearer {APIFY_TOKEN}',
        'Content-Type': 'application/json',
    }
    
    try:
        if method == 'POST' and data:
            req = urllib.request.Request(
                url, 
                data=json.dumps(data).encode('utf-8'),
                headers=headers,
                method='POST'
            )
        else:
            req = urllib.request.Request(url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=60) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"Apify API Error: {e.code} - {e.reason}")
        return {}
    except Exception as e:
        print(f"Error: {e}")
        return {}

def run_web_scraper(url: str, wait_secs: int = 60) -> List[dict]:
    """Run Apify web scraper on a URL"""
    print(f"  Running Apify scraper on {url}...")
    
    # Start actor run
    run_input = {
        "startUrls": [{"url": url}],
        "pageFunction": """
        async function pageFunction(context) {
            const { page, request, log } = context;
            
            // Wait for content to load
            await page.waitForTimeout(5000);
            
            // Extract events
            const events = await page.evaluate(() => {
                const data = [];
                
                // Look for event links
                const links = document.querySelectorAll('a[href*="/events/"]');
                links.forEach(link => {
                    const title = link.textContent?.trim();
                    const href = link.getAttribute('href');
                    if (title && href) {
                        data.push({
                            title: title,
                            url: href.startsWith('http') ? href : 'https://ra.co' + href,
                        });
                    }
                });
                
                return data;
            });
            
            return {
                url: request.url,
                events: events,
            };
        }
        """,
        "waitFor": 5000,
    }
    
    # Start run
    result = apify_request(
        f'acts/{WEB_SCRAPER_ACTOR}/runs',
        method='POST',
        data=run_input
    )
    
    if not result.get('data'):
        print("    Failed to start scraper")
        return []
    
    run_id = result['data']['id']
    print(f"    Run started: {run_id}")
    
    # Wait for completion
    import time
    for i in range(wait_secs // 5):
        time.sleep(5)
        status = apify_request(f'acts/{WEB_SCRAPER_ACTOR}/runs/{run_id}')
        if status.get('data', {}).get('status') in ['SUCCEEDED', 'FAILED', 'TIMED-OUT']:
            break
    
    # Get results
    dataset_id = status.get('data', {}).get('defaultDatasetId')
    if not dataset_id:
        print("    No dataset found")
        return []
    
    items = apify_request(f'datasets/{dataset_id}/items')
    
    events = []
    for item in items:
        if 'events' in item:
            events.extend(item['events'])
    
    print(f"    Found {len(events)} events")
    return events

def scrape_ra_with_apify(venue_id: int, venue_name: str) -> List[dict]:
    """Scrape RA venue page using Apify"""
    url = f"https://ra.co/events/us/newyork?venue={venue_id}"
    return run_web_scraper(url)

def scrape_all_apify(days_ahead: int = 30) -> List[Event]:
    """Scrape all venues using Apify"""
    if not APIFY_TOKEN:
        print("Error: APIFY_TOKEN not set")
        print("Get one at: https://console.apify.com/account/integrations")
        return []
    
    # NYC venues on RA
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
        print(f"\nScraping {venue_name}...")
        
        try:
            raw_events = scrape_ra_with_apify(venue_id, venue_name)
            
            for raw in raw_events:
                title = raw.get('title', '')
                
                # Try to parse date from title
                # RA titles often include dates like "Artist at Venue - Fri, 21 Mar"
                import re
                date_match = re.search(r'(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)', title, re.I)
                
                if date_match:
                    day = date_match.group(1)
                    month = datetime.strptime(date_match.group(2)[:3], '%b').month
                    year = now.year
                    date = f"{year}-{month:02d}-{int(day):02d}"
                else:
                    continue
                
                try:
                    event_date = datetime.strptime(date, '%Y-%m-%d')
                    if event_date < now or event_date > now + timedelta(days=days_ahead):
                        continue
                    
                    days_until = (event_date - now).days
                    artists = [title.split(' at ')[0].strip()] if ' at ' in title else [title]
                    
                    venue_obj = next((v for v in NYC_VENUES if v.name == venue_name), 
                                   Venue(venue_name, "Brooklyn"))
                    
                    event = Event(
                        id=f"apify-{venue_id}-{date}-{title[:15].lower().replace(' ', '-')}",
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
                    
        except Exception as e:
            print(f"    Error: {e}")
    
    all_events.sort(key=lambda e: e.date)
    return all_events

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--days', type=int, default=30)
    parser.add_argument('--output', default='events-apify.json')
    
    args = parser.parse_args()
    
    print("="*60)
    print("LOWEND NYC Event Scraper — Apify")
    print("="*60)
    
    if not APIFY_TOKEN:
        print("\nError: APIFY_TOKEN not set")
        print("\nTo use Apify:")
        print("1. Sign up at https://apify.com")
        print("2. Get API token at https://console.apify.com/account/integrations")
        print("3. Set environment variable:")
        print("   export APIFY_TOKEN='your_token_here'")
        print("\nCost: ~$5-10/month for basic usage")
        exit(1)
    
    events = scrape_all_apify(args.days)
    
    from models import export_to_json
    export_to_json(events, args.output)
    
    print(f"\n{'='*60}")
    print(f"Found {len(events)} events")
    print(f"{'='*60}")
