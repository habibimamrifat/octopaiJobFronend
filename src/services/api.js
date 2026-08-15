import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Decode JWT payload
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];

    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Handle expired access token
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 responses once
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem("refreshToken");

    // No refresh token -> logout
    if (!refreshToken) {
      localStorage.removeItem("octopiUser");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      window.location.href = "/login";

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Use axios directly so this request does not
      // trigger the interceptor again.
      const response = await axios.post("http://localhost:3000/auth/refresh", {
        refreshToken,
      });

      const newAccessToken = response.data.accessToken;

      const newRefreshToken = response.data.refreshToken;

      // Decode the NEW access token
      const payload = decodeToken(newAccessToken);

      // Keep EXACTLY the same octopiUser structure
      // used by your current AuthContext.
      const octopiUser = {
        id: payload?.id || null,
        role: payload?.role || null,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || refreshToken,
      };

      // Update stored user
      localStorage.setItem("octopiUser", JSON.stringify(octopiUser));

      // Update access token
      localStorage.setItem("accessToken", newAccessToken);

      // Update refresh token only if backend
      // returned a new one.
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      // Put the new token on the original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh token is invalid/expired
      localStorage.removeItem("octopiUser");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  },
);

export default api;
