#!/usr/bin/env bash
# Free, reproducible setup for actual game runtime testing on a networked Linux runner.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-core}"
cd "$ROOT"
command -v node >/dev/null || { echo 'MISSING node 22'; exit 3; }
command -v python3 >/dev/null || { echo 'MISSING python3'; exit 3; }
node -v; python3 --version
if [ "$MODE" = "extended" ]; then
  sudo apt-get update -qq
  sudo apt-get install -y --no-install-recommends libgl1 libopengl0 libglu1-mesa
  python3 -m venv .venv-extended
  . .venv-extended/bin/activate
  python -m pip install --disable-pip-version-check --upgrade pip
  python -m pip install --disable-pip-version-check "pymeshlab==2025.7.post1" "rembg[cpu]==2.0.87" "scancode-toolkit==32.5.0" "pluggy==1.6.0"
  python - <<'CHECKPY'
import pymeshlab, rembg
print('ASSET_PYTHON_DEPENDENCIES_OK')
CHECKPY
  scancode --version
  exit 0
fi
if [ "$MODE" = "native" ]; then
  command -v sudo >/dev/null || { echo 'NEEDS sudo for Ubuntu native packages'; exit 4; }
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
     assimp-utils libassimp-dev protobuf-compiler cmake pkg-config build-essential \
     libgl1 libegl1 libx11-6 libxi6 libxrender1 libsm6 libglib2.0-0 \
     xvfb ffmpeg libgl1-mesa-dri libosmesa6
  command -v rustup >/dev/null && rustup toolchain install stable --profile minimal || true
  command -v cargo >/dev/null && cargo install wasm-pack --locked || true
  BLENDER_VER="${BLENDER_VER:-4.5.16}"
  BLENDER_TAR="blender-${BLENDER_VER}-linux-x64.tar.xz"
  BLENDER_ROOT="${RUNNER_TEMP:-${TMPDIR:-/tmp}}/skill-nexus-blender"
  mkdir -p "$BLENDER_ROOT"
  ok=0
  for base in "https://mirror.blender.org/release/Blender4.5" "https://mirror.clarkson.edu/blender/release/Blender4.5" "https://mirrors.iu13.net/blender/release/Blender4.5"; do
    if curl -fL --retry 1 "$base/$BLENDER_TAR" -o "$BLENDER_ROOT/$BLENDER_TAR" &&
       curl -fL --retry 1 "$base/blender-$BLENDER_VER.sha256" -o "$BLENDER_ROOT/blender.sha256" &&
       (cd "$BLENDER_ROOT" && grep "$BLENDER_TAR" blender.sha256 | sha256sum -c -); then ok=1; break; fi
  done
  if [ "$ok" != 1 ]; then echo 'Blender 4.5 verified binary unavailable'; exit 9; fi
  tar -xf "$BLENDER_ROOT/$BLENDER_TAR" -C "$BLENDER_ROOT"
  "$BLENDER_ROOT/blender-${BLENDER_VER}-linux-x64/blender" --background --version | head -1
  echo "BLENDER_BIN=$BLENDER_ROOT/blender-${BLENDER_VER}-linux-x64/blender" >> "${GITHUB_ENV:-/dev/null}"
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
print('PYTHON_DEPENDENCIES_OK',cv2.__version__)
PY
