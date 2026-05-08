import {apiURL} from "@/lib/constants";
import axios from "axios";

const axiosApi = axios.create({
  baseURL: apiURL
});

axiosApi.defaults.withCredentials = true;

const logoutAndRedirect = async () => {
  try {
    await axios.delete(`${apiURL}/users/sessions`, {
      withCredentials: true,
      timeout: 2000
    });
  } catch (e) {
    console.log('Could not notify api about logout', e);
  }


  try {
    // logout
  } catch (e) {
    console.log('Redux store not found.', e);
  }

  if (window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
};

axiosApi.interceptors.response.use((response) => response, async (error) => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && originalRequest && !originalRequest._retry && originalRequest.url !== '/users/token') {
    originalRequest._retry = true;

    try {
      await axios.post(`${apiURL}/users/token`, {}, {withCredentials: true});
      return axiosApi(originalRequest);
    } catch (refreshError) {
      await logoutAndRedirect();
      return Promise.reject(refreshError);
    }
  }
})
