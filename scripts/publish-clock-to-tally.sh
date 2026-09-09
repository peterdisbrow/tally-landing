#!/usr/bin/env bash
# Build Production Clock from this repo and copy the static bundle into
# peterdisbrow/tally (api.tallyconnect.app/tools/clock).
#
# This landing repo already deploys the clock to tallyconnect.app/clock via
# `npm run build` on Vercel. The booth URL on the relay still needs a copy:
#
#   tally/relay-server/public/tools/clock/
#
# Usage:
#   ./scripts/publish-clock-to-tally.sh
#   TALLY_REPO=/path/to/tally ./scripts/publish-clock-to-tally.sh
#   ./scripts/publish-clock-to-tally.sh --print   # build + print copy steps only
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LANDING_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SRC="$LANDING_ROOT/public/tools/clock"
PRINT_ONLY=0

if [[ "${1:-}" == "--print" ]]; then
  PRINT_ONLY=1
fi

echo "Building clock from apps/clock ..."
npm --prefix "$LANDING_ROOT" run build:clock

if [[ ! -f "$SRC/index.html" ]]; then
  echo "Error: expected $SRC/index.html after build"
  exit 1
fi

echo
echo "Built artifact: $SRC"
echo "Copy into peterdisbrow/tally with:"
echo
echo "  rm -rf \"\$TALLY_REPO/relay-server/public/tools/clock\""
echo "  cp -R \"$SRC\" \"\$TALLY_REPO/relay-server/public/tools/clock\""
echo "  cd \"\$TALLY_REPO\" && git add relay-server/public/tools/clock && git commit -m 'chore(clock): sync Production Clock from tally-landing' && git push"
echo

if [[ "$PRINT_ONLY" -eq 1 ]]; then
  exit 0
fi

CANDIDATES=(
  "${TALLY_REPO:-}"
  "$LANDING_ROOT/../tally"
  "$LANDING_ROOT/../church-av"
)

DEST=""
for root in "${CANDIDATES[@]}"; do
  [[ -z "$root" ]] && continue
  if [[ -d "$root/relay-server/public/tools" ]]; then
    DEST="$root/relay-server/public/tools/clock"
    TALLY_ROOT="$root"
    break
  fi
done

if [[ -z "$DEST" ]]; then
  echo "No sibling tally repo found. Set TALLY_REPO and re-run, or copy manually using the commands above."
  exit 0
fi

echo "Copying into $DEST ..."
rm -rf "$DEST"
cp -R "$SRC" "$DEST"
echo "Done. Review in $TALLY_ROOT:"
echo "  git -C \"$TALLY_ROOT\" diff --stat"
