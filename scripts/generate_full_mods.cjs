const fs = require('fs');
const path = require('path');

const targetJsonPath = path.join(__dirname, '../src/data/poe_mods.json');
const existingDb = JSON.parse(fs.readFileSync(targetJsonPath, 'utf8'));

// Comprehensive influence mods from Craft of Exile & Poedb for Hunter, Warlord, Redeemer, Crusader, Shaper, Elder
const influenceModsToAdd = [
  // =========================================================================
  // ============================== HUNTER ===================================
  // =========================================================================
  {
    id: "hunter_percent_life",
    pattern: "#% increased maximum Life",
    name: "#% increased maximum Life (Hunter)",
    type: "Prefix",
    group: "LifePercent",
    groups: ["body", "belt", "amulet"],
    influence: "Hunter",
    tiers_by_class: {
      "Body Armour": [
        { tier: 1, name: "Hunter's", ilvl: 84, min: [9], max: [10] },
        { tier: 2, name: "Hunter's", ilvl: 75, min: [7], max: [8] }
      ],
      "Belt": [
        { tier: 1, name: "Hunter's", ilvl: 84, min: [8], max: [10] },
        { tier: 2, name: "Hunter's", ilvl: 75, min: [6], max: [7] }
      ],
      "_default": [
        { tier: 1, name: "Hunter's", ilvl: 84, min: [8], max: [10] }
      ]
    }
  },
  {
    id: "hunter_percent_es",
    pattern: "#% increased maximum Energy Shield",
    name: "#% increased maximum Energy Shield (Hunter)",
    type: "Prefix",
    group: "ESPercent",
    groups: ["body", "amulet", "belt"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Hunter's", ilvl: 84, min: [10], max: [12] },
        { tier: 2, name: "Hunter's", ilvl: 75, min: [7], max: [9] }
      ]
    }
  },
  {
    id: "hunter_int_stacking_lightning",
    pattern: "Adds # to # Lightning Damage to Attacks with this Weapon per 10 Intelligence",
    name: "Adds Lightning Damage per 10 Intelligence (Hunter)",
    type: "Prefix",
    group: "StatStacking",
    groups: ["weapon", "wand", "claw"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Hunter's", ilvl: 80, min: [1, 10], max: [1, 12] }
      ]
    }
  },
  {
    id: "hunter_dex_stacking_cold",
    pattern: "Adds # to # Cold Damage to Attacks with this Weapon per 10 Dexterity",
    name: "Adds Cold Damage per 10 Dexterity (Hunter)",
    type: "Prefix",
    group: "StatStacking",
    groups: ["bow", "claw", "weapon"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Hunter's", ilvl: 80, min: [2, 4], max: [3, 5] }
      ]
    }
  },
  {
    id: "hunter_str_stacking_chaos",
    pattern: "Adds # to # Chaos Damage to Attacks with this Weapon per 10 Strength",
    name: "Adds Chaos Damage per 10 Strength (Hunter)",
    type: "Prefix",
    group: "StatStacking",
    groups: ["weapon"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Hunter's", ilvl: 80, min: [2, 3], max: [3, 4] }
      ]
    }
  },
  {
    id: "hunter_faster_poison_bleed_boots",
    pattern: "Bleeding you inflict deals Damage #% faster, Poisons you inflict deal Damage #% faster",
    name: "Bleeding and Poisons deal Damage faster (Hunter)",
    type: "Suffix",
    group: "AilmentSpeed",
    groups: ["boots"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Hunt", ilvl: 82, min: [8, 8], max: [10, 10] }
      ]
    }
  },
  {
    id: "hunter_unaffected_by_poison",
    pattern: "Unaffected by Poison",
    name: "Unaffected by Poison (Hunter)",
    type: "Suffix",
    group: "Immunity",
    groups: ["boots", "ring"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Hunt", ilvl: 78, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "hunter_unaffected_by_desecrated_ground",
    pattern: "Unaffected by Desecrated Ground",
    name: "Unaffected by Desecrated Ground (Hunter)",
    type: "Suffix",
    group: "Immunity",
    groups: ["boots"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Hunt", ilvl: 75, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "hunter_chaos_penetration",
    pattern: "Damage Penetrates #% Chaos Resistance",
    name: "Damage Penetrates #% Chaos Resistance (Hunter)",
    type: "Prefix",
    group: "ChaosPen",
    groups: ["weapon", "amulet"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Hunter's", ilvl: 82, min: [9], max: [10] },
        { tier: 2, name: "Hunter's", ilvl: 73, min: [7], max: [8] }
      ]
    }
  },
  {
    id: "hunter_chaos_leech",
    pattern: "#% of Chaos Damage Leeched as Life",
    name: "#% of Chaos Damage Leeched as Life (Hunter)",
    type: "Suffix",
    group: "Leech",
    groups: ["amulet", "gloves", "ring"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Hunt", ilvl: 75, min: [0.4], max: [0.4] }
      ]
    }
  },
  {
    id: "hunter_malevolence_aura_effect",
    pattern: "Malevolence has #% increased Aura Effect",
    name: "Malevolence has #% increased Aura Effect (Hunter)",
    type: "Suffix",
    group: "Aura",
    groups: ["amulet", "helmet"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Hunt", ilvl: 82, min: [36], max: [40] },
        { tier: 2, name: "of the Hunt", ilvl: 73, min: [30], max: [35] }
      ]
    }
  },

  // =========================================================================
  // ============================== WARLORD ==================================
  // =========================================================================
  {
    id: "warlord_phys_as_extra_fire_weap",
    pattern: "Gain #% of Physical Damage as Extra Fire Damage",
    name: "Gain #% of Physical Damage as Extra Fire Damage (Warlord)",
    type: "Prefix",
    group: "ExtraFire",
    groups: ["weapon", "amulet", "shield"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Warlord's", ilvl: 85, min: [36], max: [40] },
        { tier: 2, name: "Warlord's", ilvl: 75, min: [30], max: [35] }
      ]
    }
  },
  {
    id: "warlord_frenzy_on_hit",
    pattern: "#% chance to gain a Frenzy Charge on Hit",
    name: "#% chance to gain a Frenzy Charge on Hit (Warlord)",
    type: "Prefix",
    group: "Charge",
    groups: ["body"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Warlord's", ilvl: 80, min: [10], max: [15] }
      ]
    }
  },
  {
    id: "warlord_power_charge_on_crit",
    pattern: "#% chance to gain a Power Charge on Critical Strike",
    name: "Gain Power Charge on Critical Strike (Warlord)",
    type: "Prefix",
    group: "Charge",
    groups: ["body", "weapon"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Warlord's", ilvl: 80, min: [10], max: [15] }
      ]
    }
  },
  {
    id: "warlord_endurance_charge_on_kill",
    pattern: "#% chance to gain an Endurance Charge on Kill",
    name: "Gain Endurance Charge on Kill (Warlord)",
    type: "Prefix",
    group: "Charge",
    groups: ["body", "ring"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Warlord's", ilvl: 80, min: [15], max: [20] }
      ]
    }
  },
  {
    id: "warlord_culling_strike_gloves",
    pattern: "Attacks have Culling Strike",
    name: "Attacks have Culling Strike (Warlord)",
    type: "Suffix",
    group: "CullingStrike",
    groups: ["gloves", "weapon"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 80, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "warlord_intimidate_on_hit",
    pattern: "Intimidate Enemies for # seconds on Hit",
    name: "Intimidate Enemies on Hit (Warlord)",
    type: "Prefix",
    group: "Intimidate",
    groups: ["gloves", "belt"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Warlord's", ilvl: 80, min: [4], max: [4] }
      ]
    }
  },
  {
    id: "warlord_damage_per_endurance",
    pattern: "#% increased Damage per Endurance Charge",
    name: "#% increased Damage per Endurance Charge (Warlord)",
    type: "Suffix",
    group: "ChargeScale",
    groups: ["ring", "belt", "amulet"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 80, min: [5], max: [6] }
      ]
    }
  },
  {
    id: "warlord_anger_aura_effect",
    pattern: "Anger has #% increased Aura Effect",
    name: "Anger has #% increased Aura Effect (Warlord)",
    type: "Suffix",
    group: "Aura",
    groups: ["helmet", "amulet"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 82, min: [36], max: [40] },
        { tier: 2, name: "of the Conquest", ilvl: 73, min: [30], max: [35] }
      ]
    }
  },
  {
    id: "warlord_pride_aura_effect",
    pattern: "Pride has #% increased Aura Effect",
    name: "Pride has #% increased Aura Effect (Warlord)",
    type: "Suffix",
    group: "Aura",
    groups: ["helmet", "amulet"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 82, min: [36], max: [40] },
        { tier: 2, name: "of the Conquest", ilvl: 73, min: [30], max: [35] }
      ]
    }
  },
  {
    id: "warlord_unaffected_by_ignite",
    pattern: "Unaffected by Ignite",
    name: "Unaffected by Ignite (Warlord)",
    type: "Suffix",
    group: "Immunity",
    groups: ["boots", "ring"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 78, min: [1], max: [1] }
      ]
    }
  },

  // =========================================================================
  // ============================== REDEEMER =================================
  // =========================================================================
  {
    id: "redeemer_phys_as_extra_cold_weap",
    pattern: "Gain #% of Physical Damage as Extra Cold Damage",
    name: "Gain #% of Physical Damage as Extra Cold Damage (Redeemer)",
    type: "Prefix",
    group: "ExtraCold",
    groups: ["weapon", "amulet", "shield"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Redeemer's", ilvl: 85, min: [36], max: [40] },
        { tier: 2, name: "Redeemer's", ilvl: 75, min: [30], max: [35] }
      ]
    }
  },
  {
    id: "redeemer_frenzy_on_hit",
    pattern: "#% chance to gain a Frenzy Charge on Hit",
    name: "#% chance to gain a Frenzy Charge on Hit (Redeemer)",
    type: "Prefix",
    group: "Charge",
    groups: ["body"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Redeemer's", ilvl: 80, min: [10], max: [15] }
      ]
    }
  },
  {
    id: "redeemer_unnerve_on_hit",
    pattern: "Unnerve Enemies for # seconds on Hit",
    name: "Unnerve Enemies on Hit (Redeemer)",
    type: "Prefix",
    group: "Unnerve",
    groups: ["gloves", "amulet"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Redeemer's", ilvl: 80, min: [4], max: [4] }
      ]
    }
  },
  {
    id: "redeemer_blind_nearby_enemies",
    pattern: "Nearby Enemies are Blinded",
    name: "Nearby Enemies are Blinded (Redeemer)",
    type: "Prefix",
    group: "BlindAura",
    groups: ["body", "shield"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Redeemer's", ilvl: 80, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "redeemer_damage_per_frenzy",
    pattern: "#% increased Damage per Frenzy Charge",
    name: "#% increased Damage per Frenzy Charge (Redeemer)",
    type: "Suffix",
    group: "ChargeScale",
    groups: ["ring", "belt", "amulet"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Redemption", ilvl: 80, min: [5], max: [6] }
      ]
    }
  },
  {
    id: "redeemer_hatred_aura_effect",
    pattern: "Hatred has #% increased Aura Effect",
    name: "Hatred has #% increased Aura Effect (Redeemer)",
    type: "Suffix",
    group: "Aura",
    groups: ["helmet", "amulet"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Redemption", ilvl: 82, min: [36], max: [40] },
        { tier: 2, name: "of Redemption", ilvl: 73, min: [30], max: [35] }
      ]
    }
  },
  {
    id: "redeemer_grace_aura_effect",
    pattern: "Grace has #% increased Aura Effect",
    name: "Grace has #% increased Aura Effect (Redeemer)",
    type: "Suffix",
    group: "Aura",
    groups: ["helmet", "amulet"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Redemption", ilvl: 82, min: [36], max: [40] },
        { tier: 2, name: "of Redemption", ilvl: 73, min: [30], max: [35] }
      ]
    }
  },
  {
    id: "redeemer_cold_taken_as_fire",
    pattern: "#% of Cold Damage taken as Fire Damage",
    name: "% of Cold Damage taken as Fire Damage (Redeemer)",
    type: "Prefix",
    group: "DamageTakenAs",
    groups: ["shield", "helmet", "body"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Redeemer's", ilvl: 80, min: [8], max: [10] }
      ]
    }
  },

  // =========================================================================
  // ============================== CRUSADER =================================
  // =========================================================================
  {
    id: "crusader_phys_as_extra_lightning_weap",
    pattern: "Gain #% of Physical Damage as Extra Lightning Damage",
    name: "Gain #% of Physical Damage as Extra Lightning Damage (Crusader)",
    type: "Prefix",
    group: "ExtraLightning",
    groups: ["weapon", "amulet", "shield"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Crusader's", ilvl: 85, min: [36], max: [40] },
        { tier: 2, name: "Crusader's", ilvl: 75, min: [30], max: [35] }
      ]
    }
  },
  {
    id: "crusader_power_charge_on_crit_body",
    pattern: "#% chance to gain a Power Charge on Critical Strike",
    name: "Gain Power Charge on Critical Strike (Crusader)",
    type: "Prefix",
    group: "Charge",
    groups: ["body"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Crusader's", ilvl: 80, min: [10], max: [15] }
      ]
    }
  },
  {
    id: "crusader_damage_per_power",
    pattern: "#% increased Damage per Power Charge",
    name: "#% increased Damage per Power Charge (Crusader)",
    type: "Suffix",
    group: "ChargeScale",
    groups: ["ring", "belt", "amulet"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Crusade", ilvl: 80, min: [5], max: [6] }
      ]
    }
  },
  {
    id: "crusader_wrath_aura_effect",
    pattern: "Wrath has #% increased Aura Effect",
    name: "Wrath has #% increased Aura Effect (Crusader)",
    type: "Suffix",
    group: "Aura",
    groups: ["helmet", "amulet"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Crusade", ilvl: 82, min: [36], max: [40] },
        { tier: 2, name: "of the Crusade", ilvl: 73, min: [30], max: [35] }
      ]
    }
  },
  {
    id: "crusader_zealotry_aura_effect",
    pattern: "Zealotry has #% increased Aura Effect",
    name: "Zealotry has #% increased Aura Effect (Crusader)",
    type: "Suffix",
    group: "Aura",
    groups: ["helmet", "amulet"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Crusade", ilvl: 82, min: [36], max: [40] },
        { tier: 2, name: "of the Crusade", ilvl: 73, min: [30], max: [35] }
      ]
    }
  },
  {
    id: "crusader_unaffected_by_shock",
    pattern: "Unaffected by Shock",
    name: "Unaffected by Shock (Crusader)",
    type: "Suffix",
    group: "Immunity",
    groups: ["boots", "ring"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Crusade", ilvl: 78, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "crusader_unaffected_by_shocked_ground",
    pattern: "Unaffected by Shocked Ground",
    name: "Unaffected by Shocked Ground (Crusader)",
    type: "Suffix",
    group: "Immunity",
    groups: ["boots"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Crusade", ilvl: 75, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "crusader_lightning_taken_as_cold",
    pattern: "#% of Lightning Damage taken as Cold Damage",
    name: "% of Lightning Damage taken as Cold Damage (Crusader)",
    type: "Prefix",
    group: "DamageTakenAs",
    groups: ["shield", "helmet", "body"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Crusader's", ilvl: 80, min: [8], max: [10] }
      ]
    }
  },

  // =========================================================================
  // ============================== SHAPER ===================================
  // =========================================================================
  {
    id: "shaper_cast_when_damage_taken",
    pattern: "Socketed Gems are Supported by Level # Cast When Damage Taken",
    name: "Supported by Level 20 Cast When Damage Taken (Shaper)",
    type: "Prefix",
    group: "SupportGem",
    groups: ["weapon", "shield", "helmet", "boots", "gloves"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Shaper's", ilvl: 80, min: [20], max: [20] }
      ]
    }
  },
  {
    id: "shaper_spell_echo_support",
    pattern: "Socketed Gems are Supported by Level # Spell Echo",
    name: "Supported by Level 20 Spell Echo (Shaper)",
    type: "Prefix",
    group: "SupportGem",
    groups: ["weapon", "staff"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Shaper's", ilvl: 80, min: [20], max: [20] }
      ]
    }
  },
  {
    id: "shaper_faster_casting_support",
    pattern: "Socketed Gems are Supported by Level # Faster Casting",
    name: "Supported by Level 20 Faster Casting (Shaper)",
    type: "Suffix",
    group: "SupportGem",
    groups: ["gloves", "weapon"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Shaping", ilvl: 80, min: [20], max: [20] },
        { tier: 2, name: "of Shaping", ilvl: 68, min: [18], max: [18] }
      ]
    }
  },
  {
    id: "shaper_hypothermia_support",
    pattern: "Socketed Gems are Supported by Level # Hypothermia",
    name: "Supported by Level 20 Hypothermia (Shaper)",
    type: "Suffix",
    group: "SupportGem",
    groups: ["helmet", "weapon"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Shaping", ilvl: 80, min: [20], max: [20] },
        { tier: 2, name: "of Shaping", ilvl: 68, min: [18], max: [18] }
      ]
    }
  },
  {
    id: "shaper_trap_mine_damage_support",
    pattern: "Socketed Gems are Supported by Level # Trap and Mine Damage",
    name: "Supported by Level 20 Trap and Mine Damage (Shaper)",
    type: "Prefix",
    group: "SupportGem",
    groups: ["gloves", "helmet", "weapon"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Shaper's", ilvl: 80, min: [20], max: [20] }
      ]
    }
  },
  {
    id: "shaper_gain_phys_as_extra_random_ele",
    pattern: "Gain #% of Physical Damage as Extra Damage of a Random Element",
    name: "Gain Physical Damage as Extra Random Element (Shaper)",
    type: "Prefix",
    group: "ExtraRandom",
    groups: ["amulet", "weapon"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Shaper's", ilvl: 85, min: [16], max: [20] },
        { tier: 2, name: "The Shaper's", ilvl: 75, min: [11], max: [15] }
      ]
    }
  },
  {
    id: "shaper_penetrate_all_ele_resistances",
    pattern: "Damage Penetrates #% Elemental Resistances",
    name: "Damage Penetrates #% Elemental Resistances (Shaper)",
    type: "Prefix",
    group: "ElePen",
    groups: ["amulet", "weapon"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Shaper's", ilvl: 85, min: [9], max: [10] },
        { tier: 2, name: "The Shaper's", ilvl: 75, min: [7], max: [8] }
      ]
    }
  },
  {
    id: "shaper_additional_totem_shield",
    pattern: "+# to Maximum number of Summoned Totems",
    name: "+1 to Maximum number of Summoned Totems (Shaper)",
    type: "Prefix",
    group: "Totem",
    groups: ["shield"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Shaper's", ilvl: 80, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "shaper_block_spells_shield",
    pattern: "+#% Chance to Block Spell Damage",
    name: "+% Chance to Block Spell Damage (Shaper)",
    type: "Suffix",
    group: "SpellBlock",
    groups: ["shield", "body"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Shaping", ilvl: 80, min: [8], max: [12] },
        { tier: 2, name: "of Shaping", ilvl: 68, min: [5], max: [7] }
      ]
    }
  },
  {
    id: "shaper_assassins_mark_on_hit",
    pattern: "Curse Enemies with Assassin's Mark on Hit, with #% increased Effect",
    name: "Curse Enemies with Assassin's Mark on Hit (Shaper)",
    type: "Suffix",
    group: "Curse",
    groups: ["ring"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Shaping", ilvl: 80, min: [32], max: [32] }
      ]
    }
  },

  // =========================================================================
  // ============================== ELDER ====================================
  // =========================================================================
  {
    id: "elder_supported_by_multistrike",
    pattern: "Socketed Gems are Supported by Level # Multistrike",
    name: "Supported by Level 20 Multistrike (Elder)",
    type: "Prefix",
    group: "SupportGem",
    groups: ["weapon", "two-handed"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Elder's", ilvl: 80, min: [20], max: [20] }
      ]
    }
  },
  {
    id: "elder_supported_by_fortify",
    pattern: "Socketed Gems are Supported by Level # Fortify",
    name: "Supported by Level 20 Fortify (Elder)",
    type: "Prefix",
    group: "SupportGem",
    groups: ["weapon", "two-handed"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Elder's", ilvl: 80, min: [20], max: [20] }
      ]
    }
  },
  {
    id: "elder_supported_by_faster_attacks",
    pattern: "Socketed Gems are Supported by Level # Faster Attacks",
    name: "Supported by Level 20 Faster Attacks (Elder)",
    type: "Suffix",
    group: "SupportGem",
    groups: ["gloves", "weapon"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Elder", ilvl: 80, min: [20], max: [20] },
        { tier: 2, name: "of the Elder", ilvl: 68, min: [18], max: [18] }
      ]
    }
  },
  {
    id: "elder_supported_by_concentrated_effect",
    pattern: "Socketed Gems are Supported by Level # Concentrated Effect",
    name: "Supported by Level 20 Concentrated Effect (Elder)",
    type: "Prefix",
    group: "SupportGem",
    groups: ["helmet", "weapon"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Elder's", ilvl: 80, min: [20], max: [20] },
        { tier: 2, name: "The Elder's", ilvl: 68, min: [18], max: [18] }
      ]
    }
  },
  {
    id: "elder_supported_by_burning_damage",
    pattern: "Socketed Gems are Supported by Level # Burning Damage",
    name: "Supported by Level 20 Burning Damage (Elder)",
    type: "Suffix",
    group: "SupportGem",
    groups: ["helmet", "weapon"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Elder", ilvl: 80, min: [20], max: [20] },
        { tier: 2, name: "of the Elder", ilvl: 68, min: [18], max: [18] }
      ]
    }
  },
  {
    id: "elder_percent_life_body",
    pattern: "#% increased maximum Life, #% increased maximum Mana",
    name: "#% increased maximum Life and Mana (Elder)",
    type: "Prefix",
    group: "LifePercent",
    groups: ["body"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Elder's", ilvl: 84, min: [9, 9], max: [12, 12] },
        { tier: 2, name: "The Elder's", ilvl: 75, min: [6, 6], max: [8, 8] }
      ]
    }
  },
  {
    id: "elder_life_gain_on_hit_ring",
    pattern: "+# Life gained for each Enemy hit by your Attacks",
    name: "+# Life gained for each Enemy hit (Elder)",
    type: "Prefix",
    group: "LifeOnHit",
    groups: ["ring"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Elder's", ilvl: 75, min: [15], max: [20] }
      ]
    }
  },
  {
    id: "elder_poachers_mark_on_hit",
    pattern: "Curse Enemies with Poacher's Mark on Hit, with #% increased Effect",
    name: "Curse Enemies with Poacher's Mark on Hit (Elder)",
    type: "Suffix",
    group: "Curse",
    groups: ["ring"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Elder", ilvl: 80, min: [32], max: [32] }
      ]
    }
  },
  {
    id: "elder_warlords_mark_on_hit",
    pattern: "Curse Enemies with Warlord's Mark on Hit, with #% increased Effect",
    name: "Curse Enemies with Warlord's Mark on Hit (Elder)",
    type: "Suffix",
    group: "Curse",
    groups: ["ring"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Elder", ilvl: 80, min: [32], max: [32] }
      ]
    }
  },
  {
    id: "elder_global_physical_damage_percent",
    pattern: "#% increased Global Physical Damage",
    name: "#% increased Global Physical Damage (Elder)",
    type: "Prefix",
    group: "PhysicalDamage",
    groups: ["amulet", "belt", "ring"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Elder's", ilvl: 82, min: [25], max: [30] },
        { tier: 2, name: "The Elder's", ilvl: 70, min: [18], max: [24] }
      ]
    }
  }
];

const map = new Map();
existingDb.mods.forEach(m => map.set(m.id, m));

let added = 0;
let updated = 0;

influenceModsToAdd.forEach(m => {
  if (!map.has(m.id)) {
    map.set(m.id, m);
    added++;
  } else {
    map.set(m.id, { ...map.get(m.id), ...m });
    updated++;
  }
});

existingDb.mods = Array.from(map.values());
fs.writeFileSync(targetJsonPath, JSON.stringify(existingDb, null, 2), 'utf8');

console.log(`Database updated! Total mods: ${existingDb.mods.length} (Added ${added}, Updated ${updated}).`);
