import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const script = readFileSync(resolve(root, "pages/profile/index.js"), "utf8");
const markup = readFileSync(resolve(root, "pages/profile/index.wxml"), "utf8");
const styles = readFileSync(resolve(root, "pages/profile/index.wxss"), "utf8");

test("profile loads the authenticated parent dashboard", () => {
  assert.match(script, /getParentDashboard/);
  assert.match(script, /ensureParentSession/);
  assert.match(script, /withParentSession/);
  assert.match(script, /selectStudent/);
  assert.match(script, /activeStudent/);
});

test("profile supports phone authorisation, no-match and multiple-child states", () => {
  assert.match(markup, /open-type="getPhoneNumber"/);
  assert.match(markup, /bindgetphonenumber="authorizePhone"/);
  assert.match(markup, /暂未查询到报名信息/);
  assert.match(markup, /wx:for="\{\{dashboard\.students\}\}"/);
  assert.match(markup, /data-student-id="\{\{item\.id\}\}"/);
  assert.match(markup, /student-tab/);
  assert.match(markup, /student-tab-active/);
  assert.match(markup, /aria-selected/);
  assert.match(markup, /授权手机号，查看孩子成长记录/);
  assert.match(markup, /授权获取微信手机号/);
  assert.doesNotMatch(markup, /微信手机号登录/);
  assert.doesNotMatch(markup, /PARENT CENTER|查看孩子的报名信息与到店记录/);
});

test("profile shows enrolment details and attendance timeline", () => {
  assert.match(markup, /累计到店/);
  assert.match(markup, /到店记录/);
  assert.doesNotMatch(markup, /上课记录|累计上课/);
  assert.match(markup, /activeStudent\.enrollments/);
  assert.match(markup, /activeStudent\.attendance_records/);
  assert.match(markup, /attendance_date/);
  assert.match(markup, /attendance_period_label/);
  assert.match(styles, /\.attendance-timeline/);
  assert.match(styles, /\.student-switcher/);
  assert.match(styles, /\.student-tab-active/);
});

test("profile de-emphasizes the expiry date without showing a duration", () => {
  assert.match(markup, /class="validity-row validity-row-secondary"><text>有效期至<\/text>/);
  assert.doesNotMatch(markup, /<text>有效期<\/text>/);
  assert.doesNotMatch(markup, /item\.validity_label/);
  assert.match(styles, /\.validity-row-secondary/);
});

test("profile focuses on child records without appointment or service actions", () => {
  assert.doesNotMatch(script, /goMyAppointments|goAppointment|callService/);
  assert.doesNotMatch(markup, /我的预约|预约到店体验|联系客服|support-actions/);
  assert.doesNotMatch(styles, /support-actions|support-button|support-primary/);
});
