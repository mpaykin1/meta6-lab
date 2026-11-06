#!/usr/bin/env python3
"""Optimistic GitHub checkpoint guard for independent memory workers.

Does not merge automatically. Require expected main SHA before proposing checkpoint PR.
"""
import argparse
import json
import os
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.github.com"

def main_sha(repo, request=None):
    if request is None:
        def request(url):
            headers = {"Accept":"application/vnd.github+json", "User-Agent":"meta6-memory-checkpoint"}
            if os.getenv("GH_TOKEN"):
                headers["Authorization"]="Bearer "+os.environ["GH_TOKEN"]
            with urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=25) as response:
                return json.load(response)
    if len(repo.split("/")) != 2:
        raise ValueError("Expected owner/repo")
    payload = request(API+"/repos/"+repo+"/branches/main")
    sha = payload["commit"]["sha"]
    if len(sha) != 40 or any(c not in "0123456789abcdef" for c in sha):
        raise ValueError("Invalid main SHA")
    return sha

def verify(repo, expected, request=None):
    actual = main_sha(repo, request)
    return {"repository":repo,"expected_main_sha":expected,"actual_main_sha":actual,
            "status":"UNCHANGED" if expected == actual else "STALE_REBASE_REQUIRED",
            "checkpoint_written":False}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--repo",default="mpaykin1/meta6")
    p.add_argument("--expected-main-sha",required=True)
    args=p.parse_args()
    result=verify(args.repo,args.expected_main_sha)
    print(json.dumps(result,indent=2))
    if result["status"]!="UNCHANGED":
        raise SystemExit(3)
if __name__=="__main__":
    main()
