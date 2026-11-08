import { getHome } from "../../services/api";
import { HOME_POSTERS } from "../../utils/home-posters";

Page({
  data: {
    shortcuts: ["智习室", "学习机", "课程服务", "预约体验", "学习资料", "活动风采"],
    posterBanners: HOME_POSTERS,
    currentPoster: 0,
    currentPosterInfo: HOME_POSTERS[0],
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
      this.setData({ ...data, posterBanners: HOME_POSTERS });
    } catch (error) {
      wx.showToast({ title: "首页加载失败", icon: "none" });
    }
  },
  onPosterChange(event) {
    const currentPoster = event.detail.current;
    this.setData({
      currentPoster,
      currentPosterInfo: this.data.posterBanners[currentPoster]
    });
  },
  previewPoster(event) {
    const current = event.currentTarget.dataset.src;
    wx.previewImage({
      current,
      urls: this.data.posterBanners.map((poster) => poster.src)
    });
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
  goShortcut(event) {
    const routes = {
      "智习室": "/pages/self-study/index",
      "自习室": "/pages/self-study/index",
      "课程服务": "/pages/courses/index",
      "预约体验": "/pages/appointment/index",
      "学习资料": "/pages/articles/index?type=material",
      "活动风采": "/pages/articles/index?type=activity"
    };
    const url = routes[event.currentTarget.dataset.label];
    if (!url) {
      return;
    }
    if (url === "/pages/courses/index") {
      wx.switchTab({ url });
      return;
    }
    wx.navigateTo({ url });
  },
  goArticles() {
    wx.navigateTo({ url: "/pages/articles/index" });
  }
});
