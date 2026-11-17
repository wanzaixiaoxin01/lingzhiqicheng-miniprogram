import { getCourse } from "../../services/api";

Page({
  data: {
    course: null
  },
  onLoad(options) {
    if (options.id) {
      this.loadCourse(options.id);
    }
  },
  async loadCourse(id) {
    try {
      const course = await getCourse(id);
      this.setData({ course });
    } catch (error) {
      wx.showToast({ title: "活动加载失败", icon: "none" });
    }
  },
  goAppointment() {
    const course = this.data.course;
    wx.navigateTo({ url: `/pages/appointment/index?course_id=${course.id}&course_title=${course.title}` });
  }
});
