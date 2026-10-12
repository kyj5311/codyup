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

// axios는 4xx/5xx 응답을 기본적으로 예외로 던지는데, 이 서버는 에러 상황에서도
// { success:false, error:{message} } 형태의 정상 JSON을 응답하므로 그대로 예외 처리하면
// 각 화면의 "res.error?.message" 분기가 죽고 무조건 "서버에 연결할 수 없어요"만 뜬다.
// 서버가 응답을 준 경우(4xx/5xx 포함)는 그대로 resolve시켜서 기존 res.success 분기를 타게 하고,
// 응답 자체가 없는 진짜 네트워크 오류(서버 다운 등)만 reject로 남긴다.
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      return Promise.resolve(error.response);
    }
    return Promise.reject(error);
  },
);

// CLAUDE.md 규약: 공통 응답 포맷 { success, data, error }
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}
