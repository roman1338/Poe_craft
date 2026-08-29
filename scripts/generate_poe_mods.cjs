const fs = require('fs');
const path = require('path');

// 1. Define all Item Classes and their matching groups
const itemClasses = [
  { id: "Amulet", groups: ["amulet", "jewellery"] },
  { id: "Ring", groups: ["ring", "jewellery"] },
  { id: "Belt", groups: ["belt", "jewellery"] },
  { id: "Body Armour", groups: ["body", "armour"] },
  { id: "Boots", groups: ["boots", "armour"] },
  { id: "Gloves", groups: ["gloves", "armour"] },
  { id: "Helmet", groups: ["helmet", "armour"] },
  { id: "Shield", groups: ["shield", "armour", "offhand"] },
  { id: "Bow", groups: ["bow", "weapon", "two-handed"] },
  { id: "Quiver", groups: ["quiver", "jewellery", "offhand"] },
  { id: "Wand", groups: ["wand", "weapon", "one-handed", "caster"] },
  { id: "Claw", groups: ["claw", "weapon", "one-handed"] },
  { id: "Dagger", groups: ["dagger", "weapon", "one-handed", "caster"] },
  { id: "Sceptre", groups: ["sceptre", "weapon", "one-handed", "caster"] },
  { id: "Staff", groups: ["staff", "weapon", "two-handed", "caster"] },
  { id: "One Hand Sword", groups: ["sword", "weapon", "one-handed"] },
  { id: "Two Hand Sword", groups: ["sword", "weapon", "two-handed"] },
  { id: "One Hand Axe", groups: ["axe", "weapon", "one-handed"] },
  { id: "Two Hand Axe", groups: ["axe", "weapon", "two-handed"] },
  { id: "One Hand Mace", groups: ["mace", "weapon", "one-handed"] },
  { id: "Two Hand Mace", groups: ["mace", "weapon", "two-handed"] }
];

function createTiers(tierDefinitions) {
  return tierDefinitions.map((t, idx) => ({
    tier: idx + 1,
    name: t.name || `T${idx + 1}`,
    ilvl: t.ilvl || 1,
    min: Array.isArray(t.min) ? t.min : [t.min],
    max: Array.isArray(t.max) ? t.max : [t.max]
  }));
}

// 2. Comprehensive Standard PoE Modifier Definitions from poedb.tw/us/Modifiers
const standardMods = [
  // ===================== LIFE & DEFENCE PREFIXES =====================
  {
    id: "prefix_to_maximum_life",
    pattern: "+# to maximum Life",
    name: "+# to maximum Life",
    type: "Prefix",
    group: "IncreasedLife",
    groups: ["amulet", "ring", "belt", "body", "boots", "gloves", "helmet", "shield", "quiver", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "Body Armour": createTiers([
        { name: "Rapture", ilvl: 86, min: 120, max: 129 },
        { name: "Prime", ilvl: 81, min: 110, max: 119 },
        { name: "Vigor", ilvl: 73, min: 100, max: 109 },
        { name: "Athlete's", ilvl: 64, min: 90, max: 99 },
        { name: "Fecund", ilvl: 54, min: 80, max: 89 },
        { name: "Stout", ilvl: 44, min: 70, max: 79 },
        { name: "Robust", ilvl: 35, min: 60, max: 69 },
        { name: "Hearty", ilvl: 24, min: 50, max: 59 },
        { name: "Sanguine", ilvl: 18, min: 40, max: 49 },
        { name: "Hale", ilvl: 1, min: 30, max: 39 },
      ]),
      "Shield": createTiers([
        { name: "Prime", ilvl: 81, min: 100, max: 109 },
        { name: "Vigor", ilvl: 73, min: 90, max: 99 },
        { name: "Athlete's", ilvl: 64, min: 80, max: 89 },
        { name: "Fecund", ilvl: 54, min: 70, max: 79 },
        { name: "Stout", ilvl: 44, min: 60, max: 69 },
        { name: "Robust", ilvl: 35, min: 50, max: 59 },
        { name: "Hearty", ilvl: 24, min: 40, max: 49 },
        { name: "Sanguine", ilvl: 18, min: 30, max: 39 },
        { name: "Hale", ilvl: 1, min: 20, max: 29 },
      ]),
      "Belt": createTiers([
        { name: "Prime", ilvl: 81, min: 90, max: 99 },
        { name: "Vigor", ilvl: 73, min: 80, max: 89 },
        { name: "Athlete's", ilvl: 64, min: 70, max: 79 },
        { name: "Fecund", ilvl: 54, min: 60, max: 69 },
        { name: "Stout", ilvl: 44, min: 50, max: 59 },
        { name: "Robust", ilvl: 35, min: 40, max: 49 },
        { name: "Hearty", ilvl: 24, min: 30, max: 39 },
        { name: "Sanguine", ilvl: 18, min: 20, max: 29 },
        { name: "Hale", ilvl: 1, min: 10, max: 19 },
      ]),
      "Helmet": createTiers([
        { name: "Prime", ilvl: 81, min: 90, max: 99 },
        { name: "Vigor", ilvl: 73, min: 80, max: 89 },
        { name: "Athlete's", ilvl: 64, min: 70, max: 79 },
        { name: "Fecund", ilvl: 54, min: 60, max: 69 },
        { name: "Stout", ilvl: 44, min: 50, max: 59 },
        { name: "Robust", ilvl: 35, min: 40, max: 49 },
        { name: "Hearty", ilvl: 24, min: 30, max: 39 },
        { name: "Sanguine", ilvl: 18, min: 20, max: 29 },
      ]),
      "Boots": createTiers([
        { name: "Athlete's", ilvl: 81, min: 80, max: 89 },
        { name: "Fecund", ilvl: 64, min: 70, max: 79 },
        { name: "Stout", ilvl: 54, min: 60, max: 69 },
        { name: "Robust", ilvl: 44, min: 50, max: 59 },
        { name: "Hearty", ilvl: 35, min: 40, max: 49 },
        { name: "Sanguine", ilvl: 24, min: 30, max: 39 },
        { name: "Hale", ilvl: 18, min: 20, max: 29 },
      ]),
      "Gloves": createTiers([
        { name: "Athlete's", ilvl: 81, min: 80, max: 89 },
        { name: "Fecund", ilvl: 64, min: 70, max: 79 },
        { name: "Stout", ilvl: 54, min: 60, max: 69 },
        { name: "Robust", ilvl: 44, min: 50, max: 59 },
        { name: "Hearty", ilvl: 35, min: 40, max: 49 },
        { name: "Sanguine", ilvl: 24, min: 30, max: 39 },
        { name: "Hale", ilvl: 18, min: 20, max: 29 },
      ]),
      "Amulet": createTiers([
        { name: "Athlete's", ilvl: 81, min: 80, max: 89 },
        { name: "Fecund", ilvl: 64, min: 70, max: 79 },
        { name: "Stout", ilvl: 54, min: 60, max: 69 },
        { name: "Robust", ilvl: 44, min: 50, max: 59 },
        { name: "Hearty", ilvl: 35, min: 40, max: 49 },
        { name: "Sanguine", ilvl: 24, min: 30, max: 39 },
        { name: "Hale", ilvl: 18, min: 20, max: 29 },
      ]),
      "Ring": createTiers([
        { name: "Fecund", ilvl: 74, min: 70, max: 79 },
        { name: "Stout", ilvl: 64, min: 60, max: 69 },
        { name: "Robust", ilvl: 54, min: 50, max: 59 },
        { name: "Hearty", ilvl: 44, min: 40, max: 49 },
        { name: "Sanguine", ilvl: 35, min: 30, max: 39 },
        { name: "Hale", ilvl: 24, min: 20, max: 29 },
      ]),
      "Quiver": createTiers([
        { name: "Prime", ilvl: 81, min: 90, max: 99 },
        { name: "Vigor", ilvl: 73, min: 80, max: 89 },
        { name: "Athlete's", ilvl: 64, min: 70, max: 79 },
        { name: "Fecund", ilvl: 54, min: 60, max: 69 },
        { name: "Stout", ilvl: 44, min: 50, max: 59 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 81, min: 80, max: 89 },
        { name: "T2", ilvl: 64, min: 70, max: 79 },
        { name: "T3", ilvl: 54, min: 60, max: 69 },
        { name: "T4", ilvl: 44, min: 50, max: 59 },
        { name: "T5", ilvl: 35, min: 40, max: 49 },
      ])
    }
  },
  {
    id: "prefix_to_maximum_energy_shield",
    pattern: "+# to maximum Energy Shield",
    name: "+# to maximum Energy Shield",
    type: "Prefix",
    group: "BaseEnergyShield",
    groups: ["amulet", "ring", "belt", "body", "boots", "gloves", "helmet", "shield", "armour", "jewellery"],
    influence: "",
    tiers_by_class: {
      "Body Armour": createTiers([
        { name: "Unassailable", ilvl: 86, min: 136, max: 145 },
        { name: "Indomitable", ilvl: 78, min: 121, max: 135 },
        { name: "Dauntless", ilvl: 69, min: 107, max: 120 },
        { name: "Dazzling", ilvl: 60, min: 92, max: 106 },
        { name: "Resplendent", ilvl: 51, min: 73, max: 91 },
        { name: "Incandescent", ilvl: 42, min: 52, max: 72 },
        { name: "Glimmering", ilvl: 30, min: 36, max: 51 },
      ]),
      "Shield": createTiers([
        { name: "Unassailable", ilvl: 86, min: 107, max: 135 },
        { name: "Indomitable", ilvl: 78, min: 86, max: 106 },
        { name: "Dauntless", ilvl: 69, min: 68, max: 85 },
        { name: "Dazzling", ilvl: 60, min: 50, max: 67 },
      ]),
      "Helmet": createTiers([
        { name: "Unassailable", ilvl: 86, min: 66, max: 72 },
        { name: "Indomitable", ilvl: 78, min: 57, max: 65 },
        { name: "Dauntless", ilvl: 69, min: 49, max: 56 },
        { name: "Dazzling", ilvl: 60, min: 40, max: 48 },
      ]),
      "Boots": createTiers([
        { name: "Unassailable", ilvl: 86, min: 44, max: 48 },
        { name: "Indomitable", ilvl: 78, min: 38, max: 43 },
        { name: "Dauntless", ilvl: 69, min: 32, max: 37 },
      ]),
      "Gloves": createTiers([
        { name: "Unassailable", ilvl: 86, min: 44, max: 48 },
        { name: "Indomitable", ilvl: 78, min: 38, max: 43 },
        { name: "Dauntless", ilvl: 69, min: 32, max: 37 },
      ]),
      "Amulet": createTiers([
        { name: "Unassailable", ilvl: 80, min: 44, max: 51 },
        { name: "Indomitable", ilvl: 72, min: 37, max: 43 },
        { name: "Dauntless", ilvl: 60, min: 31, max: 36 },
        { name: "Dazzling", ilvl: 48, min: 25, max: 30 },
      ]),
      "Ring": createTiers([
        { name: "Unassailable", ilvl: 80, min: 44, max: 51 },
        { name: "Indomitable", ilvl: 72, min: 37, max: 43 },
        { name: "Dauntless", ilvl: 60, min: 31, max: 36 },
      ]),
      "Belt": createTiers([
        { name: "Unassailable", ilvl: 80, min: 44, max: 51 },
        { name: "Indomitable", ilvl: 72, min: 37, max: 43 },
        { name: "Dauntless", ilvl: 60, min: 31, max: 36 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 80, min: 44, max: 51 },
        { name: "T2", ilvl: 72, min: 37, max: 43 },
        { name: "T3", ilvl: 60, min: 31, max: 36 },
      ])
    }
  },
  {
    id: "prefix_increased_energy_shield",
    pattern: "#% increased Energy Shield",
    name: "#% increased Energy Shield",
    type: "Prefix",
    group: "EnergyShieldPercent",
    groups: ["body", "boots", "gloves", "helmet", "shield", "armour"],
    influence: "",
    tiers_by_class: {
      "Body Armour": createTiers([
        { name: "Unassailable", ilvl: 86, min: 121, max: 132 },
        { name: "Indomitable", ilvl: 78, min: 101, max: 120 },
        { name: "Dauntless", ilvl: 70, min: 80, max: 100 },
        { name: "Dazzling", ilvl: 60, min: 65, max: 79 },
        { name: "Resplendent", ilvl: 50, min: 50, max: 64 },
      ]),
      "Shield": createTiers([
        { name: "Unassailable", ilvl: 86, min: 101, max: 110 },
        { name: "Indomitable", ilvl: 78, min: 86, max: 100 },
        { name: "Dauntless", ilvl: 70, min: 70, max: 85 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 86, min: 91, max: 100 },
        { name: "T2", ilvl: 78, min: 76, max: 90 },
        { name: "T3", ilvl: 70, min: 61, max: 75 },
      ])
    }
  },
  {
    id: "prefix_increased_maximum_energy_shield",
    pattern: "#% increased maximum Energy Shield",
    name: "#% increased maximum Energy Shield",
    type: "Prefix",
    group: "MaxEnergyShieldPercent",
    groups: ["amulet", "ring", "jewellery"],
    influence: "",
    tiers_by_class: {
      "Amulet": createTiers([
        { name: "Girding", ilvl: 82, min: 17, max: 22 },
        { name: "Barricading", ilvl: 70, min: 13, max: 16 },
        { name: "Warding", ilvl: 55, min: 9, max: 12 },
        { name: "Shielding", ilvl: 40, min: 5, max: 8 },
      ]),
      "Ring": createTiers([
        { name: "Girding", ilvl: 82, min: 17, max: 22 },
        { name: "Barricading", ilvl: 70, min: 13, max: 16 },
        { name: "Warding", ilvl: 55, min: 9, max: 12 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 82, min: 17, max: 22 },
        { name: "T2", ilvl: 70, min: 13, max: 16 },
        { name: "T3", ilvl: 55, min: 9, max: 12 },
      ])
    }
  },
  {
    id: "prefix_to_maximum_mana",
    pattern: "+# to maximum Mana",
    name: "+# to maximum Mana",
    type: "Prefix",
    group: "BaseMana",
    groups: ["amulet", "ring", "belt", "body", "boots", "gloves", "helmet", "shield", "wand", "sceptre", "dagger", "staff", "armour", "jewellery", "caster"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Prime", ilvl: 81, min: 69, max: 73 },
        { name: "Vigor", ilvl: 75, min: 64, max: 68 },
        { name: "Athlete's", ilvl: 69, min: 59, max: 63 },
        { name: "Fecund", ilvl: 63, min: 54, max: 58 },
        { name: "Stout", ilvl: 55, min: 49, max: 53 },
        { name: "Robust", ilvl: 45, min: 43, max: 48 },
        { name: "Hearty", ilvl: 35, min: 37, max: 42 },
        { name: "Sanguine", ilvl: 25, min: 30, max: 36 },
      ])
    }
  },
  {
    id: "prefix_increased_movement_speed",
    pattern: "#% increased Movement Speed",
    name: "#% increased Movement Speed",
    type: "Prefix",
    group: "MovementVelocity",
    groups: ["boots", "armour"],
    influence: "",
    tiers_by_class: {
      "Boots": createTiers([
        { name: "Hawkeyed", ilvl: 86, min: 35, max: 35 },
        { name: "Falcon's", ilvl: 75, min: 30, max: 30 },
        { name: "Eagle's", ilvl: 55, min: 25, max: 25 },
        { name: "Gazelle's", ilvl: 35, min: 20, max: 20 },
        { name: "Cheetah's", ilvl: 15, min: 15, max: 15 },
        { name: "Stag's", ilvl: 1, min: 10, max: 10 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 86, min: 35, max: 35 },
        { name: "T2", ilvl: 75, min: 30, max: 30 },
        { name: "T3", ilvl: 55, min: 25, max: 25 },
        { name: "T4", ilvl: 35, min: 20, max: 20 },
      ])
    }
  },
  {
    id: "prefix_to_armour",
    pattern: "+# to Armour",
    name: "+# to Armour",
    type: "Prefix",
    group: "BaseArmour",
    groups: ["body", "boots", "gloves", "helmet", "shield", "belt", "ring", "amulet", "armour", "jewellery"],
    influence: "",
    tiers_by_class: {
      "Body Armour": createTiers([
        { name: "Fortified", ilvl: 86, min: 401, max: 500 },
        { name: "Stalwart", ilvl: 78, min: 301, max: 400 },
        { name: "Reinforced", ilvl: 68, min: 201, max: 300 },
      ]),
      "Shield": createTiers([
        { name: "Fortified", ilvl: 86, min: 351, max: 450 },
        { name: "Stalwart", ilvl: 78, min: 251, max: 350 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 86, min: 361, max: 400 },
        { name: "T2", ilvl: 78, min: 281, max: 360 },
        { name: "T3", ilvl: 68, min: 201, max: 280 },
      ])
    }
  },
  {
    id: "prefix_increased_armour",
    pattern: "#% increased Armour",
    name: "#% increased Armour",
    type: "Prefix",
    group: "ArmourPercent",
    groups: ["body", "boots", "gloves", "helmet", "shield", "amulet", "armour", "jewellery"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Unbreakable", ilvl: 86, min: 101, max: 110 },
        { name: "Indestructible", ilvl: 78, min: 86, max: 100 },
        { name: "Plated", ilvl: 68, min: 71, max: 85 },
      ])
    }
  },
  {
    id: "prefix_to_evasion_rating",
    pattern: "+# to Evasion Rating",
    name: "+# to Evasion Rating",
    type: "Prefix",
    group: "BaseEvasion",
    groups: ["body", "boots", "gloves", "helmet", "shield", "ring", "amulet", "armour", "jewellery"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Mirage's", ilvl: 86, min: 401, max: 500 },
        { name: "Illusion's", ilvl: 78, min: 301, max: 400 },
        { name: "Phantasm's", ilvl: 68, min: 201, max: 300 },
      ])
    }
  },
  {
    id: "prefix_increased_evasion_rating",
    pattern: "#% increased Evasion Rating",
    name: "#% increased Evasion Rating",
    type: "Prefix",
    group: "EvasionPercent",
    groups: ["body", "boots", "gloves", "helmet", "shield", "amulet", "armour", "jewellery"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Untouchable", ilvl: 86, min: 101, max: 110 },
        { name: "Elusive", ilvl: 78, min: 86, max: 100 },
        { name: "Shadowy", ilvl: 68, min: 71, max: 85 },
      ])
    }
  },

  // ===================== RESISTANCE SUFFIXES =====================
  {
    id: "suffix_to_fire_resistance",
    pattern: "+#% to Fire Resistance",
    name: "+#% to Fire Resistance",
    type: "Suffix",
    group: "FireResist",
    groups: ["amulet", "ring", "belt", "body", "boots", "gloves", "helmet", "shield", "quiver", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Magma", ilvl: 84, min: 46, max: 48 },
        { name: "of the Volcano", ilvl: 72, min: 42, max: 45 },
        { name: "of the Furnace", ilvl: 60, min: 36, max: 41 },
        { name: "of the Kiln", ilvl: 48, min: 30, max: 35 },
        { name: "of the Smelter", ilvl: 36, min: 24, max: 29 },
        { name: "of the Hearth", ilvl: 24, min: 18, max: 23 },
        { name: "of the Fire", ilvl: 12, min: 12, max: 17 },
        { name: "of the Cinder", ilvl: 1, min: 6, max: 11 },
      ])
    }
  },
  {
    id: "suffix_to_cold_resistance",
    pattern: "+#% to Cold Resistance",
    name: "+#% to Cold Resistance",
    type: "Suffix",
    group: "ColdResist",
    groups: ["amulet", "ring", "belt", "body", "boots", "gloves", "helmet", "shield", "quiver", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Ice", ilvl: 84, min: 46, max: 48 },
        { name: "of the Glacier", ilvl: 72, min: 42, max: 45 },
        { name: "of the Blizzard", ilvl: 60, min: 36, max: 41 },
        { name: "of the Avalanche", ilvl: 48, min: 30, max: 35 },
        { name: "of the Polar Bear", ilvl: 36, min: 24, max: 29 },
        { name: "of the Penguin", ilvl: 24, min: 18, max: 23 },
        { name: "of the Seal", ilvl: 12, min: 12, max: 17 },
        { name: "of the Frost", ilvl: 1, min: 6, max: 11 },
      ])
    }
  },
  {
    id: "suffix_to_lightning_resistance",
    pattern: "+#% to Lightning Resistance",
    name: "+#% to Lightning Resistance",
    type: "Suffix",
    group: "LightningResist",
    groups: ["amulet", "ring", "belt", "body", "boots", "gloves", "helmet", "shield", "quiver", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Lightning", ilvl: 84, min: 46, max: 48 },
        { name: "of the Maelstrom", ilvl: 72, min: 42, max: 45 },
        { name: "of the Tempest", ilvl: 60, min: 36, max: 41 },
        { name: "of the Sky", ilvl: 48, min: 30, max: 35 },
        { name: "of the Cloud", ilvl: 36, min: 24, max: 29 },
        { name: "of the Squall", ilvl: 24, min: 18, max: 23 },
        { name: "of the Storm", ilvl: 12, min: 12, max: 17 },
        { name: "of the Spark", ilvl: 1, min: 6, max: 11 },
      ])
    }
  },
  {
    id: "suffix_to_chaos_resistance",
    pattern: "+#% to Chaos Resistance",
    name: "+#% to Chaos Resistance",
    type: "Suffix",
    group: "ChaosResist",
    groups: ["amulet", "ring", "belt", "body", "boots", "gloves", "helmet", "shield", "quiver", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Void", ilvl: 81, min: 31, max: 35 },
        { name: "of the Abyss", ilvl: 65, min: 26, max: 30 },
        { name: "of Eviction", ilvl: 50, min: 21, max: 25 },
        { name: "of Expulsion", ilvl: 38, min: 16, max: 20 },
        { name: "of Banishment", ilvl: 25, min: 11, max: 15 },
        { name: "of Exile", ilvl: 16, min: 5, max: 10 },
      ])
    }
  },
  {
    id: "suffix_to_all_elemental_resistances",
    pattern: "+#% to all Elemental Resistances",
    name: "+#% to all Elemental Resistances",
    type: "Suffix",
    group: "AllElementalResist",
    groups: ["amulet", "ring", "belt", "shield", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Prismatic", ilvl: 84, min: 15, max: 16 },
        { name: "of the Rainbow", ilvl: 70, min: 13, max: 14 },
        { name: "of the Kaleidoscope", ilvl: 55, min: 11, max: 12 },
        { name: "of the Prism", ilvl: 40, min: 9, max: 10 },
        { name: "of Elements", ilvl: 25, min: 7, max: 8 },
        { name: "of Resistance", ilvl: 12, min: 5, max: 6 },
      ])
    }
  },

  // ===================== ATTRIBUTE SUFFIXES =====================
  {
    id: "suffix_to_strength",
    pattern: "+# to Strength",
    name: "+# to Strength",
    type: "Suffix",
    group: "Strength",
    groups: ["amulet", "ring", "belt", "body", "boots", "gloves", "helmet", "shield", "axe", "mace", "sword", "staff", "jewellery", "armour", "weapon"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Titan", ilvl: 82, min: 51, max: 55 },
        { name: "of the Colossus", ilvl: 74, min: 43, max: 50 },
        { name: "of the Goliath", ilvl: 60, min: 38, max: 42 },
        { name: "of the Bear", ilvl: 48, min: 33, max: 37 },
        { name: "of the Lion", ilvl: 38, min: 28, max: 32 },
        { name: "of the Gorilla", ilvl: 28, min: 23, max: 27 },
        { name: "of the Bull", ilvl: 18, min: 18, max: 22 },
        { name: "of the Ox", ilvl: 8, min: 13, max: 17 },
        { name: "of the Brute", ilvl: 1, min: 8, max: 12 },
      ])
    }
  },
  {
    id: "suffix_to_dexterity",
    pattern: "+# to Dexterity",
    name: "+# to Dexterity",
    type: "Suffix",
    group: "Dexterity",
    groups: ["amulet", "ring", "body", "boots", "gloves", "helmet", "shield", "bow", "quiver", "claw", "dagger", "sword", "jewellery", "armour", "weapon"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Wind", ilvl: 82, min: 51, max: 55 },
        { name: "of the Zephyr", ilvl: 74, min: 43, max: 50 },
        { name: "of the Falcon", ilvl: 60, min: 38, max: 42 },
        { name: "of the Hawk", ilvl: 48, min: 33, max: 37 },
        { name: "of the Eagle", ilvl: 38, min: 28, max: 32 },
        { name: "of the Fox", ilvl: 28, min: 23, max: 27 },
        { name: "of the Lynx", ilvl: 18, min: 18, max: 22 },
        { name: "of the Cat", ilvl: 8, min: 13, max: 17 },
        { name: "of the Monkey", ilvl: 1, min: 8, max: 12 },
      ])
    }
  },
  {
    id: "suffix_to_intelligence",
    pattern: "+# to Intelligence",
    name: "+# to Intelligence",
    type: "Suffix",
    group: "Intelligence",
    groups: ["amulet", "ring", "body", "boots", "gloves", "helmet", "shield", "wand", "sceptre", "staff", "dagger", "jewellery", "armour", "weapon", "caster"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Omniscient", ilvl: 82, min: 51, max: 55 },
        { name: "of the Genius", ilvl: 74, min: 43, max: 50 },
        { name: "of the Polymath", ilvl: 60, min: 38, max: 42 },
        { name: "of the Savant", ilvl: 48, min: 33, max: 37 },
        { name: "of the Sage", ilvl: 38, min: 28, max: 32 },
        { name: "of the Scholar", ilvl: 28, min: 23, max: 27 },
        { name: "of the Student", ilvl: 18, min: 18, max: 22 },
        { name: "of the Pupil", ilvl: 8, min: 13, max: 17 },
        { name: "of the Novice", ilvl: 1, min: 8, max: 12 },
      ])
    }
  },
  {
    id: "suffix_to_all_attributes",
    pattern: "+# to all Attributes",
    name: "+# to all Attributes",
    type: "Suffix",
    group: "AllAttributes",
    groups: ["amulet", "ring", "jewellery"],
    influence: "",
    tiers_by_class: {
      "Amulet": createTiers([
        { name: "of the Star", ilvl: 82, min: 25, max: 32 },
        { name: "of the Comet", ilvl: 70, min: 21, max: 24 },
        { name: "of the Meteor", ilvl: 55, min: 17, max: 20 },
        { name: "of the Sky", ilvl: 40, min: 13, max: 16 },
        { name: "of the Heavens", ilvl: 25, min: 9, max: 12 },
      ]),
      "Ring": createTiers([
        { name: "of the Star", ilvl: 82, min: 13, max: 16 },
        { name: "of the Comet", ilvl: 70, min: 10, max: 12 },
        { name: "of the Meteor", ilvl: 55, min: 7, max: 9 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 82, min: 25, max: 32 },
        { name: "T2", ilvl: 70, min: 21, max: 24 },
        { name: "T3", ilvl: 55, min: 17, max: 20 },
      ])
    }
  },

  // ===================== SPELL SUPPRESSION & DEFENSIVE SUFFIXES =====================
  {
    id: "suffix_chance_to_suppress_spell_damage",
    pattern: "+#% chance to Suppress Spell Damage",
    name: "+#% chance to Suppress Spell Damage",
    type: "Suffix",
    group: "SpellSuppression",
    groups: ["body", "boots", "gloves", "helmet", "shield", "armour"],
    influence: "",
    tiers_by_class: {
      "Body Armour": createTiers([
        { name: "of Incombustibility", ilvl: 86, min: 20, max: 22 },
        { name: "of Dampening", ilvl: 77, min: 17, max: 19 },
        { name: "of Grounding", ilvl: 68, min: 14, max: 16 },
        { name: "of Quenching", ilvl: 55, min: 11, max: 13 },
        { name: "of Insulating", ilvl: 40, min: 8, max: 10 },
      ]),
      "Boots": createTiers([
        { name: "of Incombustibility", ilvl: 85, min: 13, max: 14 },
        { name: "of Dampening", ilvl: 76, min: 11, max: 12 },
        { name: "of Grounding", ilvl: 67, min: 9, max: 10 },
        { name: "of Quenching", ilvl: 54, min: 7, max: 8 },
        { name: "of Insulating", ilvl: 38, min: 5, max: 6 },
      ]),
      "Gloves": createTiers([
        { name: "of Incombustibility", ilvl: 85, min: 13, max: 14 },
        { name: "of Dampening", ilvl: 76, min: 11, max: 12 },
        { name: "of Grounding", ilvl: 67, min: 9, max: 10 },
        { name: "of Quenching", ilvl: 54, min: 7, max: 8 },
        { name: "of Insulating", ilvl: 38, min: 5, max: 6 },
      ]),
      "Helmet": createTiers([
        { name: "of Incombustibility", ilvl: 85, min: 13, max: 14 },
        { name: "of Dampening", ilvl: 76, min: 11, max: 12 },
        { name: "of Grounding", ilvl: 67, min: 9, max: 10 },
        { name: "of Quenching", ilvl: 54, min: 7, max: 8 },
        { name: "of Insulating", ilvl: 38, min: 5, max: 6 },
      ]),
      "Shield": createTiers([
        { name: "of Incombustibility", ilvl: 85, min: 13, max: 14 },
        { name: "of Dampening", ilvl: 76, min: 11, max: 12 },
        { name: "of Grounding", ilvl: 67, min: 9, max: 10 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 85, min: 13, max: 14 },
        { name: "T2", ilvl: 76, min: 11, max: 12 },
        { name: "T3", ilvl: 67, min: 9, max: 10 },
        { name: "T4", ilvl: 54, min: 7, max: 8 },
      ])
    }
  },
  {
    id: "suffix_regenerate_life_per_second",
    pattern: "Regenerate # Life per second",
    name: "Regenerate # Life per second",
    type: "Suffix",
    group: "LifeRegeneration",
    groups: ["amulet", "ring", "belt", "body", "boots", "gloves", "helmet", "shield", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Phoenix", ilvl: 80, min: 33, max: 40 },
        { name: "of the Lizard", ilvl: 68, min: 25, max: 32 },
        { name: "of the Newt", ilvl: 54, min: 17, max: 24 },
        { name: "of the Hydroid", ilvl: 40, min: 10, max: 16 },
        { name: "of the Salamander", ilvl: 24, min: 4, max: 9 },
        { name: "of the Troll", ilvl: 10, min: 1, max: 3 },
      ])
    }
  },
  {
    id: "suffix_chance_to_block_attack_damage",
    pattern: "+#% chance to Block Attack Damage",
    name: "+#% chance to Block Attack Damage",
    type: "Suffix",
    group: "BlockAttack",
    groups: ["shield", "armour", "offhand"],
    influence: "",
    tiers_by_class: {
      "Shield": createTiers([
        { name: "of Safeguarding", ilvl: 82, min: 6, max: 8 },
        { name: "of Defending", ilvl: 68, min: 4, max: 5 },
        { name: "of Guarding", ilvl: 45, min: 2, max: 3 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 82, min: 6, max: 8 },
        { name: "T2", ilvl: 68, min: 4, max: 5 },
        { name: "T3", ilvl: 45, min: 2, max: 3 },
      ])
    }
  },

  // ===================== WEAPON & ATTACK MODIFIERS =====================
  {
    id: "prefix_increased_physical_damage",
    pattern: "#% increased Physical Damage",
    name: "#% increased Physical Damage",
    type: "Prefix",
    group: "PhysicalDamagePercent",
    groups: ["bow", "wand", "claw", "dagger", "sceptre", "staff", "sword", "axe", "mace", "weapon", "one-handed", "two-handed"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Merciless", ilvl: 83, min: 170, max: 179 },
        { name: "Tyrannical", ilvl: 73, min: 150, max: 169 },
        { name: "Cruel", ilvl: 60, min: 130, max: 149 },
        { name: "Bloodthirsty", ilvl: 46, min: 110, max: 129 },
        { name: "Savage", ilvl: 35, min: 90, max: 109 },
        { name: "Grounded", ilvl: 23, min: 65, max: 84 },
        { name: "Heavy", ilvl: 11, min: 40, max: 64 },
      ])
    }
  },
  {
    id: "prefix_adds_physical_damage",
    pattern: "Adds # to # Physical Damage",
    name: "Adds # to # Physical Damage",
    type: "Prefix",
    group: "AddedPhysicalDamage",
    groups: ["bow", "wand", "claw", "dagger", "sceptre", "staff", "sword", "axe", "mace", "weapon", "one-handed", "two-handed"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Flaring", ilvl: 82, min: [15, 21], max: [32, 38] },
        { name: "Tempered", ilvl: 73, min: [13, 17], max: [26, 30] },
        { name: "Annealed", ilvl: 65, min: [11, 14], max: [22, 25] },
        { name: "Razor-sharp", ilvl: 54, min: [9, 12], max: [18, 21] },
        { name: "Carved", ilvl: 44, min: [7, 10], max: [15, 17] },
      ])
    }
  },
  {
    id: "prefix_adds_physical_damage_to_attacks",
    pattern: "Adds # to # Physical Damage to Attacks",
    name: "Adds # to # Physical Damage to Attacks",
    type: "Prefix",
    group: "AddedPhysicalDamageJewellery",
    groups: ["amulet", "ring", "gloves", "quiver", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "Amulet": createTiers([
        { name: "Flaring", ilvl: 82, min: [15, 19], max: [25, 30] },
        { name: "Tempered", ilvl: 73, min: [12, 15], max: [20, 24] },
        { name: "Annealed", ilvl: 64, min: [9, 12], max: [16, 19] },
        { name: "Razor-sharp", ilvl: 53, min: [7, 9], max: [13, 15] },
      ]),
      "Ring": createTiers([
        { name: "Flaring", ilvl: 82, min: [9, 11], max: [15, 18] },
        { name: "Tempered", ilvl: 73, min: [7, 9], max: [12, 14] },
        { name: "Annealed", ilvl: 64, min: [5, 7], max: [9, 11] },
      ]),
      "Gloves": createTiers([
        { name: "Flaring", ilvl: 82, min: [6, 8], max: [12, 15] },
        { name: "Tempered", ilvl: 73, min: [5, 6], max: [9, 11] },
        { name: "Annealed", ilvl: 64, min: [4, 5], max: [7, 8] },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 82, min: [15, 19], max: [25, 30] },
        { name: "T2", ilvl: 73, min: [12, 15], max: [20, 24] },
        { name: "T3", ilvl: 64, min: [9, 12], max: [16, 19] },
      ])
    }
  },
  {
    id: "prefix_adds_fire_damage_to_attacks",
    pattern: "Adds # to # Fire Damage to Attacks",
    name: "Adds # to # Fire Damage to Attacks",
    type: "Prefix",
    group: "AddedFireDamageToAttacks",
    groups: ["amulet", "ring", "gloves", "quiver", "bow", "wand", "claw", "dagger", "sword", "axe", "mace", "weapon", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Cremating", ilvl: 82, min: [27, 35], max: [55, 68] },
        { name: "Incinerating", ilvl: 73, min: [22, 28], max: [45, 54] },
        { name: "Blasting", ilvl: 64, min: [17, 21], max: [34, 42] },
        { name: "Combusting", ilvl: 53, min: [12, 16], max: [25, 31] },
      ])
    }
  },
  {
    id: "prefix_adds_cold_damage_to_attacks",
    pattern: "Adds # to # Cold Damage to Attacks",
    name: "Adds # to # Cold Damage to Attacks",
    type: "Prefix",
    group: "AddedColdDamageToAttacks",
    groups: ["amulet", "ring", "gloves", "quiver", "bow", "wand", "claw", "dagger", "sword", "axe", "mace", "weapon", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Polar", ilvl: 82, min: [23, 30], max: [47, 59] },
        { name: "Entombing", ilvl: 73, min: [19, 24], max: [38, 46] },
        { name: "Freezing", ilvl: 64, min: [14, 18], max: [29, 36] },
        { name: "Frigid", ilvl: 53, min: [10, 13], max: [21, 26] },
      ])
    }
  },
  {
    id: "prefix_adds_lightning_damage_to_attacks",
    pattern: "Adds # to # Lightning Damage to Attacks",
    name: "Adds # to # Lightning Damage to Attacks",
    type: "Prefix",
    group: "AddedLightningDamageToAttacks",
    groups: ["amulet", "ring", "gloves", "quiver", "bow", "wand", "claw", "dagger", "sword", "axe", "mace", "weapon", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Electrocuting", ilvl: 82, min: [4, 7], max: [75, 92] },
        { name: "Discharging", ilvl: 73, min: [3, 5], max: [60, 74] },
        { name: "Shocking", ilvl: 64, min: [2, 4], max: [46, 57] },
      ])
    }
  },
  {
    id: "prefix_adds_chaos_damage_to_attacks",
    pattern: "Adds # to # Chaos Damage to Attacks",
    name: "Adds # to # Chaos Damage to Attacks",
    type: "Prefix",
    group: "AddedChaosDamageToAttacks",
    groups: ["amulet", "ring", "gloves", "quiver", "bow", "wand", "claw", "dagger", "sword", "axe", "mace", "weapon", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Annihilating", ilvl: 83, min: [17, 23], max: [35, 43] },
        { name: "Decaying", ilvl: 74, min: [13, 18], max: [27, 34] },
        { name: "Blighted", ilvl: 62, min: [10, 13], max: [20, 25] },
      ])
    }
  },
  {
    id: "prefix_increased_elemental_damage_with_attack_skills",
    pattern: "#% increased Elemental Damage with Attack Skills",
    name: "#% increased Elemental Damage with Attack Skills",
    type: "Prefix",
    group: "IncreasedElementalDamageWithAttacks",
    groups: ["amulet", "ring", "belt", "quiver", "bow", "wand", "claw", "dagger", "sceptre", "sword", "axe", "mace", "jewellery", "weapon"],
    influence: "",
    tiers_by_class: {
      "Amulet": createTiers([
        { name: "Overpowering", ilvl: 86, min: 43, max: 50 },
        { name: "Unleashed", ilvl: 76, min: 37, max: 42 },
        { name: "Devastating", ilvl: 65, min: 31, max: 36 },
        { name: "Channeling", ilvl: 50, min: 23, max: 30 },
      ]),
      "Belt": createTiers([
        { name: "Overpowering", ilvl: 86, min: 43, max: 50 },
        { name: "Unleashed", ilvl: 76, min: 37, max: 42 },
        { name: "Devastating", ilvl: 65, min: 31, max: 36 },
      ]),
      "Ring": createTiers([
        { name: "Unleashed", ilvl: 76, min: 37, max: 42 },
        { name: "Devastating", ilvl: 65, min: 31, max: 36 },
        { name: "Channeling", ilvl: 50, min: 23, max: 30 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 86, min: 43, max: 50 },
        { name: "T2", ilvl: 76, min: 37, max: 42 },
        { name: "T3", ilvl: 65, min: 31, max: 36 },
      ])
    }
  },
  {
    id: "suffix_increased_attack_speed",
    pattern: "#% increased Attack Speed",
    name: "#% increased Attack Speed",
    type: "Suffix",
    group: "IncreasedAttackSpeed",
    groups: ["bow", "wand", "claw", "dagger", "sceptre", "staff", "sword", "axe", "mace", "gloves", "amulet", "ring", "quiver", "weapon", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "Gloves": createTiers([
        { name: "of Renown", ilvl: 84, min: 14, max: 16 },
        { name: "of Fame", ilvl: 70, min: 11, max: 13 },
        { name: "of Acclaim", ilvl: 55, min: 8, max: 10 },
      ]),
      "Amulet": createTiers([
        { name: "of Renown", ilvl: 80, min: 10, max: 12 },
        { name: "of Fame", ilvl: 65, min: 8, max: 9 },
        { name: "of Acclaim", ilvl: 45, min: 5, max: 7 },
      ]),
      "Ring": createTiers([
        { name: "of Renown", ilvl: 80, min: 5, max: 7 },
        { name: "of Fame", ilvl: 60, min: 3, max: 4 },
      ]),
      "_default": createTiers([
        { name: "Celebration", ilvl: 84, min: 26, max: 27 },
        { name: "Infamy", ilvl: 74, min: 23, max: 25 },
        { name: "Renown", ilvl: 60, min: 20, max: 22 },
        { name: "Fame", ilvl: 45, min: 17, max: 19 },
      ])
    }
  },
  {
    id: "suffix_increased_critical_strike_chance",
    pattern: "#% increased Critical Strike Chance",
    name: "#% increased Critical Strike Chance",
    type: "Suffix",
    group: "CriticalStrikeChance",
    groups: ["bow", "wand", "claw", "dagger", "sceptre", "staff", "sword", "axe", "mace", "quiver", "weapon"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of Incisions", ilvl: 80, min: 35, max: 38 },
        { name: "of Penetrating", ilvl: 68, min: 30, max: 34 },
        { name: "of Puncturing", ilvl: 54, min: 25, max: 29 },
        { name: "of Slicing", ilvl: 40, min: 20, max: 24 },
      ])
    }
  },
  {
    id: "suffix_increased_global_critical_strike_chance",
    pattern: "#% increased Global Critical Strike Chance",
    name: "#% increased Global Critical Strike Chance",
    type: "Suffix",
    group: "GlobalCriticalStrikeChance",
    groups: ["amulet", "ring", "quiver", "jewellery", "offhand"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of Incisions", ilvl: 80, min: 35, max: 38 },
        { name: "of Penetrating", ilvl: 68, min: 30, max: 34 },
        { name: "of Puncturing", ilvl: 54, min: 25, max: 29 },
      ])
    }
  },
  {
    id: "suffix_to_global_critical_strike_multiplier",
    pattern: "+#% to Global Critical Strike Multiplier",
    name: "+#% to Global Critical Strike Multiplier",
    type: "Suffix",
    group: "CriticalMultiplier",
    groups: ["amulet", "quiver", "jewellery", "offhand", "bow", "wand", "claw", "dagger", "sceptre", "staff", "sword", "axe", "mace", "weapon"],
    influence: "",
    tiers_by_class: {
      "Amulet": createTiers([
        { name: "of Destruction", ilvl: 82, min: 35, max: 38 },
        { name: "of Ruin", ilvl: 70, min: 30, max: 34 },
        { name: "of Havoc", ilvl: 55, min: 25, max: 29 },
        { name: "of Doom", ilvl: 40, min: 20, max: 24 },
      ]),
      "_default": createTiers([
        { name: "of Destruction", ilvl: 82, min: 35, max: 38 },
        { name: "of Ruin", ilvl: 70, min: 30, max: 34 },
        { name: "of Havoc", ilvl: 55, min: 25, max: 29 },
      ])
    }
  },
  {
    id: "suffix_to_accuracy_rating",
    pattern: "+# to Accuracy Rating",
    name: "+# to Accuracy Rating",
    type: "Suffix",
    group: "AccuracyRating",
    groups: ["helmet", "gloves", "amulet", "ring", "quiver", "bow", "wand", "claw", "dagger", "sword", "axe", "mace", "jewellery", "armour", "weapon"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Sniper", ilvl: 85, min: 401, max: 480 },
        { name: "of the Marksman", ilvl: 75, min: 321, max: 400 },
        { name: "of the Ranger", ilvl: 64, min: 241, max: 320 },
        { name: "of the Archer", ilvl: 50, min: 161, max: 240 },
      ])
    }
  },

  // ===================== SPELL & CASTER MODIFIERS =====================
  {
    id: "prefix_increased_spell_damage",
    pattern: "#% increased Spell Damage",
    name: "#% increased Spell Damage",
    type: "Prefix",
    group: "SpellDamagePercent",
    groups: ["wand", "sceptre", "dagger", "staff", "amulet", "shield", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "Staff": createTiers([
        { name: "Archmage's", ilvl: 84, min: 150, max: 169 },
        { name: "Wizard's", ilvl: 74, min: 130, max: 149 },
        { name: "Mage's", ilvl: 62, min: 110, max: 129 },
      ]),
      "Wand": createTiers([
        { name: "Archmage's", ilvl: 84, min: 100, max: 109 },
        { name: "Wizard's", ilvl: 74, min: 85, max: 99 },
        { name: "Mage's", ilvl: 62, min: 70, max: 84 },
        { name: "Adept's", ilvl: 48, min: 55, max: 69 },
      ]),
      "Sceptre": createTiers([
        { name: "Archmage's", ilvl: 84, min: 100, max: 109 },
        { name: "Wizard's", ilvl: 74, min: 85, max: 99 },
        { name: "Mage's", ilvl: 62, min: 70, max: 84 },
      ]),
      "Amulet": createTiers([
        { name: "Archmage's", ilvl: 80, min: 23, max: 26 },
        { name: "Wizard's", ilvl: 68, min: 19, max: 22 },
        { name: "Mage's", ilvl: 52, min: 15, max: 18 },
      ]),
      "Shield": createTiers([
        { name: "Archmage's", ilvl: 84, min: 75, max: 79 },
        { name: "Wizard's", ilvl: 72, min: 65, max: 74 },
        { name: "Mage's", ilvl: 58, min: 50, max: 64 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 84, min: 100, max: 109 },
        { name: "T2", ilvl: 74, min: 85, max: 99 },
        { name: "T3", ilvl: 62, min: 70, max: 84 },
      ])
    }
  },
  {
    id: "prefix_adds_fire_damage_to_spells",
    pattern: "Adds # to # Fire Damage to Spells",
    name: "Adds # to # Fire Damage to Spells",
    type: "Prefix",
    group: "AddedFireDamageToSpells",
    groups: ["wand", "sceptre", "dagger", "staff", "weapon", "caster"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Cremating", ilvl: 82, min: [23, 31], max: [48, 59] },
        { name: "Incinerating", ilvl: 73, min: [19, 25], max: [38, 47] },
        { name: "Blasting", ilvl: 62, min: [14, 19], max: [29, 36] },
      ])
    }
  },
  {
    id: "prefix_adds_cold_damage_to_spells",
    pattern: "Adds # to # Cold Damage to Spells",
    name: "Adds # to # Cold Damage to Spells",
    type: "Prefix",
    group: "AddedColdDamageToSpells",
    groups: ["wand", "sceptre", "dagger", "staff", "weapon", "caster"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Polar", ilvl: 82, min: [20, 27], max: [41, 51] },
        { name: "Entombing", ilvl: 73, min: [16, 21], max: [33, 40] },
        { name: "Freezing", ilvl: 62, min: [12, 16], max: [25, 31] },
      ])
    }
  },
  {
    id: "prefix_adds_lightning_damage_to_spells",
    pattern: "Adds # to # Lightning Damage to Spells",
    name: "Adds # to # Lightning Damage to Spells",
    type: "Prefix",
    group: "AddedLightningDamageToSpells",
    groups: ["wand", "sceptre", "dagger", "staff", "weapon", "caster"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Electrocuting", ilvl: 82, min: [3, 6], max: [65, 80] },
        { name: "Discharging", ilvl: 73, min: [2, 4], max: [52, 64] },
      ])
    }
  },
  {
    id: "prefix_adds_chaos_damage_to_spells",
    pattern: "Adds # to # Chaos Damage to Spells",
    name: "Adds # to # Chaos Damage to Spells",
    type: "Prefix",
    group: "AddedChaosDamageToSpells",
    groups: ["wand", "sceptre", "dagger", "staff", "weapon", "caster"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Annihilating", ilvl: 83, min: [15, 20], max: [30, 37] },
        { name: "Decaying", ilvl: 74, min: [11, 15], max: [23, 29] },
      ])
    }
  },
  {
    id: "prefix_to_level_of_all_spell_skill_gems",
    pattern: "+# to Level of all Spell Skill Gems",
    name: "+# to Level of all Spell Skill Gems",
    type: "Prefix",
    group: "AllSpellSkillGemLevel",
    groups: ["wand", "sceptre", "dagger", "staff", "amulet", "weapon", "caster", "jewellery"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Paragon's", ilvl: 75, min: 1, max: 1 }
      ])
    }
  },
  {
    id: "prefix_to_level_of_all_fire_skill_gems",
    pattern: "+# to Level of all Fire Skill Gems",
    name: "+# to Level of all Fire Skill Gems",
    type: "Prefix",
    group: "FireGemLevel",
    groups: ["wand", "sceptre", "staff", "amulet", "shield", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Flame-dancer's", ilvl: 75, min: 1, max: 1 }
      ])
    }
  },
  {
    id: "prefix_to_level_of_all_cold_skill_gems",
    pattern: "+# to Level of all Cold Skill Gems",
    name: "+# to Level of all Cold Skill Gems",
    type: "Prefix",
    group: "ColdGemLevel",
    groups: ["wand", "sceptre", "staff", "amulet", "shield", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Frost-weaver's", ilvl: 75, min: 1, max: 1 }
      ])
    }
  },
  {
    id: "prefix_to_level_of_all_lightning_skill_gems",
    pattern: "+# to Level of all Lightning Skill Gems",
    name: "+# to Level of all Lightning Skill Gems",
    type: "Prefix",
    group: "LightningGemLevel",
    groups: ["wand", "sceptre", "staff", "amulet", "shield", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Thunder-caller's", ilvl: 75, min: 1, max: 1 }
      ])
    }
  },
  {
    id: "prefix_to_level_of_all_physical_skill_gems",
    pattern: "+# to Level of all Physical Skill Gems",
    name: "+# to Level of all Physical Skill Gems",
    type: "Prefix",
    group: "PhysicalGemLevel",
    groups: ["wand", "sceptre", "staff", "amulet", "shield", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Warlord's", ilvl: 75, min: 1, max: 1 }
      ])
    }
  },
  {
    id: "prefix_to_level_of_all_chaos_skill_gems",
    pattern: "+# to Level of all Chaos Skill Gems",
    name: "+# to Level of all Chaos Skill Gems",
    type: "Prefix",
    group: "ChaosGemLevel",
    groups: ["wand", "sceptre", "staff", "amulet", "shield", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Plague-bearer's", ilvl: 75, min: 1, max: 1 }
      ])
    }
  },
  {
    id: "suffix_increased_cast_speed",
    pattern: "#% increased Cast Speed",
    name: "#% increased Cast Speed",
    type: "Suffix",
    group: "CastSpeed",
    groups: ["wand", "sceptre", "dagger", "staff", "amulet", "ring", "gloves", "shield", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "Wand": createTiers([
        { name: "of Acclaim", ilvl: 83, min: 26, max: 29 },
        { name: "of Fame", ilvl: 72, min: 22, max: 25 },
        { name: "of Renown", ilvl: 58, min: 18, max: 21 },
      ]),
      "Amulet": createTiers([
        { name: "of Acclaim", ilvl: 80, min: 17, max: 20 },
        { name: "of Fame", ilvl: 65, min: 13, max: 16 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 83, min: 26, max: 29 },
        { name: "T2", ilvl: 72, min: 22, max: 25 },
        { name: "T3", ilvl: 58, min: 18, max: 21 },
      ])
    }
  },
  {
    id: "suffix_increased_critical_strike_chance_for_spells",
    pattern: "#% increased Critical Strike Chance for Spells",
    name: "#% increased Critical Strike Chance for Spells",
    type: "Suffix",
    group: "SpellCriticalStrikeChance",
    groups: ["wand", "sceptre", "dagger", "staff", "shield", "weapon", "caster", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Elements", ilvl: 82, min: 100, max: 109 },
        { name: "of the Storm", ilvl: 70, min: 80, max: 99 },
        { name: "of the Spark", ilvl: 55, min: 60, max: 79 },
      ])
    }
  },
  {
    id: "suffix_to_damage_over_time_multiplier",
    pattern: "+#% to Damage over Time Multiplier",
    name: "+#% to Damage over Time Multiplier",
    type: "Suffix",
    group: "DamageOverTimeMultiplier",
    groups: ["amulet", "gloves", "wand", "sceptre", "staff", "bow", "quiver", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "Amulet": createTiers([
        { name: "of Dissolution", ilvl: 82, min: 24, max: 26 },
        { name: "of Decay", ilvl: 68, min: 20, max: 23 },
        { name: "of Erosion", ilvl: 50, min: 15, max: 19 },
      ]),
      "_default": createTiers([
        { name: "T1", ilvl: 82, min: 24, max: 26 },
        { name: "T2", ilvl: 68, min: 20, max: 23 },
        { name: "T3", ilvl: 50, min: 15, max: 19 },
      ])
    }
  },
  {
    id: "suffix_to_chaos_damage_over_time_multiplier",
    pattern: "+#% to Chaos Damage over Time Multiplier",
    name: "+#% to Chaos Damage over Time Multiplier",
    type: "Suffix",
    group: "ChaosDotMultiplier",
    groups: ["amulet", "wand", "sceptre", "staff", "bow", "quiver", "gloves", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of Atrophy", ilvl: 82, min: 24, max: 26 },
        { name: "of Decay", ilvl: 68, min: 20, max: 23 },
        { name: "of Corrosion", ilvl: 50, min: 15, max: 19 },
      ])
    }
  },
  {
    id: "suffix_to_fire_damage_over_time_multiplier",
    pattern: "+#% to Fire Damage over Time Multiplier",
    name: "+#% to Fire Damage over Time Multiplier",
    type: "Suffix",
    group: "FireDotMultiplier",
    groups: ["amulet", "wand", "sceptre", "staff", "bow", "quiver", "gloves", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of Combustion", ilvl: 82, min: 24, max: 26 },
        { name: "of Immolation", ilvl: 68, min: 20, max: 23 },
        { name: "of Ignition", ilvl: 50, min: 15, max: 19 },
      ])
    }
  },
  {
    id: "suffix_to_cold_damage_over_time_multiplier",
    pattern: "+#% to Cold Damage over Time Multiplier",
    name: "+#% to Cold Damage over Time Multiplier",
    type: "Suffix",
    group: "ColdDotMultiplier",
    groups: ["amulet", "wand", "sceptre", "staff", "bow", "quiver", "gloves", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of Rime", ilvl: 82, min: 24, max: 26 },
        { name: "of Frost", ilvl: 68, min: 20, max: 23 },
        { name: "of Chilling", ilvl: 50, min: 15, max: 19 },
      ])
    }
  },
  {
    id: "suffix_to_physical_damage_over_time_multiplier",
    pattern: "+#% to Physical Damage over Time Multiplier",
    name: "+#% to Physical Damage over Time Multiplier",
    type: "Suffix",
    group: "PhysicalDotMultiplier",
    groups: ["amulet", "wand", "sceptre", "staff", "bow", "quiver", "gloves", "weapon", "caster", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of Hemorrhaging", ilvl: 82, min: 24, max: 26 },
        { name: "of Bleeding", ilvl: 68, min: 20, max: 23 },
        { name: "of Rupture", ilvl: 50, min: 15, max: 19 },
      ])
    }
  },
  {
    id: "suffix_increased_mana_regeneration_rate",
    pattern: "#% increased Mana Regeneration Rate",
    name: "#% increased Mana Regeneration Rate",
    type: "Suffix",
    group: "ManaRegeneration",
    groups: ["amulet", "ring", "helmet", "wand", "sceptre", "staff", "shield", "jewellery", "armour", "weapon", "caster"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of the Euphoria", ilvl: 80, min: 55, max: 60 },
        { name: "of the Oasis", ilvl: 68, min: 45, max: 54 },
        { name: "of the Spring", ilvl: 50, min: 35, max: 44 },
        { name: "of the Fountain", ilvl: 30, min: 20, max: 34 },
      ])
    }
  },

  // ===================== FLASK & UTILITY MODIFIERS =====================
  {
    id: "suffix_increased_flask_charges_gained",
    pattern: "#% increased Flask Charges gained",
    name: "#% increased Flask Charges gained",
    type: "Suffix",
    group: "FlaskChargesGained",
    groups: ["belt", "jewellery"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of Brewer's", ilvl: 80, min: 31, max: 35 },
        { name: "of Distiller's", ilvl: 65, min: 26, max: 30 },
        { name: "of Fermenter's", ilvl: 45, min: 20, max: 25 },
      ])
    }
  },
  {
    id: "suffix_reduced_flask_charges_used",
    pattern: "#% reduced Flask Charges used",
    name: "#% reduced Flask Charges used",
    type: "Suffix",
    group: "FlaskChargesUsed",
    groups: ["belt", "jewellery"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of Conservation", ilvl: 80, min: 18, max: 20 },
        { name: "of Thrift", ilvl: 65, min: 14, max: 17 },
        { name: "of Frugality", ilvl: 45, min: 10, max: 13 },
      ])
    }
  },
  {
    id: "suffix_increased_flask_effect_duration",
    pattern: "#% increased Flask Effect Duration",
    name: "#% increased Flask Effect Duration",
    type: "Suffix",
    group: "FlaskEffectDuration",
    groups: ["belt", "jewellery"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of Endless", ilvl: 80, min: 26, max: 30 },
        { name: "of Perpetual", ilvl: 65, min: 21, max: 25 },
        { name: "of Continuous", ilvl: 45, min: 15, max: 20 },
      ])
    }
  },
  {
    id: "prefix_increased_rarity_of_items_found",
    pattern: "#% increased Rarity of Items found",
    name: "#% increased Rarity of Items found",
    type: "Prefix",
    group: "ItemRarityPrefix",
    groups: ["amulet", "ring", "helmet", "gloves", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Dragon's", ilvl: 80, min: 21, max: 26 },
        { name: "Drake's", ilvl: 60, min: 16, max: 20 },
        { name: "Wyrm's", ilvl: 40, min: 10, max: 15 },
      ])
    }
  },
  {
    id: "prefix_physical_attack_damage_leeched_as_life",
    pattern: "#% of Physical Attack Damage Leeched as Life",
    name: "#% of Physical Attack Damage Leeched as Life",
    type: "Prefix",
    group: "PhysicalLifeLeech",
    groups: ["amulet", "ring", "gloves", "quiver", "claw", "dagger", "sword", "axe", "mace", "bow", "weapon", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Remora's", ilvl: 70, min: 1.0, max: 1.2 },
        { name: "Lamprey's", ilvl: 50, min: 0.6, max: 0.8 },
        { name: "Leech's", ilvl: 20, min: 0.2, max: 0.4 },
      ])
    }
  },
  {
    id: "prefix_physical_attack_damage_leeched_as_mana",
    pattern: "#% of Physical Attack Damage Leeched as Mana",
    name: "#% of Physical Attack Damage Leeched as Mana",
    type: "Prefix",
    group: "PhysicalManaLeech",
    groups: ["amulet", "ring", "gloves", "quiver", "claw", "dagger", "sword", "axe", "mace", "bow", "weapon", "jewellery", "armour"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "Vampire's", ilvl: 70, min: 0.6, max: 0.8 },
        { name: "Bat's", ilvl: 50, min: 0.4, max: 0.5 },
        { name: "Mosquito's", ilvl: 20, min: 0.2, max: 0.3 },
      ])
    }
  },
  {
    id: "suffix_bow_attacks_fire_an_additional_arrow",
    pattern: "Bow Attacks fire an additional Arrow",
    name: "Bow Attacks fire an additional Arrow",
    type: "Suffix",
    group: "AdditionalArrow",
    groups: ["bow", "quiver", "weapon", "jewellery", "offhand"],
    influence: "",
    tiers_by_class: {
      "_default": createTiers([
        { name: "of Splintering", ilvl: 86, min: 1, max: 1 }
      ])
    }
  }
];

// 3. Load existing raw database to keep valid influence mods
let existingInfluencedMods = [];
try {
  const existingRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/poe_mods.json'), 'utf8'));
  existingInfluencedMods = existingRaw.mods.filter(m => m.influence && m.influence.trim() !== '');
} catch (e) {
  console.log('No existing mods read or error:', e);
}

// 4. Merge standard craft mods + influenced mods
const standardIds = new Set(standardMods.map(m => m.id));
const deduplicatedInfluenced = existingInfluencedMods.filter(m => !standardIds.has(m.id));

const allMods = [...standardMods, ...deduplicatedInfluenced];

const outputDb = {
  version: 5,
  note: "Comprehensive Path of Exile standard crafting modifiers database from poedb.tw/us/Modifiers + influence mod tables.",
  item_classes: itemClasses,
  mods: allMods
};

fs.writeFileSync(
  path.join(__dirname, '../src/data/poe_mods.json'),
  JSON.stringify(outputDb, null, 2),
  'utf8'
);

console.log(`Generated poe_mods.json with ${allMods.length} total modifiers (${standardMods.length} standard crafting mods, ${deduplicatedInfluenced.length} influenced mods).`);
