import axios from "axios";

export const API_BASE_URL = "http://localhost:5000/api";

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default instance;
