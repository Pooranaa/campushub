import axios from "axios";

export const API_BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getPosterUrl = (poster) => {
  if (!poster) {
    return null;
  }

  return `${API_BASE_URL}/uploads/${poster}`;
};

export default api;
