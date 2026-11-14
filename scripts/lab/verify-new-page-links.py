#!/usr/bin/env python3
"""Fail PRs that introduce new games or public demos without registering their URLs."""
from pathlib import Path
import subprocess

BASE = "https://mpaykin1.github.io/meta6-lab/"


def new_page_urls(paths):
    urls = []
    for path in paths:
        if path.startswith(("games/", "demos/", "assets/")) and path.endswith("/index.html"):
            urls.append(BASE + path[:-len("index.html")])
    return sorted(set(urls))


def missing_links(paths, links):
    return sorted(set(new_page_urls(paths)) - set(links))


def main():
    paths = subprocess.check_output(
        ["git", "diff", "--name-only", "--diff-filter=A", "origin/main", "HEAD"],
        text=True,
    ).splitlines()
    links = Path("LINKS.txt").read_text(encoding="utf-8").splitlines()
    missing = missing_links(paths, links)
    for url in missing:
        print(f"NOT REGISTERED: {url}")
    if missing:
        raise SystemExit(1)
    print("verify-new-page-links: PASS")


if __name__ == "__main__":
    main()
