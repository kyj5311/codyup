interface TabsProps<T extends string> {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
}

export default function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: TabsProps<T>) {
  return (
    <div className="flex gap-5 border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={[
            "-mb-px border-b-2 pb-3 text-[15px] font-medium transition-colors",
            active === tab
              ? "border-ink text-ink"
              : "border-transparent text-gray-text",
          ].join(" ")}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
