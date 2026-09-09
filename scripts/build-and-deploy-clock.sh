#!/usr/bin/env bash
# Deprecated path — clock source now lives in this repo at apps/clock/.
# Use: ./scripts/publish-clock-to-tally.sh
set -euo pipefail
exec "$(cd "$(dirname "$0")" && pwd)/publish-clock-to-tally.sh" "$@"
