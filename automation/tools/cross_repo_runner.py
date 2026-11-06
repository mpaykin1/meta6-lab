#!/usr/bin/env python3
"""Bounded local orchestration for existing five automation slots; no scheduler creation."""
import argparse
import json
import pathlib
import subprocess
import sys
import time
import contextlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
TOOLS = ROOT / "automation/tools"
DEFAULT_REPOS = ("mpaykin1/meta6", "mpaykin1/World_server", "mpaykin1/world-server-tech-lab")

def plan(repos, topic, skip_network):
    commands = []
    if not skip_network:
        commands.append([sys.executable, str(TOOLS/"cross_repo_inventory.py"), "--max-repos", str(len(repos)), "--max-branches", "75",
                         *[arg for repo in repos for arg in ("--repo", repo)]])
        commands.append([sys.executable, str(TOOLS/"cross_repo_pr_evidence.py"),
                         *[arg for repo in repos for arg in ("--repo", repo)], "--limit", "10"])
        commands.append([sys.executable, str(TOOLS/"cross_repo_pr_files.py"),
                         *[arg for repo in repos for arg in ("--repo", repo)], "--limit", "5"])
    commands.append([sys.executable, str(TOOLS/"cross_repo_recall.py")])
    commands.append([sys.executable, str(TOOLS/"memory_preflight.py"), "--topic", topic])
    commands.append([sys.executable, str(TOOLS/"cross_repo_components.py"), "--check"])
    commands.append([sys.executable, str(TOOLS/"cross_repo_regressions.py")])
    commands.append([sys.executable, str(TOOLS/"cross_repo_metrics.py")])
    return commands

def run(commands, executor=subprocess.run):
    results = []
    for command in commands:
        try:
            outcome = executor(command, cwd=ROOT, capture_output=True, text=True, timeout=120)
            code, stdout, stderr = outcome.returncode, outcome.stdout or "", outcome.stderr or ""
        except subprocess.TimeoutExpired:
            code, stdout, stderr = 124, "", "Step timed out after 120 seconds"
        results.append({"step": pathlib.Path(command[1]).name, "returncode": code,
                        "stdout": stdout[-3000:], "stderr": stderr[-1000:]})
        if code:
            break
    return results

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--topic", required=True)
    parser.add_argument("--repo", action="append")
    parser.add_argument("--offline", action="store_true", help="Use existing verified local ledger, skip GitHub network")
    parser.add_argument("--plan", action="store_true", help="Print exact bounded commands, do not execute")
    args = parser.parse_args()
    if not args.topic.strip():
        parser.error("--topic cannot be empty")
    repos = args.repo or list(DEFAULT_REPOS)
    if any(len(repo.split("/")) != 2 for repo in repos):
        parser.error("Repositories must be owner/repo")
    commands = plan(repos, args.topic, args.offline)
    if args.plan:
        print(json.dumps({"commands": commands, "coverage": "PARTIAL"}, indent=2))
        return
    from cross_repo_lease import lease
    try:
        with lease(ROOT / ".cross-repo-memory.lock"):
            results = run(commands)
    except RuntimeError as error:
        print(json.dumps({"status":"BLOCKED", "coverage":"PARTIAL", "reason":str(error)}))
        raise SystemExit(3)
    print(json.dumps({"status": "PARTIAL_SUCCESS" if all(r["returncode"] == 0 for r in results) else "INCOMPLETE",
                      "coverage": "PARTIAL", "results": results}, ensure_ascii=False, indent=2))
    if len(results) != len(commands) or any(r["returncode"] for r in results):
        raise SystemExit(2)
if __name__ == "__main__":
    main()
