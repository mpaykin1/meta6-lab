#!/usr/bin/env node
// Conservative preflight before merging main into an additive PR.
// This helper never replaces the protected STOROZHA or KONTUR gates.
import { spawnSync } from "node:child_process";

const [base, head] = process.argv.slice(2);
function block(reason) { console.error("BLOCK: " + reason); process.exit(1); }
function git(...args) {
  const r = spawnSync("git", args, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (r.error || r.status !== 0) {
    const err = new Error((r.stderr || r.error?.message || "git failed").trim());
    err.code = r.status;
    throw err;
  }
  return r.stdout.trim();
}
if (!base || !head || base.startsWith("-") || head.startsWith("-")) {
  console.error("Usage: node verify-additive-merge.mjs <base-ref> <head-ref>");
  process.exit(2);
}
try {
  git("rev-parse", "--verify", base + "^{commit}");
  git("rev-parse", "--verify", head + "^{commit}");
  const changes = git("diff", "--name-status", "-z", base + "..." + head).split("\0").filter(Boolean);
  if (!changes.length) block("no changes to sync");
  const added = [];
  for (let i = 0; i < changes.length;) {
    const status = changes[i++];
    const path = changes[i++];
    if (status !== "A" || !path) block("not an additive change: " + status + " " + (path || ""));
    try { git("cat-file", "-e", base + ":" + path); block("collision in latest main: " + path); }
    catch (err) { if (err.code !== 1 && err.code !== 128) throw err; }
    const sha = git("rev-parse", head + ":" + path);
    if (!/^[0-9a-f]{40}$/.test(sha) || git("cat-file", "-t", sha) !== "blob") block("invalid blob: " + path);
    added.push({ path, mode: "100644", type: "blob", sha });
  }
  const protectedCommits = git("log", "--format=%H", base + ".." + head, "--",
    ".github/protected", "scripts/storozha", "scripts/kontur", "scripts/meta-bot",
    "scripts/meta-games-guard.sh").split("\n").filter(Boolean);
  if (protectedCommits.length > 0) block("protected history: " + protectedCommits.join(", "));
  console.log(JSON.stringify({ result: "PASS", base, head, added }));
} catch (err) { block("preflight unavailable: " + err.message); }
