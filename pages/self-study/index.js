import { SELF_STUDY_ROOMS } from "../../utils/self-study-room";

Page({
  data: {
    rooms: SELF_STUDY_ROOMS
  },
  goAppointment() {
    wx.navigateTo({ url: "/pages/appointment/index?source=self-study" });
  },
  copyAddress(event) {
    const address = event.currentTarget.dataset.address;
    if (!address) {
      return;
    }
    wx.setClipboardData({
      data: address,
      success: () => wx.showToast({ title: "地址已复制", icon: "success" })
    });
  },
  callRoom(event) {
    const phone = event.currentTarget.dataset.phone;
    if (phone) {
      wx.makePhoneCall({ phoneNumber: phone });
    }
  },
  onShareAppMessage() {
    return {
      title: "灵智启程 AI 智能自习室",
      path: "/pages/self-study/index"
    };
  }
});
