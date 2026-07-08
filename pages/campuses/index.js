import { getCampuses } from "../../services/api";

Page({
  data: {
    campuses: []
  },
  onLoad() {
    this.loadCampuses();
  },
  async loadCampuses() {
    try {
      const campuses = await getCampuses();
      this.setData({ campuses });
    } catch (error) {
      wx.showToast({ title: "校区加载失败", icon: "none" });
    }
  },
  goDetail(event) {
    wx.navigateTo({ url: `/pages/campus-detail/index?id=${event.currentTarget.dataset.id}` });
  }
});
