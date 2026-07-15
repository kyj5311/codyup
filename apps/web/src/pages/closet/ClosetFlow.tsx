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
import type { ClosetItem, ClosetItemDraft } from "../../types/closet";

type View = "list" | "register" | "detail";

function draftToLocalItem(id: string, draft: ClosetItemDraft): ClosetItem {
  return {
    id,
    imageUrl: draft.imagePreviewUrl,
    category: draft.category!,
    subCategory: draft.subCategory!,
    color: draft.color!,
    seasons: draft.seasons,
    memo: draft.memo,
  };
}

export default function ClosetFlow() {
  const [view, setView] = useState<View>("list");
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    // BE1 연동: 옷장 목록 조회
    fetchClosetItems()
      .then((res) => {
        if (isMounted && res.success && res.data) setItems(res.data);
      })
      .catch(() => {
        // BE1 API 연결 전이라 실패는 정상 — 빈 옷장으로 시작
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
    setIsSaving(true);
    const localId = crypto.randomUUID();
    try {
      // BE1 연동: 옷 등록
      await createClosetItem(draft);
    } catch {
      // API 연결 전이라도 화면 확인을 위해 로컬에는 반영
    } finally {
      setIsSaving(false);
    }
    setItems((prev) => [draftToLocalItem(localId, draft), ...prev]);
    setView("list");
  }

  async function handleUpdate(id: string, draft: ClosetItemDraft) {
    setIsSaving(true);
    try {
      // BE1 연동: 옷 정보 수정
      await updateClosetItem(id, draft);
    } catch {
      // API 연결 전이라도 화면 확인을 위해 로컬에는 반영
    } finally {
      setIsSaving(false);
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? draftToLocalItem(id, draft) : item,
      ),
    );
  }

  async function handleDelete(id: string) {
    try {
      // BE1 연동: 옷 삭제
      await deleteClosetItem(id);
    } catch {
      // API 연결 전이라도 화면 확인을 위해 로컬에는 반영
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
            setView("detail");
          }}
          onAddNew={() => setView("register")}
          onDeleteItem={handleDelete}
        />
      )}

      {view === "register" && (
        <ClosetItemForm
          title="옷 등록"
          isSaving={isSaving}
          onBack={() => setView("list")}
          onSubmit={handleCreate}
        />
      )}

      {view === "detail" && selectedItem && (
        <ClosetItemDetail
          item={selectedItem}
          isSaving={isSaving}
          onBack={() => setView("list")}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
