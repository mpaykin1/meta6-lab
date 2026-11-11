#!/usr/bin/env python3
"""Бот sliyanie-status (Claude, 10.11.2026): пишет в automation/SLIYANIE.md правду из GitHub.

Колонка «GitHub» = merged / closed / open (+ dirty, если конфликт) для каждого PR из таблицы,
строка «Итог:» = счётчики и время. Колонку «Сделано» (заметки ChatGPT) не трогает.
Ввод: путь к файлу и JSON-словарь {номер: состояние} из stdin (его собирает workflow через gh api),
чтобы скрипт проверялся без сети. Выход: 0 — файл обновлён/без изменений.
"""
import json, re, sys, datetime

def update(text, states, now):
    lines = text.split('\n'); cnt = {'merged': 0, 'closed': 0, 'open': 0, 'нет данных': 0}
    row = re.compile(r'^\| #(\d+) \|')
    for i, l in enumerate(lines):
        m = row.match(l)
        if not m:
            continue
        cells = l.split(' | ')
        st = states.get(m.group(1), 'нет данных')
        cells[4] = st
        lines[i] = ' | '.join(cells)
        cnt[st.split()[0] if st.split()[0] in cnt else 'нет данных'] += 1
    total = sum(cnt.values())
    summary = (f"Итог: всего {total}, слито {cnt['merged']}, закрыто {cnt['closed']}, "
               f"открыто {cnt['open']}" + (f", нет данных {cnt['нет данных']}" if cnt['нет данных'] else '')
               + f" — бот, {now} UTC")
    lines = [summary if l.startswith('Итог:') else l for l in lines]
    return '\n'.join(lines)

if __name__ == '__main__':
    path = sys.argv[1]
    states = json.load(sys.stdin)
    now = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M')
    src = open(path, encoding='utf-8').read()
    new = update(src, states, now)
    open(path, 'w', encoding='utf-8').write(new)
