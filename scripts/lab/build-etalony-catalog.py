# Собирает ETALONY.md — единый каталог эталонов МГЛ (одна строка на папку reference/*).
# Запуск: python3 scripts/lab/build-etalony-catalog.py [путь-к-клону-МГ]
import json, os, re, sys
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
mg = sys.argv[1] if len(sys.argv) > 1 else None
ref = os.path.join(root, 'reference')
rows = []
for d in sorted(os.listdir(ref)):
    p = os.path.join(ref, d)
    if not os.path.isdir(p): continue
    title, status, text = d, '—', ''
    for name in ('REFERENCE.json', 'README.md'):
        f = os.path.join(p, name)
        if os.path.exists(f):
            text += open(f, encoding='utf-8', errors='ignore').read()
    j = os.path.join(p, 'REFERENCE.json')
    if os.path.exists(j):
        try: title = json.load(open(j, encoding='utf-8')).get('title', title)
        except Exception: pass
    elif os.path.exists(os.path.join(p, 'README.md')):
        m = re.search(r'^#\s+(.+)$', open(os.path.join(p, 'README.md'), encoding='utf-8', errors='ignore').read(), re.M)
        if m: title = m.group(1).strip()
    if re.search(r'OWNER[ _]PASS', text): status = 'OWNER PASS'
    elif re.search(r'pending|ожидает|не принят', text, re.I): status = 'ждёт владельца'
    has_index = os.path.exists(os.path.join(p, 'index.html'))
    lab = f'[МГЛ](https://mpaykin1.github.io/meta6-lab/reference/{d}/)' if has_index else '—'
    mgl = '—'
    if mg and os.path.isdir(os.path.join(mg, 'reference', d)):
        mgl = f'[МГ](https://mpaykin1.github.io/meta6/reference/{d}/)' if os.path.exists(os.path.join(mg, 'reference', d, 'index.html')) else 'есть в МГ'
    readme = f'[README](reference/{d}/README.md)' if os.path.exists(os.path.join(p, 'README.md')) else '—'
    title = title.replace('|', '/')[:90]
    rows.append(f'| `{d}` | {title} | {status} | {lab} | {mgl} | {readme} |')
out = ['# ЭТАЛОНЫ — единый каталог (МГЛ)', '',
       'Один источник правды о том, какие эталоны есть. Собирается скриптом `scripts/lab/build-etalony-catalog.py`; проверка полноты — `scripts/lab/verify-etalony-catalog.mjs`.',
       'Эталон не ограничивает новое: просят «вставь X» — можно предложить готовый отсюда; просят «сделай новый X» — делается новый (решение владельца 15.11.2026).',
       'Вне `reference/`: базовый INK Living Watercolor — `demos/living-watercolor/` (МГ `ink/`), паспорта ассет-паков и копий — `shared/references/*.json`.',
       'INK-эталоны и как делать новые 3D-модели — [ink.md](ink.md) и карточка [Z21](automation/zadachi/Z21_INK_3D.md). Синхронизация МГ = МГЛ — сторож `verify-etalony-sync`.', '',
       '| Папка | Что это | Статус | Смотреть МГЛ | МГ | Правила |', '|---|---|---|---|---|---|'] + rows + ['', f'Всего папок: {len(rows)}.', '']
open(os.path.join(root, 'ETALONY.md'), 'w', encoding='utf-8').write('\n'.join(out))
print('ETALONY.md:', len(rows))
