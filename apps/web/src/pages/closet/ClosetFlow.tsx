import { useEffect, useState } from "react";
import ClosetHome from "./ClosetHome";
import ClosetItemForm from "./ClosetItemForm";
import ClosetItemDetail from "./ClosetItemDetail";
import ClosetAnalysisView from "./ClosetAnalysis";
import Toast from "../../components/Toast";
import {
  createClosetItem,
  deleteClosetItem,
  fetchClosetItems,
  updateClosetItem,
} from "../../api/closet-api";
import { MOCK_CLOSET_ITEMS } from "../../utils/mock-closet-data";
import { draftToCreatePayload, type ClosetItem, type ClosetItemDraft } from "../../types/closet";

type View = "list" | "register" | "detail" | "analysis";

interface ClosetFlowProps {
  // 대시보드의 "AI 분석" 버튼처럼 옷장이 아닌 분석 화면으로 바로 진입해야 하는 경우 사용.
  // 지정하지 않으면 기존과 동일하게 목록 화면부터 시작.
  initialView?: View;
}

export default function ClosetFlow({ initialView = "list" }: ClosetFlowProps) {
  const [view, setView] = useState<View>(initialView);
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // App.tsx에서 대시보드 진입 경로가 바뀔 때마다(list <-> analysis) 반영
  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    let isMounted = true;
    // BE1 연동: GET /closet 옷장 목록 조회
    fetchClosetItems()
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setItems(res.data);
        } else {
          // API가 응답은 했지만 실패 — 데모가 비어 보이지 않도록 목업으로 대체
          setItems(MOCK_CLOSET_ITEMS);
          setIsMockData(true);
        }
      })
      .catch(() => {
        // BE1 서버 연결 전 — 목업 데이터로 화면 확인 가능하게 함
        if (isMounted) {
          setItems(MOCK_CLOSET_ITEMS);
          setIsMockData(true);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  async function handleCreate(draft: ClosetItemDraft) {
    const payload = draftToCreatePayload(draft);
    if (!payload) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      // BE1 연동: POST /closet
      const res = await createClosetItem(payload);
      if (res.success && res.data) {
        setItems((prev) => [res.data as ClosetItem, ...prev]);
        setView("list");
      } else {
        setErrorMessage(res.error?.message ?? "등록에 실패했어요.");
      }
    } catch {
      setErrorMessage("서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(id: number, draft: ClosetItemDraft) {
    const payload = draftToCreatePayload(draft);
    if (!payload) return;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      // BE1 연동: PUT /closet/:id
      const res = await updateClosetItem(id, payload);
      if (res.success && res.data) {
        const updated = res.data;
        setItems((prev) =>
          prev.map((item) => (item.id === id ? updated : item)),
        );
        setToastMessage("수정 완료!");
        setView("list");
      } else {
        setErrorMessage(res.error?.message ?? "수정에 실패했어요.");
      }
    } catch {
      setErrorMessage("서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      // BE1 연동: DELETE /closet/:id
      await deleteClosetItem(id);
    } catch {
      // 실패해도 화면 확인을 위해 로컬 목록에서는 제거
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
      setView("list");
    }
  }

  return (
    <div className="p-5">
      {view === "list" && (
        <ClosetHome
          items={items}
          isLoading={isLoading}
          isMockData={isMockData}
          onSelectItem={(id) => {
            setSelectedId(id);
            setErrorMessage(null);
            setView("detail");
          }}
          onAddNew={() => {
            setErrorMessage(null);
            setView("register");
          }}
          onDeleteItem={handleDelete}
          onOpenAnalysis={() => setView("analysis")}
        />
      )}

      {view === "analysis" && (
        <ClosetAnalysisView onBack={() => setView("list")} />
      )}

      {view === "register" && (
        <ClosetItemForm
          title="옷 등록"
          isSaving={isSaving}
          errorMessage={errorMessage}
          onBack={() => setView("list")}
          onSubmit={handleCreate}
        />
      )}

      {view === "detail" && selectedItem && (
        <ClosetItemDetail
          item={selectedItem}
          isSaving={isSaving}
          errorMessage={errorMessage}
          onBack={() => setView("list")}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}

      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
    </div>
  );
}
