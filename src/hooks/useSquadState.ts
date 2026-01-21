import { useState, useEffect } from "react";
import HERO_DATA_RAW from "../data/heroes.json";
import type { AppDB, HeroBase, SlotData, GlobalBaseStats } from "../types";

const HERO_DATA = HERO_DATA_RAW as HeroBase[];

const createEmptySlot = (): SlotData => ({
  id: null,
  ex_lvl: 0,
  stars: 0,
  skills: { tactics: 1, passive: 1 },
});

const initialDb: AppDB = {
  global: 0.0,
  currentSquadIdx: 0,
  squads: [
    { name: "Squad 1", slots: Array.from({ length: 5 }, createEmptySlot) },
    { name: "Squad 2", slots: Array.from({ length: 5 }, createEmptySlot) },
    { name: "Squad 3", slots: Array.from({ length: 5 }, createEmptySlot) },
  ],
  globalBaseStats: {
    sf_advanced_protection_1: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0, description: "Advanced Protection Node 1: Special Forces Technologie" },
    sf_advanced_protection_2: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0, description: "Advanced Protection Node 2: Special Forces Technologie" },
    drone_lvl: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0, description: "Current Level of your drone" },
    drone_quantum_chip_ac_lvl: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0, description: "Level of your Quantum Chip for AirCraft Heroes. (Middle Chip)" },
    drone_memory_chip_ac_lvl: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0, description: "Level of your Memory Fission Chip for AirCraft Heroes. (Left Chip)" },
    drone_quantum_chip_missile_lvl: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0, description: "Level of your Quantum Chip for Missile Heroes. (Middle Chip)" },
    drone_memory_chip_missile_lvl: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0, description: "Level of your Memory Fission Chip for Missile Heroes. (Left Chip)" },
    drone_quantum_chip_tank_lvl: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0, description: "Level of your Quantum Chip for Tank Heroes. (Middle Chip)" },
    drone_memory_chip_tank_lvl: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0, description: "Level of your Memory Fission Chip for Tank Heroes. (Left Chip)" },
    other_red: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0, description: "% of all other damage reduction, that does not have an input field in here" },
  },
  heroStats: {},
};

export function useSquadState() {
  const [db, setDb] = useState<AppDB>(() => {
    const saved = localStorage.getItem("dr_analyst_v4_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.squads && Array.isArray(parsed.squads)) {
          parsed.squads.forEach((squad: { slots: (SlotData | null)[] }) => {
            if (Array.isArray(squad.slots)) {
              squad.slots = squad.slots.map((slot: SlotData | null) => slot || createEmptySlot());
            }
          });
        }

        if (!parsed.squads) parsed.squads = initialDb.squads;
        parsed.globalBaseStats = { ...initialDb.globalBaseStats, ...(parsed.globalBaseStats || {}) };
        return parsed;
      } catch (e) {
        console.error("DB Load Error", e);
      }
    }
    return initialDb;
  });

  useEffect(() => {
    localStorage.setItem("dr_analyst_v4_db", JSON.stringify(db));
  }, [db]);

  const currentSquad = db.squads[db.currentSquadIdx];

  const updateGlobalStat = (key: keyof GlobalBaseStats, value: string) => {
    const val = parseInt(value, 10) || 0;
    let phys = 0,
      ener = 0;

    if (key === "drone_lvl" && val >= 200) {
      phys = 5;
      ener = 5;
    } else if (key.startsWith("sf_advanced_protection")) {
      phys = 1.5 * val;
      ener = 1.5 * val;
    } else if (key.includes("chip")) {
      phys = 0;
      ener = 0;
    } else if (key === "other_red") {
      phys = val;
      ener = val;
    }

    setDb((prev) => ({
      ...prev,
      globalBaseStats: {
        ...prev.globalBaseStats,
        [key]: { level: val, calculatedPhysicalReduction: phys, calculatedEnergyReduction: ener },
      },
    }));
  };

  const switchSquad = (idx: number) => {
    setDb((prev) => ({ ...prev, currentSquadIdx: idx }));
  };

  const updateHeroSlot = (slotIdx: number, updates: Partial<SlotData>) => {
    setDb((prev) => {
      const newSquads = [...prev.squads];
      const squad = { ...newSquads[prev.currentSquadIdx] };
      const slots = [...squad.slots];

      if (updates.ex_lvl !== undefined) {
        const v = Math.min(30, Math.max(1, parseInt(updates.ex_lvl.toString(), 10) || 0));
        updates.ex_lvl = v;
        const maxSkill = v >= 30 ? 40 : 30;
        const currentSkills = slots[slotIdx].skills;
        updates.skills = {
          tactics: Math.min(currentSkills.tactics, maxSkill),
          passive: Math.min(currentSkills.passive, maxSkill),
        };
      }

      slots[slotIdx] = { ...slots[slotIdx], ...updates };
      squad.slots = slots;
      newSquads[prev.currentSquadIdx] = squad;
      return { ...prev, squads: newSquads };
    });
  };

  const updateSkill = (slotIdx: number, type: "tactics_lvl" | "passive_lvl", value: string) => {
    const val = Math.max(1, parseInt(value, 10) || 1);
    setDb((prev) => {
      const newSquads = [...prev.squads];
      const currentSquadIdx = prev.currentSquadIdx;
      const squad = { ...newSquads[currentSquadIdx] };
      const slots = [...squad.slots];
      const slot = { ...slots[slotIdx] };

      slot.skills = {
        ...slot.skills,
        [type === "tactics_lvl" ? "tactics" : "passive"]: val,
      };
      slots[slotIdx] = slot;
      squad.slots = slots;
      newSquads[currentSquadIdx] = squad;
      return { ...prev, squads: newSquads };
    });
  };

  const performAssignHero = (heroId: string, slotIdx: number) => {
    const heroBase = HERO_DATA.find((h) => h.id === heroId);
    if (!heroBase) return;
    setDb((prev) => {
      let savedStats: SlotData | undefined;
      for (const s of prev.squads) {
        const found = s.slots.find((slot) => slot?.id === heroId);
        if (found) {
          savedStats = found;
          break;
        }
      }
      if (!savedStats) savedStats = prev.heroStats?.[heroId];

      const newSquads = [...prev.squads];
      for (let sIdx = 0; sIdx < newSquads.length; sIdx++) {
        const squad = newSquads[sIdx];
        const foundIdx = squad.slots.findIndex((s) => s?.id === heroId);
        if (foundIdx !== -1) {
          const newSquad = { ...squad };
          const newSlots = [...newSquad.slots];
          newSlots[foundIdx] = createEmptySlot();
          newSquad.slots = newSlots;
          newSquads[sIdx] = newSquad;
        }
      }

      const newValues = savedStats
        ? { ex_lvl: savedStats.ex_lvl, stars: savedStats.stars || 0, skills: { ...savedStats.skills } }
        : { ex_lvl: 0, stars: 0, skills: { tactics: 1, passive: 1 } };
      const currentSquadIdx = prev.currentSquadIdx;
      const currentSquad = { ...newSquads[currentSquadIdx] };
      const newSlots = [...currentSquad.slots];
      const occupant = newSlots[slotIdx];
      const updatedHeroStats = { ...prev.heroStats };
      if (occupant && occupant.id) updatedHeroStats[occupant.id] = { ...occupant };

      newSlots[slotIdx] = { id: heroBase.id, name: heroBase.name, cat: heroBase.cat, ...newValues };
      currentSquad.slots = newSlots;
      newSquads[currentSquadIdx] = currentSquad;
      return { ...prev, squads: newSquads, heroStats: updatedHeroStats };
    });
  };

  const removeHero = (slotIdx: number) => {
    setDb((prev) => {
      const currentSquadIdx = prev.currentSquadIdx;
      const hero = prev.squads[currentSquadIdx].slots[slotIdx];
      if (!hero || !hero.id) return prev;

      const newHeroStats = { ...prev.heroStats };
      newHeroStats[hero.id] = { id: hero.id, ex_lvl: hero.ex_lvl || 0, stars: hero.stars || 0, skills: { ...hero.skills } };

      const newSquads = [...prev.squads];
      const currentSquad = { ...newSquads[currentSquadIdx] };
      const newSlots = [...currentSquad.slots];
      newSlots[slotIdx] = createEmptySlot();
      currentSquad.slots = newSlots;
      newSquads[currentSquadIdx] = currentSquad;
      return { ...prev, squads: newSquads, heroStats: newHeroStats };
    });
  };

  return { db, currentSquad, updateGlobalStat, switchSquad, updateHeroSlot, updateSkill, performAssignHero, removeHero };
}
