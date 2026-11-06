#!/usr/bin/env python3
"""Incremental, read-only GitHub branch inventory. Python standard library only."""
import argparse
import datetime as dt
import json
import os
import pathlib
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
STATE = ROOT / "docs/development-memory/cross-repo/inventory.json"
API = "https://api.github.com"
def fetch(path):
    request = urllib.request.Request(API + path, headers={
        "Accept": "application/vnd.github+json",
        "User-Agent": "meta6-cross-repo-memory",
        **({"Authorization": "Bearer " + os.environ["GH_TOKEN"]} if os.getenv("GH_TOKEN") else {}),
    })
    with urllib.request.urlopen(request, timeout=25) as response:
        return json.load(response)
def pages(path, max_pages):
    for page in range(1, max_pages + 1):
        separator = "&" if "?" in path else "?"
        data = fetch(f"{path}{separator}per_page=100&page={page}")
        if not isinstance(data, list):
            raise ValueError("Expected list from GitHub")
        yield from data
        if len(data) < 100:
            break
def scan(owner, max_repos, max_branches, previous, target_repos=None):
    if target_repos:
        repositories = []
        for name in dict.fromkeys(target_repos):
            if len(name.split('/')) != 2 or name.split('/')[0] != owner or not all(part.replace('-', '').replace('_', '').replace('.', '').isalnum() for part in name.split('/')):
                raise ValueError('Invalid or cross-owner target repository: ' + name)
            repositories.append(fetch('/repos/' + urllib.parse.quote(name, safe='/')))
    else:
        repositories = list(pages(f"/users/{urllib.parse.quote(owner)}/repos?type=owner&sort=full_name", 20))
    repositories = sorted(repositories, key=lambda r: r["full_name"])
    old = previous.get("repositories", {})
    result = dict(old)
    repo_cursor = previous.get("next_repo", 0)
    if repo_cursor >= len(repositories):
        repo_cursor = 0
    budget = max_branches
    checked = 0
    while checked < max_repos and budget > 0 and repo_cursor < len(repositories):
        r = repositories[repo_cursor]
        name = r["full_name"]
        branch_list = list(pages("/repos/" + name + "/branches", 30))
        branch_list.sort(key=lambda b: b["name"])
        existing = result.get(name, {"branches": {}, "next_branch": 0})
        branch_cursor = existing.get("next_branch", 0)
        if branch_cursor >= len(branch_list):
            branch_cursor = 0
        batch = branch_list[branch_cursor:branch_cursor + budget]
        for b in batch:
            existing["branches"][b["name"]] = {
                "head_sha": b["commit"]["sha"],
                "indexed_sha": (existing["branches"].get(b["name"], {}).get("indexed_sha")
                                if existing["branches"].get(b["name"], {}).get("head_sha") == b["commit"]["sha"]
                                else None),
                "status": "DISCOVERED",
            }
        existing["next_branch"] = branch_cursor + len(batch)
        existing["branch_count"] = len(branch_list)
        existing["default_branch"] = r["default_branch"]
        result[name] = existing
        budget -= len(batch)
        checked += 1
        if existing["next_branch"] >= len(branch_list):
            existing["next_branch"] = 0
            repo_cursor += 1
        else:
            if target_repos:
                repo_cursor += 1
            else:
                break
    return {"schema_version": 1, "owner": owner, "checked_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
            "next_repo": repo_cursor if repo_cursor < len(repositories) else 0,
            "repository_count": len(repositories), "repositories": result,
            "coverage": "PARTIAL", "note": "Inventory is not evidence of code review or validated knowledge."}
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--owner", default="mpaykin1")
    parser.add_argument("--repo", action="append", help="Explicit owner/repo target; repeat to scan only named repositories")
    parser.add_argument("--max-repos", type=int, default=3)
    parser.add_argument("--max-branches", type=int, default=75)
    parser.add_argument("--output", type=pathlib.Path, default=STATE)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if args.max_repos < 1 or args.max_branches < 1:
        parser.error("budgets must be positive")
    if args.check:
        data = json.loads(args.output.read_text(encoding="utf-8"))
        assert data["schema_version"] == 1
        assert data["coverage"] in ("PARTIAL", "VERIFIED")
        for repo in data["repositories"].values():
            for b in repo["branches"].values():
                assert len(b["head_sha"]) == 40
        print("Inventory structure OK")
        return
    previous = json.loads(args.output.read_text(encoding="utf-8")) if args.output.exists() else {}
    try:
        result = scan(args.owner, args.max_repos, args.max_branches, previous, args.repo)
    except (urllib.error.URLError, ValueError) as exc:
        print("Scan incomplete; checkpoint unchanged: " + str(exc), file=sys.stderr)
        raise SystemExit(2)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temp = args.output.with_suffix(".tmp")
    temp.write_text(json.dumps(result, indent=2, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")
    temp.replace(args.output)
    print(f"Repositories discovered: {result['repository_count']}; next repo: {result['next_repo']}; coverage PARTIAL")
if __name__ == "__main__":
    main()
