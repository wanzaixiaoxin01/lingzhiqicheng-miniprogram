const app = getApp();

export function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBaseUrl}${path}`,
      method: options.method || "GET",
      data: options.data,
      header: {
        "content-type": "application/json",
        ...options.header
      },
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response.data);
          return;
        }

        reject({
          ...(response.data && typeof response.data === "object" ? response.data : {}),
          statusCode: response.statusCode
        });
      },
      fail: reject
    });
  });
}
