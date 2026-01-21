import GlobalStatsInputs from "./GlobalStatsInputs";

export default function Sidebar() {
  return (
    <div className="hidden xl:flex flex-col gap-4 p-4 bg-surface-card border-r border-surface-border h-full overflow-y-auto custom-scrollbar w-64 flex-shrink-0">
      <GlobalStatsInputs idPrefix="sidebar" />
    </div>
  );
}