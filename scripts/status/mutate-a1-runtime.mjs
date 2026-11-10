import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const base = fileURLToPath(new URL(".", import.meta.url));
const original = await readFile(join(base, "status-a1.mjs"), "utf8");
const verify = await readFile(join(base, "verify-a1.mjs"), "utf8");
const mutations = [
  {
    name: "hardcoded-repo-deception",
    before: 'return match[1] + "/" + match[2];',
    after: 'return "mpaykin1/meta6-lab";',
  },
  {
    name: "accept-foreign-origin",
    before: 'if (!match) throw new Error("Origin must point to a GitHub repository");',
    after: 'if (!match) return "forged/repository";',
  },
  {
    name: "silent-missing-credential",
    before: 'if (!token) throw new Error("GitHub API token required");',
    after: 'if (!token) return;',
  },
];

for (const mutation of mutations) {
  if (!original.includes(mutation.before)) {
    throw new Error("Mutation insertion point vanished: " + mutation.name);
  }
  const tmp = await mkdtemp(join(tmpdir(), "status-a1-runtime-mutation-"));
  try {
    await writeFile(join(tmp, "status-a1.mjs"), original.replace(mutation.before, mutation.after));
    await writeFile(join(tmp, "verify-a1.mjs"), verify);
    const result = spawnSync(process.execPath, ["--test", join(tmp, "verify-a1.mjs")], {
      cwd: process.cwd(), encoding: "utf8", timeout: 30000,
    });
    if (result.error) throw result.error;
    if (result.status !== 1) {
      throw new Error("Mutation not caught normally: " + mutation.name +
        " / exit=" + result.status + " / " + result.stderr.slice(0, 250));
    }
    process.stdout.write("CAUGHT " + mutation.name + "\n");
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}
