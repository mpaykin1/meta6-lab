import { execFileSync } from "node:child_process";
import { repositoryFromRemote, updateStatus } from "./status-a1.mjs";

// Git remote is the authoritative source for the repository; the API credential
// arrives through standard input, not through a CI-specific branch in game code.
const remote = execFileSync("git", ["remote", "get-url", "origin"], { encoding: "utf8" }).trim();
const repository = repositoryFromRemote(remote);

let token = "";
for await (const chunk of process.stdin) token += chunk;
try {
  await updateStatus({ repository, token: token.trim() });
} catch (error) {
  process.stderr.write(String(error.stack ?? error) + "\n");
  process.exitCode = 1;
}
