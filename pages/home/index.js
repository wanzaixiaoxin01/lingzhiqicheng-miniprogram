Page({
  data: {
    shortcuts: [
      { label: "兴趣活动", mark: "ACTIVITY", url: "/pages/courses/index", mode: "tab" },
      { label: "空间公告", mark: "NOTICE", url: "/pages/articles/index?type=material" },
      { label: "活动风采", mark: "ACTIVITY", mode: "coming-soon" },
      { label: "智习室", mark: "SPACE", url: "/pages/self-study/index" },
      { label: "学习机", mark: "AI", url: "/pages/growth/index", mode: "tab" }
    ]
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 0 });
    }
  },

  goShortcut(event) {
    const { url, mode } = event.currentTarget.dataset;
    if (mode === "coming-soon") {
      wx.showToast({ title: "敬请期待", icon: "none" });
      return;
    }
    if (mode === "tab") {
      wx.switchTab({ url });
      return;
    }
    wx.navigateTo({ url });
  },

  goAppointment() {
    wx.navigateTo({ url: "/pages/appointment/index" });
  }
});
