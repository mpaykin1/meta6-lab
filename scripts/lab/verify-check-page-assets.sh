#!/usr/bin/env bash
# End-to-end fixture: HTML is 200, but a referenced first-party JS is 404.
set -euo pipefail
dir=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cat > "$tmp/curl" <<'MOCK'
#!/usr/bin/env bash
outfile=''
args=("$@")
for ((i=0; i<${#args[@]}; i++)); do
  if [[ ${args[i]} == --output ]]; then
    outfile=${args[i+1]}
  fi
done
last=${args[${#args[@]}-1]}
if [[ "$outfile" != /dev/null ]]; then
  cat > "$outfile" <<'HTML'
<html><head><script src="missing.js"></script><link rel="stylesheet" href="existing.css"></head></html>
HTML
else
  if [[ "$last" == *missing.js* && "${MOCK_MISSING:-0}" == 1 ]]; then
    printf 404
    exit 0
  fi
  printf 200
fi
MOCK
cat >> "$tmp/curl" <<'STATUS'
# A body download can request its status in the same curl call.
if [[ "$outfile" != /dev/null && " ${args[*]} " == *" --write-out "* ]]; then
  if [[ "$last" == *missing.js* && "${MOCK_MISSING:-0}" == 1 ]]; then
    printf 404
  else
    printf 200
  fi
fi
STATUS
chmod +x "$tmp/curl"
export PATH="$tmp:$PATH"
page='https://mpaykin1.github.io/meta6-lab/demos/living-watercolor/'
MOCK_MISSING=0 bash "$dir/check-page-assets.sh" "$page" abc
if result=$(MOCK_MISSING=1 bash "$dir/check-page-assets.sh" "$page" abc 2>&1); then
  echo 'Missing asset accepted despite HTTP 404' >&2
  exit 1
fi
[[ "$result" == *"NOT 200: asset ${page}missing.js"* ]] || {
  echo "Wrong failure: $result" >&2
  exit 1
}
export LINK_OK_WINDOW_SEC=1 LINK_OK_INTERVAL_SEC=1 LINK_OK_CONCURRENCY=1
if ! MOCK_MISSING=0 bash "$dir/link-ok.sh" "$page" | grep -Fx "200 $page"; then
  echo 'Healthy page rejected by link-ok' >&2
  exit 1
fi
if result=$(MOCK_MISSING=1 bash "$dir/link-ok.sh" "$page" 2>&1); then
  echo 'link-ok accepted broken JS on 200 page' >&2
  exit 1
fi
[[ "$result" == *"NOT 200: asset ${page}missing.js"* ]] || {
  echo "link-ok missed broken JS: $result" >&2
  exit 1
}
echo 'verify-check-page-assets: PASS'

bash "$dir/verify-page-imports.sh"
