#!/usr/bin/env python3
"""Independent fixture for the new-public-pages registry rule."""
import importlib.util
import os
import sys

spec = importlib.util.spec_from_file_location("registry_candidate", sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
paths = [
    "games/new-game/index.html",
    "demos/fresh-art/index.html",
    "assets/train-in-the-fog/coaches-r1/index.html",
    "meta-games/index.html",
    "games/old-game/guide.html",
]
base = "https://mpaykin1.github.io/meta6-lab/"
expected = {
    base + "games/new-game/",
    base + "demos/fresh-art/",
    base + "assets/train-in-the-fog/coaches-r1/",
}
assert set(module.new_page_urls(paths)) == expected
assert module.missing_links(paths, sorted(expected)) == []
assert set(module.missing_links(paths, [base + "games/new-game/"])) == (
    expected - {base + "games/new-game/"}
)
assert os.getenv("GITHUB_ACTIONS") == "true"
print("verify-new-page-links-fixture: PASS")
