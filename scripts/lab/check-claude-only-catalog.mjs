#!/usr/bin/env node
// META GAMES: fail-closed provenance guard for the ad-free Claude game catalogue.
// New entries must be declared with an actual Claude-source GitHub PR/commit.
import { readFileSync, existsSync } from "node:fs";

const BASELINE_PATHS = [
  "../games/sumerki-i-pepel-2/",
  "../games/basement-b2/",
  "../observer-world-en-v7/",
  "../ashen-sumerek/",
  "../underwater-world/",
  "../three-worlds-game/",
  "../games/twilight-isle-classic/",
  "../games/twilight-isles/",
  "../games/archer-in-the-fog/",
  "../games/broken-city/",
  "../reference/sumerechny-arkhipelag/",
  "../reference/sunken-city/",
  "../games/rainbow-acceleration/",
  "../games/asqura-ilya-reference/",
  "../games/broken-city-copy/",
  "../reference/sumerek-golden/pod-i-nad-68b2ecd3.html",
  "../reference/abyss-glow-2026-11-09/"
];
const DENIED = /veil[-_ ]terraces/i;
const fail = message => { throw new Error("[Claude-only catalogue] " + message); };
const catalogue = readFileSync("claude-games/index.html", "utf8");
const added = JSON.parse(readFileSync("claude-games/approved-new-games.json", "utf8"));
if (!Array.isArray(added)) fail("approved-new-games.json must contain an array");

const allowed = new Set(BASELINE_PATHS);
for (const game of added) {
  if (!game || typeof game.href !== "string" || typeof game.source_path !== "string" ||
      game.created_by !== "Claude" || typeof game.claude_proof !== "string") {
    fail("Every new game requires href, source_path, created_by=Claude and claude_proof");
  }
  if (!/^https:\/\/github\.com\/mpaykin1\/(?:meta6|meta6-lab)\/(?:pull\/\d+|commit\/[0-9a-f]{40})$/.test(game.claude_proof)) {
    fail("Claude game requires a specific GitHub PR/commit, not an unverified name");
  }
  if (!/^[\w./-]+$/.test(game.source_path) || game.source_path.includes("..") ||
      !game.source_path.endsWith("/")) fail("Invalid source_path");
  if (!/^\.\.\/[a-z0-9._/-]+(?:\/|\.html)$/.test(game.href) || DENIED.test(game.href)) {
    fail("Unknown or forbidden game route: " + game.href);
  }
  if (allowed.has(game.href)) fail("Duplicate source route: " + game.href);
  allowed.add(game.href);
}
// A static Pages route cannot return HTTP 410: only a non-playable redirect may remain.
if (!existsSync("games/veil-terraces/index.html") ||
    !readFileSync("games/veil-terraces/index.html", "utf8").includes('data-game-disabled="veil-terraces"')) {
  fail("Forbidden game route must be a non-playable catalogue redirect");
}
if (DENIED.test(catalogue)) fail("Veil Terraces must not appear in catalogue HTML");
const storefront = readFileSync("meta-games/index.html", "utf8");
if (DENIED.test(storefront)) fail("Veil Terraces must not appear on the main storefront");
for (const match of storefront.matchAll(/<a class="game" href="([^"]+)"/g)) {
  if (!BASELINE_PATHS.includes(match[1]) && !added.some(game => game.href === match[1])) {
    fail("Unapproved main storefront game route: " + match[1]);
  }
}

const cards = [...catalogue.matchAll(/<article\s+class="game-card"\b[^>]*>[\s\S]*?<\/article>/g)];
if (cards.length !== allowed.size) fail("Catalogue count differs from Claude-only allowlist");
const seen = new Set();
for (const [i, match] of cards.entries()) {
  const card = match[0];
  const links = [...card.matchAll(/<a class="(?:art|play-link)" href="([^"]+)"/g)].map(x => x[1]);
  if (links.length !== 2 || links[0] !== links[1] || !allowed.has(links[0])) {
    fail("Unapproved or mismatching card links at position " + (i + 1));
  }
  if (seen.has(links[0])) fail("Duplicate game: " + links[0]);
  seen.add(links[0]);
  const number = card.match(/class="cover-number">([0-9]+)<\/span>/);
  if (!number || Number(number[1]) !== i + 1) fail("Card numbering error at " + links[0]);
}
const runtimeMatch = catalogue.match(/const approvedGamePaths = new Set\((\[[\s\S]*?\])\);/);
if (!runtimeMatch) fail("Missing fail-closed browser allowlist");
const runtime = JSON.parse(runtimeMatch[1]);
if (new Set(runtime).size !== allowed.size || runtime.some(path => !allowed.has(path))) {
  fail("Browser allowlist and approved game sources differ");
}
if (!catalogue.includes("<b>" + cards.length + "</b> миров в каталоге")) {
  fail("Displayed catalogue count is stale");
}
console.log("Claude-only catalogue: " + cards.length + " allowed game paths.");
