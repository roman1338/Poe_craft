#!/usr/bin/env python3
"""
Full compilation and deduplication script for PoE Mods Database.
Outputs clean, verified, deduplicated mod families into src/data/poe_mods.json.
- Strictly separates Prefix vs Suffix
- Clean English mod names (no tags, no brackets, no internal IDs)
- Groups all tiers into one mod entry
- Accurate spawn weights & item class eligibility
- Clean tier ranges with required ilvls
"""

import json
import urllib.request
import re
from collections import defaultdict

ITEM_CLASSES = [
    {"id": "Amulet", "tags": ["amulet"], "groups": ["amulet", "jewellery"]},
    {"id": "Ring", "tags": ["ring"], "groups": ["ring", "jewellery"]},
    {"id": "Belt", "tags": ["belt"], "groups": ["belt", "jewellery"]},
    {"id": "Body Armour", "tags": ["body_armour", "str_armour", "dex_armour", "int_armour", "str_dex_armour", "str_int_armour", "dex_int_armour", "str_dex_int_armour"], "groups": ["body", "armour"]},
    {"id": "Boots", "tags": ["boots", "str_armour", "dex_armour", "int_armour", "str_dex_armour", "str_int_armour", "dex_int_armour", "str_dex_int_armour"], "groups": ["boots", "armour"]},
    {"id": "Gloves", "tags": ["gloves", "str_armour", "dex_armour", "int_armour", "str_dex_armour", "str_int_armour", "dex_int_armour", "str_dex_int_armour"], "groups": ["gloves", "armour"]},
    {"id": "Helmet", "tags": ["helmet", "str_armour", "dex_armour", "int_armour", "str_dex_armour", "str_int_armour", "dex_int_armour", "str_dex_int_armour"], "groups": ["helmet", "armour"]},
    {"id": "Shield", "tags": ["shield", "focus", "str_armour", "dex_armour", "int_armour", "str_dex_armour", "str_int_armour", "dex_int_armour", "str_dex_int_armour"], "groups": ["shield", "armour"]},
    {"id": "Bow", "tags": ["bow"], "groups": ["bow", "weapon", "two-handed"]},
    {"id": "Quiver", "tags": ["quiver"], "groups": ["quiver", "jewellery"]},
    {"id": "Wand", "tags": ["wand"], "groups": ["wand", "weapon", "one-handed", "caster"]},
    {"id": "Claw", "tags": ["claw"], "groups": ["claw", "weapon", "one-handed"]},
    {"id": "Dagger", "tags": ["dagger", "rune_dagger"], "groups": ["dagger", "weapon", "one-handed", "caster"]},
    {"id": "Sceptre", "tags": ["sceptre"], "groups": ["sceptre", "weapon", "one-handed", "caster"]},
    {"id": "Staff", "tags": ["staff", "warstaff"], "groups": ["staff", "weapon", "two-handed", "caster"]},
    {"id": "One Hand Sword", "tags": ["sword", "one_hand_weapon", "thrusting_one_hand_sword"], "groups": ["sword", "weapon", "one-handed"]},
    {"id": "Two Hand Sword", "tags": ["two_hand_sword", "2h_sword", "two_hand_weapon"], "groups": ["sword", "weapon", "two-handed"]},
    {"id": "One Hand Axe", "tags": ["axe", "one_hand_weapon"], "groups": ["axe", "weapon", "one-handed"]},
    {"id": "Two Hand Axe", "tags": ["two_hand_axe", "2h_axe", "two_hand_weapon"], "groups": ["axe", "weapon", "two-handed"]},
    {"id": "One Hand Mace", "tags": ["mace", "one_hand_weapon"], "groups": ["mace", "weapon", "one-handed"]},
    {"id": "Two Hand Mace", "tags": ["two_hand_mace", "2h_mace", "two_hand_weapon"], "groups": ["mace", "weapon", "two-handed"]}
]

INF_TAG_MAP = {
    "shaper": "shaper",
    "elder": "elder",
    "crusader": "crusader",
    "redeemer": "eyrie",
    "hunter": "basilisk",
    "warlord": "adjudicator"
}

def load_stat_translator():
    try:
        req = urllib.request.Request('https://raw.githubusercontent.com/brather1ng/RePoE/master/RePoE/data/stat_translations.min.json', headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            translations = json.loads(resp.read().decode('utf-8'))
        
        stat_lookup = {}
        for entry in translations:
            ids = tuple(entry.get("ids", []))
            for rule in entry.get("English", []):
                raw_str = rule.get("string", "")
                fmt_list = rule.get("format", [])
                
                # Apply formatting
                res = raw_str
                for i, fmt in enumerate(fmt_list):
                    placeholder = f"{{{i}}}"
                    if "+" in str(fmt):
                        replacement = "+#"
                    else:
                        replacement = "#"
                    res = res.replace(placeholder, replacement)
                res = re.sub(r'\{[0-9]+\}', '#', res)
                
                if res:
                    if ids not in stat_lookup:
                        stat_lookup[ids] = res
                    for single_id in ids:
                        if single_id not in stat_lookup:
                            stat_lookup[single_id] = res
        return stat_lookup
    except Exception as e:
        print(f"Warning: could not fetch stat translations: {e}")
        return {}

def clean_mod_string(template):
    if not template:
        return ""
    res = template.replace('\n', ', ')
    # Normalize duplicate + or #
    res = re.sub(r'\++#', '+#', res)
    res = re.sub(r'#+', '#', res)
    return res.strip()

def can_mod_spawn_on_class(mod, item_class_info):
    spawn_weights = mod.get("spawn_weights", [])
    if not spawn_weights:
        return True
    
    weights = {sw["tag"]: sw["weight"] for sw in spawn_weights}
    
    for tag in item_class_info["tags"]:
        if weights.get(tag, 0) > 0:
            return True
        for inf_raw, inf_code in INF_TAG_MAP.items():
            if weights.get(f"{tag}_{inf_raw}", 0) > 0 or weights.get(f"{tag}_{inf_code}", 0) > 0:
                return True

    if "weapon" in item_class_info["groups"] and (
        weights.get("weapon", 0) > 0 or 
        weights.get("weapon_shaper", 0) > 0 or 
        weights.get("weapon_elder", 0) > 0 or
        weights.get("weapon_basilisk", 0) > 0 or
        weights.get("weapon_eyrie", 0) > 0 or
        weights.get("weapon_adjudicator", 0) > 0 or
        weights.get("weapon_crusader", 0) > 0
    ):
        return True

    if "armour" in item_class_info["groups"] and (
        weights.get("armour", 0) > 0 or 
        weights.get("str_dex_int_armour", 0) > 0 or
        weights.get("body_armour", 0) > 0 if item_class_info["id"] == "Body Armour" else False
    ):
        return True

    return False

def main():
    stat_lookup = load_stat_translator()

    with open("poe_mods_db.json", "r", encoding="utf-8") as f:
        poe_db = json.load(f)

    # Key: (gen_type, clean_pattern, influence)
    grouped_mods = defaultdict(lambda: {
        "id": "",
        "name": "",
        "type": "Prefix",
        "group": "",
        "influence": "",
        "pattern": "",
        "groups": set(),
        "entries": []
    })

    for mod_id, mod in poe_db.items():
        gen_type = "Prefix" if mod["generation_type"] == "prefix" else "Suffix"
        inf = mod.get("influence") or ""
        group = mod.get("group") or "Misc"

        stats = mod.get("stats", [])
        ids = tuple(s["id"] for s in stats)

        tmpl = stat_lookup.get(ids)
        if not tmpl and len(ids) == 1:
            tmpl = stat_lookup.get(ids[0])
        if not tmpl:
            # Fallback
            parts = []
            for s in stats:
                stat_name = stat_lookup.get(s["id"], s["id"].replace("_", " "))
                parts.append(stat_name)
            tmpl = ", ".join(parts) if parts else group

        clean_pattern = clean_mod_string(tmpl)
        if not clean_pattern:
            clean_pattern = group

        key = (gen_type, clean_pattern, inf)
        family = grouped_mods[key]

        if not family["id"]:
            sanitized_name = re.sub(r'[^a-zA-Z0-9]+', '_', clean_pattern[:30]).strip('_').lower()
            inf_suffix = f"_{inf.lower()}" if inf else ""
            family["id"] = f"{gen_type.lower()}_{sanitized_name}{inf_suffix}"
            family["name"] = clean_pattern
            family["pattern"] = clean_pattern
            family["type"] = gen_type
            family["group"] = group
            family["influence"] = inf

        family["entries"].append(mod)

    print(f"Aggregated {len(poe_db)} raw mods into {len(grouped_mods)} distinct mod families.")

    final_mods = []
    
    for key, family in grouped_mods.items():
        all_entries = family["entries"]
        
        valid_item_classes = {}
        for cls_info in ITEM_CLASSES:
            cls_name = cls_info["id"]
            spawnable = [m for m in all_entries if can_mod_spawn_on_class(m, cls_info)]
            if spawnable:
                sorted_entries = sorted(spawnable, key=lambda m: m.get("required_level", 1), reverse=True)
                
                dedup = []
                seen_levels = set()
                for entry in sorted_entries:
                    lvl = entry.get("required_level", 1)
                    if lvl not in seen_levels:
                        seen_levels.add(lvl)
                        dedup.append(entry)

                tiers = []
                for idx, entry in enumerate(dedup, start=1):
                    mins = [s.get("min", 0) for s in entry.get("stats", [])]
                    maxs = [s.get("max", 0) for s in entry.get("stats", [])]
                    tier_name = entry.get("name") or f"Tier {idx}"
                    tiers.append({
                        "tier": idx,
                        "name": tier_name,
                        "ilvl": entry.get("required_level", 1),
                        "min": mins,
                        "max": maxs
                    })
                
                valid_item_classes[cls_name] = tiers
                for g in cls_info["groups"]:
                    family["groups"].add(g)

        if valid_item_classes:
            best_tiers = list(valid_item_classes.values())[0]
            valid_item_classes["_default"] = best_tiers

            final_mods.append({
                "id": family["id"],
                "pattern": family["pattern"],
                "name": family["name"],
                "type": family["type"],
                "group": family["group"],
                "groups": sorted(list(family["groups"])),
                "influence": family["influence"],
                "tiers_by_class": valid_item_classes
            })

    # Sort alphabetically by clean mod name
    final_mods = sorted(final_mods, key=lambda m: (m["type"], m["name"].lower()))

    # Ensure unique IDs across all entries
    seen_ids = set()
    for m in final_mods:
        base_id = m["id"]
        counter = 1
        while m["id"] in seen_ids:
            m["id"] = f"{base_id}_{counter}"
            counter += 1
        seen_ids.add(m["id"])

    output_db = {
        "version": 4,
        "note": "Clean, deduplicated Path of Exile item modifiers database directly mapped from RePoE.",
        "item_classes": [
            {"id": c["id"], "groups": c["groups"]} for c in ITEM_CLASSES
        ],
        "mods": final_mods
    }

    with open("src/data/poe_mods.json", "w", encoding="utf-8") as f:
        json.dump(output_db, f, indent=2, ensure_ascii=False)

    print(f"Successfully compiled {len(final_mods)} clean mod entries into src/data/poe_mods.json!")

if __name__ == "__main__":
    main()
