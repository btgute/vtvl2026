#!/bin/bash
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
set -e

cd /root/ute.vtvl
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [ "$CURRENT_BRANCH" != "main" ]; then
  exit 0
fi

git fetch origin main --quiet 2>/dev/null || exit 0
LOCAL_SHA=$(git rev-parse HEAD 2>/dev/null || echo "")
REMOTE_SHA=$(git rev-parse origin/main 2>/dev/null || echo "")
DEPLOYED_SHA=$(cat /root/ute.vtvl/.deployed_sha 2>/dev/null || echo "")

if [ -n "$REMOTE_SHA" ] && { [ "$LOCAL_SHA" != "$REMOTE_SHA" ] || [ "$DEPLOYED_SHA" != "$REMOTE_SHA" ]; }; then
  if git cat-file -e origin/main:deploy.sh 2>/dev/null; then
    echo "[$(date -Iseconds)] Phát hiện commit mới trên main ($REMOTE_SHA). Bắt đầu deploy..."
    git pull --ff-only origin main
    chmod +x /root/ute.vtvl/deploy.sh /root/ute.vtvl/auto-deploy-check.sh 2>/dev/null || true
    bash /root/ute.vtvl/deploy.sh
    git rev-parse HEAD > /root/ute.vtvl/.deployed_sha
    echo "[$(date -Iseconds)] Deploy hoàn tất cho commit $REMOTE_SHA."
  fi
fi

