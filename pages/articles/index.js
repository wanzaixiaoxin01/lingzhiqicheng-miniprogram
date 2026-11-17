import { getArticles, getMaterials } from "../../services/api";
import { MATERIAL_ACTIONS } from "../../utils/material-actions";

Page({
  ...MATERIAL_ACTIONS,
  data: {
    activeType: "material",
    pageTitle: "空间公告",
    pageSummary: "查看场地开放、活动安排与服务通知",
    emptyText: "暂无空间公告",
    articles: [],
    materials: [],
    downloadingId: "",
    activeMaterialAction: "",
    savedFilePaths: {}
  },
  onLoad(options) {
    this.loadContent(options.type || "material");
  },
  async loadContent(type) {
    const contentType = ["news", "activity"].includes(type) ? type : "material";
    const pageInfo = {
      material: { title: "空间公告", summary: "查看场地开放、活动安排与服务通知", empty: "暂无空间公告" },
      news: { title: "品牌动态", summary: "灵智启程品牌动态", empty: "暂无品牌动态" },
      activity: { title: "活动风采", summary: "灵智启程活动风采", empty: "暂无活动内容" }
    }[contentType];

    try {
      if (contentType === "material") {
        const materials = (await getMaterials()).map((item, index) => ({
          ...item,
          fileType: String(item.extension || "FILE").replace(".", "").toUpperCase(),
          fileIndex: `${index < 9 ? "0" : ""}${index + 1}`
        }));
        this.setData({
          materials,
          articles: [],
          activeType: contentType,
          pageTitle: pageInfo.title,
          pageSummary: pageInfo.summary,
          emptyText: pageInfo.empty
        });
        materials.forEach((item) => this.restoreSavedFile(item));
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
