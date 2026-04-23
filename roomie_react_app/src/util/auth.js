export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_ID_KEY = "userId";
export const AUTH_EXPIRES_AT_KEY = "authExpiresAt";
export const AUTH_CHANGE_EVENT = "auth-change";
export const USER_ROLE = "userRole";
export const ROLE_ADMIN = "ROLE_ADMIN";
export const ROLE_USER = "ROLE_USER";

let authExpiryTimeoutId = null;

const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const getUserRole = () =>
  normalizeUserRole(localStorage.getItem(USER_ROLE));

export const normalizeUserRole = (role) => {
  if (role === "ADMIN") return ROLE_ADMIN;
  if (role === "USER") return ROLE_USER;
  return role;
};

const clearAuthExpiryTimeout = () => {
  if (authExpiryTimeoutId) {
    window.clearTimeout(authExpiryTimeoutId);
    authExpiryTimeoutId = null;
  }
};

const scheduleAuthSessionClear = () => {
  clearAuthExpiryTimeout();

  const expiresAt = getAuthExpiresAt();

  if (!expiresAt) {
    return;
  }

  const remainingMs = expiresAt - Date.now();

  if (remainingMs <= 0) {
    clearAuthSession();
    return;
  }

  authExpiryTimeoutId = window.setTimeout(() => {
    authExpiryTimeoutId = null;
    clearAuthSession();
  }, remainingMs);
};

export const setAuthSession = ({ token, userId, expiresInMs, userRole }) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (userId) {
    localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
  }

  if (userRole) {
    localStorage.setItem(USER_ROLE, String(normalizeUserRole(userRole)));
  }

  if (typeof expiresInMs === "number" && !Number.isNaN(expiresInMs)) {
    const expiresAt = Date.now() + expiresInMs;
    localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));
  }

  scheduleAuthSessionClear();

  notifyAuthChange();
};

export const clearAuthSession = () => {
  clearAuthExpiryTimeout();

  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_ID_KEY);
  localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
  localStorage.removeItem(USER_ROLE);

  notifyAuthChange();
};

export const getAuthExpiresAt = () => {
  const value = localStorage.getItem(AUTH_EXPIRES_AT_KEY);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

scheduleAuthSessionClear();
