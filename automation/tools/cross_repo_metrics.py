#!/usr/bin/env python3
"""Auditable memory coverage report. Unknowns are explicit; never fabricate success."""
import argparse
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = ROOT / "docs/development-memory/cross-repo"
LEDGER = ROOT / "docs/development-memory/events.jsonl"

def compute(inventory, prs, events):
    repos = inventory.get("repositories", {})
    discovered = sum(len(r.get("branches", {})) for r in repos.values())
    total = sum(r.get("branch_count", 0) for r in repos.values())
    indexed = sum(1 for r in repos.values() for b in r.get("branches", {}).values()
                  if b.get("indexed_sha") == b.get("head_sha") and b.get("head_sha"))
    stale = sum(1 for r in repos.values() for b in r.get("branches", {}).values()
                if b.get("indexed_sha") and b.get("indexed_sha") != b.get("head_sha"))
    unreviewed = discovered - indexed
    candidates = sum(len(r.get("candidates", {})) for r in prs.values())
    signatures = len({e["signature"] for e in events})
    return {
        "coverage": "PARTIAL",
        "repositories_seen": len(repos),
        "repositories_discovered": inventory.get("repository_count", None),
        "branches_discovered": discovered,
        "branches_reported_total_in_seen_repositories": total,
        "branches_verified_at_current_sha": indexed,
        "branches_not_verified_at_current_sha": unreviewed,
        "stale_indexed_sha_markers": stale,
        "branches_discovery_ratio_in_seen_repositories": round(discovered/total, 4) if total else None,
        "merged_pr_candidates_unverified": candidates,
        "ledger_event_count": len(events),
        "distinct_ledger_signatures": signatures,
        "prevented_regressions_measured": None,
        "reused_components_measured": None,
        "time_saved_minutes_measured": None,
        "all_repositories_scanned": False,
        "note": "Discovered branch is not a reviewed branch. Ratios do not imply knowledge coverage."
    }

def read_json(path):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--inventory", type=pathlib.Path, default=BASE/"inventory.json")
    p.add_argument("--prs", type=pathlib.Path, default=BASE/"pr-evidence.json")
    p.add_argument("--ledger", type=pathlib.Path, default=LEDGER)
    p.add_argument("--output", type=pathlib.Path)
    args = p.parse_args()
    events = [json.loads(s) for s in args.ledger.read_text(encoding="utf-8").splitlines() if s.strip()] if args.ledger.exists() else []
    report = compute(read_json(args.inventory), read_json(args.prs), events)
    data = json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True)+"\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(data, encoding="utf-8")
    print(data, end="")
if __name__ == "__main__":
    main()
