import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const markup = readFileSync(resolve(root, "custom-tab-bar/index.wxml"), "utf8");
const script = readFileSync(resolve(root, "custom-tab-bar/index.js"), "utf8");
const styles = readFileSync(resolve(root, "custom-tab-bar/index.wxss"), "utf8");

test("the unauthorised My tab is the explicit WeChat phone authorisation trigger", () => {
  assert.match(markup, /open-type="getPhoneNumber"/);
  assert.match(markup, /bindgetphonenumber="authorizeAndSwitch"/);
  assert.match(script, /authorizeAndSwitch/);
  assert.match(script, /authorizeParentWithPhone/);
  assert.match(script, /\/pages\/profile\/index/);
});

test("authorised parents switch to My without requesting their phone again", () => {
  assert.match(script, /isParentPhoneAuthorized/);
  assert.match(markup, /phoneAuthorized/);
  assert.match(markup, /bindtap="switchTab"/);
  assert.match(styles, /\.tab-button/);
});
