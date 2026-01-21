import type { DragEvent, KeyboardEvent } from "react";
import { useSquad } from "../context/SquadContext";
import { Tooltip } from "./Tooltip";

interface SquadSlotProps {
  slotIdx: number;
}

// Interne Sub-Komponente für die Stats-Inputs
// Reduziert Codeduplizierung und verbessert die Lesbarkeit
const StatInput = ({ label, value, onChange, color }: { label: string; value: number; onChange: (val: string) => void; color: "blue" | "purple" | "yellow" }) => {
  const colors = {
    blue: { dot: "bg-rarity-sr", text: "text-primary-soft", border: "focus:border-rarity-sr" },
    purple: { dot: "bg-rarity-ssr", text: "text-secondary-soft", border: "focus:border-rarity-ssr" },
    yellow: { dot: "bg-rarity-ur", text: "text-accent-soft", border: "focus:border-rarity-ur" },
  }[color];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 w-full">
      <div className={`w-1 h-2.5 sm:h-3 ${colors.dot} rounded-full flex-shrink-0`}></div>
      <label className="text-[8px] sm:text-[9px] font-bold text-gray-400 w-5 sm:w-6 uppercase">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-w-0 flex-1 bg-surface-main/80 border border-white/10 rounded px-1 sm:px-2 py-0.5 text-[10px] sm:text-xs text-right ${colors.text} ${colors.border} outline-none transition-colors`}
      />
    </div>
  );
};

export default function SquadSlot({ slotIdx }: SquadSlotProps) {
  const { currentSquad, assignHero, removeHero, updateHeroSlot, updateSkill, metaStatus, calculateDR, openSelectionModal } = useSquad();

  const hero = currentSquad.slots[slotIdx];
  const drStats = calculateDR(slotIdx);
  const isMeta = !!metaStatus.metaType;

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e: DragEvent) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("drag-over");
    const heroId = e.dataTransfer.getData("heroId");
    if (heroId) assignHero(heroId, slotIdx);
  };

  const getDRColor = (val: number) => {
    if (val >= 75) return "text-stat-good";
    if (val >= 50) return "text-stat-avg";
    return "text-stat-base";
  };

  const handleDragStart = (e: DragEvent) => {
    if (hero.id) {
      e.dataTransfer.setData("heroId", hero.id);
      e.dataTransfer.setData("fromSlotIdx", slotIdx.toString());
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      openSelectionModal(slotIdx);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`col-span-4 squad-slot aspect-[3/4] rounded-[1.5rem] border border-surface-border bg-surface-main relative overflow-hidden group hover:border-rarity-sr/50 transition-all duration-300 ease-in-out shadow-xl 
        ${hero.id ? "border-solid animate-border-glow" : ""} 
        ${isMeta ? "!animate-meta-glow !border-solid" : ""}
        [&.drag-over]:!border-primary 
        [&.drag-over]:!bg-primary/15 
        [&.drag-over]:shadow-[0_0_25px_color-mix(in_srgb,var(--color-primary),transparent_60%)] 
        [&.drag-over]:scale-105 
        [&.drag-over]:-translate-y-[5px] 
        [&.drag-over]:z-20
      `}>
      {!hero.id ? (
        <button
          type="button"
          onClick={() => openSelectionModal(slotIdx)}
          className="absolute inset-0 z-0 flex flex-col items-center justify-center transition-opacity duration-300 cursor-pointer hover:bg-white/5 w-full h-full outline-none focus:bg-white/10">
          <div className="text-5xl lg:text-6xl mb-2 opacity-20 grayscale group-hover:opacity-40 transition-opacity">🐢</div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-gray-600 group-hover:text-rarity-sr transition-colors mb-1">+</span>
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-600 group-hover:text-primary-highlight transition-colors">Click to Add</span>
          </div>
        </button>
      ) : (
        <div
          className="relative z-10 size-full flex flex-col cursor-pointer outline-none focus:ring-2 focus:ring-primary/50 rounded-[1.5rem]"
          onClick={() => openSelectionModal(slotIdx)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`Edit ${hero.name}`}
          draggable={!!hero.id}
          onDragStart={handleDragStart}>
          <div className="absolute inset-0 z-0">
            <img
              src={`img/${hero.id}.png`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "img/new-turtle.png";
              }}
              className="absolute -right-10 -top-10 size-[110%] object-cover opacity-40 mix-blend-luminosity skew-x-[-15deg] scale-[1.3] transition-transform duration-500 ease-out pointer-events-none"
              alt="splash"
            />
            <div className="absolute inset-0 bg-linear-to-b from-surface-main/60 via-surface-main/80 to-black"></div>
          </div>

          <div className="relative z-10 flex items-start gap-3 p-3 md:p-4 pb-0 h-[45%]">
            <div className="relative size-8 sm:size-10 md:size-16 lg:size-20 object-contain rounded-xl overflow-hidden border-2 border-gray-600 bg-surface-card shadow-lg group-hover:border-rarity-sr/50 transition-colors">
              <img
                src={`img/${hero.id}.png`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "img/placeholder.jpg";
                }}
                className="size-full object-cover"
                alt={hero.name}
              />
            </div>

            <div className="flex-1 flex flex-col justify-center min-w-0 pl-1 pr-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-0.5 mb-0.5">
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Phys</span>
                <Tooltip text="Physical Damage Reduction: Heroes like Swift, Fiona or Morrison deal Physical Damage">
                  <span className={`text-[10px] sm:text-sm md:text-[12px] lg:text-[16px] font-black italic leading-none ${getDRColor(drStats.phys)}`}>
                    {drStats.phys.toFixed(1)}%
                  </span>
                </Tooltip>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Ener</span>
                <Tooltip text="Energy Damage Reduction: Heroes like Kim, Stetman or DVA deal Energy Damage">
                  <span className={`text-[10px] sm:text-sm md:text-[12px] lg:text-[16px] font-black italic leading-none ${getDRColor(drStats.ener)}`}>
                    {drStats.ener.toFixed(1)}%
                  </span>
                </Tooltip>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeHero(slotIdx);
              }}
              className="absolute top-2 right-2 bg-black/60 text-danger hover:bg-danger-dark hover:text-white transition-all p-2 rounded-full z-20 cursor-pointer shadow-sm border border-white/10 backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="size-5 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="relative z-10 flex-1 flex flex-col px-2 sm:px-4 pb-2 sm:pb-4 gap-1.5 sm:gap-2 justify-end">
            <div className="text-[9px] sm:text-xs font-black text-center uppercase tracking-wider sm:tracking-[0.15em] text-white/90 bg-white/5 rounded py-0.5 sm:py-1 border border-white/5 truncate">
              {hero.name}
            </div>

            <div className="grid grid-cols-1 gap-1 sm:gap-1.5 bg-black/40 rounded-lg sm:rounded-xl p-1.5 sm:p-2 border border-white/5" onClick={(e) => e.stopPropagation()}>
              <Tooltip text="The current Exclusive Weapon Level of the Hero. Influences the maximum Level of Skills and also the Damage Resistance" className="w-full">
                <StatInput label="EW" value={hero.ex_lvl || 0} onChange={(val) => updateHeroSlot(slotIdx, { ex_lvl: parseInt(val, 10) || 0 })} color="blue" />
              </Tooltip>

              <Tooltip text="The level of the passive skill. The bottom left skill." className="w-full">
                <StatInput label="Pas" value={hero.skills?.passive || 1} onChange={(val) => updateSkill(slotIdx, "passive_lvl", val)} color="purple" />
              </Tooltip>
              
              <Tooltip text="The level of the tactics skill. The top right skill." className="w-full">
                <StatInput label="Tac" value={hero.skills?.tactics || 1} onChange={(val) => updateSkill(slotIdx, "tactics_lvl", val)} color="yellow" />
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
