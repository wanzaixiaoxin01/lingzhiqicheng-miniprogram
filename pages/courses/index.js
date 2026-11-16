import { getCourses } from "../../services/api";
import { mergeInterestCourses } from "../../utils/course-catalog";

Page({
  data: {
    allCourses: [],
    courses: []
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
    try {
      const remoteCourses = await getCourses();
      const allCourses = mergeInterestCourses(remoteCourses);
      this.setData({ allCourses, courses: allCourses });
    } catch (error) {
      const allCourses = mergeInterestCourses();
      this.setData({ allCourses, courses: allCourses });
    }
  },
  goDetail(event) {
    const course = this.data.courses.find((item) => item.id === event.currentTarget.dataset.id);
    if (course && course.isLocal) {
      wx.navigateTo({
        url: `/pages/appointment/index?course_title=${encodeURIComponent(course.title)}`
      });
      return;
    }
    wx.navigateTo({ url: `/pages/course-detail/index?id=${event.currentTarget.dataset.id}` });
  }
});
