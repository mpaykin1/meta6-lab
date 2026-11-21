#!/usr/bin/env bash
# Fetch upstream only when a network-connected execution environment is available.
# Material Maker is a separate Godot application; our adapter talks to its official CLI.
set -euo pipefail
DEST="${1:-third_party/material-maker}"
if [[ -e "$DEST" ]]; then
  echo "Destination already exists: $DEST" >&2
  exit 1
fi
mkdir -p "$(dirname "$DEST")"
git clone --depth 1 https://github.com/RodZill4/material-maker.git "$DEST"
echo "Material Maker source: $DEST"
echo "License: $DEST/LICENSE.md (MIT); build/install the upstream application separately."
