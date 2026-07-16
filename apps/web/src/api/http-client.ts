import axios from "axios";

// BE1 API 명세서 기준 baseURL: http://localhost:4000/api
// .env에 VITE_API_BASE_URL을 설정해서 사용 (.env.example 참고).
// 값이 비어있어도 로컬 개발이 바로 되도록 기본값을 둠 (BE1 확인 반영).
export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// CLAUDE.md 규약: 공통 응답 포맷 { success, data, error }
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}
