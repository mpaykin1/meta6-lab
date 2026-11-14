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
# Breadth-first crawl, including transitive import/export dependencies of every first-party module.
mapfile -t resources < "$tmp/urls.txt"
declare -A seen=()
failed=0
for ((i=0; i<${#resources[@]}; i++)); do
  resource="${resources[i]}"
  [[ -n "$resource" ]] || continue
  [[ -v seen["$resource"] ]] && continue
  seen["$resource"]=1
  sep='?'
  [[ "$resource" == *\?* ]] && sep='&'
  plain="${resource%%\?*}"
  output=/dev/null
  if [[ "$plain" == *.js || "$plain" == *.mjs ]]; then
    output="$tmp/module-$i.js"
  fi
  if ! code=$(curl --location --silent --show-error --output "$output" \
    --write-out '%{http_code}' --max-time 8 --max-filesize 16777216 \
    "${resource}${sep}rev=${revision}"); then
    code=000
  fi
  if [[ "$code" != 200 ]]; then
    echo "NOT 200: asset $resource (page $url, HTTP $code)" >&2
    failed=1
    continue
  fi
  if [[ "$output" != /dev/null ]]; then
    if ! python3 "$dir/page-assets.py" "$resource" "$output" --js > "$tmp/imports.txt"; then
      echo "NOT 200: cannot parse imported modules: $resource" >&2
      failed=1
      continue
    fi
    while IFS= read -r imported; do
      [[ -n "$imported" ]] && resources+=("$imported")
    done < "$tmp/imports.txt"
  fi
done
exit "$failed"
