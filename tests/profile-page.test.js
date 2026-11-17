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
  assert.match(script, /selectStudent/);
  assert.match(script, /activeStudent/);
});

test("profile supports phone authorisation, no-match and multiple-child states", () => {
  assert.match(markup, /open-type="getPhoneNumber"/);
  assert.match(markup, /bindgetphonenumber="authorizePhone"/);
  assert.match(markup, /暂未查询到报名信息/);
  assert.match(markup, /wx:for="\{\{dashboard\.students\}\}"/);
  assert.match(markup, /data-student-id="\{\{item\.id\}\}"/);
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
});

test("appointment and customer service remain secondary actions", () => {
  assert.match(script, /goAppointment/);
  assert.match(script, /callService/);
  assert.match(markup, /预约到店体验/);
  assert.match(markup, /联系客服/);
});
