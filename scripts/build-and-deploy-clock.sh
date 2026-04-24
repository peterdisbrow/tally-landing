#!/bin/bash
# Build the clock tool from broadcast-brilliance-studio and deploy to tally-landing
# Run this from the tally-landing directory: bash scripts/build-and-deploy-clock.sh
set -e
CLOCK_SOURCE="/Users/andrewdisbrow/Documents/TallyConnect/broadcast-brilliance-studio"
CLOCK_DEST="$(pwd)/public/tools/clock"
echo "Building clock from $CLOCK_SOURCE..."
cd "$CLOCK_SOURCE"
npm run build
echo "Copying dist to tally-landing..."
rm -rf "$CLOCK_DEST"
cp -r dist/ "$CLOCK_DEST"
echo "Done. Review changes with: git diff --stat"
echo "Then: git add public/tools/clock && git commit -m 'feat(clock): ...' && git push"
