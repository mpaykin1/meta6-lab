"""3D Master: real geometry mutations, including rotated-cardboard evasion."""
import base64
import json
import math
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from kinds import model3d


class Collector:
    def __init__(self):
        self.items = []
        self.stats = {}

    def add(self, code, severity, where, problem, fix):
        self.items.append((code, severity, problem))


class QualityAuditTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root / "pack.json").write_text(
            json.dumps({"model3d": {"role": "character"}}), encoding="utf-8"
        )

    def audit(self, positions, indices, *, normals=None, uvs=None, rotation=0,
              pbr=None, texture_without_uv=False, weights=None):
        positions = np.asarray(positions, dtype="<f4").reshape(-1, 3)
        streams = [("POSITION", positions, "VEC3", 5126)]
        if normals is not None:
            streams.append(("NORMAL", np.asarray(normals, dtype="<f4").reshape(-1, 3),
                            "VEC3", 5126))
        if uvs is not None:
            streams.append(("TEXCOORD_0", np.asarray(uvs, dtype="<f4").reshape(-1, 2),
                            "VEC2", 5126))
        if weights is not None:
            streams.append(("WEIGHTS_0", np.asarray(weights, dtype="<f4").reshape(-1, 4),
                            "VEC4", 5126))
        streams.append(("indices", np.asarray(indices, dtype="<u2"), "SCALAR", 5123))
        blob, views, accessors, attrs = bytearray(), [], [], {}
        for name, arr, value_type, component_type in streams:
            offset = len(blob)
            raw = arr.tobytes()
            blob.extend(raw)
            while len(blob) % 4:
                blob.append(0)
            views.append({"buffer": 0, "byteOffset": offset, "byteLength": len(raw)})
            accessor = {"bufferView": len(views) - 1, "componentType": component_type,
                        "count": len(arr), "type": value_type}
            if name == "POSITION" and np.isfinite(arr).all():
                accessor["min"] = arr.min(axis=0).tolist()
                accessor["max"] = arr.max(axis=0).tolist()
            accessors.append(accessor)
            attrs[name] = len(accessors) - 1
        prim = {"attributes": {k: v for k, v in attrs.items() if k != "indices"},
                "indices": attrs["indices"], "mode": 4}
        materials = []
        if pbr is not None or texture_without_uv:
            mat = {"pbrMetallicRoughness": pbr or {}}
            if texture_without_uv:
                mat["pbrMetallicRoughness"]["baseColorTexture"] = {"index": 0}
            materials = [mat]
            prim["material"] = 0
        g = {
            "accessors": accessors, "bufferViews": views,
            "buffers": [{"uri": "data:application/octet-stream;base64," +
                         base64.b64encode(blob).decode("ascii"), "byteLength": len(blob)}],
            "meshes": [{"primitives": [prim]}],
            "nodes": [{"mesh": 0, "rotation":
                       [0, math.sin(rotation / 2), 0, math.cos(rotation / 2)]}],
            "scenes": [{"nodes": [0]}], "scene": 0, "materials": materials
        }
        report = Collector()
        model3d._check_mesh_quality(g, self.root / "model.gltf", None, self.root,
                                    "model.gltf", report)
        return {item[0] for item in report.items}

    @staticmethod
    def cube():
        # Indexing a manifold cube verifies that healthy volume isn't labelled flat.
        pos = [[-1, 0, -1], [1, 0, -1], [1, 2, -1], [-1, 2, -1],
               [-1, 0, 1], [1, 0, 1], [1, 2, 1], [-1, 2, 1]]
        indices = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7,
                   0, 1, 5, 0, 5, 4, 3, 7, 6, 3, 6, 2,
                   0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5]
        return pos, indices

    def test_rotated_cardboard_character_is_rejected(self):
        pos = [[-1, 0, 0], [1, 0, 0], [1, 2, 0], [-1, 2, 0]]
        codes = self.audit(pos, [0, 1, 2, 0, 2, 3], rotation=math.pi / 4)
        self.assertIn("M21", codes)

    def test_real_volume_is_not_rejected_after_rotation(self):
        pos, ix = self.cube()
        codes = self.audit(pos, ix, rotation=math.pi / 4)
        self.assertNotIn("M21", codes)
        self.assertNotIn("M12", codes)
        self.assertNotIn("M13", codes)

    def test_broken_uv_area(self):
        pos, ix = self.cube()
        self.assertIn("M15", self.audit(pos, ix, uvs=[[0, 0]] * len(pos)))

    def test_out_of_range_index(self):
        pos, ix = self.cube()
        ix[-1] = 99
        self.assertIn("M12", self.audit(pos, ix))

    def test_nonfinite_positions(self):
        pos, ix = self.cube()
        pos[0][0] = float("nan")
        self.assertIn("M12", self.audit(pos, ix))

    def test_inverted_normals(self):
        pos = [[0, 0, 0], [1, 0, 0], [0, 1, 0]] * 8
        ix = list(range(24))
        normals = [[0, 0, -1]] * 24
        self.assertIn("M14", self.audit(pos, ix, normals=normals))

    def test_texture_without_uv(self):
        pos, ix = self.cube()
        self.assertIn("M16", self.audit(pos, ix, texture_without_uv=True))

    def test_bad_skin_weights(self):
        pos, ix = self.cube()
        self.assertIn("M19", self.audit(pos, ix, weights=[[.9, .9, 0, 0]] * len(pos)))

    def test_invalid_pbr(self):
        pos, ix = self.cube()
        self.assertIn("M20", self.audit(pos, ix, pbr={"roughnessFactor": 1.4}))

    def test_nonmanifold_duplicate_face(self):
        pos, ix = self.cube()
        self.assertIn("M17", self.audit(pos, ix + ix[:3] * 2))


if __name__ == "__main__":
    unittest.main()
