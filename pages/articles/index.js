import { getArticles, getMaterials } from "../../services/api";

Page({
  data: {
    activeType: "material",
    pageTitle: "学习资料",
    pageSummary: "后台上传的学习资料",
    emptyText: "暂无学习资料",
    articles: [],
    materials: []
  },
  onLoad(options) {
    this.loadContent(options.type || "material");
  },
  async loadContent(type) {
    const contentType = ["news", "activity"].includes(type) ? type : "material";
    const pageInfo = {
      material: { title: "学习资料", summary: "后台上传的学习资料", empty: "暂无学习资料" },
      news: { title: "教育动态", summary: "灵智启程教育动态", empty: "暂无教育动态" },
      activity: { title: "活动风采", summary: "灵智启程活动风采", empty: "暂无活动内容" }
    }[contentType];

    try {
      if (contentType === "material") {
        const materials = await getMaterials();
        this.setData({
          materials,
          articles: [],
          activeType: contentType,
          pageTitle: pageInfo.title,
          pageSummary: pageInfo.summary,
          emptyText: pageInfo.empty
        });
        return;
      }
      const articles = await getArticles(contentType);
      this.setData({
        articles,
        materials: [],
        activeType: contentType,
        pageTitle: pageInfo.title,
        pageSummary: pageInfo.summary,
        emptyText: pageInfo.empty
      });
    } catch (error) {
      wx.showToast({ title: "内容加载失败", icon: "none" });
    }
  },
  goDetail(event) {
    const kind = event.currentTarget.dataset.kind || this.data.activeType;
    wx.navigateTo({ url: `/pages/article-detail/index?id=${event.currentTarget.dataset.id}&kind=${kind}` });
  }
});
