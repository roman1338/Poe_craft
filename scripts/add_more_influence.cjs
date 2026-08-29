const fs = require('fs');
const path = require('path');

const targetJsonPath = path.join(__dirname, '../src/data/poe_mods.json');
const existingDb = JSON.parse(fs.readFileSync(targetJsonPath, 'utf8'));

// Massive comprehensive list of influence modifiers from Craft of Exile and Poedb
const moreInfluenceMods = [
  // -------------------------------------------------------------
  // ELDRITCH MODS (Eater of Worlds & Searing Exarch)
  // -------------------------------------------------------------
  {
    id: "exarch_fire_exposure_gloves",
    pattern: "Inflict Fire Exposure on Hit, applying -#% to Fire Resistance",
    name: "Inflict Fire Exposure on Hit (Searing Exarch)",
    type: "Prefix",
    group: "Exposure",
    groups: ["armour", "gloves"],
    influence: "Exarch",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Exalted", ilvl: 85, min: [15], max: [15] },
        { tier: 2, name: "Grand", ilvl: 80, min: [13], max: [13] },
        { tier: 3, name: "Greater", ilvl: 75, min: [11], max: [11] }
      ]
    }
  },
  {
    id: "exarch_action_speed_boots",
    pattern: "#% increased Action Speed",
    name: "#% increased Action Speed (Searing Exarch)",
    type: "Prefix",
    group: "ActionSpeed",
    groups: ["armour", "boots"],
    influence: "Exarch",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Exalted", ilvl: 85, min: [6], max: [6] },
        { tier: 2, name: "Grand", ilvl: 80, min: [5], max: [5] },
        { tier: 3, name: "Greater", ilvl: 75, min: [4], max: [4] }
      ]
    }
  },
  {
    id: "exarch_max_fire_res_body",
    pattern: "+#% to maximum Fire Resistance",
    name: "+#% to maximum Fire Resistance (Searing Exarch)",
    type: "Prefix",
    group: "MaxRes",
    groups: ["armour", "body"],
    influence: "Exarch",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Exalted", ilvl: 85, min: [2], max: [2] },
        { tier: 2, name: "Grand", ilvl: 80, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "eater_cold_exposure_gloves",
    pattern: "Inflict Cold Exposure on Hit, applying -#% to Cold Resistance",
    name: "Inflict Cold Exposure on Hit (Eater of Worlds)",
    type: "Prefix",
    group: "Exposure",
    groups: ["armour", "gloves"],
    influence: "Eater",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Exalted", ilvl: 85, min: [15], max: [15] },
        { tier: 2, name: "Grand", ilvl: 80, min: [13], max: [13] },
        { tier: 3, name: "Greater", ilvl: 75, min: [11], max: [11] }
      ]
    }
  },
  {
    id: "eater_lightning_exposure_gloves",
    pattern: "Inflict Lightning Exposure on Hit, applying -#% to Lightning Resistance",
    name: "Inflict Lightning Exposure on Hit (Eater of Worlds)",
    type: "Prefix",
    group: "Exposure",
    groups: ["armour", "gloves"],
    influence: "Eater",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Exalted", ilvl: 85, min: [15], max: [15] },
        { tier: 2, name: "Grand", ilvl: 80, min: [13], max: [13] },
        { tier: 3, name: "Greater", ilvl: 75, min: [11], max: [11] }
      ]
    }
  },
  {
    id: "eater_max_cold_res_body",
    pattern: "+#% to maximum Cold Resistance",
    name: "+#% to maximum Cold Resistance (Eater of Worlds)",
    type: "Prefix",
    group: "MaxRes",
    groups: ["armour", "body"],
    influence: "Eater",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Exalted", ilvl: 85, min: [2], max: [2] },
        { tier: 2, name: "Grand", ilvl: 80, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "eater_max_lightning_res_body",
    pattern: "+#% to maximum Lightning Resistance",
    name: "+#% to maximum Lightning Resistance (Eater of Worlds)",
    type: "Prefix",
    group: "MaxRes",
    groups: ["armour", "body"],
    influence: "Eater",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Exalted", ilvl: 85, min: [2], max: [2] },
        { tier: 2, name: "Grand", ilvl: 80, min: [1], max: [1] }
      ]
    }
  },

  // -------------------------------------------------------------
  // HUNTER INFLUENCE (Advanced)
  // -------------------------------------------------------------
  {
    id: "hunter_tailwind_boots",
    pattern: "You have Tailwind if you've dealt a Critical Strike Recently",
    name: "Tailwind on Critical Strike Recently (Hunter)",
    type: "Suffix",
    group: "Tailwind",
    groups: ["armour", "boots"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Hunt", ilvl: 75, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "hunter_chaos_dot_multi_quiver",
    pattern: "+#% to Chaos Damage over Time Multiplier with Bow Attacks",
    name: "+#% to Chaos DoT Multiplier with Bows (Hunter)",
    type: "Suffix",
    group: "DoTMulti",
    groups: ["jewellery", "quiver", "weapon", "bow"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Hunt", ilvl: 82, min: [23], max: [26] },
        { tier: 2, name: "of the Hunt", ilvl: 75, min: [19], max: [22] }
      ]
    }
  },
  {
    id: "hunter_poison_faster_quiver",
    pattern: "Poisons you inflict deal Damage #% faster",
    name: "Poisons deal Damage faster (Hunter)",
    type: "Suffix",
    group: "AilmentSpeed",
    groups: ["jewellery", "quiver", "weapon", "bow", "armour", "boots"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Hunt", ilvl: 80, min: [8], max: [10] }
      ]
    }
  },
  {
    id: "hunter_spell_crit_body",
    pattern: "Attacks have +#% to Critical Strike Chance, Spells have +#% to Critical Strike Chance",
    name: "Attacks and Spells have +#% to Critical Strike Chance (Hunter)",
    type: "Suffix",
    group: "Crit",
    groups: ["armour", "body"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Hunt", ilvl: 84, min: [1.1, 1.1], max: [1.5, 1.5] },
        { tier: 2, name: "of the Hunt", ilvl: 75, min: [0.7, 0.7], max: [1.0, 1.0] }
      ]
    }
  },
  {
    id: "hunter_intimidate_unnerve_gloves",
    pattern: "Intimidate Enemies on Hit, Unnerve Enemies on Hit",
    name: "Intimidate and Unnerve Enemies on Hit (Hunter)",
    type: "Prefix",
    group: "DebuffOnHit",
    groups: ["armour", "gloves"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Hunter's", ilvl: 85, min: [1, 1], max: [1, 1] }
      ]
    }
  },
  {
    id: "hunter_level_all_chaos_gems_amulet",
    pattern: "+# to Level of all Chaos Skill Gems",
    name: "+1 to Level of all Chaos Skill Gems (Hunter)",
    type: "Prefix",
    group: "GemLevel",
    groups: ["jewellery", "amulet", "weapon", "caster"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Hunter's", ilvl: 82, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "hunter_level_all_dexterity_gems_amulet",
    pattern: "+# to Level of all Dexterity Skill Gems",
    name: "+1 to Level of all Dexterity Skill Gems (Hunter)",
    type: "Prefix",
    group: "GemLevel",
    groups: ["jewellery", "amulet"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Hunter's", ilvl: 82, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "hunter_level_all_strength_gems_amulet",
    pattern: "+# to Level of all Strength Skill Gems",
    name: "+1 to Level of all Strength Skill Gems (Hunter)",
    type: "Prefix",
    group: "GemLevel",
    groups: ["jewellery", "amulet"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Hunter's", ilvl: 82, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "hunter_level_all_intelligence_gems_amulet",
    pattern: "+# to Level of all Intelligence Skill Gems",
    name: "+1 to Level of all Intelligence Skill Gems (Hunter)",
    type: "Prefix",
    group: "GemLevel",
    groups: ["jewellery", "amulet"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Hunter's", ilvl: 82, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "hunter_curse_despair_ring",
    pattern: "Curse Enemies with Despair on Hit, with #% increased Effect",
    name: "Curse Enemies with Despair on Hit (Hunter)",
    type: "Suffix",
    group: "Curse",
    groups: ["jewellery", "ring"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Hunt", ilvl: 80, min: [32], max: [32] }
      ]
    }
  },
  {
    id: "hunter_max_chaos_resistance_shield",
    pattern: "+#% to maximum Chaos Resistance",
    name: "+#% to maximum Chaos Resistance (Hunter)",
    type: "Suffix",
    group: "MaxRes",
    groups: ["armour", "shield", "body"],
    influence: "Hunter",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Hunt", ilvl: 84, min: [2], max: [3] },
        { tier: 2, name: "of the Hunt", ilvl: 75, min: [1], max: [1] }
      ]
    }
  },

  // -------------------------------------------------------------
  // WARLORD INFLUENCE (Advanced)
  // -------------------------------------------------------------
  {
    id: "warlord_additional_max_endurance_charge",
    pattern: "+# to Maximum Endurance Charges",
    name: "+1 to Maximum Endurance Charges (Warlord)",
    type: "Suffix",
    group: "ChargeMax",
    groups: ["armour", "shield", "boots"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 80, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "warlord_additional_max_frenzy_charge_gloves",
    pattern: "+# to Maximum Frenzy Charges",
    name: "+1 to Maximum Frenzy Charges (Warlord)",
    type: "Suffix",
    group: "ChargeMax",
    groups: ["armour", "gloves", "shield"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 80, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "warlord_curse_flammability_ring",
    pattern: "Curse Enemies with Flammability on Hit, with #% increased Effect",
    name: "Curse Enemies with Flammability on Hit (Warlord)",
    type: "Suffix",
    group: "Curse",
    groups: ["jewellery", "ring"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 80, min: [32], max: [32] }
      ]
    }
  },
  {
    id: "warlord_curse_vulnerability_ring",
    pattern: "Curse Enemies with Vulnerability on Hit, with #% increased Effect",
    name: "Curse Enemies with Vulnerability on Hit (Warlord)",
    type: "Suffix",
    group: "Curse",
    groups: ["jewellery", "ring"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 80, min: [32], max: [32] }
      ]
    }
  },
  {
    id: "warlord_fire_dot_multi_amulet",
    pattern: "+#% to Fire Damage over Time Multiplier",
    name: "+#% to Fire Damage over Time Multiplier (Warlord)",
    type: "Suffix",
    group: "DoTMulti",
    groups: ["jewellery", "amulet", "weapon", "caster"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 82, min: [23], max: [26] },
        { tier: 2, name: "of the Conquest", ilvl: 75, min: [19], max: [22] }
      ]
    }
  },
  {
    id: "warlord_physical_dot_multi_amulet",
    pattern: "+#% to Physical Damage over Time Multiplier",
    name: "+#% to Physical Damage over Time Multiplier (Warlord)",
    type: "Suffix",
    group: "DoTMulti",
    groups: ["jewellery", "amulet", "weapon"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 82, min: [23], max: [26] },
        { tier: 2, name: "of the Conquest", ilvl: 75, min: [19], max: [22] }
      ]
    }
  },
  {
    id: "warlord_phys_reduction_body",
    pattern: "#% additional Physical Damage Reduction",
    name: "additional Physical Damage Reduction (Warlord)",
    type: "Prefix",
    group: "PDR",
    groups: ["armour", "body", "shield"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Warlord's", ilvl: 84, min: [7], max: [8] },
        { tier: 2, name: "Warlord's", ilvl: 75, min: [5], max: [6] }
      ]
    }
  },
  {
    id: "warlord_ignite_faster_boots",
    pattern: "Ignites you inflict deal Damage #% faster",
    name: "Ignites you inflict deal Damage faster (Warlord)",
    type: "Suffix",
    group: "AilmentSpeed",
    groups: ["armour", "boots", "weapon"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Conquest", ilvl: 80, min: [8], max: [10] }
      ]
    }
  },
  {
    id: "warlord_level_all_fire_gems_amulet",
    pattern: "+# to Level of all Fire Skill Gems",
    name: "+1 to Level of all Fire Skill Gems (Warlord)",
    type: "Prefix",
    group: "GemLevel",
    groups: ["jewellery", "amulet", "weapon", "caster"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Warlord's", ilvl: 82, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "warlord_level_all_physical_gems_amulet",
    pattern: "+# to Level of all Physical Skill Gems",
    name: "+1 to Level of all Physical Skill Gems (Warlord)",
    type: "Prefix",
    group: "GemLevel",
    groups: ["jewellery", "amulet", "weapon"],
    influence: "Warlord",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Warlord's", ilvl: 82, min: [1], max: [1] }
      ]
    }
  },

  // -------------------------------------------------------------
  // REDEEMER INFLUENCE (Advanced)
  // -------------------------------------------------------------
  {
    id: "redeemer_curse_frostbite_ring",
    pattern: "Curse Enemies with Frostbite on Hit, with #% increased Effect",
    name: "Curse Enemies with Frostbite on Hit (Redeemer)",
    type: "Suffix",
    group: "Curse",
    groups: ["jewellery", "ring"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Redemption", ilvl: 80, min: [32], max: [32] }
      ]
    }
  },
  {
    id: "redeemer_curse_ele_weakness_ring",
    pattern: "Curse Enemies with Elemental Weakness on Hit, with #% increased Effect",
    name: "Curse Enemies with Elemental Weakness on Hit (Redeemer)",
    type: "Suffix",
    group: "Curse",
    groups: ["jewellery", "ring"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Redemption", ilvl: 80, min: [32], max: [32] }
      ]
    }
  },
  {
    id: "redeemer_elusive_boots",
    pattern: "Gain Elusive on Critical Strike",
    name: "Gain Elusive on Critical Strike (Redeemer)",
    type: "Prefix",
    group: "Elusive",
    groups: ["armour", "boots"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Redeemer's", ilvl: 75, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "redeemer_onslaught_on_kill_boots",
    pattern: "Gain Onslaught for # seconds on Kill",
    name: "Gain Onslaught on Kill (Redeemer)",
    type: "Prefix",
    group: "Onslaught",
    groups: ["armour", "boots"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Redeemer's", ilvl: 75, min: [4], max: [4] }
      ]
    }
  },
  {
    id: "redeemer_cold_dot_multi_amulet",
    pattern: "+#% to Cold Damage over Time Multiplier",
    name: "+#% to Cold Damage over Time Multiplier (Redeemer)",
    type: "Suffix",
    group: "DoTMulti",
    groups: ["jewellery", "amulet", "weapon", "caster"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Redemption", ilvl: 82, min: [23], max: [26] },
        { tier: 2, name: "of Redemption", ilvl: 75, min: [19], max: [22] }
      ]
    }
  },
  {
    id: "redeemer_level_all_cold_gems_amulet",
    pattern: "+# to Level of all Cold Skill Gems",
    name: "+1 to Level of all Cold Skill Gems (Redeemer)",
    type: "Prefix",
    group: "GemLevel",
    groups: ["jewellery", "amulet", "weapon", "caster"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Redeemer's", ilvl: 82, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "redeemer_chill_effect_helmet",
    pattern: "#% increased Effect of Chill",
    name: "#% increased Effect of Chill (Redeemer)",
    type: "Prefix",
    group: "Chill",
    groups: ["armour", "helmet", "amulet", "weapon"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Redeemer's", ilvl: 80, min: [25], max: [30] },
        { tier: 2, name: "Redeemer's", ilvl: 68, min: [20], max: [24] }
      ]
    }
  },
  {
    id: "redeemer_avoid_elemental_ailments_body",
    pattern: "+#% chance to Avoid Elemental Ailments",
    name: "+#% chance to Avoid Elemental Ailments (Redeemer)",
    type: "Prefix",
    group: "AvoidAilments",
    groups: ["armour", "body", "boots", "shield"],
    influence: "Redeemer",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Redeemer's", ilvl: 85, min: [31], max: [35] },
        { tier: 2, name: "Redeemer's", ilvl: 75, min: [25], max: [30] }
      ]
    }
  },

  // -------------------------------------------------------------
  // CRUSADER INFLUENCE (Advanced)
  // -------------------------------------------------------------
  {
    id: "crusader_explode_chest",
    pattern: "Enemies you Kill Explode, dealing #% of their Life as Physical Damage",
    name: "Enemies you Kill Explode dealing Physical Damage (Crusader)",
    type: "Prefix",
    group: "Explode",
    groups: ["armour", "body"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Crusader's", ilvl: 85, min: [3], max: [3] }
      ]
    }
  },
  {
    id: "crusader_curse_conductivity_ring",
    pattern: "Curse Enemies with Conductivity on Hit, with #% increased Effect",
    name: "Curse Enemies with Conductivity on Hit (Crusader)",
    type: "Suffix",
    group: "Curse",
    groups: ["jewellery", "ring"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Crusade", ilvl: 80, min: [32], max: [32] }
      ]
    }
  },
  {
    id: "crusader_level_all_lightning_gems_amulet",
    pattern: "+# to Level of all Lightning Skill Gems",
    name: "+1 to Level of all Lightning Skill Gems (Crusader)",
    type: "Prefix",
    group: "GemLevel",
    groups: ["jewellery", "amulet", "weapon", "caster"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Crusader's", ilvl: 82, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "crusader_additional_max_power_charge_helmet",
    pattern: "+# to Maximum Power Charges",
    name: "+1 to Maximum Power Charges (Crusader)",
    type: "Suffix",
    group: "ChargeMax",
    groups: ["armour", "helmet", "shield"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Crusade", ilvl: 80, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "crusader_concentrated_effect_helmet",
    pattern: "Socketed Gems are Supported by Level # Concentrated Effect",
    name: "Supported by Level 20 Concentrated Effect (Crusader)",
    type: "Prefix",
    group: "SupportGem",
    groups: ["armour", "helmet", "weapon"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Crusader's", ilvl: 80, min: [20], max: [20] }
      ]
    }
  },
  {
    id: "crusader_mana_recovery_rate_belt",
    pattern: "#% increased Mana Recovery Rate",
    name: "#% increased Mana Recovery Rate (Crusader)",
    type: "Suffix",
    group: "ManaRecovery",
    groups: ["jewellery", "belt"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Crusade", ilvl: 80, min: [15], max: [20] },
        { tier: 2, name: "of the Crusade", ilvl: 70, min: [10], max: [14] }
      ]
    }
  },
  {
    id: "crusader_es_on_hit_ring",
    pattern: "+# Energy Shield gained for each Enemy hit by your Attacks",
    name: "+# Energy Shield gained for each Enemy hit (Crusader)",
    type: "Prefix",
    group: "ESOnHit",
    groups: ["jewellery", "ring"],
    influence: "Crusader",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "Crusader's", ilvl: 75, min: [12], max: [15] }
      ]
    }
  },

  // -------------------------------------------------------------
  // SHAPER INFLUENCE (Advanced)
  // -------------------------------------------------------------
  {
    id: "shaper_reduced_mana_reserved_helmet",
    pattern: "#% increased Mana Reservation Efficiency of Skills",
    name: "increased Mana Reservation Efficiency (Shaper)",
    type: "Suffix",
    group: "ManaReservation",
    groups: ["armour", "helmet", "shield"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Shaping", ilvl: 84, min: [9], max: [10] },
        { tier: 2, name: "of Shaping", ilvl: 75, min: [7], max: [8] }
      ]
    }
  },
  {
    id: "shaper_mana_recovery_rate_belt",
    pattern: "#% increased Mana Recovery Rate",
    name: "#% increased Mana Recovery Rate (Shaper)",
    type: "Suffix",
    group: "ManaRecovery",
    groups: ["jewellery", "belt"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Shaping", ilvl: 80, min: [15], max: [20] },
        { tier: 2, name: "of Shaping", ilvl: 70, min: [10], max: [14] }
      ]
    }
  },
  {
    id: "shaper_gain_fire_as_extra_chaos",
    pattern: "Gain #% of Fire Damage as Extra Chaos Damage",
    name: "Gain #% of Fire Damage as Extra Chaos Damage (Shaper)",
    type: "Prefix",
    group: "ExtraChaos",
    groups: ["weapon", "caster", "shield", "jewellery", "amulet"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Shaper's", ilvl: 85, min: [13], max: [15] },
        { tier: 2, name: "The Shaper's", ilvl: 75, min: [9], max: [12] }
      ]
    }
  },
  {
    id: "shaper_gain_cold_as_extra_chaos",
    pattern: "Gain #% of Cold Damage as Extra Chaos Damage",
    name: "Gain #% of Cold Damage as Extra Chaos Damage (Shaper)",
    type: "Prefix",
    group: "ExtraChaos",
    groups: ["weapon", "caster", "shield", "jewellery", "amulet"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Shaper's", ilvl: 85, min: [13], max: [15] },
        { tier: 2, name: "The Shaper's", ilvl: 75, min: [9], max: [12] }
      ]
    }
  },
  {
    id: "shaper_gain_lightning_as_extra_chaos",
    pattern: "Gain #% of Lightning Damage as Extra Chaos Damage",
    name: "Gain #% of Lightning Damage as Extra Chaos Damage (Shaper)",
    type: "Prefix",
    group: "ExtraChaos",
    groups: ["weapon", "caster", "shield", "jewellery", "amulet"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Shaper's", ilvl: 85, min: [13], max: [15] },
        { tier: 2, name: "The Shaper's", ilvl: 75, min: [9], max: [12] }
      ]
    }
  },
  {
    id: "shaper_additional_arrow_quiver",
    pattern: "Bow Attacks fire # additional Arrow",
    name: "Bow Attacks fire +1 additional Arrow (Shaper)",
    type: "Prefix",
    group: "Bow",
    groups: ["jewellery", "quiver", "weapon", "bow"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Shaper's", ilvl: 80, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "shaper_cooldown_recovery_rate_boots",
    pattern: "#% increased Cooldown Recovery Rate",
    name: "#% increased Cooldown Recovery Rate (Shaper)",
    type: "Suffix",
    group: "Cooldown",
    groups: ["armour", "boots", "jewellery", "belt"],
    influence: "Shaper",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of Shaping", ilvl: 80, min: [13], max: [15] },
        { tier: 2, name: "of Shaping", ilvl: 70, min: [9], max: [12] }
      ]
    }
  },

  // -------------------------------------------------------------
  // ELDER INFLUENCE (Advanced)
  // -------------------------------------------------------------
  {
    id: "elder_supported_by_increased_critical_strikes",
    pattern: "Socketed Gems are Supported by Level # Increased Critical Strikes",
    name: "Supported by Level 20 Increased Critical Strikes (Elder)",
    type: "Suffix",
    group: "SupportGem",
    groups: ["armour", "helmet", "gloves", "weapon"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Elder", ilvl: 80, min: [20], max: [20] },
        { tier: 2, name: "of the Elder", ilvl: 68, min: [18], max: [18] }
      ]
    }
  },
  {
    id: "elder_supported_by_brutality",
    pattern: "Socketed Gems are Supported by Level # Brutality",
    name: "Supported by Level 20 Brutality (Elder)",
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
    id: "elder_supported_by_maim",
    pattern: "Socketed Gems are Supported by Level # Maim",
    name: "Supported by Level 20 Maim (Elder)",
    type: "Prefix",
    group: "SupportGem",
    groups: ["armour", "body", "weapon"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Elder's", ilvl: 80, min: [20], max: [20] }
      ]
    }
  },
  {
    id: "elder_additional_totem_shield",
    pattern: "+# to Maximum number of Summoned Totems",
    name: "+1 to Maximum number of Summoned Totems (Elder)",
    type: "Prefix",
    group: "Totem",
    groups: ["armour", "shield"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Elder's", ilvl: 80, min: [1], max: [1] }
      ]
    }
  },
  {
    id: "elder_physical_taken_as_fire",
    pattern: "#% of Physical Damage taken as Fire Damage",
    name: "% of Physical Damage taken as Fire Damage (Elder)",
    type: "Prefix",
    group: "DamageTakenAs",
    groups: ["armour", "body", "helmet", "shield"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Elder's", ilvl: 80, min: [8], max: [10] }
      ]
    }
  },
  {
    id: "elder_physical_taken_as_cold",
    pattern: "#% of Physical Damage taken as Cold Damage",
    name: "% of Physical Damage taken as Cold Damage (Elder)",
    type: "Prefix",
    group: "DamageTakenAs",
    groups: ["armour", "body", "helmet", "shield"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Elder's", ilvl: 80, min: [8], max: [10] }
      ]
    }
  },
  {
    id: "elder_physical_taken_as_lightning",
    pattern: "#% of Physical Damage taken as Lightning Damage",
    name: "% of Physical Damage taken as Lightning Damage (Elder)",
    type: "Prefix",
    group: "DamageTakenAs",
    groups: ["armour", "body", "helmet", "shield"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "The Elder's", ilvl: 80, min: [8], max: [10] }
      ]
    }
  },
  {
    id: "elder_cooldown_recovery_rate_boots",
    pattern: "#% increased Cooldown Recovery Rate",
    name: "#% increased Cooldown Recovery Rate (Elder)",
    type: "Suffix",
    group: "Cooldown",
    groups: ["armour", "boots", "jewellery", "belt"],
    influence: "Elder",
    tiers_by_class: {
      "_default": [
        { tier: 1, name: "of the Elder", ilvl: 80, min: [13], max: [15] },
        { tier: 2, name: "of the Elder", ilvl: 70, min: [9], max: [12] }
      ]
    }
  }
];

const map = new Map();
existingDb.mods.forEach(m => map.set(m.id, m));

let added = 0;
let updated = 0;

moreInfluenceMods.forEach(m => {
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

console.log(`Massive influence update finished! Total mods: ${existingDb.mods.length} (Added ${added}, Updated ${updated}).`);
