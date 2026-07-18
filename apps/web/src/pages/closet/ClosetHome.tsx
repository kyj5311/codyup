import { useMemo, useState } from "react";
import { Bell, ChevronRight, Menu, PieChart, Plus } from "lucide-react";
import Tabs from "../../components/Tabs";
import Card from "../../components/Card";
import ClosetItemThumbnail from "../../components/ClosetItemThumbnail";
import type { ClosetItem, ClothingCategory } from "../../types/closet";

const TABS = ["전체", "상의", "하의", "아우터", "신발", "악세서리"] as const;
type TabValue = (typeof TABS)[number];

interface ClosetHomeProps {
  items: ClosetItem[];
  isLoading: boolean;
  isMockData?: boolean;
  onSelectItem: (id: number) => void;
  onAddNew: () => void;
  onDeleteItem: (id: number) => void;
  onOpenAnalysis: () => void;
}

export default function ClosetHome({
  items,
  isLoading,
  isMockData = false,
  onSelectItem,
  onAddNew,
  onDeleteItem,
  onOpenAnalysis,
}: ClosetHomeProps) {
  const [tab, setTab] = useState<TabValue>("전체");
  const [isEditing, setIsEditing] = useState(false);

  const filteredItems = useMemo(() => {
    if (tab === "전체") return items;
    return items.filter((item) => item.category === (tab as ClothingCategory));
  }, [items, tab]);

  return (
    <div className="min-h-full pb-24">
      <header className="flex items-center justify-between py-2">
        <button type="button" aria-label="메뉴" className="text-ink">
          <Menu size={22} strokeWidth={1.75} />
        </button>
        <h1 className="text-lg font-bold text-ink">내옷장</h1>
        <button type="button" aria-label="알림" className="text-ink">
          <Bell size={22} strokeWidth={1.75} />
        </button>
      </header>

      {isMockData && (
        <p className="mt-2 rounded-xl bg-cream-deep px-3 py-1.5 text-xs text-gray-text">
          서버 연결 전이라 샘플 데이터를 보여주고 있어요.
        </p>
      )}

      <div className="mt-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      <button type="button" onClick={onOpenAnalysis} className="mt-4 block w-full text-left">
        <Card tone="yellow" className="flex items-center justify-between !py-3.5">
          <div className="flex items-center gap-2">
            <PieChart size={18} strokeWidth={2} className="text-ink" />
            <span className="text-sm font-semibold text-ink">
              옷장 분석 보기
            </span>
          </div>
          <ChevronRight size={18} strokeWidth={2} className="text-ink" />
        </Card>
      </button>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-text">총 {filteredItems.length}개</p>
        <button
          type="button"
          onClick={() => setIsEditing((prev) => !prev)}
          className="rounded-xl border border-line px-3 py-1.5 text-sm font-medium text-ink-soft"
        >
          {isEditing ? "완료" : "편집"}
        </button>
      </div>

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-gray-text">
          옷장을 불러오는 중...
        </p>
      ) : filteredItems.length === 0 ? (
        <p className="mt-10 text-center text-sm text-gray-text">
          아직 등록된 옷이 없어요. 오른쪽 아래 + 버튼으로 추가해 보세요.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <ClosetItemThumbnail
              key={item.id}
              imageUrl={item.imageUrl}
              alt={`${item.category} ${item.color}`}
              category={item.category}
              onClick={() => onSelectItem(item.id)}
              onDelete={isEditing ? () => onDeleteItem(item.id) : undefined}
            />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onAddNew}
        aria-label="옷 등록하기"
        className="fixed bottom-8 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-yellow text-ink shadow-lg"
      >
        <Plus size={26} strokeWidth={2} />
      </button>
    </div>
  );
}
