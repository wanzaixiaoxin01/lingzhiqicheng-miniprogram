Page({
  data: {
    marketingImages: [
      "/assets/learn-machine/haibao-1.jpg",
      "/assets/learn-machine/haibao-2.jpg",
      "/assets/learn-machine/haibao-3.jpg",
      "/assets/learn-machine/01.jpg",
      "/assets/learn-machine/02.jpg",
      "/assets/learn-machine/03.jpg",
      "/assets/learn-machine/04.jpg",
      "/assets/learn-machine/05.jpg",
      "/assets/learn-machine/06.jpg",
      "/assets/learn-machine/07.jpg",
      "/assets/learn-machine/08.jpg"
    ]
  },

  onShow() {
    const tabBar = this.getTabBar && this.getTabBar();
    if (tabBar) {
      tabBar.setData({ selected: 2 });
    }
  },

  goAppointment() {
    wx.navigateTo({
      url: "/pages/appointment/index?source=ai-learning-machine"
    });
  }
});
