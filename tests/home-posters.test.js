import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const miniProgramRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const homeWxml = readFileSync(resolve(miniProgramRoot, "pages/home/index.wxml"), "utf8");
const homeJs = readFileSync(resolve(miniProgramRoot, "pages/home/index.js"), "utf8");
const homeWxss = readFileSync(resolve(miniProgramRoot, "pages/home/index.wxss"), "utf8");

test("home presents the three core services in order", () => {
  const servicesMarkup = homeWxml.slice(homeWxml.indexOf("核心服务"));
  const spaceIndex = servicesMarkup.indexOf("空间服务");
  const aiIndex = servicesMarkup.indexOf("AI 陪伴");
  const fieldIndex = servicesMarkup.indexOf("兴趣研学");

  assert.ok(spaceIndex >= 0);
  assert.ok(aiIndex > spaceIndex);
  assert.ok(fieldIndex > aiIndex);
});

test("home section headings retain their English kickers", () => {
  assert.match(homeWxml, />核心服务</);
  assert.match(homeWxml, />热门服务</);
  assert.match(homeWxml, /class="section-kicker">WHAT WE OFFER</);
  assert.match(homeWxml, /class="section-kicker">QUICK ACCESS</);
  assert.doesNotMatch(homeWxml, /找到你需要的服务/);
  assert.doesNotMatch(homeWxml, /从专注学习到兴趣探索，陪伴孩子看见、思考、表达与行动。/);
});

test("service and shortcut cards retain their English kickers", () => {
  for (const kicker of ["01 · SPACE", "02 · AI COMPANION", "03 · FIELD"]) {
    assert.match(homeWxml, new RegExp(kicker));
  }
  assert.match(homeWxml, /class="shortcut-mark">\{\{item\.mark\}\}</);
  for (const mark of ["COURSE", "MATERIAL", "ACTIVITY", "SPACE", "AI"]) {
    assert.match(homeJs, new RegExp(`mark: "${mark}"`));
  }
  assert.match(homeWxml, /class="appointment-kicker">START HERE</);
});

test("appointment card uses parent-facing value language", () => {
  assert.match(homeWxml, /到店体验学习空间与 AI 学习方案，为孩子找到更适合的成长路径。/);
  assert.doesNotMatch(homeWxml, /看看是否适合孩子/);
});

test("service descriptions use compact readable leading", () => {
  const summaryRule = homeWxss.match(/\.service-summary\s*\{([^}]*)\}/)?.[1] || "";
  const lineHeight = Number(summaryRule.match(/line-height:\s*([\d.]+)/)?.[1]);

  assert.ok(lineHeight >= 1.2 && lineHeight <= 1.5);
});

test("shortcut Chinese titles remain enlarged beneath English kickers", () => {
  const labelRule = homeWxss.match(/\.shortcut-label\s*\{([^}]*)\}/)?.[1] || "";
  const fontSize = Number(labelRule.match(/font-size:\s*(\d+)rpx/)?.[1]);

  assert.ok(fontSize >= 30);
});

test("appointment card clears the tab bar and enlarges its action", () => {
  const shellRule = homeWxss.match(/\.content-shell\s*\{([^}]*)\}/)?.[1] || "";
  const ctaRule = homeWxss.match(/\.appointment-cta\s*\{([^}]*)\}/)?.[1] || "";
  const bottomPadding = Number(shellRule.match(/padding-bottom:\s*(\d+)rpx/)?.[1]);
  const ctaFontSize = Number(ctaRule.match(/font-size:\s*(\d+)rpx/)?.[1]);

  assert.ok(bottomPadding >= 220);
  assert.ok(ctaFontSize >= 32);
});

test("hero explains how interest programs benefit children", () => {
  assert.match(homeWxml, /通过高校参访、兴趣拓展和多元研习活动，帮助孩子发展爱好、开阔眼界。/);
  assert.doesNotMatch(homeWxml, /通过兴趣研学连接更多真实场景/);
});

test("home uses website-aligned local imagery", () => {
  const images = [
    "assets/home/hero-space-ai-v2.jpg",
    "assets/home/learning-space-interior-v2.jpg",
    "assets/home/ai-device-scene-v2.jpg",
    "assets/home/interest-workshop-v2.jpg"
  ];

  assert.ok(images.every((image) => existsSync(resolve(miniProgramRoot, image))));
});

test("home hero includes a standalone brand logo without changing content flow", () => {
  const logoRule = homeWxss.match(/\.hero-brand-logo\s*\{([^}]*)\}/)?.[1] || "";

  assert.match(homeWxml, /class="hero-brand-logo"[\s\S]*src="\.\.\/\.\.\/assets\/lingzhi-logo-144\.png"/);
  assert.equal((homeWxml.match(/class="hero-brand-logo"/g) || []).length, 1);
  assert.match(logoRule, /position:\s*absolute/);
  assert.match(logoRule, /left:\s*42rpx/);
  assert.match(logoRule, /width:\s*96rpx/);
  assert.match(logoRule, /height:\s*96rpx/);
});

test("home keeps five distinct shortcuts", () => {
  for (const label of ["智习室", "学习机", "课程服务", "学习资料", "活动风采"]) {
    assert.match(homeJs, new RegExp(label));
  }
  assert.doesNotMatch(homeJs, /校区网点|CAMPUS/);
  assert.match(homeWxss, /\.shortcut-item:nth-child\(n\+4\)[\s\S]*grid-column:\s*span 3/);
});

test("home orders informational services before the two primary product entries", () => {
  const expectedOrder = ["课程服务", "学习资料", "活动风采", "智习室", "学习机"];
  const positions = expectedOrder.map((label) => homeJs.indexOf(`label: "${label}"`));

  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test("learning machine shortcut opens the third tab", () => {
  assert.match(
    homeJs,
    /label: "学习机", mark: "AI", url: "\/pages\/growth\/index", mode: "tab"/
  );
});

test("activity shortcut shows a coming-soon toast", () => {
  assert.match(homeJs, /label: "活动风采", mark: "ACTIVITY", mode: "coming-soon"/);
  assert.match(homeJs, /mode === "coming-soon"[\s\S]*wx\.showToast\(\{ title: "敬请期待", icon: "none" \}\)/);
});

test("home keeps the original appointment card and adds a lightweight hero entry", () => {
  const heroEntryRule = homeWxss.match(/\.hero-appointment-entry\s*\{([^}]*)\}/)?.[1] || "";

  assert.match(homeWxml, /class="hero-appointment-entry"[^>]*bindtap="goAppointment"/);
  assert.match(homeWxml, /预约体验/);
  assert.match(homeWxml, /class="appointment-section"/);
  assert.match(homeWxml, /预约一次体验/);
  assert.match(homeWxml, /立即预约/);
  assert.equal((homeWxml.match(/bindtap="goAppointment"/g) || []).length, 2);

  assert.match(heroEntryRule, /position:\s*absolute/);
  assert.match(heroEntryRule, /bottom:\s*32rpx/);
  assert.doesNotMatch(heroEntryRule, /border|background|box-shadow/);
  assert.match(homeJs, /wx\.navigateTo\(\{ url: "\/pages\/appointment\/index" \}\)/);
});

test("home removes the old poster and remote content feeds", () => {
  assert.doesNotMatch(homeWxml, /poster-swiper/);
  assert.doesNotMatch(homeWxml, /wx:for="\{\{campuses\}\}"/);
  assert.doesNotMatch(homeWxml, /wx:for="\{\{courses\}\}"/);
  assert.doesNotMatch(homeJs, /getHome|HOME_POSTERS|loadHome/);
});
