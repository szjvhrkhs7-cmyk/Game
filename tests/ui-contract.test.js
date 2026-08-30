import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const app = readFileSync(resolve(root, "src/app.js"), "utf8");
const manifest = JSON.parse(readFileSync(resolve(root, "manifest.webmanifest"), "utf8"));
const serviceWorker = readFileSync(resolve(root, "sw.js"), "utf8");

test("все ID-селекторы приложения существуют в разметке", () => {
  const selectors = [...app.matchAll(/\$\(["']#([A-Za-z][\w-]*)["']\)/g)].map((match) => match[1]);
  const markupSources = `${html}\n${app}`;
  const missing = [...new Set(selectors)].filter((id) => !markupSources.includes(`id="${id}"`));
  assert.deepEqual(missing, []);
});

test("идентификаторы элементов не дублируются", () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepEqual([...new Set(duplicates)], []);
});

test("PWA ссылается только на существующие локальные файлы", () => {
  for (const icon of manifest.icons) assert.equal(existsSync(resolve(root, icon.src)), true, icon.src);
  const shellFiles = [...serviceWorker.matchAll(/"\.\/([^"?]+)"/g)].map((match) => match[1]);
  for (const relativePath of shellFiles) assert.equal(existsSync(resolve(root, relativePath)), true, relativePath);
});

test("в интерфейсе не осталось названий и ресурсов прежней игры", () => {
  const source = `${html}\n${app}\n${readFileSync(resolve(root, "styles.css"), "utf8")}`.toLowerCase();
  for (const staleTerm of ["бананов", "котик", "face-boroda", "face-ryzhik", "src/game.js", "src/levels.js"]) {
    assert.equal(source.includes(staleTerm), false, `найдено устаревшее значение: ${staleTerm}`);
  }
});
