# Repair Bot

`node scripts/repair-bot/repair-json.mjs` checks tracked JSON files from the repository root.
It removes a leading UTF-8 BOM and trailing commas only when the result parses as JSON.
Strings and already valid files are preserved.

The bot first reads and validates the entire batch. If any JSON cannot be read or repaired,
it exits with code 2 and applies none of the planned changes. Missing tracked files and
symbolic links (including linked parent directories) are errors, rather than successful skips.
This is a preflight guarantee, not a filesystem transaction: an I/O failure during writes
can still leave earlier writes applied. The scheduled workflow publishes no repair PR on failure.

Run `node scripts/repair-bot/selftest.mjs` for both the original fixture and safety regressions.
`node scripts/repair-bot/mutate-repair-safety.mjs` independently verifies three fault injections.
Tests create their own temporary repositories and never change an installed game.

This repairer fixes JSON syntax. It does not repair gameplay or arbitrary JavaScript behavior.
