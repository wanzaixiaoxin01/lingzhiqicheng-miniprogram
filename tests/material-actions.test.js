import test from "node:test";
import assert from "node:assert/strict";
import { MATERIAL_ACTIONS } from "../utils/material-actions.js";

function createPage(material) {
  return {
    ...MATERIAL_ACTIONS,
    data: {
      materials: [material],
      downloadingId: "",
      activeMaterialAction: "",
      savedFilePaths: {}
    },
    setData(patch) {
      this.data = { ...this.data, ...patch };
    }
  };
}

test("sharing an unsaved material downloads, persists and shares it from the list", () => {
  const calls = [];
  const material = {
    id: 12,
    title: "期中试卷",
    file_name: "期中试卷.pdf",
    extension: "pdf",
    download_url: "/api/materials/12/download"
  };
  const page = createPage(material);

  globalThis.getApp = () => ({ globalData: { apiBaseUrl: "http://127.0.0.1:4000" } });
  globalThis.wx = {
    showLoading: ({ title }) => calls.push(["loading", title]),
    hideLoading: () => calls.push(["hideLoading"]),
    showToast: () => {},
    downloadFile: ({ url, success, complete }) => {
      calls.push(["download", url]);
      success({ statusCode: 200, tempFilePath: "/tmp/material.pdf" });
      complete();
    },
    saveFile: ({ tempFilePath, success }) => {
      calls.push(["save", tempFilePath]);
      success({ savedFilePath: "wxfile://saved/material.pdf" });
    },
    setStorageSync: (key, value) => calls.push(["storage", key, value]),
    shareFileMessage: ({ filePath, fileName }) => calls.push(["share", filePath, fileName])
  };

  page.shareSavedFile({ currentTarget: { dataset: { id: 12 } } });

  assert.deepEqual(calls.find(([type]) => type === "download"), [
    "download",
    "http://127.0.0.1:4000/api/materials/12/download"
  ]);
  assert.deepEqual(calls.find(([type]) => type === "save"), ["save", "/tmp/material.pdf"]);
  assert.deepEqual(calls.find(([type]) => type === "share"), [
    "share",
    "wxfile://saved/material.pdf",
    "期中试卷.pdf"
  ]);
  assert.equal(page.data.savedFilePaths[12], "wxfile://saved/material.pdf");
});

test("preview opens a previewable document without saving it", () => {
  const calls = [];
  const material = {
    id: 13,
    title: "复习资料",
    extension: ".docx",
    can_preview: true,
    download_url: "https://files.example.com/review.docx"
  };
  const page = createPage(material);

  globalThis.getApp = () => ({ globalData: { apiBaseUrl: "http://127.0.0.1:4000" } });
  globalThis.wx = {
    showLoading: () => {},
    hideLoading: () => {},
    showToast: () => {},
    downloadFile: ({ success, complete }) => {
      success({ statusCode: 200, tempFilePath: "/tmp/review.docx" });
      complete();
    },
    openDocument: (options) => calls.push(options),
    saveFile: () => assert.fail("preview should not save the file")
  };

  page.previewMaterial({ currentTarget: { dataset: { id: 13 } } });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].filePath, "/tmp/review.docx");
  assert.equal(calls[0].fileType, "docx");
  assert.equal(calls[0].showMenu, true);
});
