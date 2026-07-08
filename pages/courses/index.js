import { getCourses } from "../../services/api";

Page({
  data: {
    categories: ["全部", "智习室", "晚托", "学习机"],
    activeCategory: "",
    courses: []
  },
  onLoad() {
    this.loadCourses();
  },
  async loadCourses(category = "") {
    try {
      const courses = await getCourses(category);
      this.setData({ courses, activeCategory: category });
    } catch (error) {
      wx.showToast({ title: "课程加载失败", icon: "none" });
    }
  },
  selectCategory(event) {
    const value = event.currentTarget.dataset.value;
    this.loadCourses(value === "全部" ? "" : value);
  },
  goDetail(event) {
    wx.navigateTo({ url: `/pages/course-detail/index?id=${event.currentTarget.dataset.id}` });
  }
});
