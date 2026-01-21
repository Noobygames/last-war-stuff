import { useMemo } from "react";
import HERO_DATA_RAW from "../data/heroes.json";
import type { AppDB, HeroBase, SlotData, DRStats, MetaStatus } from "../types";

const HERO_DATA = HERO_DATA_RAW as HeroBase[];

export function useSquadCalculations(db: AppDB) {
  const currentSquad = db.squads[db.currentSquadIdx];

  const metaStatus: MetaStatus = useMemo(() => {
    const activeHeroes = currentSquad.slots
      .map((s, idx) => (s.id ? { ...HERO_DATA.find((h) => h.id === s.id)!, ...s, slotIdx: idx } : null))
      .filter((h): h is HeroBase & SlotData & { slotIdx: number } => h !== null);

    const names = activeHeroes.map((h) => h.name);
    const cats = activeHeroes.map((h) => h.cat);

    let metaType = "";
    let showNerzi = false;

    const hasAirBase = names.includes("Lucius") && names.includes("DVA") && names.includes("Shuyler");
    const hasAirFlex = names.includes("Sarah") || names.includes("Morrison");
    if (hasAirBase && hasAirFlex && names.includes("Murphy")) {
      metaType = "air41";
      showNerzi = true;
    }
    if (["Scarlett", "Kim", "Murphy", "Adam", "Marshall"].every((n) => names.includes(n))) {
      const adam = activeHeroes.find((h) => h.name === "Adam");
      if (adam && adam.ex_lvl >= 1) metaType = "tank41";
    }
    if (["Lucius", "Swift", "Tesla", "McGregor", "Adam"].every((n) => names.includes(n))) {
      const lucius = activeHeroes.find((h) => h.name === "Lucius");
      if (lucius && lucius.ex_lvl >= 10) metaType = "missile41";
    }
    if (!metaType) {
      if (cats.filter((c) => c === "Tank").length === 5 && !names.includes("Scarlett")) metaType = "fullTank";
      if (cats.filter((c) => c === "Missile").length === 5) metaType = "fullMissile";
    }
    return { metaType, showNerzi };
  }, [currentSquad]);

  const squadDRStats = useMemo(() => {
    const baseStats = db.globalBaseStats;
    const globalPhys = baseStats.drone_lvl.calculatedPhysicalReduction + baseStats.sf_advanced_protection_1.calculatedPhysicalReduction + baseStats.sf_advanced_protection_2.calculatedPhysicalReduction + baseStats.other_red.calculatedPhysicalReduction;
    const globalEner = baseStats.drone_lvl.calculatedEnergyReduction + baseStats.sf_advanced_protection_1.calculatedEnergyReduction + baseStats.sf_advanced_protection_2.calculatedEnergyReduction + baseStats.other_red.calculatedEnergyReduction;
    return currentSquad.slots.map((slot) => {
      let phys = globalPhys;
      let ener = globalEner;

      if (slot.cat === "Tank") {
        phys += baseStats.drone_quantum_chip_tank_lvl.calculatedPhysicalReduction + baseStats.drone_memory_chip_tank_lvl.calculatedPhysicalReduction;
        ener += baseStats.drone_quantum_chip_tank_lvl.calculatedEnergyReduction + baseStats.drone_memory_chip_tank_lvl.calculatedEnergyReduction;
      } else if (slot.cat === "Missile") {
        phys += baseStats.drone_quantum_chip_missile_lvl.calculatedPhysicalReduction + baseStats.drone_memory_chip_missile_lvl.calculatedPhysicalReduction;
        ener += baseStats.drone_quantum_chip_missile_lvl.calculatedEnergyReduction + baseStats.drone_memory_chip_missile_lvl.calculatedEnergyReduction;
      } else if (slot.cat === "Aircraft") {
        phys += baseStats.drone_quantum_chip_ac_lvl.calculatedPhysicalReduction + baseStats.drone_memory_chip_ac_lvl.calculatedPhysicalReduction;
        ener += baseStats.drone_quantum_chip_ac_lvl.calculatedEnergyReduction + baseStats.drone_memory_chip_ac_lvl.calculatedEnergyReduction;
      }

      return { phys, ener };
    });
  }, [db.globalBaseStats, currentSquad.slots]);

  const calculateDR = (slotIdx: number): DRStats => squadDRStats[slotIdx] || { phys: 0, ener: 0 };

  return { metaStatus, calculateDR };
}