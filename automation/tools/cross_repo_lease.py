#!/usr/bin/env python3
"""Local atomic lease for cross-repo memory runs. Does not lock remote GitHub."""
import argparse
import contextlib
import json
import os
import pathlib
import subprocess
import sys
import time
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[2]
LOCK = ROOT / ".cross-repo-memory.lock"

@contextlib.contextmanager
def lease(path, ttl=300, clock=time.time):
    token = uuid.uuid4().hex
    payload = {"token": token, "pid": os.getpid(), "created_epoch": clock(), "ttl_seconds": ttl}
    try:
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    except FileExistsError:
        raise RuntimeError("Lease busy; no writes permitted")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as out:
            json.dump(payload, out)
        yield payload
    finally:
        try:
            current = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
            if current.get("token") == token:
                pathlib.Path(path).unlink()
        except (OSError, ValueError):
            pass

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--lock", type=pathlib.Path, default=LOCK)
    p.add_argument("--ttl", type=int, default=300)
    p.add_argument("command", nargs=argparse.REMAINDER)
    args = p.parse_args()
    if not args.command:
        p.error("Provide command after --")
    if args.ttl < 1:
        p.error("ttl must be positive")
    cmd = args.command[1:] if args.command[0] == "--" else args.command
    try:
        with lease(args.lock, args.ttl):
            result = subprocess.run(cmd, cwd=ROOT, timeout=args.ttl)
            raise SystemExit(result.returncode)
    except RuntimeError as e:
        p.exit(3, str(e)+"\n")
    except subprocess.TimeoutExpired:
        p.exit(124, "Lease command timed out\n")
if __name__ == "__main__":
    main()
