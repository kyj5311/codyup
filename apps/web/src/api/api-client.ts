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

// VITE_API_BASE_URL이 없으면(.env 미설정, 백엔드 미연동) 네트워크 요청 자체를 시도하지 않는다.
// 안 하면 Vite dev 서버가 알 수 없는 경로 요청에 index.html을 돌려줘서
// catch로 안 빠지고 응답이 이상하게 붕 뜨는 경우가 생긴다.
export function hasApiBase(): boolean {
  return Boolean(import.meta.env.VITE_API_BASE_URL);
}