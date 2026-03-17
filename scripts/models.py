#!/usr/bin/env python3
"""
LOWEND NYC Event Scraper — Shared Models and Utilities
"""

import json
import csv
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from typing import List

@dataclass
class Venue:
    name: str
    city: str
    songkick_id: int = None
    website: str = None

@dataclass
class Event:
    id: str
    title: str
    date: str
    time: str
    venue: str
    venue_city: str
    artists: List[str]
    headliner: str
    genre: List[str]
    description: str
    ticket_url: str
    price: str
    age: str
    days_until: int
    status: str
    scraped_at: str
    # Editorial fields
    assigned_to: str = ""
    coverage_type: str = ""  # preview, recap, profile, none
    draft_due: str = ""
    publish_date: str = ""
    priority: str = "normal"
    notes: str = ""

# NYC Electronic Music Venues
NYC_VENUES = [
    Venue("Knockdown Center", "Queens", None, "https://knockdowncenter.com"),
    Venue("Brooklyn Mirage", "Brooklyn", None, "https://www.elsewherebrooklyn.com"),
    Venue("Basement", "Brooklyn", None, "https://basementny.net"),
    Venue("Elsewhere", "Brooklyn", None, "https://www.elsewherebrooklyn.com"),
    Venue("Nowadays", "Queens", None, "https://nowadays.nyc"),
    Venue("99 Scott", "Brooklyn", None, "https://99scott.com"),
    Venue("Superior Ingredients", "Brooklyn", None, "https://superioringredients.nyc"),
    Venue("Le Bain", "Manhattan", None, "https://lebainnyc.com"),
    Venue("Good Room", "Brooklyn", None, "https://goodroombk.com"),
    Venue("Public Records", "Brooklyn", None, "https://publicrecords.nyc"),
]

GENRE_KEYWORDS = {
    "techno": ["techno", "industrial", "melodic techno", "hard techno", "acid", "berlin"],
    "house": ["house", "deep house", "progressive house", "bass house", "ghetto house", "disco", "garage"],
    "garage": ["uk garage", "bassline", "speed garage", "2-step", "grime"],
    "bass": ["dubstep", "trap", "bass", "future bass", "halftime", "wonky"],
    "dnb": ["drum and bass", "drum & bass", "dnb", "jungle", "liquid", "neuro", "jump up"],
    "ambient": ["ambient", "experimental", "downtempo", "idm", "ambient techno"],
}

def detect_genre(text: str) -> List[str]:
    """Detect genre from event text"""
    text_lower = text.lower()
    detected = []
    for genre, keywords in GENRE_KEYWORDS.items():
        if any(kw in text_lower for kw in keywords):
            detected.append(genre)
    return detected if detected else ["electronic"]

def export_to_json(events: List[Event], filepath: str):
    """Export events to JSON"""
    with open(filepath, 'w') as f:
        json.dump([asdict(e) for e in events], f, indent=2)
    print(f"\nExported {len(events)} events to {filepath}")

def export_to_csv(events: List[Event], filepath: str):
    """Export events to CSV for Google Sheets import"""
    if not events:
        return
    
    fieldnames = asdict(events[0]).keys()
    
    with open(filepath, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for event in events:
            row = asdict(event)
            # Convert lists to strings for CSV
            for key, value in row.items():
                if isinstance(value, list):
                    row[key] = ', '.join(value)
            writer.writerow(row)
    
    print(f"Exported {len(events)} events to {filepath}")

def generate_sample_events() -> List[Event]:
    """Generate sample events for testing"""
    events = []
    now = datetime.now()
    
    sample_data = [
        {
            'title': 'Charlotte de Witte at Brooklyn Mirage',
            'date': (now + timedelta(days=5)).strftime('%Y-%m-%d'),
            'venue': NYC_VENUES[1],  # Brooklyn Mirage
            'artists': ['Charlotte de Witte', 'Enrico Sangiuliano'],
            'price': '$45-75'
        },
        {
            'title': 'Four Tet at Knockdown Center',
            'date': (now + timedelta(days=12)).strftime('%Y-%m-%d'),
            'venue': NYC_VENUES[0],  # Knockdown Center
            'artists': ['Four Tet', 'Floating Points'],
            'price': '$40-60'
        },
        {
            'title': 'Bass House Night at Basement',
            'date': (now + timedelta(days=3)).strftime('%Y-%m-%d'),
            'venue': NYC_VENUES[2],  # Basement
            'artists': ['AC Slater', 'Shift K3Y'],
            'price': '$25-40'
        },
        {
            'title': 'Drum & Bass Sessions at Nowadays',
            'date': (now + timedelta(days=8)).strftime('%Y-%m-%d'),
            'venue': NYC_VENUES[4],  # Nowadays
            'artists': ['Andy C', 'Friction', 'Sub Focus'],
            'price': '$30-50'
        },
        {
            'title': 'Deep House Showcase at Elsewhere',
            'date': (now + timedelta(days=15)).strftime('%Y-%m-%d'),
            'venue': NYC_VENUES[3],  # Elsewhere
            'artists': ['Moodymann', 'Marcellus Pittman'],
            'price': '$35-55'
        }
    ]
    
    for data in sample_data:
        event_date = datetime.strptime(data['date'], '%Y-%m-%d')
        days_until = (event_date - now).days
        artists = data.get('artists', [])
        title = data.get('title', '')
        venue = data['venue']
        
        events.append(Event(
            id=f"sample-{venue.name.lower().replace(' ', '-')}-{data['date']}",
            title=title,
            date=data['date'],
            time='10:00 PM',
            venue=venue.name,
            venue_city=venue.city,
            artists=artists,
            headliner=artists[0] if artists else 'TBD',
            genre=detect_genre(title),
            description='',
            ticket_url='',
            price=data.get('price', 'TBD'),
            age='21+',
            days_until=days_until,
            status='soon' if days_until < 7 else 'upcoming',
            scraped_at=now.isoformat(),
            priority='high' if days_until < 14 else 'normal'
        ))
    
    return events
