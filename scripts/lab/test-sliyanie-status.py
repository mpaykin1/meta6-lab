#!/usr/bin/env python3
"""Проверка + ловушки для sliyanie-status.py (OSHIBKI №16). Без сети."""
import importlib.util, pathlib, sys

HERE = pathlib.Path(__file__).parent
SAMPLE = """Итог: (заполнит бот)

| PR | Группа | Ветка | Название | GitHub | Сделано |
|---|---|---|---|---|---|
| #10 | эталон | `lab/a` | A | open | слит abc123 |
| #11 | код | `lab/b` | B | open | |
| #12 | код | `lab/c` | C | open | НУЖЕН CLAUDE: workflows |
"""

def load(src):
    spec = importlib.util.spec_from_loader('m', loader=None); m = importlib.util.module_from_spec(spec)
    exec(compile(src, 'sliyanie', 'exec'), m.__dict__); return m

def suite(mod):
    out = mod.update(SAMPLE, {'10': 'merged', '11': 'open dirty', '12': 'closed'}, 'T')
    ok = [
        '| #10 | эталон | `lab/a` | A | merged | слит abc123 |' in out,          # заметка ChatGPT цела
        '| #12 | код | `lab/c` | C | closed | НУЖЕН CLAUDE: workflows |' in out,
        '| #11 | код | `lab/b` | B | open dirty | |' in out,
        'всего 3, слито 1, закрыто 1, открыто 1' in out,                       # счётчики
        'нет данных' in mod.update(SAMPLE, {}, 'T'),                            # PR без ответа GitHub не считается слитым
    ]
    return all(ok)

real = (HERE / 'sliyanie-status.py').read_text(encoding='utf-8')
fail = 0
if suite(load(real)): print('PASS настоящий sliyanie-status.py')
else: print('FAIL настоящий sliyanie-status.py'); fail = 1
traps = {
    'stiraet-zametki': real.replace("lines[i] = ' | '.join(cells)", "lines[i] = ' | '.join(cells[:5] + ['|'])"),
    'net-dannyh-kak-slito': real.replace("states.get(m.group(1), 'нет данных')", "states.get(m.group(1), 'merged')"),
    'ne-schitaet': real.replace("cnt[st.split()[0] if st.split()[0] in cnt else 'нет данных'] += 1", "pass"),
}
for name, src in traps.items():
    if src == real: print(f'FAIL ловушка {name} не применилась'); fail = 1; continue
    try: caught = not suite(load(src))
    except Exception: caught = True
    print(('PASS ловушка %s поймана' if caught else 'FAIL ловушка %s НЕ поймана') % name); fail |= not caught
sys.exit(fail)
