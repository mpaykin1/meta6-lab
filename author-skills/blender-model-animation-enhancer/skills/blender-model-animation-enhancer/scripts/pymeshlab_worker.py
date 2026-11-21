#!/usr/bin/env python3
"""Isolated PyMeshLab geometry processor; input/output are JSON vertex/triangle arrays.

Requires: python -m pip install pymeshlab numpy
Invoked as a subprocess of Blender. This module never runs in bpy and never
modifies an uploaded model in-place.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path


def process(payload: dict, clean: bool) -> dict:
    import numpy as np
    import pymeshlab

    vertices = np.asarray(payload["vertices"], dtype=np.float64).reshape(-1, 3)
    faces = np.asarray(payload["faces"], dtype=np.int32).reshape(-1, 3)
    if len(vertices) < 3 or len(faces) < 1:
        raise ValueError("Mesh must contain at least 3 vertices and 1 face")
    if not np.all(np.isfinite(vertices)):
        raise ValueError("Vertex coordinates contain NaN/Infinity")
    if np.any(faces < 0) or np.any(faces >= len(vertices)):
        raise ValueError("Triangle indices out of range")

    ms = pymeshlab.MeshSet()
    ms.add_mesh(pymeshlab.Mesh(vertex_matrix=vertices, face_matrix=faces), "imported_mesh")
    initial = {"vertices": len(vertices), "triangles": len(faces)}
    # These filters remove exact topological defects, without sculpting or
    # remeshing. The output must still pass Blender-side safety checks.
    ms.meshing_remove_duplicate_vertices()
    ms.meshing_remove_duplicate_faces()
    ms.meshing_remove_null_faces()
    ms.meshing_remove_unreferenced_vertices()

    result_mesh = ms.current_mesh()
    out_vertices = result_mesh.vertex_matrix()
    out_faces = result_mesh.face_matrix()
    if len(out_vertices) < 3 or len(out_faces) < 1:
        raise ValueError("Mesh became empty; refusing to apply cleanup")
    if not np.all(np.isfinite(out_vertices)):
        raise ValueError("Nonfinite output coordinates")
    if np.any(out_faces < 0) or np.any(out_faces >= len(out_vertices)):
        raise ValueError("Invalid output face references")
    # Filters are expected to remove duplicates, not change silhouette/bounds.
    bounds_before = np.stack((vertices.min(axis=0), vertices.max(axis=0)))
    bounds_after = np.stack((out_vertices.min(axis=0), out_vertices.max(axis=0)))
    delta = float(np.max(np.abs(bounds_before - bounds_after)))
    scale = float(np.max(np.ptp(vertices, axis=0)))
    if delta > max(1e-7, scale * 1e-6):
        raise ValueError("Bounds changed during cleanup; refusing output")
    response = {
        "original": initial,
        "cleaned": {"vertices": int(len(out_vertices)), "triangles": int(len(out_faces))},
        "bounds_delta": delta,
        "applied": bool(clean),
    }
    if clean:
        response["vertices"] = out_vertices.tolist()
        response["faces"] = out_faces.tolist()
    return response


def main() -> int:
    parser = argparse.ArgumentParser(description="PyMeshLab static geometry diagnostics/cleanup")
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--clean", action="store_true")
    args = parser.parse_args()
    if args.input.resolve() == args.output.resolve():
        parser.error("Input and output must differ")
    payload = json.loads(args.input.read_text(encoding="utf-8"))
    result = process(payload, clean=args.clean)
    args.output.write_text(json.dumps(result, separators=(",", ":")), encoding="utf-8")
    print(f"[pymeshlab] {result['original']} -> {result['cleaned']} (applied={result['applied']})")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"[pymeshlab] ERROR {type(error).__name__}: {error}", file=sys.stderr)
        raise
