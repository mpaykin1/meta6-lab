#!/usr/bin/env python3
"""Deterministic, source-linked development-memory compactor.

Append to docs/development-memory/events.jsonl; never rewrite historical evidence.
Run: python3 automation/tools/compact_experience.py [--check|--self-test]
"""
from __future__ import annotations
import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
STORE = ROOT / "docs" / "development-memory"
LEDGER = STORE / "events.jsonl"
PROJECTS = ("shared", "ostrov-sumerek", "underwater-sumerek", "ashen-sumerek")
KINDS = {"baseline", "decision", "solution", "failure", "measurement"}
STATUSES = {"technical", "owner_approved", "unverified", "rejected"}
FIELDS = ("id", "date", "project", "kind", "status", "signature",
          "observation", "action", "evidence", "source_sha")


def parse(path: Path) -> list[dict]:
    entries = []
    ids = {}
    for line_num, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError as error:
            raise ValueError(f"line {line_num}: invalid JSON: {error}") from error
        missing = [k for k in FIELDS if not isinstance(item.get(k), str) or not item[k].strip()]
        if missing:
            raise ValueError(f"line {line_num}: missing text fields: {missing}")
        if item["id"] in ids:
            raise ValueError(f"line {line_num}: duplicate id {item['id']}")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}-[a-z0-9-]+", item["id"]):
            raise ValueError(f"line {line_num}: id must be dated and stable")
        if item["date"] != item["id"][:10] or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", item["date"]):
            raise ValueError(f"line {line_num}: invalid date")
        if item["project"] not in PROJECTS or item["kind"] not in KINDS or item["status"] not in STATUSES:
            raise ValueError(f"line {line_num}: unknown project, kind or status")
        if not re.fullmatch(r"[a-z0-9][a-z0-9/_-]*", item["signature"]):
            raise ValueError(f"line {line_num}: invalid signature")
        if not item["evidence"].startswith("https://") or not re.fullmatch(r"[0-9a-f]{40}", item["source_sha"]):
            raise ValueError(f"line {line_num}: require a HTTPS evidence URL and exact 40-char source SHA")
        for key in ("observation", "action"):
            if len(item[key]) > 300 or "\n" in item[key] or "|" in item[key]:
                raise ValueError(f"line {line_num}: {key} too long or contains newline/table pipe")
        old = item.get("supersedes", [])
        if not isinstance(old, list) or len(old) != len(set(old)):
            raise ValueError(f"line {line_num}: supersedes must be a unique-id list")
        for prior in old:
            if prior not in ids or ids[prior]["signature"] != item["signature"]:
                raise ValueError(f"line {line_num}: supersedes unknown/later or different-signature record {prior}")
        if item["status"] == "owner_approved" and not item.get("owner_quote"):
            raise ValueError(f"line {line_num}: owner_approved requires owner_quote from direct owner response")
        item["supersedes"] = old
        ids[item["id"]] = item
        entries.append(item)
    return entries


def outputs(entries: list[dict]) -> dict[Path, str]:
    replaced = {old for row in entries for old in row["supersedes"]}
    active = [row for row in entries if row["id"] not in replaced]
    by_project = defaultdict(list)
    for item in active:
        by_project[item["project"]].append(item)
    result = {}
    index = [
        "# Память разработки — навигация",
        "",
        "Генерируется из events.jsonl командой python3 automation/tools/compact_experience.py.",
        "Начинай каждый запуск здесь, затем читай карточку нужной игры, нужные исходные документы и свежую weekly-review.",
        "Этот индекс — навигация, а не доказательство качества. Состояние owner_approved только по прямому решению владельца.",
        "",
        f"Архив: {len(entries)} записей; актуальных карточек: {len(active)}; superseded: {len(replaced)}.",
        "",
    ]
    for project in PROJECTS:
        rows = sorted(by_project[project], key=lambda x: (x["signature"], x["date"], x["id"]))
        dupes = Counter(x["signature"] for x in rows)
        conflicts = sum(v > 1 for v in dupes.values())
        index.append(f"- [{project}](cards/{project}.md): {len(rows)} актуальных записей, конфликтующих тем: {conflicts}")
        card = [
            f"# Карточка опыта: {project}",
            "",
            "Краткая выборка; все исходные записи сохранены в ../events.jsonl.",
            "При конфликте не выбирай победителя по дате: проверь обе ссылки, запиши новую запись с supersedes.",
            "",
        ]
        if not rows:
            card.append("Пока нет записей.")
        for row in rows:
            signature = row["signature"]
            warning = " ⚠️ CONFLICT" if dupes[signature] > 1 else ""
            card.extend([
                f"## {signature}{warning}",
                f"- {row['date']} · {row['kind']} · {row['status']} · {row['id']}",
                f"- **Наблюдение:** {row['observation']}",
                f"- **Применять:** {row['action']}",
                f"- **Источник:** [доказательство]({row['evidence']}) · SHA {row['source_sha']}",
                "",
            ])
        result[STORE / "cards" / f"{project}.md"] = "\n".join(card).rstrip() + "\n"
    index.extend([
        "",
        "## Как дополнять",
        "",
        "После реально проверенного изменения добавь одну JSONL-запись с уникальным id, источником и source_sha.",
        "Повторный случай с тем же signature не стирает предшественника; supersedes допустим только при доказанном разрешении.",
        "Сохраняй необработанные отчёты PR, кадры и замеры отдельно; сводные карточки можно пересобирать.",
        "Еженедельный Claude-review исправляет ошибки через новые записи, не через уничтожение истории.",
        "",
    ])
    result[STORE / "INDEX.md"] = "\n".join(index)
    return result


def self_test() -> None:
    example = {
        "id": "2026-10-21-test", "date": "2026-10-21", "project": "shared",
        "kind": "solution", "status": "technical", "signature": "test/one",
        "observation": "Observed.", "action": "Verify again.",
        "evidence": "https://github.com/mpaykin1/meta6",
        "source_sha": "a" * 40, "supersedes": []
    }
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "events.jsonl"
        path.write_text(json.dumps(example) + "\n", encoding="utf-8")
        assert len(parse(path)) == 1
        path.write_text((json.dumps(example) + "\n") * 2, encoding="utf-8")
        try:
            parse(path)
        except ValueError as error:
            assert "duplicate" in str(error)
        else:
            raise AssertionError("duplicate id not caught")
        newer = dict(example, id="2026-10-22-test", date="2026-10-22", supersedes=["2026-10-21-test"])
        path.write_text(json.dumps(example) + "\n" + json.dumps(newer) + "\n", encoding="utf-8")
        parsed = parse(path)
        assert len(parsed) == 2
        assert "актуальных карточек: 1" in outputs(parsed)[STORE / "INDEX.md"]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="validate and ensure generated files match")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        print("memory self-test OK")
        return 0
    try:
        generated = outputs(parse(LEDGER))
    except (ValueError, OSError) as error:
        print(f"memory invalid: {error}", file=sys.stderr)
        return 1
    mismatches = []
    for path, expected in generated.items():
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != expected:
                mismatches.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(expected, encoding="utf-8")
    if mismatches:
        print("memory compact is stale; run python3 automation/tools/compact_experience.py: " +
              ", ".join(mismatches), file=sys.stderr)
        return 1
    print(f"memory {'verified' if args.check else 'compacted'}: {len(generated)} generated files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
