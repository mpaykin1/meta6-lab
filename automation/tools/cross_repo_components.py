#!/usr/bin/env python3
"""Validate source-linked reusable component candidates; no automatic approvals."""
import argparse
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
CATALOG = ROOT / "docs/development-memory/cross-repo/components.json"
SHA = re.compile(r"^[0-9a-f]{40}$")
STAGES = ("DISCOVERED", "LAB_VERIFIED", "INTEGRATION_VERIFIED", "OWNER_APPROVED")
REQUIRED = ("id", "category", "repository", "source_sha", "license", "status", "evidence", "test")

def validate(data):
    errors = []
    if data.get("schema_version") != 1 or not isinstance(data.get("components"), list):
        return ["Invalid schema"]
    seen = set()
    for i, item in enumerate(data["components"]):
        name = item.get("id", f"row:{i}")
        if name in seen:
            errors.append(f"{name}: duplicate id")
        seen.add(name)
        for key in REQUIRED:
            if not isinstance(item.get(key), str) or not item[key].strip():
                errors.append(f"{name}: missing {key}")
        if not SHA.fullmatch(item.get("source_sha", "")):
            errors.append(f"{name}: invalid source_sha")
        if item.get("status") not in STAGES:
            errors.append(f"{name}: invalid status")
        if item.get("status") in STAGES[1:] and item.get("test") in ("UNKNOWN", "NONE"):
            errors.append(f"{name}: verified stage requires test evidence")
        if item.get("status") == "OWNER_APPROVED" and not item.get("owner_approval"):
            errors.append(f"{name}: explicit owner approval evidence required")
    return errors

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--catalog", type=pathlib.Path, default=CATALOG)
    p.add_argument("--check", action="store_true")
    args = p.parse_args()
    data = json.loads(args.catalog.read_text(encoding="utf-8"))
    errors = validate(data)
    if errors:
        p.exit(2, "\n".join(errors)+"\n")
    print(json.dumps({"status": "VALID", "components": len(data["components"]),
                      "owner_approved": sum(c["status"] == "OWNER_APPROVED" for c in data["components"])},
                     ensure_ascii=False))
if __name__ == "__main__":
    main()
