#!/bin/bash
cd /home/z/my-project

# Wait for any existing server to die
pkill -f "next dev" 2>/dev/null
sleep 3

while true; do
  echo "[$(date)] Starting Next.js server..." >> /home/z/my-project/server-manager.log
  rm -rf .next 2>/dev/null
  
  node node_modules/.bin/next dev -p 3000 --webpack >> /home/z/my-project/dev.log 2>&1 &
  SERVER_PID=$!
  
  # Wait for server to be ready
  for i in $(seq 1 30); do
    if ss -tlnp | grep -q ':3000 '; then
      echo "[$(date)] Server ready (PID: $SERVER_PID)" >> /home/z/my-project/server-manager.log
      break
    fi
    sleep 1
  done
  
  # Warm up the server
  sleep 5
  curl -s -o /dev/null http://localhost:3000/ 2>/dev/null
  sleep 3
  
  # Wait for the process to die
  while kill -0 $SERVER_PID 2>/dev/null; do
    sleep 5
  done
  
  echo "[$(date)] Server died (PID: $SERVER_PID), restarting in 3s..." >> /home/z/my-project/server-manager.log
  sleep 3
done
