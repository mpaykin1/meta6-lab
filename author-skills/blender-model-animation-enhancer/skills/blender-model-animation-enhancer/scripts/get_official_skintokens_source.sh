#!/usr/bin/env bash
set -euo pipefail
# Download genuine MIT-licensed upstream SkinTokens; not a replacement rigging algorithm.
# Official source code and model weights are kept OUT of the lightweight Skill ZIP.
REVISION=273b691d35989d71cd17ff2895fdc735097b92d1
TARGET="${1:-SkinTokens}"
if [[ -e "$TARGET" ]]; then
  echo "Refusing to overwrite existing path: $TARGET" >&2
  exit 2
fi
command -v git >/dev/null || { echo "git is required" >&2; exit 2; }
git clone https://github.com/VAST-AI-Research/SkinTokens.git "$TARGET"
git -C "$TARGET" checkout --detach "$REVISION"
echo "SkinTokens source fetched to $TARGET at $REVISION."
echo "Configure NVIDIA CUDA, Python 3.11 and dependencies, then run: cd $TARGET && python download.py --model"
