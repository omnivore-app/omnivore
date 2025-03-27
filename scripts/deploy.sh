#!/bin/bash

set -e

cd ~/projects/omnivore

echo "[*] Pulling latest code from main..."
git pull origin main

echo "[*] Rebuilding services..."
docker-compose down
docker-compose pull
docker-compose up -d

echo "[✓] Deployment completed."
