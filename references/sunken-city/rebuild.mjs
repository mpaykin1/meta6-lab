// Rebuild byte-exact original water(1).html from the ordered text chunks.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const dir = dirname(fileURLToPath(import.meta.url));
const prefix = "(globalThis.__WATER_REF_PARTS__ ||= []).push(";
const parts = Array.from({ length: 19 }, (_, i) => {
 const js = readFileSync(join(dir, "chunks", String(i).padStart(2, "0") + ".js"), "utf8").trim();
 if (!js.startsWith(prefix) || !js.endsWith(");")) throw new Error("Corrupt chunk: " + i);
 return JSON.parse(js.slice(prefix.length, -2));
});
writeFileSync(join(dir, "water-original.html"), parts.join(""), "utf8");
