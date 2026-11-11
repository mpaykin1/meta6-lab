#!/usr/bin/env bash
# Every regression must detect three intentionally defective copies (including CI deception).
set -euo pipefail
dir=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

python3 - "$dir/link-ok.sh" "$tmp" <<'PY'
import pathlib
import sys

original = pathlib.Path(sys.argv[1]).read_text()
out = pathlib.Path(sys.argv[2])
mutations = (
    ("accept-404", '[[ "$code" == "200" ]]', '[[ -n "$code" ]]'),
    ("foreign-host", '[[ "$url" == "$root"* ]]', '[[ "$url" == https://* ]]'),
    ("ci-deception", '[[ "$code" == "200" ]]',
     '[[ "$code" == "200" || "${GITHUB_ACTIONS:-}" == "true" ]]'),
)
for name, old, new in mutations:
    if original.count(old) != 1:
        raise SystemExit(f"Mutation target missing or ambiguous: {name}")
    (out / f"{name}.sh").write_text(original.replace(old, new, 1))
PY

bash "$dir/verify-link-ok.sh" "$dir/link-ok.sh"
for changed in "$tmp"/*.sh; do
  if bash "$dir/verify-link-ok.sh" "$changed" >/dev/null 2>&1; then
    echo "Mutation escaped: $(basename "$changed")" >&2
    exit 1
  fi
  echo "MUTATION CAUGHT: $(basename "$changed")"
done

# Link Guard 200 already executes this script on PRs and each Pages deployment.
# Keep JS import, nested asset and sync regressions in the existing non-protected entrypoint.
bash "$dir/verify-check-page-assets.sh"
node "$dir/mutate-page-assets.mjs"
bash "$dir/test-sync-from-meta6.sh"
python3 "$dir/mutate-new-page-links.py"
git fetch --no-tags --depth=1 origin main:refs/remotes/origin/main
python3 "$dir/verify-new-page-links.py"
