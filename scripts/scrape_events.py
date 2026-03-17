#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — Unified Interface

Usage:
  python3 scrape_events.py --source venues --days 30
  python3 scrape_events.py --source ra --days 30
  python3 scrape_events.py --source all --days 30 --output events.json

Sources:
  - venues: Scrapes venue websites directly (works now)
  - ra: Resident Advisor via Playwright (requires install)
  - all: Tries both sources and merges results
  - sample: Generates sample data for testing
"""

import os
import sys
import argparse
from typing import List

from models import Event, export_to_json, export_to_csv, generate_sample_events

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
    
    merged.sort(key=lambda e: e.date)
    return merged

def main():
    parser = argparse.ArgumentParser(description='LOWEND NYC Event Scraper')
    parser.add_argument('--source', choices=['venues', 'ra', 'all', 'sample'], 
                        default='sample', help='Data source')
    parser.add_argument('--days', type=int, default=30, help='Days ahead to scrape')
    parser.add_argument('--output', default='events.json', help='Output file (json or csv)')
    parser.add_argument('--venue', help='Scrape specific venue only (for --source venues)')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("LOWEND NYC Event Scraper")
    print("=" * 60)
    
    events = []
    
    if args.source == 'sample':
        print("\nGenerating sample events...")
        events = generate_sample_events()
    
    elif args.source == 'venues':
        try:
            from scrape_venues import scrape_all_venues
            print(f"\nScraping venue websites (next {args.days} days)...")
            events = scrape_all_venues(args.days, specific_venue=args.venue)
        except ImportError as e:
            print(f"Error importing venue scraper: {e}")
            return
    
    elif args.source == 'ra':
        try:
            from scrape_ra import scrape_ra
            print(f"\nScraping Resident Advisor (next {args.days} days)...")
            print("NOTE: This requires Playwright (pip install playwright && playwright install)")
            events = scrape_ra(args.days)
        except ImportError as e:
            print(f"Error importing RA scraper: {e}")
            print("\nTo use RA scraping:")
            print("  pip install playwright")
            print("  playwright install chromium")
            return
    
    elif args.source == 'all':
        all_events = []
        
        # Try venue scraping first (more reliable)
        try:
            from scrape_venues import scrape_all_venues
            print("\nScraping venue websites...")
            venue_events = scrape_all_venues(args.days)
            all_events.append(venue_events)
            print(f"  Found {len(venue_events)} events from venues")
        except Exception as e:
            print(f"\nVenue scraper error: {e}")
        
        # Try RA scraping
        try:
            from scrape_ra import scrape_ra
            print("\nScraping Resident Advisor...")
            ra_events = scrape_ra(args.days)
            all_events.append(ra_events)
            print(f"  Found {len(ra_events)} events from RA")
        except Exception as e:
            print(f"\nRA scraper error: {e}")
            print("Make sure Playwright is installed:")
            print("  pip install playwright && playwright install chromium")
        
        # Merge and deduplicate
        events = merge_events(all_events)
        print(f"\nMerged: {len(events)} unique events")
    
    if not events:
        print("\nNo events found.")
        print("\nTo get started:")
        print("  python3 scrape_events.py --source sample --days 30")
        print("  python3 scrape_events.py --source venues --days 30")
        print("\nFor RA scraping (most comprehensive):")
        print("  pip install playwright && playwright install chromium")
        print("  python3 scrape_events.py --source ra --days 30")
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
