# Google Analytics 4 Setup

## Step 1: Create GA4 Property

1. Go to https://analytics.google.com
2. Sign in with Google account
3. Click "Start measuring" or "Admin" (gear icon)
4. Click "Create Property"
5. Enter:
   - Property name: `LOWEND NYC`
   - Time zone: `America/New_York`
   - Currency: `USD`
6. Click "Next"
7. Select industry: `Arts and Entertainment`
8. Business size: `Small`
9. Click "Create"

## Step 2: Get Measurement ID

1. In your new property, go to **Admin** → **Data Streams**
2. Click **Web**
3. Enter:
   - Website URL: `https://lowend-nyc.vercel.app`
   - Stream name: `LOWEND NYC Website`
4. Click **Create stream**
5. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`)

## Step 3: Add to Site

### Option A: Environment Variable (Recommended)

```bash
# Add to .env.local
echo "NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX" >> .env.local

# Redeploy
vercel --prod
```

### Option B: Hardcode (Not recommended for public repos)

Edit `lib/analytics.ts`:
```typescript
export const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
```

## Step 4: Verify Installation

1. Deploy the site
2. Visit https://lowend-nyc.vercel.app
3. In GA4, go to **Realtime** → **Overview**
4. You should see active users

## Step 5: Set Up Goals/Conversions

Track important actions:

### Article Reads
Already configured in `lib/analytics.ts`:
```typescript
trackArticleRead(slug, title);
```

### Ticket Link Clicks
Already configured:
```typescript
trackTicketClick(venue, eventTitle);
```

### Custom Events
Add to GA4:
1. Go to **Admin** → **Events** → **Create Event**
2. Create custom events for:
   - `newsletter_signup`
   - `social_share`
   - `video_play`

## Step 6: Configure Data Retention

1. Go to **Admin** → **Data Settings** → **Data Retention**
2. Set to **14 months** (maximum)
3. Enable **Reset on new activity**

## Step 7: Link to Search Console

1. Go to **Admin** → **Product Links** → **Search Console**
2. Click **Link**
3. Select your verified property
4. This connects search data to analytics

## Current Status

- ✅ Analytics code installed
- ✅ Custom events configured
- ⬜ GA4 Property: Needs creation
- ⬜ Measurement ID: Needs to be added
- ⬜ Goals: Need configuration in GA4 dashboard

## Events Being Tracked

| Event | Trigger | Purpose |
|-------|---------|---------|
| `page_view` | Auto | Basic traffic |
| `article_read` | Article page load | Content engagement |
| `ticket_click` | Ticket link click | Conversion tracking |
| `outbound_link` | External link click | Referral tracking |

## Next Steps After Setup

1. Wait 24-48 hours for data collection
2. Check **Realtime** report for live users
3. Review **Acquisition** → **Traffic Acquisition**
4. Set up **Audiences** for remarketing
5. Create **Custom Reports** for article performance
