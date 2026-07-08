import { getArticle } from "../../services/api";

Page({
  data: {
    article: null
  },
  onLoad(options) {
    if (options.id) {
      this.loadArticle(options.id);
    }
  },
  async loadArticle(id) {
    try {
      const article = await getArticle(id);
      this.setData({ article });
    } catch (error) {
      wx.showToast({ title: "内容加载失败", icon: "none" });
    }
  }
});
