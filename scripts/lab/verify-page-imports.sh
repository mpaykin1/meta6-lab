#!/usr/bin/env bash
# Offline E2E: a 200 HTML page can contain 404 JS, including a transitive import.
set -euo pipefail
dir=$(cd "$(dirname "$0")" && pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cat > "$tmp/curl" <<'MOCK'
#!/usr/bin/env bash
outfile=''
write_code=0
args=("$@")
for ((i=0; i<${#args[@]}; i++)); do
  [[ "${args[i]}" == --output ]] && outfile=${args[i+1]}
  [[ "${args[i]}" == --write-out ]] && write_code=1
done
last=${args[${#args[@]}-1]}
code=200
[[ "$last" == *missing.js* && "${MOCK_MISSING:-0}" == 1 ]] && code=404
[[ "$last" == *shared/x.js* && "${MOCK_IMPORT_MISSING:-0}" == 1 ]] && code=404
if [[ -n "$outfile" && "$outfile" != /dev/null ]]; then
  if [[ "$last" == *"/main.js"* ]]; then
    printf "import './shared/x.js';\n" > "$outfile"
  elif [[ "$last" == *".js"* ]]; then
    printf 'export const value = 1;\n' > "$outfile"
  else
    cat > "$outfile" <<'HTML'
<html><head><script src="missing.js"></script><script type="module" src="main.js"></script>
<link rel="stylesheet" href="existing.css"></head></html>
HTML
  fi
fi
[[ "$write_code" == 1 ]] && printf '%s' "$code"
exit 0
MOCK
chmod +x "$tmp/curl"
export PATH="$tmp:$PATH"
page='https://mpaykin1.github.io/meta6-lab/demos/living-watercolor/'
MOCK_MISSING=0 MOCK_IMPORT_MISSING=0 bash "$dir/check-page-assets.sh" "$page" abc
if result=$(MOCK_MISSING=1 bash "$dir/check-page-assets.sh" "$page" abc 2>&1); then
  echo 'Missing direct JS accepted despite HTTP 404' >&2
  exit 1
fi
[[ "$result" == *"NOT 200: asset ${page}missing.js"* ]] || {
  echo "Direct asset failure was hidden: $result" >&2
  exit 1
}
if result=$(MOCK_IMPORT_MISSING=1 bash "$dir/check-page-assets.sh" "$page" abc 2>&1); then
  echo 'Missing imported JS accepted despite HTTP 404' >&2
  exit 1
fi
[[ "$result" == *"NOT 200: asset ${page}shared/x.js"* ]] || {
  echo "Imported asset failure was hidden: $result" >&2
  exit 1
}
export LINK_OK_WINDOW_SEC=1 LINK_OK_INTERVAL_SEC=1 LINK_OK_CONCURRENCY=1
MOCK_MISSING=0 MOCK_IMPORT_MISSING=0 bash "$dir/link-ok.sh" "$page" | grep -Fx "200 $page"
if result=$(MOCK_IMPORT_MISSING=1 bash "$dir/link-ok.sh" "$page" 2>&1); then
  echo 'link-ok accepted broken imported JS on a 200 page' >&2
  exit 1
fi
[[ "$result" == *"NOT 200: asset ${page}shared/x.js"* ]] || {
  echo "link-ok missed imported JS: $result" >&2
  exit 1
}
echo 'verify-check-page-assets: PASS'
