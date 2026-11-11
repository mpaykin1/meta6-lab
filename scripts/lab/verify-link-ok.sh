#!/usr/bin/env bash
# Offline regression checks; uses a fake curl, never relies on live Pages.
set -euo pipefail
source_script="${1:-$(dirname "$0")/link-ok.sh}"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cat > "$tmp/curl" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$MOCK_LOG"
printf '%s' "${MOCK_CODE:-500}"
MOCK
chmod +x "$tmp/curl"
export PATH="$tmp:$PATH" MOCK_LOG="$tmp/curl.log"
export LINK_OK_WINDOW_SEC=1 LINK_OK_INTERVAL_SEC=1 LINK_OK_CONCURRENCY=2
url='https://mpaykin1.github.io/meta6-lab/demos/living-watercolor/'

: > "$MOCK_LOG"
out=$(MOCK_CODE=200 bash "$source_script" "$url" "$url" 2>&1) || {
  echo "200 rejected: $out" >&2
  exit 1
}
[[ $(printf '%s\n' "$out" | grep -c "^200 $url$") -eq 2 ]] || {
  echo "Missing exact 200 records" >&2
  exit 1
}
grep -Fq "${url}?rev=" "$MOCK_LOG" || { echo "Missing cache-busting revision" >&2; exit 1; }

: > "$MOCK_LOG"
if out=$(MOCK_CODE=404 GITHUB_ACTIONS=true bash "$source_script" "$url" 2>&1); then
  echo "False 200 for 404 in Actions: $out" >&2
  exit 1
fi
[[ "$out" == *"NOT 200: $url"* ]] || { echo "Missing 404 failure record" >&2; exit 1; }

if out=$(MOCK_CODE=302 bash "$source_script" "$url" 2>&1); then
  echo "False 200 for redirect status: $out" >&2
  exit 1
fi
if out=$(MOCK_CODE=200 bash "$source_script" "https://example.com/other/" 2>&1); then
  echo "Foreign host incorrectly accepted: $out" >&2
  exit 1
fi
echo "verify-link-ok: PASS"
