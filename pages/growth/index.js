Page({
  data: {
    appointments: [],
    children: []
  },
  goAppointment() {
    wx.navigateTo({ url: "/pages/appointment/index" });
  }
});
