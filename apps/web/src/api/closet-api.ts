import axios from "axios";
import type { ClosetItem, ClosetItemDraft } from "../types/closet";

// CLAUDE.md 규약: 공통 응답 포맷 { success, data, error }
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function buildFormData(draft: ClosetItemDraft): FormData {
  const formData = new FormData();
  if (draft.imageFile) formData.append("image", draft.imageFile);
  if (draft.category) formData.append("category", draft.category);
  if (draft.subCategory) formData.append("subCategory", draft.subCategory);
  if (draft.color) formData.append("color", draft.color.name);
  draft.seasons.forEach((season) => formData.append("seasons[]", season));
  formData.append("memo", draft.memo);
  return formData;
}

/** 옷장 목록 조회 — TODO(BE1): GET /api/closet-items 응답 스펙 확정 */
export async function fetchClosetItems(): Promise<ApiResponse<ClosetItem[]>> {
  const { data } = await client.get<ApiResponse<ClosetItem[]>>(
    "/api/closet-items",
  );
  return data;
}

/** 옷 등록 — TODO(BE1): POST /api/closet-items 스펙 확정 */
export async function createClosetItem(
  draft: ClosetItemDraft,
): Promise<ApiResponse<ClosetItem>> {
  const { data } = await client.post<ApiResponse<ClosetItem>>(
    "/api/closet-items",
    buildFormData(draft),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

/** 옷 정보 수정 — TODO(BE1): PATCH /api/closet-items/:id 스펙 확정 */
export async function updateClosetItem(
  id: string,
  draft: ClosetItemDraft,
): Promise<ApiResponse<ClosetItem>> {
  const { data } = await client.patch<ApiResponse<ClosetItem>>(
    `/api/closet-items/${id}`,
    buildFormData(draft),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

/** 옷 삭제 — TODO(BE1): DELETE /api/closet-items/:id 스펙 확정 */
export async function deleteClosetItem(
  id: string,
): Promise<ApiResponse<null>> {
  const { data } = await client.delete<ApiResponse<null>>(
    `/api/closet-items/${id}`,
  );
  return data;
}
