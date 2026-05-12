import axios from "axios";

import { apiURL } from "@/lib/constants";

const axiosApi = axios.create({
  baseURL: apiURL,
  withCredentials: true,
});

const logoutAndRedirect = async () => {
  try {
    await axios.delete(`${apiURL}/users/sessions`, {
      withCredentials: true,
      timeout: 2000,
    });
  } catch (e) {
    console.log("Could not notify services about logout", e);
  }

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

axiosApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== "/users/token" &&
      originalRequest.url !== "/users/sessions"
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${apiURL}/users/token`,
          {},
          { withCredentials: true },
        );

        return axiosApi(originalRequest);
      } catch (refreshError) {
        await logoutAndRedirect();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosApi;
