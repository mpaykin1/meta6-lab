#!/usr/bin/env python3
"""Evidence-backed regression coverage audit. Reports gaps, never invents passing tests."""
import argparse
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
LEDGER = ROOT / "docs/development-memory/events.jsonl"
REGISTRY = ROOT / "docs/development-memory/cross-repo/regression-links.json"

def audit(events, links):
    by_id = {event["id"]: event for event in events}
    results = []
    for item in links.get("links", []):
        event = by_id.get(item.get("event_id"))
        path = item.get("test_path", "")
        test_file = ROOT / path
        if not event:
            status = "INVALID_EVENT"
        elif not path or pathlib.PurePosixPath(path).is_absolute() or ".." in pathlib.PurePosixPath(path).parts:
            status = "INVALID_PATH"
        elif not test_file.is_file():
            status = "MISSING_TEST"
        elif not item.get("ci_workflow"):
            status = "UNVERIFIED_CI"
        else:
            status = "TEST_LINKED_UNVERIFIED_RUNTIME"
        results.append({"event_id": item.get("event_id"), "test_path": path, "status": status})
    linked = {item.get("event_id") for item in links.get("links", [])}
    unlinked = sorted(event["id"] for event in events if event.get("kind") in ("failure", "regression") and event["id"] not in linked)
    return {"coverage": "PARTIAL", "linked": results, "unlinked_failure_ids": unlinked,
            "tested_regressions": None, "note": "A file and workflow link do not prove a regression test ran or passed."}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--ledger", type=pathlib.Path, default=LEDGER)
    p.add_argument("--registry", type=pathlib.Path, default=REGISTRY)
    p.add_argument("--strict", action="store_true")
    p.add_argument("--check-links", action="store_true", help="Block broken registered links without requiring all historical failures to be mapped")
    args = p.parse_args()
    events = [json.loads(s) for s in args.ledger.read_text(encoding="utf-8").splitlines() if s.strip()] if args.ledger.exists() else []
    links = json.loads(args.registry.read_text(encoding="utf-8"))
    result = audit(events, links)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    invalid = any(x["status"] != "TEST_LINKED_UNVERIFIED_RUNTIME" for x in result["linked"])
    if (args.strict and (result["unlinked_failure_ids"] or invalid)) or (args.check_links and invalid):
        raise SystemExit(2)
if __name__ == "__main__":
    main()
