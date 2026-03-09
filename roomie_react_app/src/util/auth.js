export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_ID_KEY = "userId";
export const AUTH_EXPIRES_AT_KEY = "authExpiresAt";

export const setAuthSession = ({ token, userId, expiresInMs }) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (userId) {
    localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
  }

  if (typeof expiresInMs === "number" && !Number.isNaN(expiresInMs)) {
    const expiresAt = Date.now() + expiresInMs;
    localStorage.setItem(AUTH_EXPIRES_AT_KEY, String(expiresAt));
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_ID_KEY);
  localStorage.removeItem(AUTH_EXPIRES_AT_KEY);
};

export const getAuthExpiresAt = () => {
  const value = localStorage.getItem(AUTH_EXPIRES_AT_KEY);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};
