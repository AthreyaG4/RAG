import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000,
});

let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (logoutCallback) {
        logoutCallback();
      }
    }
    return Promise.reject(error);
  },
);

export default instance;
