export interface SkillDef {
  name: string;
  hasDR: boolean;
  base?: number;
  inc?: number;
  target?: string;
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
}

export interface GlobalBaseStats {
  sf_tech_1: GlobalStat;
  sf_tech_2: GlobalStat;
  drone_lvl: GlobalStat;
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
