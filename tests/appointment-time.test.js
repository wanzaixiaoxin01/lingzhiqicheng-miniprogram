import test from "node:test";
import assert from "node:assert/strict";
import { getAppointmentBounds, validateAppointment } from "../utils/appointment-validation.js";

test("date minimum is today in Beijing", () => {
  const now = Date.parse("2026-11-22T12:00:30+08:00");
  assert.deepEqual(getAppointmentBounds("2026-11-22", now), {
    minAppointmentDate: "2026-11-22"
  });
});

test("today remains selectable just before midnight", () => {
  const bounds = getAppointmentBounds("", Date.parse("2026-11-22T23:55:30+08:00"));
  assert.equal(bounds.minAppointmentDate, "2026-11-22");
});

test("today can be booked without a ten minute window", () => {
  const data = { form: { name: "家长", phone: "13800138000", child_name: "小明", child_age: 10,
    child_grade: "四年级", campus_id: "campus-1" }, appointmentDate: "2026-11-22", appointmentTime: "12:10" };
  assert.deepEqual(validateAppointment(data, Date.parse("2026-11-22T12:00:00+08:00")), {});
  assert.deepEqual(validateAppointment(data, Date.parse("2026-11-22T23:59:01+08:00")), {});
});
