#!/usr/bin/env bash
# LAB: собирает сайт песочницы. Корень = main, каждая ветка lab/<имя> -> preview/<имя>/.
# Файл песочницы (Claude). В mpaykin1/meta6 его нет.
set -euo pipefail
OUT="${1:-_site}"
rm -rf "$OUT"; mkdir -p "$OUT"
EXCL=(--exclude='.git/' --exclude='.github/' --exclude='node_modules/' --exclude='_site/' --exclude='**/evidence/')
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
  wt="$(mktemp -d)"; git worktree add -q --detach "$wt" "origin/$ref"
  dest="$OUT/preview/$safe"; mkdir -p "$dest"
  base="$(git merge-base origin/main "origin/$ref" 2>/dev/null || echo origin/main)"
  tops="$( (git diff --name-only "$base" "origin/$ref"; echo meta-games/x) | awk -F/ 'NF>1{print $1}' | sort -u)"
  for t in $tops; do [ -e "$wt/$t" ] && rsync -a "${EXCL[@]}" "$wt/$t" "$dest/"; done
  git diff --name-only "$base" "origin/$ref" | awk -F/ 'NF==1' | while read -r f; do [ -f "$wt/$f" ] && cp "$wt/$f" "$dest/"; done
  rewrite "$dest"
  grep -rlI 'mpaykin1.github.io/meta6-lab/' "$dest" 2>/dev/null | xargs -r sed -i "s#mpaykin1\.github\.io/meta6-lab/#mpaykin1.github.io/meta6-lab/preview/$safe/#g"
  git worktree remove --force "$wt"
  echo "$safe" >> "$OUT/.lab-previews"
done
# FIX: inject fixed mobile viewport into every playable game in main and previews.
node scripts/lab/inject-game-screen.mjs "$OUT"
node scripts/lab/verify-mobile-screen.mjs "$OUT"
du -sh "$OUT"
