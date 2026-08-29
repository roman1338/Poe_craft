import {
  CompiledTarget,
  ModDef,
  SimulatedItem,
  TierRange,
} from '../types';
import {
  lineMatchesTarget,
  matchTargets,
  ModsDatabase,
} from './modsDb';

const SKIP_PREFIXES = [
  'rarity:',
  'item class:',
  'requirements:',
  'sockets:',
  'item level:',
  'quality:',
  'armour:',
  'evasion rating:',
  'energy shield:',
  'chance to block:',
  'physical damage:',
  'elemental damage:',
  'critical strike chance:',
  'attacks per second:',
  'weapon range:',
  'stack size:',
  'note:',
];

export function parseExplicitMods(itemText: string): string[] {
  if (!itemText || !itemText.trim()) {
    return [];
  }

  const normalized = itemText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized
    .split('--------')
    .map((b) => b.trim())
    .filter(Boolean);

  const mods: string[] = [];

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((ln) => ln.trim())
      .filter(Boolean);

    if (lines.length === 0) continue;

    const first = lines[0].toLowerCase();
    if (SKIP_PREFIXES.some((p) => first.startsWith(p))) {
      continue;
    }
    if (first.startsWith('rarity')) {
      continue;
    }

    for (const line of lines) {
      const low = line.toLowerCase();
      if (
        low.startsWith('unidentified') ||
        low.startsWith('corrupted') ||
        low.startsWith('mirrored') ||
        low.startsWith('split')
      ) {
        continue;
      }
      if (
        low.includes('(implicit)') ||
        low.includes('(enchant)') ||
        low.includes('(crafted)')
      ) {
        continue;
      }
      // Line contains numbers, plus, or % (a modifier)
      if (/[\d%+]/.test(line)) {
        mods.push(line);
      }
    }
  }

  return mods;
}

export function decideOrb(
  lines: string[],
  targets: CompiledTarget[],
  db: ModsDatabase,
  itemClass: string
): 'done' | 'aug' | 'alt' {
  const hits = matchTargets(lines, targets);
  if (hits.length > 0 && hits.every(Boolean)) {
    return 'done';
  }
  if (lines.length >= 2) {
    return 'alt';
  }
  if (lines.length === 0) {
    return 'aug';
  }

  const line = lines[0];
  const remaining = targets.filter((_, idx) => !hits[idx]);
  const matchedHere = targets.filter((t) => lineMatchesTarget(line, t));

  const occupied =
    matchedHere.length > 0
      ? matchedHere[0].kind
      : db.classifyLine(line, itemClass);

  if (occupied && remaining.some((t) => t.kind === occupied)) {
    return 'alt';
  }
  return 'aug';
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number, decimals = 1): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function fillPatternValues(pattern: string, values: number[]): string {
  let idx = 0;
  return pattern.replace(/#/g, () => {
    const val = values[idx++];
    return val !== undefined ? String(val) : '10';
  });
}

function rollAffix(
  modDef: ModDef,
  itemClass: string
): {
  modDef: ModDef;
  tier: TierRange;
  rolledValues: number[];
  displayText: string;
} {
  const tiers = modDef.tiers_by_class[itemClass] || modDef.tiers_by_class['_default'] || [];
  const pickedTier: TierRange =
    tiers.length > 0
      ? tiers[Math.floor(Math.random() * tiers.length)]
      : { tier: 1, name: '', ilvl: 1, mins: [10], maxs: [20] };

  const rolledValues: number[] = [];
  const minList = pickedTier.mins.length > 0 ? pickedTier.mins : [5];
  const maxList = pickedTier.maxs.length > 0 ? pickedTier.maxs : [15];

  for (let i = 0; i < minList.length; i++) {
    const min = minList[i];
    const max = maxList[i] ?? min;
    const isFloat = min % 1 !== 0 || max % 1 !== 0;
    if (isFloat) {
      rolledValues.push(getRandomFloat(min, max, 1));
    } else {
      rolledValues.push(getRandomInt(min, max));
    }
  }

  const displayText = fillPatternValues(modDef.pattern, rolledValues);

  return {
    modDef,
    tier: pickedTier,
    rolledValues,
    displayText,
  };
}

export function createSimulatedItem(
  baseClass: string,
  prefix: ReturnType<typeof rollAffix> | null,
  suffix: ReturnType<typeof rollAffix> | null
): SimulatedItem {
  const explicitLines: string[] = [];
  if (prefix) explicitLines.push(prefix.displayText);
  if (suffix) explicitLines.push(suffix.displayText);

  let itemName = `Superior Agate ${baseClass}`;
  if (prefix && suffix) {
    itemName = `${prefix.tier.name || 'Glinting'} ${baseClass} ${suffix.tier.name ? `of ${suffix.tier.name}` : 'of the Falcon'}`;
  } else if (prefix) {
    itemName = `${prefix.tier.name || 'Glinting'} ${baseClass}`;
  } else if (suffix) {
    itemName = `${baseClass} ${suffix.tier.name ? `of ${suffix.tier.name}` : 'of the Falcon'}`;
  }

  const rawText = [
    `Item Class: ${baseClass}s`,
    'Rarity: Magic',
    itemName,
    '--------',
    'Item Level: 84',
    '--------',
    ...explicitLines,
  ].join('\n');

  return {
    name: itemName,
    baseClass,
    itemLevel: 84,
    rarity: 'Magic',
    implicits: [],
    prefix,
    suffix,
    rawText,
  };
}

export function rollAlteration(
  db: ModsDatabase,
  itemClass: string
): SimulatedItem {
  const availableMods = db.modsForClass(itemClass);
  const prefixes = availableMods.filter((m) => m.kind === 'Prefix');
  const suffixes = availableMods.filter((m) => m.kind === 'Suffix');

  // PoE Alt probability: 50% 1 affix (25% prefix only, 25% suffix only), 50% 2 affixes (1 prefix + 1 suffix)
  const rollType = Math.random();
  let rolledPrefix: ReturnType<typeof rollAffix> | null = null;
  let rolledSuffix: ReturnType<typeof rollAffix> | null = null;

  if (rollType < 0.25 && prefixes.length > 0) {
    // Prefix only
    const pMod = prefixes[Math.floor(Math.random() * prefixes.length)];
    rolledPrefix = rollAffix(pMod, itemClass);
  } else if (rollType < 0.5 && suffixes.length > 0) {
    // Suffix only
    const sMod = suffixes[Math.floor(Math.random() * suffixes.length)];
    rolledSuffix = rollAffix(sMod, itemClass);
  } else {
    // Both prefix and suffix
    if (prefixes.length > 0) {
      const pMod = prefixes[Math.floor(Math.random() * prefixes.length)];
      rolledPrefix = rollAffix(pMod, itemClass);
    }
    if (suffixes.length > 0) {
      const sMod = suffixes[Math.floor(Math.random() * suffixes.length)];
      rolledSuffix = rollAffix(sMod, itemClass);
    }
  }

  return createSimulatedItem(itemClass, rolledPrefix, rolledSuffix);
}

export function rollAugmentation(
  currentItem: SimulatedItem,
  db: ModsDatabase,
  itemClass: string
): SimulatedItem {
  const availableMods = db.modsForClass(itemClass);
  let prefix = currentItem.prefix;
  let suffix = currentItem.suffix;

  if (!prefix && !suffix) {
    // Empty item -> add one
    const pMod = availableMods.find((m) => m.kind === 'Prefix') || availableMods[0];
    prefix = rollAffix(pMod, itemClass);
  } else if (!prefix) {
    const prefixes = availableMods.filter((m) => m.kind === 'Prefix');
    if (prefixes.length > 0) {
      const pMod = prefixes[Math.floor(Math.random() * prefixes.length)];
      prefix = rollAffix(pMod, itemClass);
    }
  } else if (!suffix) {
    const suffixes = availableMods.filter((m) => m.kind === 'Suffix');
    if (suffixes.length > 0) {
      const sMod = suffixes[Math.floor(Math.random() * suffixes.length)];
      suffix = rollAffix(sMod, itemClass);
    }
  }

  return createSimulatedItem(itemClass, prefix, suffix);
}

export const SAMPLE_POE_ITEMS: { label: string; text: string }[] = [
  {
    label: 'Amulet: +85 Life (T2) & +16% All Elemental Res (T3)',
    text: `Item Class: Amulets
Rarity: Magic
Vivid Turquoise Amulet of the Prism
--------
Requirements:
Level: 65
--------
Item Level: 84
--------
+85 to maximum Life
+16% to all Elemental Resistances`,
  },
  {
    label: 'Body Armour: +118 Life (T1) single prefix',
    text: `Item Class: Body Armours
Rarity: Magic
Athlete's Astral Plate
--------
Quality: +20% (augmented)
Armour: 980 (augmented)
--------
Requirements:
Level: 68
Str: 180
--------
Item Level: 86
--------
+12% to all Elemental Resistances (implicit)
--------
+118 to maximum Life`,
  },
  {
    label: 'Gloves: +48% Fire Res (T1 Suffix only)',
    text: `Item Class: Gloves
Rarity: Magic
Titan Gauntlets of the Magma
--------
Armour: 250
--------
Requirements:
Level: 69
Str: 95
--------
Item Level: 85
--------
+48% to Fire Resistance`,
  },
  {
    label: 'Boots: 35% Movement Speed & +45% Lightning Res',
    text: `Item Class: Boots
Rarity: Magic
Cheetah's Two-Toned Boots of the Lightning
--------
Armour: 120
Energy Shield: 35
--------
Requirements:
Level: 70
--------
Item Level: 86
--------
+35% increased Movement Speed
+45% to Lightning Resistance`,
  },
  {
    label: 'Claw: Adds 18 to 35 Physical Damage (Prefix)',
    text: `Item Class: Claws
Rarity: Magic
Flaring Imperial Claw
--------
Physical Damage: 45-120
Critical Strike Chance: 6.30%
Attacks per Second: 1.60
--------
Item Level: 83
--------
Adds 18 to 35 Physical Damage`,
  },
];
