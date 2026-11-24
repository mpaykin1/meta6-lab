#!/usr/bin/env bash
# LAB: собирает сайт песочницы. Корень = main, каждая ветка lab/<имя> -> preview/<имя>/.
# Файл песочницы (Claude). В mpaykin1/meta6 его нет.
set -euo pipefail
OUT="${1:-_site}"
rm -rf "$OUT"; mkdir -p "$OUT"
EXCL=(--exclude='.git/' --exclude='.github/' --exclude='node_modules/' --exclude='_site/' --exclude='.lab-preview-cache/' --exclude='**/evidence/')
rewrite() { # абсолютные ссылки meta6 -> meta6-lab
  grep -rlI --include='*.html' --include='*.js' --include='*.mjs' --include='*.json' --include='*.css' --include='*.xml' --include='*.webmanifest' \
    -e 'mpaykin1.github.io/meta6/' -e '/meta6/' "$1" 2>/dev/null | while read -r f; do
    sed -i -e 's#mpaykin1\.github\.io/meta6/#mpaykin1.github.io/meta6-lab/#g' -e 's#\([\"'"'"'(]\)/meta6/#\1/meta6-lab/#g' "$f"; done
}
rsync -a "${EXCL[@]}" ./ "$OUT"/
rewrite "$OUT"
touch "$OUT/.nojekyll"
# Чего нет в превью ветки — берётся из main песочницы (GitHub Pages отдаёт корневой 404.html).
cat > "$OUT/404.html" <<'H'
<!doctype html><meta charset="utf-8"><title></title><script>
(function(){var m=location.pathname.match(/^\/meta6-lab\/preview\/[^\/]+\/(.*)$/);
if(m&&!/[?&]lab404=1/.test(location.search)){location.replace('/meta6-lab/'+m[1]+(location.search?location.search+'&':'?')+'lab404=1'+location.hash);}})();
</script><p>404</p>
H
git fetch --no-tags origin '+refs/heads/lab/*:refs/remotes/origin/lab/*' >/dev/null 2>&1 || true
: > "$OUT/.lab-previews"
for ref in $(git for-each-ref --format='%(refname:strip=3)' 'refs/remotes/origin/lab/'); do
  name="${ref#lab/}"; safe="${name//\//-}"
  [[ "$safe" =~ ^[A-Za-z0-9._-]+$ ]] || { echo "skip unsafe branch $ref"; continue; }
  # Pages artifact must stay < 1 GB (24.11.2026: 429 previews = 1.95 GB, every deploy failed).
  # Publish only branches active in the last PREVIEW_MAX_AGE_DAYS days or linked in LINKS.txt.
  age_days=$(( ( $(date +%s) - $(git log -1 --format=%ct "origin/$ref") ) / 86400 ))
  if (( age_days > ${PREVIEW_MAX_AGE_DAYS:-7} )) && ! grep -q "/preview/$safe/" LINKS.txt 2>/dev/null; then
    echo "skip stale preview $safe (${age_days}d)"; continue
  fi
  dest="$OUT/preview/$safe"; mkdir -p "$dest"
  base="$(git merge-base origin/main "origin/$ref" 2>/dev/null || echo origin/main)"
  # Fast path (owner 15.11.2026: publishing must be quick): a preview whose branch and base did not change
  # is reused from the cache of the previous build instead of being rebuilt.
  key="$(git rev-parse "origin/$ref")-$(git rev-parse "$base")-$(git rev-parse origin/main:scripts/lab/build-site.sh 2>/dev/null || echo x)"
  if [[ -n "${PREVIEW_CACHE:-}" && -f "$PREVIEW_CACHE/$safe/.key" && "$(cat "$PREVIEW_CACHE/$safe/.key")" == "$key" ]]; then
    rsync -a --exclude='.key' "$PREVIEW_CACHE/$safe/" "$dest/"; echo "$safe" >> "$OUT/.lab-previews"; echo "reuse preview $safe"; continue
  fi
  wt="$(mktemp -d)"; git worktree add -q --detach "$wt" "origin/$ref"
  tops="$( (git diff --name-only "$base" "origin/$ref"; echo meta-games/x) | awk -F/ 'NF>1{print $1}' | sort -u)"
  for t in $tops; do [ -e "$wt/$t" ] && rsync -a "${EXCL[@]}" "$wt/$t" "$dest/"; done
  git diff --name-only "$base" "origin/$ref" | awk -F/ 'NF==1' | while read -r f; do [ -f "$wt/$f" ] && cp "$wt/$f" "$dest/" || true; done
  rewrite "$dest"
  grep -rlI 'mpaykin1.github.io/meta6-lab/' "$dest" 2>/dev/null | xargs -r sed -i "s#mpaykin1\.github\.io/meta6-lab/#mpaykin1.github.io/meta6-lab/preview/$safe/#g"
  git worktree remove --force "$wt"
  echo "$safe" >> "$OUT/.lab-previews"
  if [[ -n "${PREVIEW_CACHE:-}" ]]; then rm -rf "$PREVIEW_CACHE/$safe"; mkdir -p "$PREVIEW_CACHE/$safe"; rsync -a "$dest/" "$PREVIEW_CACHE/$safe/"; echo "$key" > "$PREVIEW_CACHE/$safe/.key"; fi
done
# drop cached previews of deleted branches
if [[ -n "${PREVIEW_CACHE:-}" && -d "$PREVIEW_CACHE" ]]; then for d in "$PREVIEW_CACHE"/*/; do n="$(basename "$d")"; grep -qx "$n" "$OUT/.lab-previews" || rm -rf "$d"; done; fi
du -sh "$OUT"
# Pages refuses oversized artifacts (24.11.2026: 1.95 GB -> every deploy failed). Fail loudly instead.
site_mb=$(du -sm "$OUT" | cut -f1)
if (( site_mb > ${SITE_MAX_MB:-950} )); then echo "SITE_TOO_BIG ${site_mb} MB > ${SITE_MAX_MB:-950} MB: lower PREVIEW_MAX_AGE_DAYS" >&2; exit 1; fi

# Legacy root URLs sometimes point to games that exist only in one lab preview.
# Only when there is one unambiguous existing preview, publish a real redirect
# instead of inventing a game or silently declaring a missing source successful.
if [[ -f LINKS.txt ]]; then
  while IFS= read -r url; do
    prefix='https://mpaykin1.github.io/meta6-lab/'
    [[ "$url" == "$prefix"* ]] || continue
    relative="${url#"$prefix"}"
    relative="${relative%%\?*}"
    relative="${relative%/}"
    [[ "$relative" == preview/* ]] && continue
    [[ "$relative" =~ ^[a-zA-Z0-9_/.-]+$ && "$relative" != *..* ]] || continue
    [[ -f "$OUT/$relative/index.html" ]] && continue
    shopt -s nullglob
    candidates=("$OUT"/preview/*/"$relative"/index.html)
    shopt -u nullglob
    if (( ${#candidates[@]} == 1 )); then
      target="${candidates[0]#"$OUT"/}"
      target="${target%index.html}"
      mkdir -p "$OUT/$relative"
      cat > "$OUT/$relative/index.html" <<EOF
<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/meta6-lab/$target">
<a href="/meta6-lab/$target">Open the existing lab preview</a>
EOF
      echo "redirect existing preview: $relative -> $target"
    fi
  done < LINKS.txt
fi

# Published registry = owner-provided URLs plus every real index.html in the assembled site.
# Unlike an index of Git sources, this includes previews copied from lab/* branches.
{
  if [[ -f LINKS.txt ]]; then
    grep -E '^https://mpaykin1[.]github[.]io/meta6-lab/' LINKS.txt || true
  fi
  while IFS= read -r -d '' page; do
    relative="${page#"$OUT"/}"
    printf 'https://mpaykin1.github.io/meta6-lab/%s\n' "${relative%index.html}"
  done < <(find "$OUT" -type f -name index.html -print0)
} | LC_ALL=C sort -u > "$OUT/LINKS.txt"
echo "Generated $(wc -l < "$OUT/LINKS.txt") public URL candidates"
