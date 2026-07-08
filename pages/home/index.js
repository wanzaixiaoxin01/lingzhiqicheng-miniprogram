import { getHome } from "../../services/api";

Page({
  data: {
    shortcuts: ["智习室", "学习机", "课程服务", "预约体验", "学习资料", "活动风采"],
    banners: [],
    campuses: [],
    courses: [],
    articles: []
  },
  onLoad() {
    this.loadHome();
  },
  async loadHome() {
    try {
      const data = await getHome();
      this.setData(data);
    } catch (error) {
      wx.showToast({ title: "首页加载失败", icon: "none" });
    }
  },
  goAppointment() {
    wx.navigateTo({ url: "/pages/appointment/index" });
  },
  goCourses() {
    wx.switchTab({ url: "/pages/courses/index" });
  },
  goCourse(event) {
    wx.navigateTo({ url: `/pages/course-detail/index?id=${event.currentTarget.dataset.id}` });
  },
  goCampus(event) {
    wx.navigateTo({ url: `/pages/campus-detail/index?id=${event.currentTarget.dataset.id}` });
  },
  goArticles() {
    wx.navigateTo({ url: "/pages/articles/index" });
  }
});
