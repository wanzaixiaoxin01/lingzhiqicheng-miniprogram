import { getArticle, getMaterial } from "../../services/api";
import { savedMaterialKey } from "../../utils/material-file";

const PREVIEW_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

Page({
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
  },
  previewMaterial() {
    this.transferMaterial("preview");
  },
  downloadMaterial() {
    this.transferMaterial("download");
  },
  shareSavedFile() {
    const material = this.data.material;
    const filePath = this.data.savedFilePath;
    if (!material || !filePath) {
      wx.showToast({ title: "请先下载文件", icon: "none" });
      return;
    }
    if (typeof wx.shareFileMessage !== "function") {
      wx.showToast({ title: "当前微信版本不支持转发文件", icon: "none" });
      return;
    }

    wx.shareFileMessage({
      filePath,
      fileName: material.file_name || material.title || "学习资料",
      fail: (error) => {
        const message = error && error.errMsg ? error.errMsg : "";
        if (!message.toLowerCase().includes("cancel")) {
          wx.showToast({ title: "暂时无法转发该文件", icon: "none" });
        }
      }
    });
  },
  transferMaterial(mode) {
    const material = this.data.material;
    if (!material || this.data.downloading) {
      return;
    }

    const app = getApp();
    const url = material.download_url.startsWith("http")
      ? material.download_url
      : `${app.globalData.apiBaseUrl}${material.download_url}`;
    const extension = material.extension.replace(".", "").toLowerCase();
    this.setData({ downloading: true });
    wx.showLoading({ title: "下载中" });
    wx.downloadFile({
      url,
      success: (response) => {
        if (response.statusCode !== 200) {
          wx.showToast({ title: "下载失败", icon: "none" });
          return;
        }
        if (mode === "preview" && IMAGE_EXTENSIONS.includes(extension)) {
          wx.previewImage({ current: response.tempFilePath, urls: [response.tempFilePath] });
          return;
        }
        if (mode === "preview" && material.can_preview && PREVIEW_EXTENSIONS.includes(extension)) {
          wx.openDocument({
            filePath: response.tempFilePath,
            fileType: extension,
            showMenu: true,
            fail: () => wx.showToast({ title: "暂不支持预览，请重试下载", icon: "none" })
          });
          return;
        }
        this.saveDownloadedFile(response.tempFilePath, extension);
      },
      fail: () => wx.showToast({ title: "下载失败", icon: "none" }),
      complete: () => {
        this.setData({ downloading: false });
        wx.hideLoading();
      }
    });
  },
  saveDownloadedFile(filePath, extension) {
    if (IMAGE_EXTENSIONS.includes(extension)) {
      this.saveToMiniProgramFiles(
        filePath,
        "",
        () => this.saveImageToPhotosAlbum(filePath, true),
        () => this.saveImageToPhotosAlbum(filePath, false)
      );
      return;
    }
    this.saveToMiniProgramFiles(filePath, "已保存到小程序文件");
  },
  saveImageToPhotosAlbum(filePath, hasMiniProgramCopy) {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => wx.showToast({
        title: hasMiniProgramCopy ? "已保存到相册，可转发" : "已保存到系统相册",
        icon: "success"
      }),
      fail: (error) => {
        const message = error && error.errMsg ? error.errMsg : "";
        if (message.includes("auth deny") || message.includes("auth denied")) {
          wx.showModal({
            title: "需要相册权限",
            content: hasMiniProgramCopy
              ? "请允许小程序访问相册后重试。文件已经保存到小程序内，可直接转发。"
              : "请允许小程序访问相册后重试。",
            confirmText: "去设置",
            cancelText: "知道了",
            success: (result) => {
              if (result.confirm) {
                wx.openSetting();
              }
            }
          });
          return;
        }
        wx.showToast({
          title: hasMiniProgramCopy ? "文件已保存，可转发" : "图片保存失败，请重试",
          icon: hasMiniProgramCopy ? "success" : "none"
        });
      }
    });
  },
  restoreSavedFile(material) {
    if (!material || material.id === undefined || material.id === null) {
      return;
    }
    const key = savedMaterialKey(material.id);
    let savedFilePath = "";
    try {
      savedFilePath = wx.getStorageSync(key) || "";
    } catch (error) {
      return;
    }
    if (!savedFilePath) {
      return;
    }
    if (typeof wx.getSavedFileInfo !== "function") {
      return;
    }
    wx.getSavedFileInfo({
      filePath: savedFilePath,
      success: () => this.setData({ savedFilePath }),
      fail: () => {
        try {
          wx.removeStorageSync(key);
        } catch (error) {
          // Ignore stale local storage cleanup failures.
        }
      }
    });
  },
  saveToMiniProgramFiles(filePath, successTitle, onSaved, onFailed) {
    const material = this.data.material;
    if (!material || material.id === undefined || material.id === null) {
      if (onFailed) {
        onFailed();
        return;
      }
      wx.showToast({ title: "文件保存失败，请重试", icon: "none" });
      return;
    }
    wx.saveFile({
      tempFilePath: filePath,
      success: (response) => {
        // `wx.saveFile` is the durable copy used by `wx.shareFileMessage`.
        const savedFilePath = response.savedFilePath;
        let storageSaved = true;
        try {
          wx.setStorageSync(savedMaterialKey(material.id), savedFilePath);
        } catch (error) {
          storageSaved = false;
          wx.showToast({ title: "文件已保存但状态记录失败", icon: "none" });
        }
        if (storageSaved) {
          this.setData({ savedFilePath });
        }
        if (successTitle) {
          wx.showToast({ title: successTitle, icon: "success" });
        }
        if (onSaved) {
          onSaved();
        }
      },
      fail: () => {
        if (onFailed) {
          onFailed();
          return;
        }
        wx.showToast({ title: "文件保存失败，请重试", icon: "none" });
      }
    });
  }
});
