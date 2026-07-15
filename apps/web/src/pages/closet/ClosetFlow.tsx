import { useEffect, useState } from "react";
import ClosetHome from "./ClosetHome";
import ClosetItemForm from "./ClosetItemForm";
import ClosetItemDetail from "./ClosetItemDetail";
import {
  createClosetItem,
  deleteClosetItem,
  fetchClosetItems,
  updateClosetItem,
} from "../../api/closet-api";
import { draftToCreatePayload, type ClosetItem, type ClosetItemDraft } from "../../types/closet";

type View = "list" | "register" | "detail";

export default function ClosetFlow() {
  const [view, setView] = useState<View>("list");
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    // BE1 연동: GET /closet 옷장 목록 조회
    fetchClosetItems()
      .then((res) => {
        if (isMounted && res.success && res.data) setItems(res.data);
      })
      .catch(() => {
        // BE1 서버 연결 전이라 실패는 정상 — 빈 옷장으로 시작
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
        setView("detail");
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
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-cream px-6 pt-8">
      {view === "list" && (
        <ClosetHome
          items={items}
          isLoading={isLoading}
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
        />
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
    </div>
  );
}
