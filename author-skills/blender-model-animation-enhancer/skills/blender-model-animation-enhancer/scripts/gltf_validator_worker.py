#!/usr/bin/env python3
"""Official Khronos glTF-Validator CLI bridge. No faux validation substitutes.

The required official `gltf_validator --stdout input.glb` implementation is
external; this wrapper checks its machine-readable diagnostics, then commits
only validated files. No validation report is written to disk.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile


def find_validator(requested: str | None) -> str:
    name = requested or os.environ.get('GLTF_VALIDATOR_BIN') or 'gltf_validator'
    exe = shutil.which(name)
    if exe:
        return exe
    candidate = Path(name).expanduser()
    if candidate.is_file():
        return str(candidate.resolve())
    raise FileNotFoundError(
        'Official Khronos gltf_validator not installed. '
        'Build or download from https://github.com/KhronosGroup/glTF-Validator'
    )


def get_report(cli: str, glb: Path, timeout: int) -> dict:
    result = subprocess.run(
        [cli, '--stdout', '--validate-resources', str(glb)],
        capture_output=True, text=True, timeout=timeout, check=False,
    )
    if not result.stdout.strip():
        raise RuntimeError('glTF Validator returned no JSON: ' + result.stderr[-900:])
    try:
        report = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise RuntimeError('glTF Validator returned invalid JSON') from exc
    issues = report.get('issues')
    if not isinstance(issues, dict) or not all(
        isinstance(issues.get(key), int) for key in ('numErrors', 'numWarnings')
    ):
        raise RuntimeError('glTF Validator report has no trusted issues summary')
    if issues['numErrors'] or result.returncode:
        descriptions = [
            f"{i.get('code', 'ISSUE')}: {i.get('message', '')}"
            for i in issues.get('messages', [])
            if i.get('severity') == 0
        ][:4]
        raise RuntimeError(
            f"glTF Validator rejected GLB: {issues['numErrors']} errors "
            f"(exit={result.returncode}). {'; '.join(descriptions)}"
        )
    return report


def check_validation(cli: str, source: Path, timeout: int, strict: bool) -> tuple[int,int]:
    report=get_report(cli,source,timeout)
    issues=report['issues']
    warnings=issues['numWarnings']
    if strict and warnings:
        raise RuntimeError(f'glTF Validator strict mode: {warnings} warnings')
    return issues['numErrors'],warnings


def main(argv: list[str] | None = None) -> int:
    parser=argparse.ArgumentParser(description='Khronos glTF 2.0 validation gate')
    parser.add_argument('--input', required=True, help='A GLB to validate')
    parser.add_argument('--output', required=True, help='Different path for accepted GLB')
    parser.add_argument('--validator-bin', default=None)
    parser.add_argument('--strict', action='store_true', help='Reject warnings too')
    parser.add_argument('--timeout', type=int, default=120)
    parser.add_argument('--overwrite', action='store_true')
    args=parser.parse_args(argv)
    original=Path(args.input).expanduser().resolve()
    destination=Path(args.output).expanduser().resolve()
    if not original.is_file() or original.suffix.lower() != '.glb':
        parser.error('Input must be an existing .glb')
    if destination == original or destination.suffix.lower() != '.glb':
        parser.error('Output must be a distinct .glb path')
    if destination.exists() and not args.overwrite:
        parser.error('Output exists (use --overwrite)')
    if args.timeout < 10 or args.timeout > 7200:
        parser.error('--timeout must be between 10 and 7200 seconds')
    try:
        validator=find_validator(args.validator_bin)
        errors,warnings=check_validation(validator,original,args.timeout,args.strict)
        destination.parent.mkdir(parents=True,exist_ok=True)
        # Atomic publish. If the validator fails, no destination is touched.
        with tempfile.NamedTemporaryFile(
            dir=destination.parent, prefix='.gltf-validated-', suffix='.glb', delete=False
        ) as f:
            tmp=Path(f.name)
        try:
            shutil.copy2(original,tmp)
            os.replace(tmp,destination)
        finally:
            tmp.unlink(missing_ok=True)
        print(f'[gltf-validator] accepted: errors={errors}, warnings={warnings}, output={destination}')
        return 0
    except (FileNotFoundError,RuntimeError,subprocess.TimeoutExpired,OSError) as exc:
        print(f'[gltf-validator] blocked: {exc}',file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
