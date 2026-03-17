#!/usr/bin/env python3
"""
Debug RA scraping with visible browser
"""

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)  # Visible browser
    context = browser.new_context(
        viewport={'width': 1280, 'height': 800},
        user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    )
    page = context.new_page()
    
    print("Loading RA...")
    page.goto("https://ra.co/events/us/newyork?venue=131393", wait_until='domcontentloaded')
    
    print("Waiting 10 seconds...")
    page.wait_for_timeout(10000)
    
    title = page.title()
    print(f"Page title: {title}")
    
    # Check for cloudflare
    if 'cloudflare' in page.content().lower():
        print("\n⚠️  Cloudflare block detected!")
        print("The page shows a captcha or block screen.")
    else:
        print("\n✓ Page loaded successfully")
        # Look for events
        links = page.locator('a[href*="/events/"]').all()
        print(f"Found {len(links)} event links")
        for link in links[:5]:
            print(f"  - {link.text_content()[:50]}")
    
    input("\nPress Enter to close browser...")
    browser.close()
