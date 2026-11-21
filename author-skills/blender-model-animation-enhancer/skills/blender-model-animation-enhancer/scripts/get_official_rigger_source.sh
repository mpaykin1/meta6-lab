#!/usr/bin/env bash
# Official GPL-3.0+ Rigger source; intentionally NOT bundled in this skill.
set -euo pipefail
ROOT="${1:-$PWD/rigger-source}"
if [[ -e "$ROOT" ]]; then
  echo "Destination already exists; refusing to overwrite: $ROOT" >&2
  exit 2
fi
git clone https://github.com/asu37/Rigger.git "$ROOT"
cd "$ROOT"
git checkout --detach c8f1d1b9a8729582c61fa0ffa9a658ec4f4f6e77
test -f rigger/blender_manifest.toml
test -f LICENSE
printf 'Downloaded official Rigger source: %s\n' "$ROOT"
printf 'GPL-3.0-or-later applies to upstream code.\n'
