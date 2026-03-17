#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — Unified Interface

Usage:
  python3 scrape_events.py --source songkick --days 30
  python3 scrape_events.py --source venues --days 14
  python3 scrape_events.py --source all --days 30 --output events.json

Sources:
  - songkick: Uses Songkick API (requires SONGKICK_API_KEY)
  - venues: Scrapes venue websites directly (no API key, may break)
  - all: Tries both sources and merges results
  - sample: Generates sample data for testing
"""

import os
import sys
import argparse
from typing import List

# Import shared models
from models import Event, export_to_json, export_to_csv, generate_sample_events, NYC_VENUES

def merge_events(event_lists: List[List[Event]]) -> List[Event]:
    """Merge events from multiple sources, deduplicating by title+date+venue"""
    seen = set()
    merged = []
    
    for events in event_lists:
        for event in events:
            key = f"{event.title.lower()}|{event.date}|{event.venue.lower()}"
            if key not in seen:
                seen.add(key)
                merged.append(event)
    
    # Sort by date
    merged.sort(key=lambda e: e.date)
    return merged

def main():
    parser = argparse.ArgumentParser(description='LOWEND NYC Event Scraper')
    parser.add_argument('--source', choices=['songkick', 'venues', 'all', 'sample'], 
                        default='sample', help='Data source')
    parser.add_argument('--days', type=int, default=30, help='Days ahead to scrape')
    parser.add_argument('--output', default='events.json', help='Output file (json or csv)')
    parser.add_argument('--lookup', action='store_true', help='Look up Songkick venue IDs')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("LOWEND NYC Event Scraper")
    print("=" * 60)
    
    events = []
    
    if args.source == 'sample':
        print("\nGenerating sample events...")
        events = generate_sample_events()
    
    elif args.source == 'songkick':
        try:
            from scrape_songkick import scrape_songkick, lookup_all_venue_ids
            if args.lookup:
                lookup_all_venue_ids()
                return
            print(f"\nScraping from Songkick (next {args.days} days)...")
            events = scrape_songkick(args.days)
        except ImportError as e:
            print(f"Error importing Songkick scraper: {e}")
            return
    
    elif args.source == 'venues':
        try:
            from scrape_venues import scrape_all_venues
            print(f"\nScraping venue websites (next {args.days} days)...")
            print("NOTE: This may break if venues update their sites")
            events = scrape_all_venues(args.days)
        except ImportError as e:
            print(f"Error importing venue scraper: {e}")
            return
    
    elif args.source == 'all':
        all_events = []
        
        # Try Songkick first
        try:
            from scrape_songkick import scrape_songkick
            if os.environ.get('SONGKICK_API_KEY'):
                print("\nScraping from Songkick...")
                sk_events = scrape_songkick(args.days)
                all_events.append(sk_events)
                print(f"  Found {len(sk_events)} events from Songkick")
            else:
                print("\nSkipping Songkick (no API key)")
        except Exception as e:
            print(f"\nSongkick error: {e}")
        
        # Try venue scraping
        try:
            from scrape_venues import scrape_all_venues
            print("\nScraping venue websites...")
            venue_events = scrape_all_venues(args.days)
            all_events.append(venue_events)
            print(f"  Found {len(venue_events)} events from venues")
        except Exception as e:
            print(f"\nVenue scraper error: {e}")
        
        # Merge and deduplicate
        events = merge_events(all_events)
        print(f"\nMerged: {len(events)} unique events")
    
    if not events:
        print("\nNo events found.")
        print("\nTo get started:")
        print("1. Get a Songkick API key:")
        print("   https://www.songkick.com/developer/getting-started")
        print("2. Set it: export SONGKICK_API_KEY='your_key'")
        print("3. Run: python3 scrape_events.py --source songkick --days 30")
        print("\nOr use sample data:")
        print("   python3 scrape_events.py --source sample --days 30")
        return
    
    # Export
    if args.output.endswith('.csv'):
        export_to_csv(events, args.output)
    else:
        export_to_json(events, args.output)
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Total events: {len(events)}")
    print(f"High priority (next 2 weeks): {sum(1 for e in events if e.priority == 'high')}")
    print(f"Soon (next week): {sum(1 for e in events if e.status == 'soon')}")
    
    print(f"\nGenres:")
    all_genres = [g for e in events for g in e.genre]
    for genre in sorted(set(all_genres)):
        count = all_genres.count(genre)
        print(f"  - {genre}: {count}")
    
    print(f"\nVenues:")
    venues = {}
    for e in events:
        venues[e.venue] = venues.get(e.venue, 0) + 1
    for venue, count in sorted(venues.items(), key=lambda x: -x[1]):
        print(f"  - {venue}: {count}")
    
    print(f"\n{'='*60}")
    print(f"Next steps:")
    print(f"1. Import {args.output} to Google Sheets")
    print(f"2. Assign writers to high priority events")
    print(f"3. Update coverage_type and publish_date")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
