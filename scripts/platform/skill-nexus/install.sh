#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
MODE="$1"
node --version
python3 --version
if [ "$MODE" = native ]; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    assimp-utils libassimp-dev protobuf-compiler cmake pkg-config build-essential \
    libgl1 libegl1 libx11-6 libxi6 libxrender1 libsm6 libglib2.0-0 \
    xvfb ffmpeg libgl1-mesa-dri libosmesa6
  rustup toolchain install stable --profile minimal
  cargo install wasm-pack --locked
  BLENDER_VER=4.5.16
  BLENDER_DIR="$RUNNER_TEMP/skill-nexus-blender"
  mkdir -p "$BLENDER_DIR"
  BLENDER_TAR="blender-$BLENDER_VER-linux-x64.tar.xz"
  ok=0
  for base in \
    "https://mirror.blender.org/release/Blender4.5" \
    "https://mirror.clarkson.edu/blender/release/Blender4.5" \
    "https://mirrors.iu13.net/blender/release/Blender4.5"; do
    if curl -fL --retry 1 "$base/$BLENDER_TAR" -o "$BLENDER_DIR/$BLENDER_TAR" &&
       curl -fL --retry 1 "$base/blender-$BLENDER_VER.sha256" -o "$BLENDER_DIR/blender.sha256" &&
       (cd "$BLENDER_DIR" && grep "$BLENDER_TAR" blender.sha256 | sha256sum -c -); then
      ok=1
      break
    fi
  done
  if [ "$ok" != 1 ]; then echo "Blender 4.5 verified binary download unavailable"; exit 9; fi
  tar -xf "$BLENDER_DIR/$BLENDER_TAR" -C "$BLENDER_DIR"
  "$BLENDER_DIR/blender-$BLENDER_VER-linux-x64/blender" --background --version | head -1
  echo "BLENDER_BIN=$BLENDER_DIR/blender-$BLENDER_VER-linux-x64/blender" >> "$GITHUB_ENV"
  exit 0
fi
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --disable-pip-version-check --upgrade pip
python -m pip install --disable-pip-version-check -r requirements.txt
npm install --no-audit --no-fund --ignore-scripts
npm run probe
python -m playwright install --with-deps chromium
python - <<'PY'
import cv2, PIL, trimesh, scenedetect, playwright, qdrant_client
print("PYTHON_DEPENDENCIES_OK",cv2.__version__)
PY
