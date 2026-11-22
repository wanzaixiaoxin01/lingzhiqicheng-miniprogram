import { getParentDashboard } from "../../services/api";
import {
  authorizeParentWithPhone,
  ensureParentSession,
  markParentPhoneAuthorized
} from "../../utils/parent-session";

Page({
  data: {
    loading: true,
    authorizing: false,
    errorMessage: "",
    dashboard: null,
    activeStudentId: "",
    activeStudent: null
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 3 });
    }
    this.loadDashboard();
  },

  async loadDashboard() {
    this.setData({ loading: true, errorMessage: "" });
    try {
      const sessionToken = await ensureParentSession();
      const dashboard = await getParentDashboard(sessionToken);
      if (!dashboard.needs_phone_authorization) {
        markParentPhoneAuthorized();
      }
      const selected = dashboard.students.find((item) => item.id === this.data.activeStudentId)
        || dashboard.students[0]
        || null;
      this.setData({
        dashboard,
        activeStudentId: selected ? selected.id : "",
        activeStudent: selected,
        loading: false
      });
      const tabBar = this.getTabBar && this.getTabBar();
      if (tabBar && !dashboard.needs_phone_authorization) {
        tabBar.setData({ phoneAuthorized: true });
      }
    } catch (error) {
      this.setData({
        loading: false,
        errorMessage: error && error.detail ? error.detail : "家长信息加载失败"
      });
    }
  },

  async authorizePhone(event) {
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
    wx.showLoading({ title: "正在验证" });
    try {
      await authorizeParentWithPhone(phoneCode);
      await this.loadDashboard();
    } catch (error) {
      wx.showToast({
        title: error && error.detail ? error.detail : "手机号授权失败，请稍后重试",
        icon: "none"
      });
    } finally {
      this.setData({ authorizing: false });
      wx.hideLoading();
    }
  },

  selectStudent(event) {
    const studentId = event.currentTarget.dataset.studentId;
    const activeStudent = (this.data.dashboard.students || []).find((item) => item.id === studentId) || null;
    this.setData({ activeStudentId: studentId, activeStudent });
  },

  retryLoad() {
    this.loadDashboard();
  }
});
