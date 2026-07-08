Page({
  callService() {
    wx.showToast({ title: "请在后台配置客服电话", icon: "none" });
  },
  goAppointment() {
    wx.navigateTo({ url: "/pages/appointment/index" });
  }
});
