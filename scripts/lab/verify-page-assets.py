#!/usr/bin/env python3
"""Independent fixture for parsing first-party HTML assets."""
import importlib.util
import os
import sys

path = sys.argv[1]
spec = importlib.util.spec_from_file_location("page_assets_candidate", path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
page = "https://mpaykin1.github.io/meta6-lab/demos/living-watercolor/"
html = '''
<html><head>
<base href="/meta6-lab/demos/living-watercolor/">
<script src="main.js"></script>
<link rel="stylesheet" href="style.css">
<link rel="modulepreload" href="extra.js">
<link rel="canonical" href="/meta6-lab/ignore.html">
<link rel="stylesheet" href="https://foreign.invalid/meta6-lab/foreign.css">
<style>.foo { background: url("images/cloud.png") }</style>
</head><body>
<img src="missing.png" srcset="little.webp 1x, big.webp 2x">
<a href="/meta6-lab/does-not-matter/">Navigation</a>
<audio src="sound/ambient.ogg"></audio>
<img src="data:image/png;base64,AAAA">
</body></html>'''
resources = module.extract_resources(html, page)
expected = {
    page + "main.js", page + "style.css", page + "extra.js",
    page + "images/cloud.png", page + "missing.png", page + "little.webp",
    page + "big.webp", page + "sound/ambient.ogg",
}
assert expected == set(resources), (expected - set(resources), set(resources) - expected)
assert all("foreign.invalid" not in resource for resource in resources)
assert all("ignore.html" not in resource for resource in resources)
assert os.getenv("GITHUB_ACTIONS") == "true", "CI-deception mutation must be covered"
print("verify-page-assets: PASS")
