import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const WORKFLOW_NAME = "A1 STATUS";

export function parseFinish(markdown) {
  const rows = [];
  for (const line of markdown.split("\n")) {
    const cells = line.split("|").slice(1, -1).map((value) => value.trim());
    if (!/^[MBLP]\d+$/.test(cells[0] ?? "")) continue;
    if (cells.length !== 4) throw new Error("Malformed FINISH row: " + cells[0]);
    const status = cells[3];
    const hasEvidence = /\[прогон\]\(https:\/\/github\.com\/[^)]+\/actions\/runs\/\d+\)/.test(status);
    const green = /^ЗЕЛЁНАЯ(?=\s|$)/.test(status) && hasEvidence;
    const title = cells[1].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[\x60*]/g, "").replace(/\s+/g, " ").trim();
    rows.push({ id: cells[0], title, green });
  }
  if (rows.length !== 18 || new Set(rows.map((row) => row.id)).size !== 18) {
    throw new Error("Expected 18 unique FINISH checks, found " + rows.length);
  }
  return rows;
}

export function summarizeRuns(runs, sha, repository) {
  const scope = runs.filter((run) => run.head_sha === sha && run.name !== WORKFLOW_NAME);
  const bad = scope.filter((run) => run.status === "completed" &&
    !["success", "skipped"].includes(run.conclusion));
  const pending = scope.find((run) => run.status !== "completed");
  const good = scope.filter((run) => run.status === "completed" && run.conclusion === "success");
  const green = bad.length === 0 && !pending && good.length > 0;
  const chosen = bad[0] ?? pending ?? good[0] ?? runs.find((run) => run.name !== WORKFLOW_NAME);
  const url = chosen?.html_url ?? "https://github.com/" + repository + "/actions";
  const broken = bad.slice(0, 5).map((run) => {
    return run.name + ": " + run.conclusion + " — " + run.html_url;
  });
  if (broken.length === 0 && pending) {
    broken.push("проверка выполняется: " + pending.name + " — " + pending.html_url);
  }
  if (broken.length === 0 && good.length === 0) {
    broken.push("нет завершённых проверок текущего SHA — " + url);
  }
  return { green, url, broken };
}

export function renderStatus({ rows, runs, sha, lastChange, repository }) {
  const finished = rows.filter((row) => row.green).length;
  const checks = summarizeRuns(runs, sha, repository);
  const left = rows.filter((row) => !row.green).slice(0, 5);
  const lines = [
    "last_change: " + lastChange,
    "last_sha: " + sha,
    "finish: " + finished + "/" + rows.length,
    "checks: " + (checks.green ? "зелёный" : "красный") + " — " + checks.url,
    "broken:",
    ...checks.broken.map((line) => "- " + line),
    "left:",
    ...left.map((row) => "- " + row.id + ": " + row.title.slice(0, 98)),
  ];
  if (lines.length > 20) throw new Error("STATUS.md exceeds 20 lines");
  return lines.join("\n") + "\n";
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repository || !token) throw new Error("GITHUB_REPOSITORY and GITHUB_TOKEN required");
  const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
  // Ignore our own status commits: the last meaningful change must remain stable.
  const commit = git("log", "-1", "--format=%H%n%cI", "--invert-grep",
    "--grep=^chore(status-a1): refresh$").split("\n");
  const sha = commit[0];
  const lastChange = commit[1];
  if (!/^[0-9a-f]{40}$/.test(sha) || !lastChange) throw new Error("Invalid git history");
  const api = "https://api.github.com/repos/" + repository + "/actions/runs?branch=main&per_page=100";
  const response = await fetch(api, {
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error("GitHub Actions API returned " + response.status);
  const payload = await response.json();
  if (!Array.isArray(payload.workflow_runs)) throw new Error("GitHub Actions runs missing");
  const finish = await readFile("rules/09-platforma/FINISH.md", "utf8");
  const status = renderStatus({
    rows: parseFinish(finish),
    runs: payload.workflow_runs,
    sha,
    lastChange,
    repository,
  });
  await writeFile("STATUS.md", status);
  process.stdout.write(status);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    process.stderr.write(String(error.stack ?? error) + "\n");
    process.exitCode = 1;
  });
}
