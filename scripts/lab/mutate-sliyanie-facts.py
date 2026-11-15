#!/usr/bin/env python3
"""Three permanent code mutations against time-only SLIYANIE commits."""
import importlib.util
from pathlib import Path
source = Path(__file__).with_name('sliyanie-status.py').read_text(encoding='utf-8')
sample = """Итог: (заполнит бот)
| PR | Группа | Ветка | Название | GitHub | Сделано |
|---|---|---|---|---|---|
| #10 | код | x | example | open | note |
| #11 | код | y | example | closed | note |
"""
def suite(code):
    module = importlib.util.module_from_spec(importlib.util.spec_from_loader('test_module', loader=None))
    exec(compile(code, 'sliyanie-status.py', 'exec'), module.__dict__)
    first = module.update(sample, {'10': 'open', '11': 'closed'}, 'T1')
    stable = module.update(first, {'10': 'open', '11': 'closed'}, 'T2')
    assert stable == first, 'time-only update must not change output'
    changed = module.update(first, {'10': 'closed', '11': 'open'}, 'T3')
    assert changed != first and 'T3 UTC' in changed, 'changed facts must update timestamp'
    assert 'note |' in changed, 'human notes must survive'
suite(source)
mutants = [
 ('time-only-churn', 'if not any_change and old_summary:', 'if False and old_summary:'),
 ('ignore-status-updates', 'any_change = any_change or cells[4] != st', 'any_change = False'),
 ('always-stale-summary', 'summary = old_summary', 'summary = old_summary if False else None')
]
for name,old,new in mutants:
    assert old in source, 'missing mutation anchor: ' + name
    try:
        suite(source.replace(old, new))
    except Exception:
        continue
    raise AssertionError('mutation survived: ' + name)
print('PASS: 3 sliyanie fact-only mutation traps')
