import rawDbData from '../data/poe_mods.json';
import {
  CompiledTarget,
  ModDef,
  RawPoeModsDb,
  RawTierEntry,
  TierRange,
} from '../types';

const NUMBER_PATTERN = '(\\d+(?:\\.\\d+)?)';

export function parseTiers(entries: RawTierEntry[] = []): TierRange[] {
  return entries.map((t) => ({
    tier: Number(t.tier) || 1,
    name: String(t.name || ''),
    ilvl: Number(t.ilvl) || 1,
    mins: (t.min || []).map((x) => Number(x) || 0),
    maxs: (t.max || []).map((x) => Number(x) || 0),
  }));
}

export class ModsDatabase {
  itemClasses: { id: string; groups: string[] }[];
  mods: ModDef[];
  classGroups: Record<string, string[]>;

  constructor(data: RawPoeModsDb) {
    this.itemClasses = data.item_classes || [];
    this.classGroups = {};
    for (const c of this.itemClasses) {
      this.classGroups[c.id] = c.groups || [];
    }

    this.mods = (data.mods || []).map((row) => {
      const tiersByClass: Record<string, TierRange[]> = {};
      if (row.tiers_by_class) {
        for (const [clsName, entries] of Object.entries(row.tiers_by_class)) {
          tiersByClass[clsName] = parseTiers(entries);
        }
      }

      return {
        id: row.id,
        pattern: row.pattern,
        name: row.name,
        kind: row.type === 'Prefix' ? 'Prefix' : 'Suffix',
        group: row.group || '',
        groups: row.groups || [],
        influence: String(row.influence || '').trim(),
        tiers_by_class: tiersByClass,
      };
    });
  }

  classIds(): string[] {
    return this.itemClasses.map((c) => c.id);
  }

  modsForClass(itemClass: string): ModDef[] {
    const validGroups = new Set(this.classGroups[itemClass] || []);
    return this.mods.filter((mod) => {
      return mod.groups.some((g) => validGroups.has(g));
    });
  }

  get(modId: string): ModDef | undefined {
    return this.mods.find((m) => m.id === modId);
  }

  findMod(modId: string): ModDef | undefined {
    return this.mods.find((m) => m.id === modId);
  }

  filterMods(
    itemClass: string,
    query = '',
    kind = 'Any',
    influence = 'Any',
    category = 'All'
  ): ModDef[] {
    const q = query.trim().toLowerCase();
    const kindNormalized = kind.trim();
    const infNormalized = influence.trim();
    const catNormalized = category.trim();

    return this.modsForClass(itemClass).filter((mod) => {
      // 1. Kind filter (Prefix / Suffix)
      if (kindNormalized === 'Prefix' && mod.kind !== 'Prefix') return false;
      if (kindNormalized === 'Suffix' && mod.kind !== 'Suffix') return false;

      // 2. Influence filter
      if (infNormalized === 'Normal' && mod.influence) return false;
      if (
        infNormalized !== 'Any' &&
        infNormalized !== 'Normal' &&
        infNormalized !== '' &&
        mod.influence.toLowerCase() !== infNormalized.toLowerCase()
      ) {
        return false;
      }

      // 3. Category filter
      if (catNormalized !== 'All' && catNormalized !== '') {
        const g = `${mod.group} ${mod.name} ${mod.pattern}`.toLowerCase();
        if (catNormalized === 'Life & ES' && !g.includes('life') && !g.includes('energy shield') && !g.includes('energyshield') && !g.includes('es')) return false;
        if (catNormalized === 'Resistances' && !g.includes('res') && !g.includes('resistance')) return false;
        if (catNormalized === 'Gem Levels' && !g.includes('gem') && !g.includes('level of all')) return false;
        if (catNormalized === 'Damage & Attack' && !g.includes('damage') && !g.includes('phys') && !g.includes('attack') && !g.includes('bow') && !g.includes('crit')) return false;
        if (catNormalized === 'Spells & Cast' && !g.includes('spell') && !g.includes('cast') && !g.includes('aura') && !g.includes('curse') && !g.includes('mana')) return false;
        if (catNormalized === 'DoT Multi' && !g.includes('dot') && !g.includes('bleed') && !g.includes('poison') && !g.includes('ignite') && !g.includes('multiplier')) return false;
        if (catNormalized === 'Attributes' && !g.includes('str') && !g.includes('dex') && !g.includes('int') && !g.includes('strength') && !g.includes('dexterity') && !g.includes('intelligence') && !g.includes('attributes')) return false;
        if (catNormalized === 'Defences' && !g.includes('suppress') && !g.includes('block') && !g.includes('armour') && !g.includes('evasion') && !g.includes('avoid')) return false;
        if (catNormalized === 'Influenced' && !mod.influence) return false;
      }

      // 4. Name/Pattern Search
      if (q) {
        const hay = `${mod.name} ${mod.pattern} ${mod.group} ${mod.influence}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }

  influences(): string[] {
    const set = new Set<string>();
    for (const m of this.mods) {
      if (m.influence) {
        set.add(m.influence);
      }
    }
    return Array.from(set).sort();
  }

  classifyLine(line: string, itemClass: string): 'Prefix' | 'Suffix' | null {
    for (const mod of this.modsForClass(itemClass)) {
      const rx = patternToRegex(mod.pattern);
      if (rx.test(line)) {
        return mod.kind;
      }
    }
    return null;
  }
}

export const globalModsDb = new ModsDatabase(rawDbData as unknown as RawPoeModsDb);

export function patternToRegex(pattern: string): RegExp {
  const sentinel = '___NUM___';
  const stamped = pattern.replace(/#/g, sentinel);
  // escape regex specials except placeholder
  const escaped = stamped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = escaped.replace(new RegExp(sentinel, 'g'), NUMBER_PATTERN);
  return new RegExp(body, 'i');
}

export function allowedTiersFor(
  mod: ModDef,
  itemClass: string,
  minTier: number | null
): TierRange[] | null {
  const allTiers = mod.tiers_by_class[itemClass] || mod.tiers_by_class['_default'] || [];
  if (minTier === null || minTier === undefined) {
    return null;
  }
  const picked = allTiers.filter((t) => t.tier <= minTier);
  return picked.length > 0 ? picked : allTiers.slice(0, 1);
}

export function compileTarget(
  db: ModsDatabase,
  modId: string,
  itemClass: string,
  minTier: number | null
): CompiledTarget {
  const mod = db.get(modId);
  if (!mod) {
    throw new Error(`Unknown modifier id: ${modId}`);
  }
  return {
    id: mod.id,
    name: mod.name,
    pattern: mod.pattern,
    kind: mod.kind,
    regex: patternToRegex(mod.pattern),
    allowed_tiers: allowedTiersFor(mod, itemClass, minTier),
    min_tier: minTier,
    influence: mod.influence,
  };
}

export function valuesInBand(values: number[], band: TierRange): boolean {
  if (!band.mins.length && !band.maxs.length) return true;
  if (values.length !== band.mins.length) return false;

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    const lo = band.mins[i];
    const hi = band.maxs[i];
    if (val < lo || val > hi) {
      return false;
    }
  }
  return true;
}

export function lineMatchesTarget(line: string, target: CompiledTarget): boolean {
  const cleanLine = line.trim();
  const match = cleanLine.match(target.regex);
  if (!match) return false;

  if (target.allowed_tiers === null) {
    return true;
  }

  // Extract all capture groups as float numbers
  const values = match.slice(1).map((g) => parseFloat(g));
  if (values.some(isNaN)) return false;

  for (const band of target.allowed_tiers) {
    if (valuesInBand(values, band)) {
      return true;
    }
  }

  return false;
}

export function matchTargets(
  explicitLines: string[],
  targets: CompiledTarget[]
): boolean[] {
  return targets.map((target) =>
    explicitLines.some((line) => lineMatchesTarget(line, target))
  );
}
