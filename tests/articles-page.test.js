import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const miniProgramRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pageScript = readFileSync(resolve(miniProgramRoot, "pages/articles/index.js"), "utf8");
const pageMarkup = readFileSync(resolve(miniProgramRoot, "pages/articles/index.wxml"), "utf8");
const pageStyles = readFileSync(resolve(miniProgramRoot, "pages/articles/index.wxss"), "utf8");

test("space notice page directly renders uploaded notice files without tabs", () => {
  assert.doesNotMatch(pageScript, /tabs:/);
  assert.doesNotMatch(pageMarkup, /tab-row|请选择学习资料、教育动态或活动风采/);
  assert.match(pageScript, /getMaterials/);
  assert.match(pageMarkup, /wx:for="\{\{materials\}\}"/);
  assert.match(pageMarkup, /item\.file_name/);
  assert.match(pageScript, /空间公告/);
  assert.match(pageScript, /场地开放、活动安排与服务通知/);
  assert.doesNotMatch(pageScript, /学习资料|教育动态/);
});

test("material cards expose preview and seamless share actions in the list", () => {
  assert.match(pageScript, /MATERIAL_ACTIONS/);
  assert.match(pageScript, /savedFilePaths/);
  assert.match(pageScript, /restoreSavedFile\(item\)/);
  assert.match(pageMarkup, /class="material-card"/);
  assert.match(pageMarkup, /wx:if="\{\{item\.can_preview\}\}"[^>]*catchtap="previewMaterial"/);
  assert.match(pageMarkup, /catchtap="shareSavedFile"/);
  assert.match(pageMarkup, />转发<\/button>/);
  assert.doesNotMatch(pageMarkup, /catchtap="downloadMaterial"|下载并转发|>下载<\/button>/);
  assert.match(pageMarkup, /data-id="\{\{item\.id\}\}"/);
  assert.doesNotMatch(pageMarkup, /class="material-card"[^>]*bindtap="goDetail"/);
});

test("material list uses a compact file directory layout", () => {
  assert.match(pageMarkup, /\{\{item\.fileType\}\}/);
  assert.match(pageMarkup, /\{\{item\.fileIndex\}\}/);
  assert.match(pageStyles, /\.material-card/);
  assert.match(pageStyles, /\.material-title[\s\S]*-webkit-line-clamp:\s*2/);
  assert.match(pageStyles, /\.material-actions/);
});

test("non-material entries remain reachable as standalone content views", () => {
  assert.match(pageScript, /options\.type \|\| "material"/);
  assert.match(pageScript, /getArticles\(contentType\)/);
  assert.match(pageMarkup, /wx:for="\{\{articles\}\}"/);
});
