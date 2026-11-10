import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const base = fileURLToPath(new URL(".", import.meta.url));
const source = await readFile(join(base, "status-a1.mjs"), "utf8");
const verify = await readFile(join(base, "verify-a1.mjs"), "utf8");
const mutations = [
  {
    name: "fake-green-without-run-link",
    before: "const green = /^ЗЕЛЁНАЯ(?=\\s|$)/.test(status) && hasEvidence;",
    after: "const green = /^ЗЕЛЁНАЯ(?=\\s|$)/.test(status);",
  },
  {
    name: "ignore-incomplete-workflow",
    before: "const green = bad.length === 0 && !pending && good.length > 0;",
    after: "const green = bad.length === 0 && good.length > 0;",
  },
  {
    name: "hide-unfinished-items",
    before: "const left = rows.filter((row) => !row.green).slice(0, 5);",
    after: "const left = [];",
  },
];

for (const mutation of mutations) {
  if (!source.includes(mutation.before)) {
    throw new Error("Mutation insertion point vanished: " + mutation.name);
  }
  const tmp = await mkdtemp(join(tmpdir(), "status-a1-mutation-"));
  try {
    await writeFile(join(tmp, "status-a1.mjs"), source.replace(mutation.before, mutation.after));
    await writeFile(join(tmp, "verify-a1.mjs"), verify);
    const result = spawnSync(process.execPath, ["--test", join(tmp, "verify-a1.mjs")], {
      cwd: process.cwd(),
      encoding: "utf8",
      timeout: 30000,
    });
    if (result.error) throw result.error;
    if (result.status === 0) {
      throw new Error("Mutation was NOT caught: " + mutation.name);
    }
    if (result.status !== 1) {
      throw new Error("Mutation failed to execute normally: " + mutation.name +
        " / exit=" + result.status + " / " + result.stderr.slice(0, 250));
    }
    process.stdout.write("CAUGHT " + mutation.name + "\n");
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}
