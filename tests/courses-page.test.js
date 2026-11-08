import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  COURSE_CATEGORIES,
  INTEREST_COURSES,
  filterInterestCourses,
  mergeInterestCourses
} from "../utils/course-catalog.js";
import { decodeQueryValue } from "../utils/query.js";

const miniProgramRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("course catalog only exposes interest and growth directions", () => {
  assert.deepEqual(COURSE_CATEGORIES, [
    "全部",
    "编程与逻辑",
    "英语口语",
    "表达与阅读",
    "书法",
    "绘画",
    "音乐与乐器"
  ]);
  assert.equal(INTEREST_COURSES.length, 6);
  assert.ok(INTEREST_COURSES.every((course) => COURSE_CATEGORIES.includes(course.category)));
});

test("legacy service courses are filtered while interest courses remain visible", () => {
  const courses = mergeInterestCourses([
    { id: "legacy-1", title: "课后晚托服务", category: "晚托" },
    { id: "legacy-2", title: "AI 智习室体验课", category: "智习室" },
    { id: "new-1", title: "少儿编程项目课", category: "编程" }
  ]);

  assert.ok(courses.every((course) => course.category !== "晚托" && course.category !== "智习室"));
  assert.ok(courses.some((course) => course.title === "少儿编程项目课"));
  assert.ok(courses.some((course) => course.category === "英语口语"));
  assert.deepEqual(
    filterInterestCourses(courses, "音乐与乐器").map((course) => course.category),
    ["音乐与乐器"]
  );
});

test("course page presents one unified interest course list", () => {
  const wxml = readFileSync(resolve(miniProgramRoot, "pages/courses/index.wxml"), "utf8");
  const pageConfig = JSON.parse(readFileSync(resolve(miniProgramRoot, "pages/courses/index.json"), "utf8"));

  assert.match(wxml, />兴趣与素质课程</);
  assert.doesNotMatch(wxml, /&amp;/);
  assert.doesNotMatch(wxml, /category-row/);
  assert.doesNotMatch(wxml, /category-active/);
  assert.doesNotMatch(wxml, />课程服务</);
  assert.equal(pageConfig.navigationBarTitleText, "兴趣课程");
});

test("appointment query values decode course names exactly once", () => {
  assert.equal(decodeQueryValue("%E7%BC%96%E7%A8%8B%E4%B8%8E%E9%80%BB%E8%BE%91"), "编程与逻辑");
  assert.equal(decodeQueryValue("编程与逻辑"), "编程与逻辑");
  assert.equal(decodeQueryValue("%"), "%");

  const appointmentPage = readFileSync(resolve(miniProgramRoot, "pages/appointment/index.js"), "utf8");
  assert.match(appointmentPage, /decodeQueryValue/);
});
