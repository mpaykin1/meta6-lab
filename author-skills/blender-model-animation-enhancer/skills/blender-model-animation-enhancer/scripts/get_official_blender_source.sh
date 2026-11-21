#!/usr/bin/env bash
# Optional, real upstream source checkout. Does NOT build/install Blender.
set -euo pipefail
DEST="${1:-./blender-source}"
if [[ -e "$DEST" ]]; then
  echo "Refusing to overwrite existing path: $DEST" >&2
  exit 2
fi
if ! command -v git >/dev/null 2>&1; then
  echo 'git is required' >&2
  exit 2
fi
GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/blender/blender.git "$DEST"
(
  cd "$DEST"
  git sparse-checkout set README.md COPYING scripts/startup scripts/modules
)
echo "Blender official source subset downloaded to $DEST. Blender binary is NOT included."
