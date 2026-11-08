const apiBaseUrls = {
  develop: "http://127.0.0.1:4000",
  trial: "https://api-test.lingzhiqicheng.com",
  release: "https://api.lingzhiqicheng.com"
};

function getApiBaseUrl() {
  let envVersion = "develop";
  let platform = "devtools";
  try {
    envVersion = wx.getAccountInfoSync().miniProgram.envVersion;
  } catch (error) {
    // Older developer tools may not expose account environment information.
  }
  try {
    platform = wx.getSystemInfoSync().platform;
  } catch (error) {
    // Keep the developer-tools default when device information is unavailable.
  }

  if (platform !== "devtools" && envVersion !== "release") {
    return apiBaseUrls.trial;
  }
  return apiBaseUrls[envVersion] || apiBaseUrls.develop;
}

App({
  globalData: {
    apiBaseUrl: getApiBaseUrl(),
    apiBaseUrls
  }
});
