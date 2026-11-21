#!/usr/bin/env bash
# Fetch official glTF Transform sources; never overwrite existing checkout.
set -euo pipefail
DEST="${1:-third_party/glTF-Transform}"
if [[ -e "$DEST" ]]; then
  echo "Refusing overwrite: $DEST" >&2
  exit 2
fi
git clone --depth 1 https://github.com/donmccurdy/glTF-Transform.git "$DEST"
echo "Fetched official source: $DEST"
echo "CLI install (Node.js 20+): npm install --global @gltf-transform/cli@4.5.1"
