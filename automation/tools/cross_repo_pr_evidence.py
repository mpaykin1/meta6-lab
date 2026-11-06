#!/usr/bin/env python3
"""Bounded, incremental PR evidence collector; no automatic promotion to verified lessons."""
import argparse
import datetime as dt
import json
import os
import pathlib
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
STATE = ROOT / "docs/development-memory/cross-repo/pr-evidence.json"
API = "https://api.github.com"

def get(path):
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "meta6-memory-evidence"}
    if os.getenv("GH_TOKEN"):
        headers["Authorization"] = "Bearer " + os.environ["GH_TOKEN"]
    with urllib.request.urlopen(urllib.request.Request(API + path, headers=headers), timeout=25) as r:
        return json.load(r)

def collect(repo, previous, limit, request=get):
    if limit < 1 or limit > 100:
        raise ValueError("limit must be 1..100")
    state = dict(previous)
    repo_state = dict(state.get(repo, {"cursor": 1, "candidates": {}}))
    cursor = repo_state.get("cursor", 1)
    path = "/repos/" + repo + "/pulls?state=closed&sort=updated&direction=desc&per_page=" + str(limit) + "&page=" + str(cursor)
    pulls = request(path)
    if not isinstance(pulls, list):
        raise ValueError("Expected PR list")
    candidates = dict(repo_state.get("candidates", {}))
    for pr in pulls:
        if not pr.get("merged_at"):
            continue
        number = pr["number"]
        sha = pr["merge_commit_sha"]
        if not sha or len(sha) != 40:
            continue
        key = str(number)
        previous_candidate = candidates.get(key, {})
        candidates[key] = {
            **previous_candidate,
            "pr": number, "title": pr["title"], "merged_at": pr["merged_at"],
            "merge_sha": sha, "url": pr["html_url"],
            "base_branch": pr["base"]["ref"], "source_branch": pr["head"]["ref"],
            "status": "CANDIDATE_UNVERIFIED", "reviewed": False,
            "note": "Metadata and changed files are unverified; inspect actual diff, tests and license",
        }
        if previous_candidate.get("merge_sha") != sha:
            candidates[key].pop("files_inspected", None)
            candidates[key].pop("changed_files", None)
    repo_state.update({"cursor": cursor + 1 if len(pulls) == limit else 1,
                       "candidates": candidates, "last_page_count": len(pulls),
                       "checked_utc": dt.datetime.now(dt.timezone.utc).isoformat()})
    state[repo] = repo_state
    return state

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--repo", action="append", required=True, help="owner/repo; repeatable")
    p.add_argument("--limit", type=int, default=30)
    p.add_argument("--output", type=pathlib.Path, default=STATE)
    p.add_argument("--check", action="store_true")
    a = p.parse_args()
    if a.check:
        data = json.loads(a.output.read_text(encoding="utf-8"))
        for repo, state in data.items():
            assert "/" in repo and state["cursor"] >= 1
            for candidate in state["candidates"].values():
                assert candidate["status"] == "CANDIDATE_UNVERIFIED"
                assert len(candidate["merge_sha"]) == 40
        print("PR evidence structure OK")
        return
    if not 1 <= a.limit <= 100:
        p.error("--limit must be 1..100")
    old = json.loads(a.output.read_text(encoding="utf-8")) if a.output.exists() else {}
    new = old
    try:
        for repo in a.repo:
            if len(repo.split("/")) != 2:
                p.error("Invalid owner/repo")
            new = collect(repo, new, a.limit)
    except (urllib.error.URLError, ValueError) as error:
        p.exit(2, "Collection incomplete, checkpoint unchanged: " + str(error) + "\n")
    a.output.parent.mkdir(parents=True, exist_ok=True)
    temp = a.output.with_suffix(".tmp")
    temp.write_text(json.dumps(new, indent=2, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")
    temp.replace(a.output)
    print("Collected merged PR metadata; all new entries unverified")
if __name__ == "__main__":
    main()
