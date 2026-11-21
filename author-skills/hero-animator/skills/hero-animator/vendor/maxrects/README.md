# MaxRects Packer — build-time dependency

Upstream: https://github.com/soimy/maxrects-packer — MIT © 2017 Shen Yiming.
Exact npm dependency: maxrects-packer@3.0.0 in ../../package.json.
The upstream package is installed into node_modules during asset compilation;
it is not redistributed inside this lightweight plugin patch.

The actual upstream MaxRectsPacker class (not a simulated rectangle algorithm)
is imported by ../../scripts/maxrects_layout.mjs. No npm or Node dependency
is loaded by browser runtime; the resulting sheets are ordinary PNG + JSON.
