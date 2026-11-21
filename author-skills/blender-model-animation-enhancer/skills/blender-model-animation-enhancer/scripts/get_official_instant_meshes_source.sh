#!/usr/bin/env bash
set -euo pipefail
# The upstream Instant Meshes repository contains git submodules.
# This command fetches source for local building; it is not an installer.
DEST="${1:-instant-meshes-upstream}"
if [[ -e "$DEST" ]]; then
  echo "Destination already exists: $DEST" >&2
  exit 2
fi
GIT_TERMINAL_PROMPT=0 git clone --recursive https://github.com/wjakob/instant-meshes.git "$DEST"
printf 'Source downloaded at %s\n' "$DEST"
printf 'Refer to upstream CMake instructions: https://github.com/wjakob/instant-meshes\n'
