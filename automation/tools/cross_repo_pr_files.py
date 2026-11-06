#!/usr/bin/env python3
"""Read-only PR changed-file evidence intake; NEVER promotes a candidate to verified."""
import argparse
import json
import os
import pathlib
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
STATE = ROOT / "docs/development-memory/cross-repo/pr-evidence.json"

def fetch(url):
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "meta6-memory-diff"}
    if os.getenv("GH_TOKEN"):
        headers["Authorization"] = "Bearer " + os.environ["GH_TOKEN"]
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=25) as response:
        return json.load(response)

def enrich(repo, state, limit=5, request=fetch):
    if not 1 <= limit <= 100:
        raise ValueError("limit must be 1..100")
    current = dict(state)
    record = dict(current.get(repo, {}))
    candidates = dict(record.get("candidates", {}))
    selected = sorted((c for c in candidates.values() if c.get("status") == "CANDIDATE_UNVERIFIED"
                       and not c.get("files_inspected")), key=lambda c: c["pr"])[:limit]
    for item in selected:
        files = []
        complete = False
        for page in range(1, 11):
            url = "https://api.github.com/repos/" + repo + "/pulls/" + str(item["pr"]) + "/files?per_page=100&page=" + str(page)
            batch = request(url)
            if not isinstance(batch, list):
                raise ValueError("Expected file list")
            for f in batch:
                files.append({"path": f["filename"], "status": f["status"],
                              "additions": f["additions"], "deletions": f["deletions"],
                              "blob_sha": f["sha"]})
            if len(batch) < 100:
                complete = True
                break
        if not complete:
            raise ValueError("PR file list exceeds 1000 entries; incomplete evidence must not be marked inspected")
        item = dict(item)
        item["changed_files"] = files
        item["files_inspected"] = True
        item["status"] = "CANDIDATE_UNVERIFIED"
        candidates[str(item["pr"])] = item
    record["candidates"] = candidates
    current[repo] = record
    return current

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--repo", action="append", required=True)
    p.add_argument("--limit", type=int, default=5)
    p.add_argument("--state", type=pathlib.Path, default=STATE)
    args = p.parse_args()
    if not args.state.exists():
        p.error("PR candidate state missing; run cross_repo_pr_evidence.py first")
    original = json.loads(args.state.read_text(encoding="utf-8"))
    updated = original
    for repo in args.repo:
        if len(repo.split("/")) != 2:
            p.error("Expected owner/repo")
        updated = enrich(repo, updated, args.limit)
    args.state.parent.mkdir(parents=True, exist_ok=True)
    temp = args.state.with_suffix(".tmp")
    temp.write_text(json.dumps(updated, indent=2, sort_keys=True, ensure_ascii=False)+"\n", encoding="utf-8")
    temp.replace(args.state)
    print("File-level PR evidence collected; no candidate promoted")
if __name__ == "__main__":
    main()
