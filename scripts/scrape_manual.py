#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — Manual Entry & Sample Data

Since automated scraping is blocked, this provides:
1. Sample data for testing
2. Manual event entry helper
3. CSV import from manual sources
"""

import csv
import json
from datetime import datetime, timedelta
from typing import List
from models import Event, Venue, detect_genre, export_to_json, export_to_csv

# Key NYC venues and promoters to track manually
NYC_SOURCES = {
    'promoters': [
        'Teksupport',
        'Gray Area', 
        'Circoloco',
        'Schimanski',
        'Brooklyn Storehouse',
        'Despacio',
    ],
    'venues': [
        'Knockdown Center',
        'Brooklyn Mirage',
        'Basement',
        'Elsewhere',
        'Nowadays',
        '99 Scott',
        'Superior Ingredients',
        'Le Bain',
        'Good Room',
        'Public Records',
    ]
}

def generate_sample_events() -> List[Event]:
    """Generate realistic sample events for NYC"""
    now = datetime.now()
    
    sample_events = [
        {
            'title': 'Charlotte de Witte at Brooklyn Mirage',
            'date': (now + timedelta(days=5)).strftime('%Y-%m-%d'),
            'venue': 'Brooklyn Mirage',
            'city': 'Brooklyn',
            'artists': ['Charlotte de Witte', 'Enrico Sangiuliano'],
            'promoter': 'Teksupport',
            'genre': ['techno'],
        },
        {
            'title': 'Four Tet at Knockdown Center',
            'date': (now + timedelta(days=12)).strftime('%Y-%m-%d'),
            'venue': 'Knockdown Center',
            'city': 'Queens',
            'artists': ['Four Tet', 'Floating Points'],
            'promoter': 'Gray Area',
            'genre': ['electronic', 'ambient'],
        },
        {
            'title': 'The Martinez Brothers at Brooklyn Storehouse',
            'date': (now + timedelta(days=8)).strftime('%Y-%m-%d'),
            'venue': 'Brooklyn Storehouse',
            'city': 'Brooklyn',
            'artists': ['The Martinez Brothers', 'Seth Troxler'],
            'promoter': 'Circoloco',
            'genre': ['house', 'techno'],
        },
        {
            'title': 'Bass House Night at Basement',
            'date': (now + timedelta(days=3)).strftime('%Y-%m-%d'),
            'venue': 'Basement',
            'city': 'Brooklyn',
            'artists': ['AC Slater', 'Shift K3Y'],
            'promoter': 'Basement',
            'genre': ['bass', 'house'],
        },
        {
            'title': 'Drum & Bass Sessions at Nowadays',
            'date': (now + timedelta(days=10)).strftime('%Y-%m-%d'),
            'venue': 'Nowadays',
            'city': 'Queens',
            'artists': ['Andy C', 'Friction'],
            'promoter': 'Nowadays',
            'genre': ['dnb'],
        },
        {
            'title': 'Deep House Showcase at Elsewhere',
            'date': (now + timedelta(days=15)).strftime('%Y-%m-%d'),
            'venue': 'Elsewhere',
            'city': 'Brooklyn',
            'artists': ['Moodymann'],
            'promoter': 'Elsewhere',
            'genre': ['house'],
        },
        {
            'title': 'Nina Kraviz at 99 Scott',
            'date': (now + timedelta(days=20)).strftime('%Y-%m-%d'),
            'venue': '99 Scott',
            'city': 'Brooklyn',
            'artists': ['Nina Kraviz'],
            'promoter': 'Teksupport',
            'genre': ['techno'],
        },
    ]
    
    events = []
    for data in sample_events:
        event_date = datetime.strptime(data['date'], '%Y-%m-%d')
        days_until = (event_date - now).days
        
        events.append(Event(
            id=f"sample-{data['venue'].lower().replace(' ', '-')}-{data['date']}",
            title=data['title'],
            date=data['date'],
            time='22:00',
            venue=data['venue'],
            venue_city=data['city'],
            artists=data['artists'],
            headliner=data['artists'][0],
            genre=data['genre'],
            description=f"Presented by {data['promoter']}",
            ticket_url='',
            price='TBD',
            age='21+',
            days_until=days_until,
            status='soon' if days_until < 7 else 'upcoming',
            scraped_at=now.isoformat(),
            priority='high' if days_until < 14 else 'normal',
            notes=f"Source: {data['promoter']}"
        ))
    
    return events

def create_manual_entry_template():
    """Create CSV template for manual event entry"""
    template = [
        ['title', 'date', 'time', 'venue', 'venue_city', 'artists', 'genre', 'ticket_url', 'price', 'promoter'],
        ['Artist Name at Venue', '2026-03-25', '22:00', 'Venue Name', 'Brooklyn', 'Artist 1, Artist 2', 'techno', 'https://tickets.link', '$30-50', 'Promoter Name'],
    ]
    
    with open('manual_entry_template.csv', 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(template)
    
    print("Created manual_entry_template.csv")

def import_manual_csv(filepath: str) -> List[Event]:
    """Import events from manually created CSV"""
    events = []
    now = datetime.now()
    
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                event_date = datetime.strptime(row['date'], '%Y-%m-%d')
                days_until = (event_date - now).days
                
                artists = [a.strip() for a in row['artists'].split(',')]
                genre = [g.strip() for g in row.get('genre', 'electronic').split(',')]
                
                events.append(Event(
                    id=f"manual-{row['venue'].lower().replace(' ', '-')}-{row['date']}",
                    title=row['title'],
                    date=row['date'],
                    time=row.get('time', 'TBD'),
                    venue=row['venue'],
                    venue_city=row.get('venue_city', 'Brooklyn'),
                    artists=artists,
                    headliner=artists[0] if artists else 'TBD',
                    genre=genre,
                    description=f"Presented by {row.get('promoter', 'Unknown')}",
                    ticket_url=row.get('ticket_url', ''),
                    price=row.get('price', 'TBD'),
                    age='21+',
                    days_until=days_until,
                    status='soon' if days_until < 7 else 'upcoming',
                    scraped_at=now.isoformat(),
                    priority='high' if days_until < 14 else 'normal',
                    notes='Manual entry'
                ))
            except Exception as e:
                print(f"Error parsing row: {e}")
    
    return events

def print_tracking_checklist():
    """Print checklist of sources to track manually"""
    print("\n" + "="*60)
    print("NYC ELECTRONIC MUSIC SOURCES TO TRACK")
    print("="*60)
    
    print("\nPROMOTERS (check weekly):")
    for promoter in NYC_SOURCES['promoters']:
        print(f"  □ {promoter}")
    
    print("\nVENUES (check weekly):")
    for venue in NYC_SOURCES['venues']:
        print(f"  □ {venue}")
    
    print("\nWEBSITES TO CHECK:")
    print("  □ https://ra.co/events/us/newyork")
    print("  □ https://teksupport.com")
    print("  □ Venue Instagram accounts")
    print("  □ Promoter Instagram accounts")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--sample', action='store_true', help='Generate sample events')
    parser.add_argument('--template', action='store_true', help='Create manual entry template')
    parser.add_argument('--import-csv', help='Import manual CSV file')
    parser.add_argument('--checklist', action='store_true', help='Print tracking checklist')
    parser.add_argument('--output', default='events.json')
    
    args = parser.parse_args()
    
    if args.template:
        create_manual_entry_template()
    
    elif args.checklist:
        print_tracking_checklist()
    
    elif args.import_csv:
        events = import_manual_csv(args.import_csv)
        export_to_json(events, args.output)
    
    else:
        # Default: generate sample events
        events = generate_sample_events()
        export_to_json(events, args.output)
        print(f"\nGenerated {len(events)} sample events")
        print(f"\nTo track real events:")
        print(f"  python3 scrape_manual.py --checklist")
        print(f"  python3 scrape_manual.py --template")
        print(f"  python3 scrape_manual.py --import-csv your_events.csv")
