import { getArticles } from "../../services/api";

Page({
  data: {
    tabs: [
      { label: "学习资料", value: "material" },
      { label: "教育动态", value: "news" },
      { label: "活动风采", value: "activity" }
    ],
    activeType: "material",
    articles: []
  },
  onLoad(options) {
    this.loadArticles(options.type || "material");
  },
  async loadArticles(type) {
    try {
      const articles = await getArticles(type);
      this.setData({ articles, activeType: type });
    } catch (error) {
      wx.showToast({ title: "内容加载失败", icon: "none" });
    }
  },
  selectType(event) {
    this.loadArticles(event.currentTarget.dataset.type);
  },
  goDetail(event) {
    wx.navigateTo({ url: `/pages/article-detail/index?id=${event.currentTarget.dataset.id}` });
  }
});
