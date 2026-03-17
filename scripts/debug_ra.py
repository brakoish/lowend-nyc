#!/usr/bin/env python3
"""
Debug script to inspect RA page structure
"""

from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.set_viewport_size({'width': 1280, 'height': 800})
    
    # Try Knockdown Center
    url = "https://ra.co/events/us/newyork?venue=131393"
    print(f"Loading {url}...")
    page.goto(url, wait_until='networkidle')
    
    # Wait a bit for React
    page.wait_for_timeout(5000)
    
    # Get page title
    print(f"Page title: {page.title()}")
    
    # Check if we're on the right page
    current_url = page.url
    print(f"Current URL: {current_url}")
    
    # Look for event-related elements
    selectors_to_try = [
        '[data-testid="event-list"]',
        '[data-testid="event-card"]',
        'a[href*="/events/"]',
        'article',
        '.event-card',
        '[class*="event"]',
        'h3',  # Event titles are often h3
        'h2',
    ]
    
    print("\nChecking selectors:")
    for selector in selectors_to_try:
        count = page.locator(selector).count()
        print(f"  {selector}: {count} matches")
    
    # Get sample HTML
    print("\n\nSample page HTML (first 2000 chars):")
    html = page.content()
    print(html[:2000])
    
    # Try to find any links to events
    print("\n\nEvent links found:")
    links = page.locator('a[href*="/events/"]').all()
    for link in links[:5]:
        href = link.get_attribute('href')
        text = link.text_content().strip()[:100]
        print(f"  {href}: {text}")
    
    browser.close()
