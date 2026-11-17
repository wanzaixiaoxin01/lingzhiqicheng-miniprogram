import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { SELF_STUDY_GALLERY, SELF_STUDY_ROOMS } from "../utils/self-study-room.js";

const miniProgramRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pageWxml = readFileSync(resolve(miniProgramRoot, "pages/self-study/index.wxml"), "utf8");
const pageWxss = readFileSync(resolve(miniProgramRoot, "pages/self-study/index.wxss"), "utf8");

test("self-study room content includes the three opened locations", () => {
  assert.deepEqual(
    SELF_STUDY_ROOMS.map((room) => room.name),
    ["郾城服务点", "莲花服务点", "北舞渡服务点"]
  );
  assert.ok(SELF_STUDY_ROOMS.every((room) => room.address && room.phone));
  assert.ok(SELF_STUDY_ROOMS.every((room) => room.phone === "4009006368"));
});

test("self-study room gallery includes local interior photos", () => {
  assert.deepEqual(
    SELF_STUDY_GALLERY.map((image) => image.src),
    ["../../assets/self-study/room-interior-01.png", "../../assets/self-study/room-interior-02.png"]
  );
});

test("self-study room gallery files are inside the mini-program root", () => {
  assert.ok(
    SELF_STUDY_GALLERY.every((image) =>
      existsSync(resolve(miniProgramRoot, "pages/self-study", image.src))
    )
  );
});

test("self-study page uses a premium editorial space presentation", () => {
  assert.match(pageWxml, /learning-space-interior-v2\.jpg/);
  assert.match(pageWxml, /class="hero-shade"/);
  assert.match(pageWxml, /class="editorial-intro"/);
  assert.match(pageWxml, /class="location-card location-card-\{\{index\}\}"/);
  assert.doesNotMatch(pageWxml, /hero-orbit|hero-spark/);
  assert.match(pageWxss, /#f3f0e9|#f4f1ea/);
});

test("self-study page does not render the low-quality real-space gallery", () => {
  assert.doesNotMatch(pageWxml, /space-journal|journal-card|真实空间记录|wx:for="\{\{gallery\}\}"/);
  assert.doesNotMatch(pageWxss, /\.space-journal|\.journal-card|\.journal-grid/);
});

test("self-study page preserves location and conversion actions", () => {
  assert.match(pageWxml, /wx:for="\{\{rooms\}\}"/);
  assert.match(pageWxml, /bindtap="copyAddress"/);
  assert.match(pageWxml, /bindtap="callRoom"/);
  assert.equal((pageWxml.match(/bindtap="goAppointment"/g) || []).length, 2);
  assert.match(pageWxml, /400-900-6368/);
  assert.match(pageWxml, /188 3952 0239/);
});

test("self-study page explains the location count once in plain language", () => {
  assert.match(pageWxml, /class="fact-value">3个</);
  assert.match(pageWxml, /class="fact-label">已开放学习空间</);
  assert.doesNotMatch(pageWxml, /class="section-count"/);
});

test("self-study services avoid teacher-led tutoring claims", () => {
  assert.match(pageWxml, /成长反馈/);
  assert.match(pageWxml, /沉淀学习记录，让阶段成长清晰可见/);
  assert.match(pageWxml, /自主规划/);
  assert.doesNotMatch(pageWxml, /老师陪伴|及时答疑|过程支持|任务提醒|作业辅导|学科辅导|老师授课/);
});
