#!/usr/bin/env python3
"""Deterministic source-linked cross-repo recall index; stdlib, no AI and no secrets."""
import argparse
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
LEDGER = ROOT / "docs/development-memory/events.jsonl"
INVENTORY = ROOT / "docs/development-memory/cross-repo/inventory.json"
OUTPUT = ROOT / "docs/development-memory/cross-repo/recall-index.json"
TOKEN = re.compile(r"[\w/-]{3,}", re.UNICODE)

def words(value):
    return set(TOKEN.findall(str(value).lower()))

def build(events, inventory):
    branches = {}
    for repo, entry in inventory.get("repositories", {}).items():
        for name, branch in entry.get("branches", {}).items():
            branches[repo + "@" + name] = branch["head_sha"]
    records = {}
    for item in events:
        signature = item["signature"]
        evidence = {"id": item["id"], "project": item["project"], "kind": item["kind"],
                    "status": item["status"], "source_sha": item["source_sha"],
                    "evidence": item["evidence"], "observation": item["observation"],
                    "action": item["action"]}
        records.setdefault(signature, []).append(evidence)
    entries = []
    for signature, evidence in sorted(records.items()):
        unique = {e["id"]: e for e in evidence}
        evidence = [unique[k] for k in sorted(unique)]
        entries.append({"signature": signature, "tokens": sorted(words(signature + " " + " ".join(
            e["observation"] + " " + e["action"] for e in evidence))),
                        "evidence": evidence, "conflict": len({e["action"] for e in evidence}) > 1})
    return {"schema_version": 1, "source": "docs/development-memory/events.jsonl",
            "coverage": "PARTIAL", "branches_discovered": branches, "entries": entries,
            "notice": "Recall candidates only; verify SHA, evidence, code, license and owner verdict before use."}

def load_events(path):
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]

def recall(index, query, limit):
    terms = words(query)
    ranked = []
    for item in index["entries"]:
        score = len(terms.intersection(item["tokens"]))
        if score:
            ranked.append((score, item["signature"], item))
    ranked.sort(key=lambda row: (-row[0], row[1]))
    return [{"score": score, **item} for score, _, item in ranked[:limit]]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ledger", type=pathlib.Path, default=LEDGER)
    parser.add_argument("--inventory", type=pathlib.Path, default=INVENTORY)
    parser.add_argument("--output", type=pathlib.Path, default=OUTPUT)
    parser.add_argument("--query")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.query:
        if not args.output.exists():
            parser.error("Build index before querying")
        index = json.loads(args.output.read_text(encoding="utf-8"))
        print(json.dumps(recall(index, args.query, 12), ensure_ascii=False, indent=2))
        return
    inventory = json.loads(args.inventory.read_text(encoding="utf-8")) if args.inventory.exists() else {}
    index = build(load_events(args.ledger), inventory)
    serialized = json.dumps(index, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.check:
        if not args.output.exists() or args.output.read_text(encoding="utf-8") != serialized:
            parser.error("Recall index is missing or stale")
        print("Recall index OK")
        return
    args.output.parent.mkdir(parents=True, exist_ok=True)
    import os
    import tempfile
    fd, temp_name = tempfile.mkstemp(prefix=args.output.name + ".", suffix=".tmp", dir=args.output.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as out:
            out.write(serialized)
            out.flush()
            os.fsync(out.fileno())
        os.replace(temp_name, args.output)
    finally:
        if os.path.exists(temp_name):
            os.unlink(temp_name)
    print(f"Indexed {len(index['entries'])} signatures; coverage PARTIAL")
if __name__ == "__main__":
    main()
