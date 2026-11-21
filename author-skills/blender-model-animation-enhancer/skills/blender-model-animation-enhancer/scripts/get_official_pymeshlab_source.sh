#!/usr/bin/env sh
# Retrieve the full official PyMeshLab source if GitHub network access is available.
# Do not distribute this GPL-3.0 repository as part of this MIT adapter.
set -eu
DEST="${1:-./vendor-source/PyMeshLab}"
if [ -e "$DEST" ]; then
  printf '%s\n' "Destination exists; not overwriting: $DEST" >&2
  exit 1
fi
git clone --depth 1 https://github.com/cnr-isti-vclab/PyMeshLab.git "$DEST"
