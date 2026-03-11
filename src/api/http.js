import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Resquest Interceptor for JWT
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for 401 Unauthorized
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = '/Login';
    }
    return Promise.reject(error);
  }
);
