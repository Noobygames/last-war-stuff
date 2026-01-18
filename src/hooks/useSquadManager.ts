import { useState, useEffect, useMemo } from "react";
import HERO_DATA_RAW from "../data/heroes.json";
import type { AppDB, HeroBase, SlotData, GlobalBaseStats, MetaStatus, DRStats } from "../types";

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
    sf_tech_1: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0 },
    sf_tech_2: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0 },
    drone_lvl: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0 },
    other_red: { level: 0, calculatedPhysicalReduction: 0, calculatedEnergyReduction: 0 },
  },
  heroStats: {},
};

export function useSquadManager() {
  const [db, setDb] = useState<AppDB>(() => {
    const saved = localStorage.getItem("dr_analyst_v4_db");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.squads && Array.isArray(parsed.squads)) {
          parsed.squads.forEach((squad: { slots: (SlotData | null)[]; }) => {
            if (Array.isArray(squad.slots)) {
              squad.slots = squad.slots.map((slot: SlotData | null) => slot || createEmptySlot());
            }
          });
        }

        if (!parsed.squads) parsed.squads = initialDb.squads;
        if (!parsed.globalBaseStats) parsed.globalBaseStats = initialDb.globalBaseStats;
        return parsed;
      } catch (e) {
        console.error("DB Load Error", e);
      }
    }
    return initialDb;
  });

  const [dontAskMoveConfirmation, setDontAskMoveConfirmation] = useState(() => {
    return localStorage.getItem("dr_analyst_dont_ask_move") === "true";
  });

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: (dontAskAgain: boolean) => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const [selectionModalConfig, setSelectionModalConfig] = useState<{
    isOpen: boolean;
    slotIdx: number | null;
  }>({
    isOpen: false,
    slotIdx: null,
  });

  useEffect(() => {
    localStorage.setItem("dr_analyst_v4_db", JSON.stringify(db));
  }, [db]);

  const currentSquad = db.squads[db.currentSquadIdx];

  const updateGlobalStat = (key: keyof GlobalBaseStats, value: string) => {
    const val = parseInt(value) || 0;
    let phys = 0,
      ener = 0;

    if (key === "drone_lvl" && val >= 200) {
      phys = 5;
      ener = 5;
    } else if (key.startsWith("sf_tech")) {
      phys = 1.5 * val;
      ener = 1.5 * val;
    } else if (key === "other_red") {
      // Direkte Eingabe
      phys = 0;
      ener = 0; // Logik aus app.js war hier leer/placeholder, wir speichern nur Level
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

      // Logik für Skill-Cap basierend auf Weapon Level
      if (updates.ex_lvl !== undefined) {
        const v = Math.min(30, Math.max(1, parseInt(updates.ex_lvl.toString()) || 0));
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
    const val = Math.max(1, parseInt(value) || 1);
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

      if (!savedStats) {
        savedStats = prev.heroStats?.[heroId];
      }

      const newSquads = [...prev.squads];

      // Remove from old slot if exists
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
        ? {
            ex_lvl: savedStats.ex_lvl,
            stars: savedStats.stars || 0,
            skills: { ...savedStats.skills },
          }
        : { ex_lvl: 0, stars: 0, skills: { tactics: 1, passive: 1 } };

      const currentSquadIdx = prev.currentSquadIdx;
      const currentSquad = { ...newSquads[currentSquadIdx] };
      const newSlots = [...currentSquad.slots];

      newSlots[slotIdx] = {
        id: heroBase.id,
        name: heroBase.name,
        cat: heroBase.cat,
        ...newValues,
      };

      currentSquad.slots = newSlots;
      newSquads[currentSquadIdx] = currentSquad;

      return { ...prev, squads: newSquads };
    });
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const assignHero = (heroId: string, slotIdx: number) => {
    const heroBase = HERO_DATA.find((h) => h.id === heroId);
    if (!heroBase) return;

    // Check if hero is already assigned
    let existingSquadIdx = -1;
    let existingSlotIdx = -1;

    for (let i = 0; i < db.squads.length; i++) {
      const s = db.squads[i];
      const idx = s.slots.findIndex((slot) => slot?.id === heroId);
      if (idx !== -1) {
        existingSquadIdx = i;
        existingSlotIdx = idx;
        break;
      }
    }

    if (existingSquadIdx !== -1) {
      if (existingSquadIdx === db.currentSquadIdx && existingSlotIdx === slotIdx) {
        return;
      }

      if (dontAskMoveConfirmation) {
        performAssignHero(heroId, slotIdx);
        return;
      }

      const squadName = db.squads[existingSquadIdx].name || `Squad ${existingSquadIdx + 1}`;
      const confirmMsg = `${heroBase.name} is already assigned to ${squadName}.\nDo you want to move them here?`;

      setModalConfig({
        isOpen: true,
        message: confirmMsg,
        onConfirm: (dontAskAgain: boolean) => {
          if (dontAskAgain) {
            setDontAskMoveConfirmation(true);
            localStorage.setItem("dr_analyst_dont_ask_move", "true");
          }
          performAssignHero(heroId, slotIdx);
        },
      });
      return;
    }

    // No conflict, assign directly
    performAssignHero(heroId, slotIdx);
  };

  const openSelectionModal = (slotIdx: number) => {
    setSelectionModalConfig({ isOpen: true, slotIdx });
  };

  const closeSelectionModal = () => {
    setSelectionModalConfig({ isOpen: false, slotIdx: null });
  };

  const selectHeroForSlot = (heroId: string) => {
    if (selectionModalConfig.slotIdx !== null) {
      assignHero(heroId, selectionModalConfig.slotIdx);
      closeSelectionModal();
    }
  };

  const removeHero = (slotIdx: number) => {
    console.log("Removing hero from slot", slotIdx);

    setDb((prev) => {
      const currentSquadIdx = prev.currentSquadIdx;
      const hero = prev.squads[currentSquadIdx].slots[slotIdx];
      if (!hero || !hero.id) return prev;

      const newHeroStats = { ...prev.heroStats };
      newHeroStats[hero.id] = {
        id: hero.id,
        ex_lvl: hero.ex_lvl || 0,
        stars: hero.stars || 0,
        skills: { ...hero.skills },
      };

      const newSquads = [...prev.squads];
      const currentSquad = { ...newSquads[currentSquadIdx] };
      const newSlots = [...currentSquad.slots];

      newSlots[slotIdx] = createEmptySlot();
      currentSquad.slots = newSlots;
      newSquads[currentSquadIdx] = currentSquad;

      return { ...prev, squads: newSquads, heroStats: newHeroStats };
    });
  };

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

  const calculateDR = (slotIdx: number): DRStats => {
    const baseStats = db.globalBaseStats;
    const phys = baseStats.drone_lvl.calculatedPhysicalReduction + baseStats.sf_tech_1.calculatedPhysicalReduction + baseStats.sf_tech_2.calculatedPhysicalReduction;
    const ener = baseStats.drone_lvl.calculatedEnergyReduction + baseStats.sf_tech_1.calculatedEnergyReduction + baseStats.sf_tech_2.calculatedEnergyReduction;

    // TODO: add remaining calcs

    console.log("Calculating DR for slot:", currentSquad.slots[slotIdx]);

    return { phys, ener };
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    db,
    currentSquad,
    updateGlobalStat,
    switchSquad,
    updateHeroSlot,
    updateSkill,
    assignHero,
    removeHero,
    metaStatus,
    calculateDR,
    modalConfig,
    closeModal,
    selectionModalConfig,
    openSelectionModal,
    closeSelectionModal,
    selectHeroForSlot,
  };
}
