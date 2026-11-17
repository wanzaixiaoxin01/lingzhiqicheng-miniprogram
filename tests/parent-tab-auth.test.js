import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(root, "custom-tab-bar/index.wxml"), "utf8");
const script = readFileSync(resolve(root, "custom-tab-bar/index.js"), "utf8");
const styles = readFileSync(resolve(root, "custom-tab-bar/index.wxss"), "utf8");

test("the My tab always opens the profile page before phone authorisation", () => {
  assert.doesNotMatch(markup, /open-type="getPhoneNumber"/);
  assert.doesNotMatch(markup, /bindgetphonenumber="authorizeAndSwitch"/);
  assert.doesNotMatch(script, /authorizeAndSwitch/);
  assert.match(markup, /bindtap="switchTab"/);
  assert.match(script, /\/pages\/profile\/index/);
});

test("all bottom tabs use the same native tab switching interaction", () => {
  assert.doesNotMatch(script, /isParentPhoneAuthorized/);
  assert.doesNotMatch(markup, /phoneAuthorized/);
  assert.match(markup, /bindtap="switchTab"/);
  assert.doesNotMatch(styles, /\.tab-button/);
});
