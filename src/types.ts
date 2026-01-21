export type SkillTarget = "self" | "front" | "back" | "all" | "self_front";

export interface SkillDef {
  name: string;
  hasDR: boolean;
  base?: number;
  inc?: number;
  target?: SkillTarget;
}

export interface HeroBase {
  id: string;
  name: string;
  cat: string;
  skills: {
    auto: SkillDef;
    tactics: SkillDef;
    passive: SkillDef;
  };
}

export interface SlotSkills {
  tactics: number;
  passive: number;
}

export interface SlotData {
  id: string | null;
  ex_lvl: number;
  stars: number;
  skills: SlotSkills;
  // Optional: Name und Cat werden oft für UI benötigt, wenn Slot belegt ist
  name?: string;
  cat?: string;
}

export interface Squad {
  name: string;
  slots: SlotData[];
}

export interface GlobalStat {
  level: number;
  calculatedPhysicalReduction: number;
  calculatedEnergyReduction: number;
  description: string;
}

export interface GlobalBaseStats {
  sf_advanced_protection_1: GlobalStat;
  sf_advanced_protection_2: GlobalStat;

  drone_lvl: GlobalStat;

  drone_quantum_chip_ac_lvl: GlobalStat;
  drone_memory_chip_ac_lvl: GlobalStat;

  drone_quantum_chip_missile_lvl: GlobalStat;
  drone_memory_chip_missile_lvl: GlobalStat;

  drone_quantum_chip_tank_lvl: GlobalStat;
  drone_memory_chip_tank_lvl: GlobalStat;

  other_red: GlobalStat;
}

export interface AppDB {
  global: number;
  currentSquadIdx: number;
  squads: Squad[];
  globalBaseStats: GlobalBaseStats;
  heroStats: Record<string, SlotData>;
}

export interface DRStats {
  phys: number;
  ener: number;
}

export interface MetaStatus {
  metaType: string;
  showNerzi: boolean;
}
