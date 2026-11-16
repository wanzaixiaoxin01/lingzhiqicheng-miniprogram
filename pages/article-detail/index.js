import { getArticle, getMaterial } from "../../services/api";
import { MATERIAL_ACTIONS } from "../../utils/material-actions";

Page({
  ...MATERIAL_ACTIONS,
  data: {
    article: null,
    material: null,
    isMaterial: false,
    downloading: false,
    savedFilePath: ""
  },
  onLoad(options) {
    if (options.id) {
      if (options.kind === "material") {
        this.loadMaterial(options.id);
      } else {
        this.loadArticle(options.id);
      }
    }
  },
  async loadArticle(id) {
    try {
      const article = await getArticle(id);
      this.setData({ article });
    } catch (error) {
      wx.showToast({ title: "内容加载失败", icon: "none" });
    }
  },
  async loadMaterial(id) {
    try {
      const material = await getMaterial(id);
      this.setData({ material, article: null, isMaterial: true });
      this.restoreSavedFile(material);
    } catch (error) {
      wx.showToast({ title: "资料加载失败", icon: "none" });
    }
  }
});
