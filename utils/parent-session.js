import { authorizeParentPhone, createParentSession } from "../services/api";

export const PARENT_SESSION_KEY = "parent-session-token";
export const PARENT_PHONE_AUTHORIZED_KEY = "parent-phone-authorized";

export function getParentSessionToken() {
  try {
    return wx.getStorageSync(PARENT_SESSION_KEY) || "";
  } catch (error) {
    return "";
  }
}

export function isParentPhoneAuthorized() {
  try {
    return Boolean(wx.getStorageSync(PARENT_PHONE_AUTHORIZED_KEY));
  } catch (error) {
    return false;
  }
}

export function markParentPhoneAuthorized() {
  wx.setStorageSync(PARENT_PHONE_AUTHORIZED_KEY, true);
}

function wechatLogin() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (response) => response.code ? resolve(response.code) : reject(new Error("微信登录失败")),
      fail: reject
    });
  });
}

export async function ensureParentSession() {
  const existing = getParentSessionToken();
  if (existing) {
    return existing;
  }
  const code = await wechatLogin();
  const result = await createParentSession({ code });
  wx.setStorageSync(PARENT_SESSION_KEY, result.session_token);
  return result.session_token;
}

export async function withParentSession(operation) {
  const sessionToken = await ensureParentSession();
  try {
    return await operation(sessionToken);
  } catch (error) {
    if (!error || error.statusCode !== 401) {
      throw error;
    }
    wx.removeStorageSync(PARENT_SESSION_KEY);
    wx.removeStorageSync(PARENT_PHONE_AUTHORIZED_KEY);
    const renewedToken = await ensureParentSession();
    return operation(renewedToken);
  }
}

export async function authorizeParentWithPhone(phoneCode) {
  if (!phoneCode) {
    throw new Error("未获得手机号授权");
  }
  const sessionToken = await ensureParentSession();
  const result = await authorizeParentPhone(phoneCode, sessionToken);
  markParentPhoneAuthorized();
  return result;
}
