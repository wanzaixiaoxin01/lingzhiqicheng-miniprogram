import { authorizeParentWithPhone, isParentPhoneAuthorized } from "../utils/parent-session";

Component({
  data: {
    selected: 0,
    phoneAuthorized: false,
    authorizing: false,
    tabs: [
      { pagePath: "/pages/home/index", text: "首页" },
      { pagePath: "/pages/courses/index", text: "课程" },
      { pagePath: "/pages/growth/index", text: "AI学习机" },
      { pagePath: "/pages/profile/index", text: "我的", requiresPhone: true }
    ]
  },

  lifetimes: {
    attached() {
      this.refreshAuthorization();
      this.syncSelected();
    }
  },

  pageLifetimes: {
    show() {
      this.refreshAuthorization();
      this.syncSelected();
    }
  },

  methods: {
    refreshAuthorization() {
      this.setData({ phoneAuthorized: isParentPhoneAuthorized() });
    },
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
    },
    async authorizeAndSwitch(event) {
      const phoneCode = event.detail && event.detail.code;
      if (!phoneCode || this.data.authorizing) {
        if (!phoneCode) {
          let title = "需要授权手机号才能查看孩子记录";
          try {
            if (wx.getSystemInfoSync().platform === "devtools") {
              title = "请使用真机测试手机号授权";
            }
          } catch (error) {
            // Keep the normal user-facing prompt on older clients.
          }
          wx.showToast({ title, icon: "none" });
        }
        return;
      }
      this.setData({ authorizing: true });
      wx.showLoading({ title: "正在登录" });
      try {
        await authorizeParentWithPhone(phoneCode);
        this.setData({ phoneAuthorized: true, selected: 3 });
        wx.switchTab({ url: "/pages/profile/index" });
      } catch (error) {
        const detail = error && error.detail ? error.detail : "手机号授权失败，请稍后重试";
        wx.showToast({ title: detail, icon: "none" });
      } finally {
        this.setData({ authorizing: false });
        wx.hideLoading();
      }
    }
  }
});
