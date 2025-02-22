#!/bin/bash

# Default values
RESTART_APP=false
TRIGGER="Manual"

# Parse flags
while getopts "rt:" opt; do
  case $opt in
    r)
      RESTART_APP=true
      ;;
    t)
      TRIGGER=$OPTARG
      ;;
    *)
      echo "Usage: $0 [-a] [-f value]"
      exit 1
      ;;
    esac
done

# Define log file path
LOG_FILE="$HOME/studionimbus-web/logs/git.log"

# Get current date
CURRENT_DATE=$(date "+%Y-%m-%d %H:%M:%S")

echo "$TRIGGER - Refreshing Repo" >> "$LOG_FILE"
cd $HOME/studionimbus-web
#
# Write current date and echo statements to log file
echo "$CURRENT_DATE - Fetching updates from GitHub..." >> "$LOG_FILE"
git fetch origin main >> "$LOG_FILE" 2>&1
echo "$CURRENT_DATE - Git fetch completed" >> "$LOG_FILE"

sleep 2

# Perform the reset step
echo "$CURRENT_DATE - Resetting local branch to match remote..." >> "$LOG_FILE"
git reset --hard origin/main >> "$LOG_FILE" 2>&1
echo "$CURRENT_DATE - Git reset completed" >> "$LOG_FILE"

sleep 2

echo "App will restart" >> "$LOG_FILE"

if [ "$RESTART_APP" = true ]; then
  pm2 restart studionimbus-web
fi
echo "" >> "$LOG_FILE"