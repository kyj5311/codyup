import axios from "axios";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

// http-client.ts(FE1)와 동일한 baseURL 규약으로 통일 (/api 포함).
// 호출부는 "/api/..."가 아니라 "/purchase-roadmap"처럼 /api 없이 경로만 씀.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
