import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  COURSE_CATEGORIES,
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
    "练字",
    "绘画",
    "音乐与乐器"
  ]);
});

test("activity cards use only server data and server covers", () => {
  assert.deepEqual(mergeInterestCourses([]), []);
  const courses = mergeInterestCourses([
    { id: "remote", title: "绘画", category: "绘画", cover_url: "https://example.test/painting.jpg" }
  ]);
  assert.equal(courses.length, 1);
  assert.equal(courses[0].image, "https://example.test/painting.jpg");
});

test("hidden activities are filtered while new server categories remain visible", () => {
  const courses = mergeInterestCourses([
    { id: "hidden", title: "已隐藏活动", category: "其他", status: "hidden" },
    { id: "new-1", title: "少儿编程项目课", category: "编程", status: "published" },
    { id: "new-2", title: "舞蹈体验", category: "舞蹈", status: "published" }
  ]);

  assert.ok(courses.every((course) => course.id !== "hidden"));
  assert.ok(courses.some((course) => course.title === "少儿编程项目课"));
  assert.ok(courses.some((course) => course.category === "舞蹈"));
  assert.deepEqual(
    filterInterestCourses(courses, "音乐与乐器").map((course) => course.category),
    []
  );
});

test("activity page exposes retry state when the server request fails", () => {
  const pageScript = readFileSync(resolve(miniProgramRoot, "pages/courses/index.js"), "utf8");
  const pageMarkup = readFileSync(resolve(miniProgramRoot, "pages/courses/index.wxml"), "utf8");

  assert.match(pageScript, /loadFailed/);
  assert.match(pageScript, /retryLoad/);
  assert.doesNotMatch(pageScript, /isLocal/);
  assert.match(pageMarkup, /加载失败/);
  assert.match(pageMarkup, /重新加载/);
});

test("activity page presents one unified interest activity list", () => {
  const wxml = readFileSync(resolve(miniProgramRoot, "pages/courses/index.wxml"), "utf8");
  const pageConfig = JSON.parse(readFileSync(resolve(miniProgramRoot, "pages/courses/index.json"), "utf8"));

  assert.match(wxml, />兴趣活动</);
  assert.doesNotMatch(wxml, /&amp;/);
  assert.doesNotMatch(wxml, /category-row/);
  assert.doesNotMatch(wxml, /category-active/);
  assert.doesNotMatch(wxml, /课程|课次|试听|授课|教学/);
  assert.equal(pageConfig.navigationBarTitleText, "兴趣活动");
});

test("activity details use visit-oriented labels", () => {
  const detailMarkup = readFileSync(resolve(miniProgramRoot, "pages/course-detail/index.wxml"), "utf8");
  const detailConfig = JSON.parse(readFileSync(resolve(miniProgramRoot, "pages/course-detail/index.json"), "utf8"));

  assert.equal(detailConfig.navigationBarTitleText, "活动详情");
  assert.match(detailMarkup, /活动安排/);
  assert.match(detailMarkup, /预约到店体验/);
  assert.doesNotMatch(detailMarkup, /课程|试听|授课|教学/);
});

test("course page uses a branded editorial catalog with numbered directions", () => {
  const wxml = readFileSync(resolve(miniProgramRoot, "pages/courses/index.wxml"), "utf8");
  const wxss = readFileSync(resolve(miniProgramRoot, "pages/courses/index.wxss"), "utf8");

  assert.match(wxml, /class="courses-hero"/);
  assert.match(wxml, /class="hero-count"/);
  assert.match(wxml, /wx:for-index="courseIndex"/);
  assert.match(wxml, /class="course-number"/);
  assert.match(wxml, /0\{\{courseIndex \+ 1\}\}/);
  assert.match(wxss, /\.courses-hero\s*\{[^}]*background:\s*linear-gradient\([^}]*#071a34/s);
  assert.match(wxss, /\.course-action\s*\{[^}]*border-radius:\s*50%/s);
  assert.match(wxss, /padding-bottom:\s*190rpx/);
});

test("course cards do not repeat the category when it duplicates the title", () => {
  const wxml = readFileSync(resolve(miniProgramRoot, "pages/courses/index.wxml"), "utf8");

  assert.doesNotMatch(wxml, /class="course-category"/);
  assert.doesNotMatch(wxml, /\{\{item\.category\}\}/);
  assert.match(wxml, /class="course-title">\{\{item\.title\}\}<\/text>/);
});

test("course cards lead with their conversion image", () => {
  const wxml = readFileSync(resolve(miniProgramRoot, "pages/courses/index.wxml"), "utf8");
  const wxss = readFileSync(resolve(miniProgramRoot, "pages/courses/index.wxss"), "utf8");

  assert.match(wxml, /class="course-visual"/);
  assert.match(wxml, /class="course-image"\s+src="\{\{item\.image\}\}"\s+mode="aspectFill"/);
  assert.match(wxml, /class="course-image-shade"/);
  assert.match(wxss, /\.course-visual\s*\{[^}]*height:\s*250rpx/s);
  assert.match(wxss, /\.course-image\s*\{[^}]*width:\s*100%[^}]*height:\s*100%/s);
});

test("course hero pairs programming and interest scenes with a diagonal split", () => {
  const wxml = readFileSync(resolve(miniProgramRoot, "pages/courses/index.wxml"), "utf8");
  const wxss = readFileSync(resolve(miniProgramRoot, "pages/courses/index.wxss"), "utf8");

  assert.match(wxml, /class="hero-panel hero-panel-left"/);
  assert.match(wxml, /src="\/assets\/courses\/programming-workshop-v1\.jpg"/);
  assert.match(wxml, /class="hero-panel hero-panel-right"/);
  assert.match(wxml, /src="\/assets\/home\/interest-workshop-v2\.jpg"/);
  assert.match(wxml, /class="hero-split"/);
  assert.match(wxml, /class="hero-shade"/);
  assert.match(wxss, /\.hero-panel-left\s*\{[^}]*clip-path:\s*polygon/s);
  assert.match(wxss, /\.hero-panel-right\s*\{[^}]*clip-path:\s*polygon/s);
  assert.match(wxss, /\.hero-split\s*\{[^}]*transform:\s*rotate/s);
  assert.match(wxss, /\.hero-image\s*\{[^}]*position:\s*absolute[^}]*width:\s*100%[^}]*height:\s*100%/s);
  assert.match(wxss, /\.hero-shade\s*\{[^}]*linear-gradient/s);
});

test("appointment query values decode course names exactly once", () => {
  assert.equal(decodeQueryValue("%E7%BC%96%E7%A8%8B%E4%B8%8E%E9%80%BB%E8%BE%91"), "编程与逻辑");
  assert.equal(decodeQueryValue("编程与逻辑"), "编程与逻辑");
  assert.equal(decodeQueryValue("%"), "%");

  const appointmentPage = readFileSync(resolve(miniProgramRoot, "pages/appointment/index.js"), "utf8");
  assert.match(appointmentPage, /decodeQueryValue/);
});
