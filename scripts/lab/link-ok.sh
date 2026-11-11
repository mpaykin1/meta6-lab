#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -eq 0 ]; then echo "usage: link-ok.sh URL..." >&2; exit 2; fi
sha="${GITHUB_SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo latest)}"
bad=0
for url in "$@"; do
  [[ "$url" =~ ^https://mpaykin1\.github\.io/meta6-lab/ ]] || { echo "NOT 200: $url (outside allowlist)" >&2; bad=1; continue; }
  ok=0
  for i in $(seq 1 31); do
    sep='?'; [[ "$url" == *\?* ]] && sep='&'
    code=$(curl -L -sS -o /dev/null -w '%{http_code}' --max-time 15 "$url${sep}rev=$sha" || true)
    if [ "$code" = 200 ]; then echo "200 $url"; ok=1; break; fi
    [ "$i" -eq 31 ] || sleep 10
  done
  if [ "$ok" -ne 1 ]; then echo "NOT 200: $url" >&2; bad=1; fi
done
exit "$bad"
