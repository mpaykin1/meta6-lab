import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseFinish, renderStatus, summarizeRuns } from "./status-a1.mjs";

const ids = [
  "M1", "M2", "M3", "M4", "M5", "M6", "B1", "B2", "B3",
  "B4", "B5", "B6", "B7", "L1", "L2", "L3", "L4", "P1",
];
const approved = new Set(["M1", "M2", "M3", "M4", "M5", "B1", "P1"]);
const proof = "ЗЕЛЁНАЯ — [прогон](https://github.com/mpaykin1/meta6-lab/actions/runs/123)";
const makeFinish = (overrides = {}) => [
  "| ID | Что проверяется | Скрипт | Статус |",
  "|---|---|---|---|",
  ...ids.map((id) => "| " + id + " | Тест " + id + " | скрипт | " +
    (overrides[id] ?? (approved.has(id) ? proof : "НЕТ")) + " |"),
].join("\n");
const sha = "a".repeat(40);
const url = "https://github.com/mpaykin1/meta6-lab/actions/runs/999";
const makeRun = (status, conclusion, name = "Kontur", headSha = sha) => ({
  head_sha: headSha,
  name,
  status,
  conclusion,
  html_url: url,
});

test("real FINISH has 18 distinct checks and evidence links", () => {
  const rows = parseFinish(readFileSync("rules/09-platforma/FINISH.md", "utf8"));
  assert.equal(rows.length, 18);
  assert.ok(rows.filter((row) => row.green).length <= 18);
});

test("only evidenced green statuses count; forged marker is rejected", () => {
  const rows = parseFinish(makeFinish({ M6: "ЗЕЛЁНАЯ", M2: "ЗЕЛЁНАЯ — no action link" }));
  assert.equal(rows.filter((row) => row.green).length, 6);
  assert.equal(rows.find((row) => row.id === "M6").green, false);
  assert.equal(rows.find((row) => row.id === "M2").green, false);
});

test("a pending or cancelled job cannot turn checks green", () => {
  const running = [makeRun("completed", "success"), makeRun("in_progress", null, "Pages")];
  assert.equal(summarizeRuns(running, sha, "mpaykin1/meta6-lab").green, false);
  assert.equal(summarizeRuns([makeRun("completed", "cancelled")], sha, "repo").green, false);
  assert.equal(summarizeRuns([makeRun("completed", "success")], sha, "repo").green, true);
  assert.equal(summarizeRuns([makeRun("completed", "success", "A1 STATUS")], sha, "repo").green, false);
});

test("render keeps all required fields, unfinished checks and at most 20 lines", () => {
  const status = renderStatus({
    rows: parseFinish(makeFinish()),
    runs: [makeRun("completed", "failure")],
    sha,
    lastChange: "2026-11-10T05:07:00Z",
    repository: "mpaykin1/meta6-lab",
  });
  assert.match(status, /^last_change: /m);
  assert.match(status, /^last_sha: [a-f0-9]{40}$/m);
  assert.match(status, /^finish: 7\/18$/m);
  assert.match(status, /^checks: красный — https:\/\/github.com\//m);
  assert.match(status, /broken:\n- Kontur: failure/m);
  assert.match(status, /left:\n- M6:/m);
  assert.equal((status.match(/\n- /g) ?? []).length, 6);
  assert.ok(status.trimEnd().split("\n").length <= 20);
});

test("missing FINISH row must fail instead of silently reporting 100%", () => {
  assert.throws(() => parseFinish(makeFinish().replace(/\| P1 \|[^\n]+/, "")), /18 unique/);
});
