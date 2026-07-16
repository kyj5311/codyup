import { Menu, Bell } from "lucide-react";

interface PageHeaderProps {
  title: string;
}

/**
 * 내 옷장(FE1) 헤더와 톤을 맞춘 공용 페이지 헤더.
 * 특정 화면에 종속되지 않는 전역 레이아웃 조각이라 공용 components/ 에 둔다.
 */
export default function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Menu size={22} className="text-ink" />
      <h1 className="text-[28px] font-semibold text-ink">{title}</h1>
      <Bell size={22} className="text-ink" />
    </div>
  );
}