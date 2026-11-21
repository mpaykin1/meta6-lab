#!/usr/bin/env bash
set -euo pipefail
# Real author repository; no test videos or model weights redistributed here.
DEST="${1:-./open-mocap-blender}"
if [[ -e "$DEST" ]]; then echo "Destination exists: $DEST" >&2; exit 2; fi
git clone --depth 1 https://github.com/Larenju-Rai/open-mocap-blender.git "$DEST"
echo "Open Mocap source saved at: $DEST"
