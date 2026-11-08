import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { HOME_POSTERS } from "../utils/home-posters.js";

test("home poster carousel uses the three approved local posters in order", () => {
  assert.deepEqual(
    HOME_POSTERS.map((poster) => poster.src),
    [
      "../../assets/posters/education-vision.png",
      "../../assets/posters/learning-methods.png",
      "../../assets/posters/county-education-goal.png"
    ]
  );
  assert.deepEqual(
    HOME_POSTERS.map((poster) => poster.title),
    ["教育理念", "素质培养", "县域教育目标"]
  );
});

test("home poster assets are inside the mini-program root", () => {
  const miniProgramRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  assert.ok(
    HOME_POSTERS.every((poster) =>
      existsSync(resolve(miniProgramRoot, "pages/home", poster.src))
    )
  );
});

test("appointment action is separated from the poster caption", () => {
  const miniProgramRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const homeWxml = readFileSync(resolve(miniProgramRoot, "pages/home/index.wxml"), "utf8");
  const captionStart = homeWxml.indexOf('<view class="poster-caption">');
  const indicatorStart = homeWxml.indexOf('<view class="poster-indicator">');
  const caption = homeWxml.slice(captionStart, indicatorStart);

  assert.doesNotMatch(caption, /appointment-cta/);
  assert.match(homeWxml, /<view class="appointment-section(?: card)?">[\s\S]*appointment-cta/);
});

test("home service shortcuts appear under the popular services heading", () => {
  const miniProgramRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const homeWxml = readFileSync(resolve(miniProgramRoot, "pages/home/index.wxml"), "utf8");
  const headingIndex = homeWxml.indexOf(">热门服务</view>");
  const shortcutsIndex = homeWxml.indexOf('class="card grid-card"');

  assert.ok(headingIndex >= 0);
  assert.ok(shortcutsIndex > headingIndex);
});
