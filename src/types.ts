export interface TierRange {
  tier: number;
  name: string;
  ilvl: number;
  mins: number[];
  maxs: number[];
}

export interface RawTierEntry {
  tier: number | string;
  name?: string;
  ilvl?: number | string;
  min: (number | string)[];
  max: (number | string)[];
}

export interface RawModItem {
  id: string;
  pattern: string;
  name: string;
  type: string; // "Prefix" | "Suffix"
  group: string;
  groups: string[];
  influence?: string;
  tiers_by_class?: Record<string, RawTierEntry[]>;
}

export interface RawItemClass {
  id: string;
  groups: string[];
}

export interface RawPoeModsDb {
  version: number;
  note?: string;
  item_classes: RawItemClass[];
  mods: RawModItem[];
}

export interface ModDef {
  id: string;
  pattern: string;
  name: string;
  kind: 'Prefix' | 'Suffix';
  group: string;
  groups: string[];
  influence: string;
  tiers_by_class: Record<string, TierRange[]>;
}

export interface SelectedTarget {
  id: string;
  min_tier: number | null; // null = Any, 1 = T1, 2 = T1-T2, 3 = T1-T3
}

export interface CompiledTarget {
  id: string;
  name: string;
  pattern: string;
  kind: 'Prefix' | 'Suffix';
  regex: RegExp;
  allowed_tiers: TierRange[] | null;
  min_tier: number | null;
  influence: string;
}

export interface CraftingStats {
  alts: number;
  augs: number;
  copies: number;
  startTime: number | null;
  elapsedSeconds: number;
  finished: boolean;
  success: boolean;
}

export interface SimulatedItem {
  name: string;
  baseClass: string;
  itemLevel: number;
  rarity: 'Normal' | 'Magic' | 'Rare';
  implicits: string[];
  prefix: {
    modDef: ModDef;
    tier: TierRange;
    rolledValues: number[];
    displayText: string;
  } | null;
  suffix: {
    modDef: ModDef;
    tier: TierRange;
    rolledValues: number[];
    displayText: string;
  } | null;
  rawText: string;
}

export type CrafterTab = 'general' | 'craft' | 'map_craft';

export interface GroupCraftRule {
  id: string;
  name: string;
  item_class: string;
  magic_weight: number;
  rare_weight: number;
  eval_count: number;
  annul_count: number;
  augm_enabled: boolean;
  aug_before_regal: boolean;
  rare_regal_enabled: boolean;
  group_craft_enabled: boolean;
  affixes: Array<{
    id: string;
    name: string;
    kind: 'Prefix' | 'Suffix';
    min_tier: number | null;
    group: string;
  }>;
}

export interface AppSettings {
  item_class: string;
  selected: SelectedTarget[];
  delay_after_move: number;
  delay_after_ctrl_c: number;
  delay_after_click: number;
  delay_between: number;
  alt_key_swap: boolean;
  humanize: boolean;
  always_on_top: boolean;
  sound_alert: boolean;
  pause_on_unfocus: boolean;
  auto_aug: boolean;
  log_all_rolls: boolean;
  currency_limit_enabled: boolean;
  currency_limit: number;
  item_pos: [number, number] | null;
  alt_pos: [number, number] | null;
  aug_pos: [number, number] | null;
  regal_pos?: [number, number] | null;
}

