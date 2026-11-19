import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const miniProgramRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("appointment page presents a branded parent-facing consultation flow", () => {
  const wxml = readFileSync(resolve(miniProgramRoot, "pages/appointment/index.wxml"), "utf8");
  const wxss = readFileSync(resolve(miniProgramRoot, "pages/appointment/index.wxss"), "utf8");
  const config = JSON.parse(
    readFileSync(resolve(miniProgramRoot, "pages/appointment/index.json"), "utf8")
  );

  assert.match(wxml, /class="appointment-hero"/);
  assert.match(wxml, />预约到店，了解空间与设备</);
  assert.match(wxml, />联系信息</);
  assert.match(wxml, />孩子情况</);
  assert.match(wxml, /1对1沟通/);
  assert.match(wxss, /\.appointment-hero\s*\{[^}]*#071a34/s);
  assert.match(wxss, /\.history-card\s*\{[^}]*margin:\s*-32rpx/s);
  assert.match(wxml, /体验建议/);
  assert.match(wxml, /意向活动/);
  assert.doesNotMatch(wxml, /课程建议|意向课程/);
  assert.equal(config.navigationBarTitleText, "预约到店体验");
});

test("appointment redesign preserves all lead fields and submission behavior", () => {
  const wxml = readFileSync(resolve(miniProgramRoot, "pages/appointment/index.wxml"), "utf8");
  const script = readFileSync(resolve(miniProgramRoot, "pages/appointment/index.js"), "utf8");

  for (const field of ["name", "phone", "child_grade", "message"]) {
    assert.match(wxml, new RegExp(`data-field="${field}"[^>]*bindinput="updateField"`));
  }
  assert.match(wxml, /class="submit-button"[^>]*bindtap="submitAppointment"/);
  assert.match(wxml, /\{\{courseTitle\}\}/);
  assert.match(wxml, /\{\{campusName\}\}/);
  assert.match(script, /ensureParentSession/);
  assert.match(script, /getParentAppointments/);
  assert.match(script, /createLead\(this\.data\.form, sessionToken\)/);
  assert.match(wxml, />我的预约</);
  assert.match(wxml, /wx:for="\{\{appointments\}\}"/);
  assert.match(wxml, /follow_status_label/);
});
