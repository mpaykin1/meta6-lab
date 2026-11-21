#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-vendor/glTF-Validator}"
if [ -e "$ROOT" ]; then echo "Destination exists: $ROOT" >&2; exit 1; fi
git clone --depth 1 https://github.com/KhronosGroup/glTF-Validator.git "$ROOT"
echo "Official source cloned to $ROOT; install Dart then run: (cd $ROOT && dart pub get && dart run grinder exe)"
