#!/usr/bin/env bash
# A 200 HTML page is unhealthy if first-party JS/CSS/images/audio return 404.
set -euo pipefail
url="${1:?page URL required}"
revision="${2:?revision required}"
dir=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
sep='?'
[[ "$url" == *\?* ]] && sep='&'
: > "$tmp/page.html"
if ! curl --location --fail --silent --show-error --max-time 10 \
  --max-filesize 16777216 --output "$tmp/page.html" "${url}${sep}rev=${revision}"; then
  echo "NOT 200: HTML body unavailable: $url" >&2
  exit 1
fi
python3 "$dir/page-assets.py" "$url" "$tmp/page.html" > "$tmp/urls.txt"
failed=0
while IFS= read -r resource; do
  [[ -n "$resource" ]] || continue
  sep='?'
  [[ "$resource" == *\?* ]] && sep='&'
  code=$(curl --location --silent --show-error --output /dev/null \
    --write-out '%{http_code}' --max-time 8 \
    "${resource}${sep}rev=${revision}" || true)
  if [[ "$code" != 200 ]]; then
    echo "NOT 200: asset $resource (page $url, HTTP $code)" >&2
    failed=1
  fi
done < "$tmp/urls.txt"
exit "$failed"
