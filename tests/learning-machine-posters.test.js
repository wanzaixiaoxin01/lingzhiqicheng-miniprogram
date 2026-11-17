import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pageScript = readFileSync(resolve(root, "pages/growth/index.js"), "utf8");
const pageMarkup = readFileSync(resolve(root, "pages/growth/index.wxml"), "utf8");
const apiScript = readFileSync(resolve(root, "services/api.js"), "utf8");

test("learning machine posters are loaded from server configuration", () => {
  assert.match(apiScript, /getLearningMachinePosters/);
  assert.match(apiScript, /\/api\/public\/learning-machine-posters/);
  assert.match(pageScript, /getLearningMachinePosters/);
  assert.match(pageScript, /onLoad\(\)/);
  assert.match(pageScript, /marketingImages:\s*\[\]/);
  assert.doesNotMatch(pageScript, /\/assets\/learn-machine\//);
});

test("learning machine page has loading, configured and empty states", () => {
  assert.match(pageMarkup, /wx:if="\{\{loadingPosters\}\}"/);
  assert.match(pageMarkup, /wx:elif="\{\{marketingImages\.length\}\}"/);
  assert.match(pageMarkup, /暂无学习机海报/);
});
