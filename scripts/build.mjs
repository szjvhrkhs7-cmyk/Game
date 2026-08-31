import { cp, mkdir, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const files = ["index.html", "styles.css", "manifest.webmanifest", "sw.js", "assets", "src"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of files) await cp(resolve(root, entry), resolve(output, entry), { recursive: true });

const html = await readFile(resolve(output, "index.html"), "utf8");
const required = ["gameCanvas", "steeringWheel", "gasButton", "menuDialog", "src/app.js"];
for (const marker of required) {
  if (!html.includes(marker)) throw new Error(`Production build is missing: ${marker}`);
}

console.log(`Built ${files.length} application entries in dist/`);
