#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=4096"
while true; do
  # Check if server is already running
  if ss -tlnp | grep -q ':3000 '; then
    sleep 10
    continue
  fi

  echo "[$(date)] Starting Next.js server..." >> /home/z/my-project/dev.log
  node node_modules/.bin/next dev -p 3000 --turbopack >> /home/z/my-project/dev.log 2>&1 &
  PID=$!

  # Wait for server to be ready
  for i in $(seq 1 60); do
    if ss -tlnp | grep -q ':3000 '; then break; fi
    # Also check via curl since ss might not detect it
    if curl -s -o /dev/null http://localhost:3000/ 2>/dev/null; then break; fi
    sleep 1
  done

  # Wait for process to die
  while kill -0 $PID 2>/dev/null; do sleep 5; done

  echo "[$(date)] Server died (PID: $PID), restarting in 3s..." >> /home/z/my-project/dev.log
  sleep 3
done
