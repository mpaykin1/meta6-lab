# Upstream: Blockbench

- Repository: https://github.com/JannisX11/blockbench
- Official docs: https://www.blockbench.net/wiki/docs/plugin
- Official `.bbmodel` format: https://www.blockbench.net/wiki/docs/bbmodel
- License: GPL-3.0-or-later on current source package (version observed 5.2.2 in `package.json`).
- Source README: `https://github.com/JannisX11/blockbench/blob/master/README.md`.

This skill **does not bundle or fork Blockbench's GPL source**. It ships an independent JS plugin using Blockbench's public Plugin/Cube/Group API, a Python procedural glTF asset generator, and a browser preview. The user opens generated assets in Blockbench for editing if desired. All generated sample geometry is original.

Source was reviewed using the public repository and official plugin API documentation. Full upstream clone was not performed in the build sandbox due to blocked external network. The included `scripts/download_blockbench.py` performs a real clone when run in an environment with GitHub access. Never claim the plugin includes the full upstream application. Preserve upstream GPL notices when using or distributing Blockbench itself.

Blockbench allows independently-authored plugins under licenses of their authors' choice, as documented in the official README.
