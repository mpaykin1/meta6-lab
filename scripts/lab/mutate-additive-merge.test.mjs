#!/usr/bin/env node
// Regression suite for additive-merge preflight. Re-run with a deliberately
// mutated verifier: this same test must turn RED on a skipped history check.
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const subject = resolve(process.argv[2] || new URL("./verify-additive-merge.mjs", import.meta.url).pathname);
const dir = mkdtempSync(join(tmpdir(), "mg-merge-gate-"));
const git = (...args) => {
  const r = spawnSync("git", args, { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 0, "git " + args.join(" ") + ": " + r.stderr);
  return r.stdout.trim();
};
const put = (path, value) => {
  mkdirSync(dirname(join(dir, path)), { recursive: true });
  writeFileSync(join(dir, path), value);
};
const check = (base, head, pass) => {
  const r = spawnSync(process.execPath, [subject, base, head], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status === 0, pass, "expected " + (pass ? "PASS" : "BLOCK") + " for " + head + "; " + r.stdout + r.stderr);
};
try {
  git("init", "-q");
  git("config", "user.email", "tester@example.invalid");
  git("config", "user.name", "Test");
  put("README.md", "base\n");
  git("add", "-A");
  git("commit", "-qm", "initial");
  git("branch", "-M", "main");
  const root = git("rev-parse", "HEAD");

  git("checkout", "-qb", "add-only");
  put("preview/add.js", "export const a = 1;\n");
  git("add", "-A"); git("commit", "-qm", "add new file");
  check("main", "add-only", true);

  git("checkout", "-q", "main"); git("checkout", "-qb", "edits");
  put("README.md", "tampered\n");
  git("add", "-A"); git("commit", "-qm", "edit existing file");
  check("main", "edits", false);

  git("checkout", "-q", "main"); git("checkout", "-qb", "bad-history");
  put(".github/protected/sum.txt", "bad\n");
  git("add", "-A"); git("commit", "-qm", "edit protected file");
  git("rm", "-q", ".github/protected/sum.txt");
  git("commit", "-qm", "undo snapshot but not history");
  put("preview/historic.js", "export const h = 1;\n");
  git("add", "-A"); git("commit", "-qm", "add file after protected history");
  check("main", "bad-history", false);

  git("checkout", "-q", "main");
  put("preview/collision.js", "main\n");
  git("add", "-A"); git("commit", "-qm", "main asset");
  git("checkout", "-qb", "collision", root);
  put("preview/collision.js", "branch\n");
  git("add", "-A"); git("commit", "-qm", "branch asset");
  check("main", "collision", false);
  console.log("PASS: additive, modified, historic-protected and collision cases");
} finally { rmSync(dir, { recursive: true, force: true }); }
