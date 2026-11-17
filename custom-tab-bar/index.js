Component({
  data: {
    selected: 0,
    tabs: [
      { pagePath: "/pages/home/index", text: "首页" },
      { pagePath: "/pages/courses/index", text: "课程" },
      { pagePath: "/pages/growth/index", text: "AI学习机" },
      { pagePath: "/pages/profile/index", text: "我的" }
    ]
  },

  lifetimes: {
    attached() {
      this.syncSelected();
    }
  },

  pageLifetimes: {
    show() {
      this.syncSelected();
    }
  },

  methods: {
    syncSelected() {
      const pages = getCurrentPages();
      const currentRoute = pages.length ? `/${pages[pages.length - 1].route}` : "";
      const selected = this.data.tabs.findIndex((item) => item.pagePath === currentRoute);
      if (selected >= 0) {
        this.setData({ selected });
      }
    },
    switchTab(event) {
      const { index, path } = event.currentTarget.dataset;
      this.setData({ selected: Number(index) });
      wx.switchTab({ url: path });
    }
  }
});
