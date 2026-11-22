import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function setup(responses = []) {
  const storage = new Map([["parent-session-token", "stale-token"]]);
  const calls = [];
  const toasts = [];
  const modals = [];
  const phoneCalls = [];
  const scrollCalls = [];
  let page;
  const wx = {
    pageScrollTo: (value) => scrollCalls.push(value),
    makePhoneCall: (value) => phoneCalls.push(value.phoneNumber),
    getStorageSync: (key) => storage.get(key),
    setStorageSync: (key, value) => storage.set(key, value),
    removeStorageSync: (key) => storage.delete(key),
    login: ({ success }) => success({ code: "fresh-code" }),
    showToast: (value) => toasts.push(value),
    showModal: (value) => {
      modals.push(value);
      value.success({ confirm: true, cancel: false });
    },
    request(options) {
      calls.push(options);
      const response = responses.shift();
      if (!response) throw new Error("Unexpected request");
      options.success(response);
    }
  };
  const context = vm.createContext({ wx, getApp: () => ({ globalData: { apiBaseUrl: "https://example.test" } }) });
  const evaluate = (path) => {
    const source = readFileSync(new URL(path, import.meta.url), "utf8")
      .replace(/^import .*?;\n/gms, "").replace(/export /g, "");
    vm.runInContext(source, context);
  };
  evaluate("../utils/request.js");
  evaluate("../utils/query.js");
  evaluate("../utils/appointment-validation.js");
  evaluate("../services/api.js");
  evaluate("../utils/parent-session.js");
  context.Page = (value) => { page = value; };
  evaluate("../pages/appointment/index.js");
  page.setData = (values, callback) => {
    for (const [key, value] of Object.entries(values)) {
      const parts = key.split(".");
      if (parts.length === 2) page.data[parts[0]][parts[1]] = value;
      else page.data[key] = value;
    }
    if (callback) callback();
  };
  return { page, calls, storage, toasts, modals, phoneCalls, scrollCalls };
}

test("history renews a rejected cached login and retries with the new token", async () => {
  const { page, calls, storage } = setup([
    { statusCode: 401, data: { detail: "家长登录已失效" } },
    { statusCode: 200, data: { session_token: "fresh-token" } },
    { statusCode: 200, data: [{ id: "mine", child_age: 10, child_grade: "四年级" }] }
  ]);
  await page.loadAppointmentHistory();
  assert.equal(page.data.historyError, "");
  assert.equal(page.data.appointments[0]?.id, "mine");
  assert.equal(storage.get("parent-session-token"), "fresh-token");
  assert.equal(calls[2].header.Authorization, "Bearer fresh-token");
  assert.equal(page.data.form.child_age, "");
});

test("history stops after one authentication retry and keeps errors visible", async () => {
  const { page, calls } = setup([
    { statusCode: 401, data: {} },
    { statusCode: 200, data: { session_token: "fresh-token" } },
    { statusCode: 401, data: { detail: "家长登录已失效" } }
  ]);
  await page.loadAppointmentHistory();
  assert.equal(calls.length, 3);
  assert.ok(page.data.historyError);
  assert.equal(page.data.historyLoading, false);
});

test("server errors are not retried as login failures or displayed as empty history", async () => {
  const { page, calls } = setup([{ statusCode: 500, data: { detail: "服务暂不可用" } }]);
  await page.loadAppointmentHistory();
  assert.equal(calls.length, 1);
  assert.ok(page.data.historyError);
});

test("pickers cover ages 1–30 and the twelve requested grades and submit actual values", async () => {
  const { page, calls, toasts } = setup([
    { statusCode: 201, data: { id: "new" } },
    { statusCode: 200, data: [{ id: "new", name: "家长", phone: "13800138000", child_age: 30, child_grade: "高三" }] }
  ]);
  assert.equal(page.data.ageOptions.length, 30);
  assert.equal(page.data.ageOptions[0], "1岁");
  assert.equal(page.data.ageOptions[29], "30岁");
  assert.deepEqual(Array.from(page.data.gradeOptions), ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "七年级", "八年级", "九年级", "高一", "高二", "高三"]);
  page.selectAge({ detail: { value: "29" } });
  page.data.form.child_name = "小明";
  page.updateField({ currentTarget: { dataset: { field: "child_school" } }, detail: { value: "实验小学" } });
  page.selectGrade({ detail: { value: "11" } });
  page.data.form.name = "家长";
  page.data.form.phone = "13800138000";
  page.data.form.campus_id = "campus-1";
  page.data.appointmentDate = "2099-01-01";
  page.data.appointmentTime = "14:30";
  await page.submitAppointment();
  assert.equal(calls[0].data.child_age, 30);
  assert.equal(calls[0].data.child_name, "小明");
  assert.equal(calls[0].data.child_school, "实验小学");
  assert.equal(page.data.form.child_school, "");
  assert.equal(page.data.form.child_name, "");
  assert.equal(calls[0].data.child_grade, "高三");
  assert.equal(calls[0].data.campus_id, "campus-1");
  assert.equal(calls[0].data.appointment_at, "2099-01-01");
  assert.match(toasts[0].title, /预约成功/);
  assert.match(toasts[0].title, /服务人员/);
  assert.equal(page.data.form.name, "");
  assert.equal(page.data.form.phone, "");
  assert.equal(page.data.form.child_age, "");
  assert.equal(page.data.form.child_grade, "");
  assert.equal(page.data.form.campus_id, "");
  assert.equal(page.data.appointmentDate, page.data.minAppointmentDate);
  assert.equal(page.data.activeTab, "history");
});

test("today can be submitted with all child information empty", async () => {
  const { page, calls } = setup([
    { statusCode: 201, data: { id: "new" } },
    { statusCode: 200, data: [] }
  ]);
  const today = page.data.minAppointmentDate;
  assert.equal(page.data.appointmentDate, today);
  page.data.form.name = "家长";
  page.data.form.phone = "13800138000";
  page.data.form.campus_id = "campus-1";
  await page.submitAppointment();
  assert.equal(calls[0].data.appointment_at, today);
  assert.equal(calls[0].data.child_age, "");
  assert.equal(page.data.activeTab, "history");
  assert.equal(page.data.appointmentDate, today);
});

test("empty child information does not cause validation errors", async () => {
  const { page, calls, toasts } = setup();
  page.data.form.child_name = "小明";
  page.data.form.name = "家长";
  page.data.form.phone = "13800138000";
  await page.submitAppointment();
  assert.equal(calls.length, 0);
  assert.equal(page.data.fieldErrors.child_age, undefined);
  page.selectAge({ detail: { value: "4" } });
  await page.submitAppointment();
  assert.equal(calls.length, 0);
  assert.equal(page.data.fieldErrors.child_grade, undefined);
  assert.equal(page.data.fieldErrors.child_age, undefined);
  assert.equal(toasts.length, 0);
});

test("campus selector loads server campuses and preserves a requested campus", async () => {
  const { page } = setup([{ statusCode: 200, data: [
    { id: "campus-1", name: "北舞渡网点" },
    { id: "campus-2", name: "莲花网点" }
  ] }]);

  await page.loadCampuses("campus-2");

  assert.equal(page.data.campusOptions.length, 2);
  assert.equal(page.data.form.campus_id, "campus-2");
  assert.equal(page.data.campusName, "莲花网点");
  page.selectCampus({ detail: { value: "0" } });
  assert.equal(page.data.form.campus_id, "campus-1");
});

test("submission requires campus and date", async () => {
  const { page, calls, toasts } = setup();
  page.data.form.child_name = "小明";
  Object.assign(page.data.form, { name: "家长", phone: "13800138000", child_age: 10, child_grade: "四年级" });

  await page.submitAppointment();
  assert.match(page.data.fieldErrors.campus_id, /网点/);
  page.data.form.campus_id = "campus-1";
  page.data.appointmentDate = "";
  await page.submitAppointment();
  assert.match(page.data.fieldErrors.appointmentDate, /日期/);
  assert.equal(toasts.length, 0);
  assert.equal(calls.length, 0);
});

test("cancel button confirms cancellation and refreshes appointment history", async () => {
  const { page, calls, toasts, modals } = setup([
    { statusCode: 200, data: { message: "预约已取消" } },
    { statusCode: 200, data: [{ id: "appointment-1", follow_status: "cancelled", follow_status_label: "已取消", name: "旧姓名", phone: "13800138000", child_age: 10, child_grade: "四年级" }] }
  ]);
  page.data.appointments = [{ id: "appointment-1", follow_status: "pending", can_cancel: true }];

  await page.cancelAppointment({ currentTarget: { dataset: { id: "appointment-1" } } });
  assert.equal(modals.length, 1);
  assert.match(calls[0].url, /\/api\/public\/parent\/appointments\/appointment-1\/cancel$/);
  assert.equal(calls[0].method, "POST");
  assert.match(toasts.at(-1).title, /已取消/);
  assert.equal(page.data.appointments[0].follow_status, "cancelled");
  assert.equal(page.data.form.name, "");
  assert.equal(page.data.form.phone, "");
  assert.equal(page.data.form.child_age, "");
  assert.equal(page.data.form.child_grade, "");
});

test("history refresh leaves a partially entered form unchanged", async () => {
  const { page } = setup([{ statusCode: 200, data: [{
    id: "old", name: "旧姓名", phone: "13800138000", child_age: 10, child_grade: "四年级"
  }] }]);
  page.data.form.name = "新姓名";
  const before = JSON.stringify(page.data.form);
  await page.loadAppointmentHistory();
  assert.equal(JSON.stringify(page.data.form), before);
});

test("appointment opens on the form and loads history only for its tab", () => {
  const { page } = setup();
  let historyLoads = 0;
  page.loadCampuses = () => {};
  page.loadAppointmentHistory = () => { historyLoads += 1; };
  page.onLoad();
  assert.equal(page.data.activeTab, "form");
  assert.equal(historyLoads, 0);
  page.data.form.name = "正在填写";
  page.switchAppointmentTab({ currentTarget: { dataset: { tab: "history" } } });
  assert.equal(historyLoads, 1);
  assert.equal(page.data.activeTab, "history");
  page.switchAppointmentTab({ currentTarget: { dataset: { tab: "form" } } });
  assert.equal(page.data.form.name, "正在填写");
  page.onLoad({ tab: "history" });
  assert.equal(page.data.activeTab, "history");
  assert.equal(historyLoads, 2);
});

test("blank child name does not cause a validation error", async () => {
  const { page, calls, toasts } = setup();
  for (const childName of ["", "   "]) {
    page.data.form.child_name = childName;
    await page.submitAppointment();
    assert.equal(calls.length, 0);
    assert.equal(page.data.fieldErrors.child_name, undefined);
    assert.equal(toasts.length, 0);
  }
});

test("contact button calls the selected appointment campus instead of the parent", () => {
  const { page, phoneCalls, toasts } = setup();
  page.data.appointments = [
    { id: "a", campus_phone: "13811112222", phone: "13900000000" },
    { id: "b", campus_phone: " 13833334444 ", phone: "13900000000" },
    { id: "empty", campus_phone: "", phone: "13900000000" }
  ];
  for (const id of ["b", "a", "empty", "missing"]) {
    page.callAppointmentCampus({ currentTarget: { dataset: { id } } });
  }
  assert.deepEqual(phoneCalls, ["13833334444", "13811112222"]);
  assert.equal(toasts.length, 2);
});

test("empty submission marks all required fields and scrolls to the first without a toast", async () => {
  const { page, calls, toasts, scrollCalls } = setup();
  await page.submitAppointment();
  assert.deepEqual(Object.keys(page.data.fieldErrors).sort(), [
    "name", "phone", "campus_id"
  ].sort());
  assert.equal(calls.length, 0);
  assert.equal(toasts.length, 0);
  assert.equal(scrollCalls[0].selector, "#field-name");
  page.updateField({ currentTarget: { dataset: { field: "name" } }, detail: { value: "家长" } });
  page.updateField({ currentTarget: { dataset: { field: "phone" } }, detail: { value: "12345" } });
  assert.equal(page.data.fieldErrors.name, undefined);
  assert.match(page.data.fieldErrors.phone, /11位手机号/);
  page.updateField({ currentTarget: { dataset: { field: "phone" } }, detail: { value: "13800138000" } });
  assert.equal(page.data.fieldErrors.phone, undefined);
  assert.equal(page.data.fieldErrors.child_name, undefined);
});

test("past appointment stays on the form and clears date errors when corrected", async () => {
  const { page, calls, toasts } = setup();
  page.data.appointmentDate = "2000-01-01";
  page.data.appointmentTime = "12:00";
  await page.submitAppointment();
  assert.match(page.data.fieldErrors.appointmentDate, /今天/);
  assert.equal(page.data.activeTab, "form");
  assert.equal(calls.length, 0);
  assert.equal(toasts.length, 0);
  page.selectAppointmentDate({ detail: { value: "2099-01-01" } });
  assert.equal(page.data.fieldErrors.appointmentDate, undefined);
  assert.equal(page.data.fieldErrors.appointmentTime, undefined);
});

function fillValidForm(page) {
  Object.assign(page.data.form, { name: "家长", phone: "13800138000", child_name: "小明",
    child_age: 10, child_grade: "四年级", campus_id: "campus-1", message: "" });
  page.data.appointmentDate = "2099-01-01";
  page.data.appointmentTime = "14:30";
}

test("server field validation uses inline errors and preserves the draft", async () => {
  const { page, calls, toasts, scrollCalls } = setup([{ statusCode: 400, data: { detail: { fields: {
    campus_id: "预约网点不存在或不可预约", appointment_at: "请选择未来的预约时间"
  } } } }]);
  fillValidForm(page);
  await page.submitAppointment();
  assert.equal(calls.length, 1);
  assert.equal(toasts.length, 0);
  assert.match(page.data.fieldErrors.campus_id, /不可预约/);
  assert.match(page.data.fieldErrors.appointmentDate, /未来/);
  assert.equal(scrollCalls.at(-1).selector, "#field-campus_id");
  assert.equal(page.data.form.child_name, "小明");
  assert.equal(page.data.submitting, false);
});

test("service failures still show a toast and preserve the form", async () => {
  const { page, toasts } = setup([{ statusCode: 503, data: { detail: "服务暂不可用" } }]);
  fillValidForm(page);
  await page.submitAppointment();
  assert.equal(toasts.at(-1).title, "服务暂不可用");
  assert.equal(page.data.form.name, "家长");
  assert.equal(page.data.submitting, false);
});
