import { useSquad } from "../context/SquadContext";
import { Tooltip } from "./Tooltip";
import type { GlobalBaseStats } from "../types";

interface GlobalStatsInputsProps {
  idPrefix: string;
}

export default function GlobalStatsInputs({ idPrefix }: GlobalStatsInputsProps) {
  const { db, updateGlobalStat } = useSquad();
  const globalStats = db.globalBaseStats;

  const renderChipInput = (label: string, key: keyof GlobalBaseStats, focusBorderColor: string) => (
    <div className="space-y-2">
      <Tooltip text={globalStats[key]?.description || ""}>
        <label htmlFor={`${idPrefix}-${key}`} className="block text-[10px] font-bold text-gray-500 uppercase cursor-help hover:text-white transition-colors">
          {label}
        </label>
        <input
          id={`${idPrefix}-${key}`}
          type="number"
          value={globalStats[key]?.level || ""}
          onChange={(e) => updateGlobalStat(key, e.target.value)}
          className={`w-full bg-black/40 border border-surface-card rounded-lg px-3 py-2 text-sm text-white outline-none transition-colors ${focusBorderColor}`}
          placeholder="0"
        />
      </Tooltip>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-primary-highlight uppercase tracking-widest border-b border-primary/30 pb-1">Technologie</h3>

        {(["sf_advanced_protection_1", "sf_advanced_protection_2"] as const).map((tech, i) => (
          <div key={tech} className="space-y-2">
            <Tooltip text={globalStats[tech]?.description || ""}>
              <label htmlFor={`${idPrefix}-${tech}`} className="block text-[10px] font-bold text-gray-500 uppercase cursor-help hover:text-white transition-colors">
                Advanced Protection  {i + 1} (Level 0-10)
              </label>
            </Tooltip>
            <input
              id={`${idPrefix}-${tech}`}
              type="number"
              value={globalStats[tech]?.level || ""}
              onChange={(e) => updateGlobalStat(tech, e.target.value)}
              className="w-full bg-black/40 border border-surface-card rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none transition-colors"
              placeholder="0"
              min="0"
              max="10"
            />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-tertiary-soft uppercase tracking-widest border-b border-tertiary/30 pb-1">Drone</h3>
        <div className="space-y-2">
          <Tooltip text={globalStats.drone_lvl?.description || ""}>
            <label htmlFor={`${idPrefix}-drone_lvl`} className="block text-[10px] font-bold text-gray-500 uppercase cursor-help hover:text-white transition-colors">
              Drone Level
            </label>
          </Tooltip>
          <input
            id={`${idPrefix}-drone_lvl`}
            type="number"
            value={globalStats.drone_lvl?.level || ""}
            onChange={(e) => updateGlobalStat("drone_lvl", e.target.value)}
            className="w-full bg-black/40 border border-surface-card rounded-lg px-3 py-2 text-sm text-white focus:border-tertiary outline-none transition-colors"
            placeholder="0"
          />
        </div>
      </div>

      {["Tank", "Missile", "Aircraft"].map((type) => {
        const typeKey = type === "Aircraft" ? "ac" : type.toLowerCase();
        const titleColor = type === "Tank" ? "text-rarity-ur" : type === "Missile" ? "text-rarity-ssr" : "text-rarity-sr";
        const borderColor = type === "Tank" ? "border-rarity-ur/30" : type === "Missile" ? "border-rarity-ssr/30" : "border-rarity-sr/30";
        const focusBorder = type === "Tank" ? "focus:border-rarity-ur" : type === "Missile" ? "focus:border-rarity-ssr" : "focus:border-rarity-sr";

        return (
          <div key={type} className="space-y-4">
            <h3 className={`text-[10px] font-black uppercase tracking-widest border-b pb-1 ${titleColor} ${borderColor}`}>{type} Chips</h3>
            {renderChipInput("Quantum Chip", `drone_quantum_chip_${typeKey}_lvl` as keyof GlobalBaseStats, focusBorder)}
            {renderChipInput("Memory Chip", `drone_memory_chip_${typeKey}_lvl` as keyof GlobalBaseStats, focusBorder)}
          </div>
        );
      })}

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-secondary-soft uppercase tracking-widest border-b border-secondary/30 pb-1">Sonstiges</h3>
        <div className="space-y-2">
          <Tooltip text={globalStats.other_red?.description || ""}>
            <label htmlFor={`${idPrefix}-other_red`} className="block text-[10px] font-bold text-gray-500 uppercase cursor-help hover:text-white transition-colors">
              Andere Reduktion (%)
            </label>
          </Tooltip>
          <input
            id={`${idPrefix}-other_red`}
            type="number"
            value={globalStats.other_red?.level || ""}
            onChange={(e) => updateGlobalStat("other_red", e.target.value)}
            className="w-full bg-black/40 border border-surface-card rounded-lg px-3 py-2 text-sm text-white focus:border-secondary outline-none transition-colors"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}
