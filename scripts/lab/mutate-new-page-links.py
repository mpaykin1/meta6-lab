#!/usr/bin/env python3
"""Three fail-closed mutations for public-game/demo URL registration."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile

source = Path(__file__).with_name("verify-new-page-links.py")
fixture = Path(__file__).with_name("verify-new-page-links-fixture.py")
original = source.read_text()
mutations = [
    ("ignore-games", '("games/", "demos/", "assets/")',
     '("demos/", "assets/")'),
    ("skip-all", 'return sorted(set(urls))', 'return []'),
    ("ci-deception", 'return sorted(set(urls))',
     'return [] if __import__("os").getenv("GITHUB_ACTIONS") == "true"'
     ' else sorted(set(urls))'),
]
env = dict(os.environ, GITHUB_ACTIONS="true")
subprocess.run([sys.executable, str(fixture), str(source)], env=env, check=True)
with tempfile.TemporaryDirectory() as tmp:
    for name, target, replacement in mutations:
        if original.count(target) != 1:
            raise SystemExit("Mutation target missing or ambiguous: " + name)
        mutant = Path(tmp, name + ".py")
        mutant.write_text(original.replace(target, replacement, 1))
        run = subprocess.run(
            [sys.executable, str(fixture), str(mutant)],
            env=env, capture_output=True, text=True,
        )
        if run.returncode == 0:
            raise SystemExit("MUTATION ESCAPED: " + name)
        print("MUTATION CAUGHT: " + name)
print("mutate-new-page-links: PASS")
