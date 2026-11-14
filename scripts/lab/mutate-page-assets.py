#!/usr/bin/env python3
"""Three broken variants must fail, including a fake CI-only success."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile

source = Path(__file__).with_name("page-assets.py")
verifier = Path(__file__).with_name("verify-page-assets.py")
original = source.read_text()
mutations = [
    ("skip-script", 'if tag == "script" and attrs.get("src"):', 'if False and attrs.get("src"):'),
    ("accept-external", 'target.netloc != self.page.netloc', 'False'),
    ("ci-deception", 'return sorted(parser.resources)',
     'return [] if __import__("os").getenv("GITHUB_ACTIONS") == "true" else sorted(parser.resources)'),
]
# Keep the original cases; scope the HTML mutation to its function now that JS imports have another return.
mutations[2] = (
    "ci-deception",
    'parser.feed(html)\n    return sorted(parser.resources)',
    'parser.feed(html)\n    return [] if __import__("os").getenv("GITHUB_ACTIONS") == "true"'
    ' else sorted(parser.resources)',
)
with tempfile.TemporaryDirectory() as tmp:
    env = dict(os.environ, GITHUB_ACTIONS="true")
    subprocess.run([sys.executable, str(verifier), str(source)], env=env, check=True)
    for name, before, after in mutations:
        if original.count(before) != 1:
            raise SystemExit("Mutant insertion ambiguous: " + name)
        mutant = Path(tmp, name + ".py")
        mutant.write_text(original.replace(before, after))
        result = subprocess.run([sys.executable, str(verifier), str(mutant)],
                                env=env, capture_output=True, text=True)
        if result.returncode == 0:
            raise SystemExit("MUTATION ESCAPED: " + name)
        print("MUTATION CAUGHT: " + name)

import runpy
runpy.run_path(str(Path(__file__).with_name("mutate-page-imports.py")), run_name="__main__")
