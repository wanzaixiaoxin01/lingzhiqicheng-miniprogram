import { savedMaterialKey } from "./material-file.js";

const PREVIEW_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

function findMaterial(page, event) {
  const dataset = event && event.currentTarget ? event.currentTarget.dataset : null;
  const id = dataset ? dataset.id : null;
  if (id !== undefined && id !== null && Array.isArray(page.data.materials)) {
    return page.data.materials.find((item) => String(item.id) === String(id)) || null;
  }
  return page.data.material || null;
}

function isListPage(page) {
  return Array.isArray(page.data.materials);
}

function getSavedPath(page, material) {
  if (isListPage(page)) {
    return (page.data.savedFilePaths || {})[material.id] || "";
  }
  return page.data.savedFilePath || "";
}

function setBusy(page, material, busy, action) {
  if (isListPage(page)) {
    page.setData({
      downloadingId: busy ? material.id : "",
      activeMaterialAction: busy ? action : ""
    });
    return;
  }
  page.setData({ downloading: busy });
}

function setSavedPath(page, material, savedFilePath) {
  if (isListPage(page)) {
    page.setData({
      savedFilePaths: {
        ...(page.data.savedFilePaths || {}),
        [material.id]: savedFilePath
      }
    });
    return;
  }
  page.setData({ savedFilePath });
}

export const MATERIAL_ACTIONS = {
  previewMaterial(event) {
    const material = findMaterial(this, event);
    if (material) {
      this.transferMaterial(material, "preview");
    }
  },

  downloadMaterial(event) {
    const material = findMaterial(this, event);
    if (material) {
      this.transferMaterial(material, "download");
    }
  },

  shareSavedFile(event) {
    const material = findMaterial(this, event);
    if (!material) {
      return;
    }
    const filePath = getSavedPath(this, material);
    if (filePath) {
      this.openShare(material, filePath);
      return;
    }
    this.transferMaterial(material, "share");
  },

  openShare(material, filePath) {
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

  transferMaterial(material, mode) {
    if (!material || this.data.downloading || this.data.downloadingId) {
      return;
    }
    const app = getApp();
    const downloadUrl = material.download_url || "";
    const url = downloadUrl.startsWith("http")
      ? downloadUrl
      : `${app.globalData.apiBaseUrl}${downloadUrl}`;
    const extension = String(material.extension || "").replace(".", "").toLowerCase();

    setBusy(this, material, true, mode);
    wx.showLoading({ title: mode === "share" ? "准备转发" : "下载中" });
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
        this.saveDownloadedFile(material, response.tempFilePath, extension, mode);
      },
      fail: () => wx.showToast({ title: "下载失败", icon: "none" }),
      complete: () => {
        setBusy(this, material, false, mode);
        wx.hideLoading();
      }
    });
  },

  saveDownloadedFile(material, filePath, extension, mode) {
    if (mode === "share") {
      this.saveToMiniProgramFiles(material, filePath, "", (savedFilePath) => {
        this.openShare(material, savedFilePath);
      });
      return;
    }
    if (IMAGE_EXTENSIONS.includes(extension)) {
      this.saveToMiniProgramFiles(
        material,
        filePath,
        "",
        () => this.saveImageToPhotosAlbum(filePath, true),
        () => this.saveImageToPhotosAlbum(filePath, false)
      );
      return;
    }
    this.saveToMiniProgramFiles(material, filePath, "已保存到小程序文件");
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
    if (!savedFilePath || typeof wx.getSavedFileInfo !== "function") {
      return;
    }
    wx.getSavedFileInfo({
      filePath: savedFilePath,
      success: () => setSavedPath(this, material, savedFilePath),
      fail: () => {
        try {
          wx.removeStorageSync(key);
        } catch (error) {
          // Ignore stale local storage cleanup failures.
        }
      }
    });
  },

  saveToMiniProgramFiles(material, filePath, successTitle, onSaved, onFailed) {
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
        const savedFilePath = response.savedFilePath;
        let storageSaved = true;
        try {
          wx.setStorageSync(savedMaterialKey(material.id), savedFilePath);
        } catch (error) {
          storageSaved = false;
          wx.showToast({ title: "文件已保存但状态记录失败", icon: "none" });
        }
        if (storageSaved) {
          setSavedPath(this, material, savedFilePath);
        }
        if (successTitle) {
          wx.showToast({ title: successTitle, icon: "success" });
        }
        if (onSaved) {
          onSaved(savedFilePath);
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
};
