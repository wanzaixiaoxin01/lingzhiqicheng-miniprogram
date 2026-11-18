import { getCourses } from "../../services/api";
import { mergeInterestCourses } from "../../utils/course-catalog";

Page({
  data: {
    allCourses: [],
    courses: [],
    loading: true,
    loadFailed: false
  },
  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 1 });
    }
  },
  onLoad() {
    this.loadCourses();
  },
  async loadCourses() {
    this.setData({ loading: true, loadFailed: false });
    try {
      const remoteCourses = await getCourses();
      const allCourses = mergeInterestCourses(remoteCourses);
      this.setData({ allCourses, courses: allCourses, loading: false });
    } catch (error) {
      this.setData({ allCourses: [], courses: [], loading: false, loadFailed: true });
    }
  },
  retryLoad() {
    this.loadCourses();
  },
  goDetail(event) {
    wx.navigateTo({ url: `/pages/course-detail/index?id=${event.currentTarget.dataset.id}` });
  }
});
