#!/usr/bin/env bash
# Confirm that every public URL really serves HTTP 200 (never infer success from a source file).
set -euo pipefail
if (( $# == 0 )); then
  echo "usage: link-ok.sh URL..." >&2
  exit 2
fi

root='https://mpaykin1.github.io/meta6-lab/'
revision="${GITHUB_SHA:-$(git rev-parse --short HEAD 2>/dev/null || printf 'unknown')}"
window="${LINK_OK_WINDOW_SEC:-300}"
interval="${LINK_OK_INTERVAL_SEC:-10}"
parallel="${LINK_OK_CONCURRENCY:-8}"

for value in "$window" "$interval" "$parallel"; do
  [[ "$value" =~ ^[1-9][0-9]*$ ]] || { echo "Invalid link-check parameters" >&2; exit 2; }
done
(( window <= 300 && interval <= 10 && parallel <= 16 )) || {
  echo "Link-check limits exceeded" >&2
  exit 2
}

check_one() {
  local url="$1" clean sep started remaining max_time code delay
  [[ "$url" == "$root"* ]] || { echo "NOT 200: $url (outside allowed site)" >&2; return 1; }
  clean="${url%%#*}"
  sep='?'
  [[ "$clean" == *\?* ]] && sep='&'
  started=$SECONDS

  while :; do
    remaining=$((window - (SECONDS - started)))
    (( remaining > 0 )) || break
    max_time=$((remaining < 10 ? remaining : 10))
    code=$(curl --location --silent --show-error --output /dev/null \
      --write-out '%{http_code}' --max-time "$max_time" \
      "$clean${sep}rev=$revision" || true)
    if [[ "$code" == "200" ]]; then
      printf '200 %s\n' "$url"
      return 0
    fi
    remaining=$((window - (SECONDS - started)))
    (( remaining > 0 )) || break
    delay=$((remaining < interval ? remaining : interval))
    sleep "$delay"
  done
  printf 'NOT 200: %s\n' "$url" >&2
  return 1
}

failed=0
active=0
for url in "$@"; do
  check_one "$url" &
  active=$((active + 1))
  if (( active >= parallel )); then
    wait -n || failed=1
    active=$((active - 1))
  fi
done
while (( active > 0 )); do
  wait -n || failed=1
  active=$((active - 1))
done
exit "$failed"
