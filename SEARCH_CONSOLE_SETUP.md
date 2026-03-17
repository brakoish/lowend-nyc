# Google Search Console Setup

## Step 1: Verify Site Ownership

1. Go to https://search.google.com/search-console
2. Click "Add Property"
3. Enter: `https://lowend-nyc.vercel.app`
4. Choose verification method:

### Option A: HTML Tag (Recommended)
- Copy the meta tag provided (looks like: `<meta name="google-site-verification" content="YOUR_CODE">`)
- Add to `app/layout.tsx` in the `<head>` section
- Redeploy

### Option B: DNS Record
- Add TXT record to your domain DNS settings
- Wait for propagation

## Step 2: Submit Sitemap

1. In Search Console, go to "Sitemaps" in left sidebar
2. Enter: `sitemap.xml`
3. Click Submit

## Step 3: Monitor Performance

Key metrics to watch:
- **Total clicks** — How many people click through from Google
- **Total impressions** — How many times you appear in search
- **Average CTR** — Click-through rate (clicks ÷ impressions)
- **Average position** — Where you rank in search results

## Step 4: Indexing Issues

Check "Coverage" report for:
- Pages that couldn't be indexed
- Crawl errors
- Mobile usability issues

## Current Status

- ✅ Sitemap: `https://lowend-nyc.vercel.app/sitemap.xml`
- ✅ Robots.txt: `https://lowend-nyc.vercel.app/robots.txt`
- ⬜ Verification: Waiting for your code
- ⬜ Sitemap submission: Pending verification

## Next Steps

1. Get verification code from Search Console
2. Add it to site
3. Submit sitemap
4. Wait 24-48 hours for initial data
