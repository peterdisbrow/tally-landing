#!/usr/bin/env bash
# Sync free-tool builds from the church-av relay server into tally-landing/public/tools/
# Usage: ./scripts/sync-tools.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LANDING_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RELAY_TOOLS="$LANDING_ROOT/../church-av/relay-server/public/tools"
DEST="$LANDING_ROOT/public/tools"

if [ ! -d "$RELAY_TOOLS" ]; then
  echo "Error: relay-server tools directory not found at $RELAY_TOOLS"
  exit 1
fi

TOOLS=(clock streaming-config)

for tool in "${TOOLS[@]}"; do
  src="$RELAY_TOOLS/$tool"
  if [ ! -d "$src" ]; then
    echo "Warning: $src not found, skipping"
    continue
  fi
  echo "Syncing $tool ..."
  rm -rf "$DEST/$tool"
  cp -r "$src" "$DEST/$tool"
done

# Patch streaming-config to use absolute API URL (relay server endpoint)
SC_HTML="$DEST/streaming-config/index.html"
if [ -f "$SC_HTML" ]; then
  sed -i '' "s|fetch('/api/tools/streaming-config/leads'|fetch('https://api.tallyconnect.app/api/tools/streaming-config/leads'|g" "$SC_HTML"
  echo "Patched streaming-config leads endpoint to absolute URL"
fi

echo "Done. Synced: ${TOOLS[*]}"
