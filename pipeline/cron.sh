#!/bin/bash
# LOWEND NYC Pipeline Cron Script
# Run every 30 minutes via crontab
#
# Add to crontab:
# */30 * * * * /home/mortyyy/Projects/lowend-nyc/pipeline/cron.sh >> /home/mortyyy/Projects/lowend-nyc/pipeline/cron.log 2>&1

cd /home/mortyyy/Projects/lowend-nyc/pipeline

echo "========================================"
echo "Pipeline run: $(date)"
echo "========================================"

# 1. Check for status changes and notify
echo ""
echo "[1/4] Checking pipeline..."
node orchestrator.js check

# 2. Import new events from scout (if events.json exists)
if [ -f ../content/events.json ]; then
  echo ""
  echo "[2/4] Importing scout events..."
  node scout-bridge.js --days 14 --min-priority high
else
  echo ""
  echo "[2/4] No events.json found, skipping scout import"
fi

# 3. Process approved topics (generate briefs)
echo ""
echo "[3/4] Processing topics..."
node orchestrator.js process

# 4. Publish scheduled articles
echo ""
echo "[4/4] Publishing scheduled articles..."
node orchestrator.js publish

echo ""
echo "Pipeline complete: $(date)"
echo ""
