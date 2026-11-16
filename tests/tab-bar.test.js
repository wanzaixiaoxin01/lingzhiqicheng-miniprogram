import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const miniProgramRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appConfig = JSON.parse(readFileSync(resolve(miniProgramRoot, "app.json"), "utf8"));
const tabBarRoot = resolve(miniProgramRoot, "custom-tab-bar");

test("bottom navigation uses a custom four-item tab bar", () => {
  assert.equal(appConfig.tabBar.custom, true);
  assert.deepEqual(appConfig.tabBar.list.map((item) => item.text), ["首页", "课程", "AI学习机", "我的"]);
  assert.ok(existsSync(resolve(tabBarRoot, "index.js")));
  assert.ok(existsSync(resolve(tabBarRoot, "index.wxml")));
  assert.ok(existsSync(resolve(tabBarRoot, "index.wxss")));
});

test("the third tab is an AI learning machine conversion page", () => {
  const tabBarScript = readFileSync(resolve(tabBarRoot, "index.js"), "utf8");
  const productPage = readFileSync(resolve(miniProgramRoot, "pages/growth/index.wxml"), "utf8");
  const productScript = readFileSync(resolve(miniProgramRoot, "pages/growth/index.js"), "utf8");
  const productConfig = JSON.parse(
    readFileSync(resolve(miniProgramRoot, "pages/growth/index.json"), "utf8")
  );

  assert.match(tabBarScript, /pagePath:\s*"\/pages\/growth\/index",\s*text:\s*"AI学习机"/);
  assert.equal(productConfig.navigationBarTitleText, "AI学习机");
  assert.match(productPage, /wx:for="\{\{marketingImages\}\}"/);
  assert.match(productPage, /bindtap="goAppointment"/);
  assert.match(productPage, /咨询购买/);
  assert.match(productScript, /goAppointment\(\)/);
  assert.match(productScript, /\/pages\/appointment\/index\?source=ai-learning-machine/);

  const expectedImages = [
    "haibao-1.jpg",
    "haibao-2.jpg",
    "haibao-3.jpg",
    "01.jpg",
    "02.jpg",
    "03.jpg",
    "04.jpg",
    "05.jpg",
    "06.jpg",
    "07.jpg",
    "08.jpg"
  ];
  const imagePaths = [
    ...productScript.matchAll(/"(\/assets\/learn-machine\/[^"]+)"/g)
  ].map((match) => match[1]);

  assert.deepEqual(
    imagePaths,
    expectedImages.map((file) => `/assets/learn-machine/${file}`)
  );
  for (const imagePath of imagePaths) {
    assert.ok(existsSync(resolve(miniProgramRoot, imagePath.slice(1))), `${imagePath} must exist`);
  }
});

test("bottom navigation labels use a two-step larger font", () => {
  const styles = existsSync(resolve(tabBarRoot, "index.wxss"))
    ? readFileSync(resolve(tabBarRoot, "index.wxss"), "utf8")
    : "";

  assert.match(styles, /\.tab-label\s*\{[\s\S]*font-size:\s*24rpx/);
});

test("bottom navigation resyncs its selected item whenever a cached tab page is shown", () => {
  const source = readFileSync(resolve(tabBarRoot, "index.js"), "utf8");
  const executableSource = source.replace(/^import[^;]+;\s*/, "");
  let componentConfig;
  let currentRoute = "pages/home/index";

  vm.runInNewContext(executableSource, {
    Component(config) {
      componentConfig = config;
    },
    getCurrentPages() {
      return [{ route: currentRoute }];
    },
    wx: { switchTab() {} },
    authorizeParentWithPhone: async () => ({}),
    isParentPhoneAuthorized: () => false
  });

  const instance = {
    ...componentConfig.methods,
    data: structuredClone(componentConfig.data),
    setData(nextData) {
      Object.assign(this.data, nextData);
    }
  };

  componentConfig.lifetimes.attached.call(instance);
  assert.equal(instance.data.selected, 0);

  currentRoute = "pages/courses/index";
  assert.equal(typeof componentConfig.pageLifetimes?.show, "function");
  componentConfig.pageLifetimes.show.call(instance);
  assert.equal(instance.data.selected, 1);

  currentRoute = "pages/home/index";
  componentConfig.pageLifetimes.show.call(instance);
  assert.equal(instance.data.selected, 0);
});

test("each tab page explicitly selects itself when WeChat shows a cached page", () => {
  const tabPages = [
    ["pages/home/index.js", 0],
    ["pages/courses/index.js", 1],
    ["pages/growth/index.js", 2],
    ["pages/profile/index.js", 3]
  ];

  for (const [file, selected] of tabPages) {
    const source = readFileSync(resolve(miniProgramRoot, file), "utf8");
    const onShow = source.match(/onShow\(\)\s*\{([\s\S]*?)\n\s*\},/)?.[1] || "";

    assert.match(onShow, /this\.getTabBar/, `${file} must sync its custom tab bar in onShow`);
    assert.match(
      onShow,
      new RegExp(`setData\\(\\{\\s*selected:\\s*${selected}\\s*\\}\\)`),
      `${file} must select tab ${selected}`
    );
  }
});

test("tab pages reserve space above the custom navigation", () => {
  const tabPageStyles = [
    "pages/home/index.wxss",
    "pages/courses/index.wxss",
    "pages/growth/index.wxss",
    "pages/profile/index.wxss"
  ];

  for (const file of tabPageStyles) {
    const styles = readFileSync(resolve(miniProgramRoot, file), "utf8");
    const paddingBottom = styles.match(/padding-bottom:\s*(\d+)rpx/);
    assert.ok(paddingBottom, `${file} must define bottom spacing for the custom tab bar`);
    assert.ok(Number(paddingBottom[1]) >= 156, `${file} must clear the custom tab bar`);
  }
});
