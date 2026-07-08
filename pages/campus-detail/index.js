import { getCampus } from "../../services/api";

Page({
  data: {
    campus: null
  },
  onLoad(options) {
    if (options.id) {
      this.loadCampus(options.id);
    }
  },
  async loadCampus(id) {
    try {
      const campus = await getCampus(id);
      this.setData({ campus });
    } catch (error) {
      wx.showToast({ title: "校区加载失败", icon: "none" });
    }
  },
  callCampus() {
    const phone = this.data.campus && this.data.campus.phone;
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone });
    }
  },
  goAppointment() {
    const campus = this.data.campus;
    wx.navigateTo({ url: `/pages/appointment/index?campus_id=${campus.id}&campus_name=${campus.name}` });
  }
});
