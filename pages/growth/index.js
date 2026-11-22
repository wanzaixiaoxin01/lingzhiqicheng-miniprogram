import { getLearningMachinePosters } from "../../services/api";

Page({
  data: {
    contactPhone: "4009006368",
    marketingImages: [],
    loadingPosters: true
  },

  onLoad() {
    this.loadPosters();
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 2 });
    }
  },

  async loadPosters() {
    try {
      const result = await getLearningMachinePosters();
      const marketingImages = Array.isArray(result && result.posters)
        ? result.posters.map((poster) => poster.url).filter(Boolean)
        : [];
      this.setData({ marketingImages, loadingPosters: false });
    } catch (error) {
      this.setData({ marketingImages: [], loadingPosters: false });
    }
  },

  callService() {
    wx.makePhoneCall({ phoneNumber: this.data.contactPhone });
  }
});
