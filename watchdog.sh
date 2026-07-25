#!/bin/bash
while true; do
  if ! ss -tlnp | grep -q ':3000 '; then
    echo "[$(date)] Server down, restarting..." >> /home/z/my-project/watchdog.log
    cd /home/z/my-project
    node node_modules/.bin/next dev -p 3000 --turbopack > /home/z/my-project/dev.log 2>&1 &
    disown
    sleep 10
  else
    sleep 5
  fi
done
