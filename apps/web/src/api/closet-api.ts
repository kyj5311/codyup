import { httpClient, type ApiResponse } from "./http-client";
import type {
  ClosetAnalysis,
  ClosetItem,
  ClosetItemCreatePayload,
  ClosetItemUpdatePayload,
  MissingClosetItem,
} from "../types/closet";

/** 옷장 목록 조회 — GET /closet */
export async function fetchClosetItems(): Promise<ApiResponse<ClosetItem[]>> {
  const { data } = await httpClient.get<ApiResponse<ClosetItem[]>>("/closet");
  return data;
}

/** 옷장 아이템 단건 조회 — GET /closet/:id */
export async function fetchClosetItem(
  id: number,
): Promise<ApiResponse<ClosetItem>> {
  const { data } = await httpClient.get<ApiResponse<ClosetItem>>(
    `/closet/${id}`,
  );
  return data;
}

/** 옷장 아이템 등록 — POST /closet (JSON, imageUrl은 업로드 완료된 URL이어야 함) */
export async function createClosetItem(
  payload: ClosetItemCreatePayload,
): Promise<ApiResponse<ClosetItem>> {
  const { data } = await httpClient.post<ApiResponse<ClosetItem>>(
    "/closet",
    payload,
  );
  return data;
}

/** 옷장 아이템 수정 — PUT /closet/:id (수정할 필드만 전송) */
export async function updateClosetItem(
  id: number,
  payload: ClosetItemUpdatePayload,
): Promise<ApiResponse<ClosetItem>> {
  const { data } = await httpClient.put<ApiResponse<ClosetItem>>(
    `/closet/${id}`,
    payload,
  );
  return data;
}

/** 옷장 아이템 삭제 — DELETE /closet/:id */
export async function deleteClosetItem(
  id: number,
): Promise<ApiResponse<{ id: number; deleted: boolean }>> {
  const { data } = await httpClient.delete<
    ApiResponse<{ id: number; deleted: boolean }>
  >(`/closet/${id}`);
  return data;
}

/** 옷장 분석(카테고리/색상 집계) — GET /closet/analysis */
export async function fetchClosetAnalysis(): Promise<
  ApiResponse<ClosetAnalysis>
> {
  const { data } = await httpClient.get<ApiResponse<ClosetAnalysis>>(
    "/closet/analysis",
  );
  return data;
}

/** 부족 아이템 추천 — GET /closet/missing */
export async function fetchMissingClosetItems(): Promise<
  ApiResponse<MissingClosetItem[]>
> {
  const { data } = await httpClient.get<ApiResponse<MissingClosetItem[]>>(
    "/closet/missing",
  );
  return data;
}
