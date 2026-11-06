#!/usr/bin/env python3
"""Fail-closed development memory preflight. No network and no side effects."""
import argparse
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
INDEX = ROOT / "docs/development-memory/cross-repo/recall-index.json"
RECALL = ROOT / "automation/tools/cross_repo_recall.py"
def run(topic, require_match=False, index=INDEX):
    if not topic.strip():
        raise ValueError("topic is required")
    if not index.exists():
        return 2, {"status": "BLOCKED", "reason": "Missing recall index; generate from verified ledger first"}
    try:
        data = json.loads(index.read_text(encoding="utf-8"))
        if data.get("schema_version") != 1 or data.get("coverage") not in ("PARTIAL", "VERIFIED"):
            return 2, {"status": "BLOCKED", "reason": "Unknown index schema"}
        if data.get("coverage") != "VERIFIED":
            coverage = "PARTIAL"
        else:
            coverage = "VERIFIED"
        if not isinstance(data.get("entries"), list):
            return 2, {"status": "BLOCKED", "reason": "Missing or invalid recall entries"}
        for entry in data["entries"]:
            if not isinstance(entry, dict) or not isinstance(entry.get("signature"), str) or not isinstance(entry.get("tokens"), list):
                return 2, {"status": "BLOCKED", "reason": "Malformed recall entry"}
        from cross_repo_recall import recall
        matches = recall(data, topic, 10)
    except (ValueError, KeyError, TypeError) as error:
        return 2, {"status": "BLOCKED", "reason": "Invalid index: " + str(error)}
    if require_match and not matches:
        return 1, {"status": "REVIEW_REQUIRED", "reason": "No matching verified historical lesson", "coverage": coverage}
    return 0, {"status": "RECALL_COMPLETE", "coverage": coverage, "matches": matches,
               "instruction": "Review evidence and canonical source before editing; do not treat candidates as approved."}
def main():
    p = argparse.ArgumentParser()
    p.add_argument("--topic", required=True)
    p.add_argument("--require-match", action="store_true")
    p.add_argument("--index", type=pathlib.Path, default=INDEX)
    a = p.parse_args()
    code, result = run(a.topic, a.require_match, a.index)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(code)
if __name__ == "__main__":
    main()
