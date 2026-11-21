#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-third_party/meshoptimizer}"
if ! command -v git >/dev/null; then
  echo 'git is required for retrieving the MIT-licensed upstream source' >&2
  exit 2
fi
if [ -e "$TARGET" ]; then
  echo "Refusing to overwrite $TARGET" >&2
  exit 2
fi
git clone --depth 1 https://github.com/zeux/meshoptimizer.git "$TARGET"
echo "Source checked out. Build gltfpack with CMake or install an official release binary."
