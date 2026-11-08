import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const miniProgramRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pageScript = readFileSync(resolve(miniProgramRoot, "pages/articles/index.js"), "utf8");
const pageMarkup = readFileSync(resolve(miniProgramRoot, "pages/articles/index.wxml"), "utf8");

test("learning materials page directly renders uploaded materials without tabs", () => {
  assert.doesNotMatch(pageScript, /tabs:/);
  assert.doesNotMatch(pageMarkup, /tab-row|请选择学习资料、教育动态或活动风采/);
  assert.match(pageScript, /getMaterials/);
  assert.match(pageMarkup, /wx:for="\{\{materials\}\}"/);
  assert.match(pageMarkup, /data-kind="material"/);
  assert.match(pageMarkup, /item\.file_name/);
});

test("non-material entries remain reachable as standalone content views", () => {
  assert.match(pageScript, /options\.type \|\| "material"/);
  assert.match(pageScript, /getArticles\(contentType\)/);
  assert.match(pageMarkup, /wx:for="\{\{articles\}\}"/);
});
