#!/usr/bin/env python3
"""
Downloads and saves full RePoE item mods database to poe_mods_db.json.
Accurately maps GGG internal influence codes:
  - basilisk -> Hunter
  - eyrie -> Redeemer
  - adjudicator -> Warlord
  - crusader -> Crusader
  - shaper -> Shaper
  - elder -> Elder
  - exarch / cleansing_fire -> Exarch
  - eater / tangle -> Eater
"""

import json
import urllib.request
import sys
import re

URLS = [
    "https://raw.githubusercontent.com/repoe-fork/repoe/gh-pages/data/mods.json",
    "https://raw.githubusercontent.com/brather1ng/RePoE/master/RePoE/data/mods.min.json",
    "https://raw.githubusercontent.com/brather1ng/RePoE/master/RePoE/data/mods.json"
]

STAT_TRANS_URL = "https://raw.githubusercontent.com/brather1ng/RePoE/master/RePoE/data/stat_translations.min.json"
OUTPUT_FILE = "poe_mods_db.json"

def fetch_json(urls):
    for u in urls:
        try:
            print(f"Fetching from {u}...")
            req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                print(f"Successfully loaded data from {u}")
                return data
        except Exception as e:
            print(f"Failed to fetch {u}: {e}")
    raise RuntimeError("All URLs failed to load")

def build_stat_translator():
    try:
        print("Fetching stat translations...")
        req = urllib.request.Request(STAT_TRANS_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            translations = json.loads(resp.read().decode('utf-8'))
        
        stat_map = {}
        for entry in translations:
            ids = tuple(entry.get("ids", []))
            english_rules = entry.get("English", [])
            if ids and english_rules:
                for rule in english_rules:
                    fmt_str = rule.get("string", "")
                    if fmt_str:
                        stat_map[ids] = fmt_str
                        if len(ids) == 1:
                            stat_map[ids[0]] = fmt_str
                        break
        return stat_map
    except Exception as e:
        print(f"Could not load stat translations: {e}")
        return {}

def detect_influence(spawn_weights, mod_id, mod_name):
    combined = (mod_id + " " + mod_name).lower()
    for sw in spawn_weights:
        t = sw.get("tag", "").lower()
        if "shaper" in t: return "Shaper"
        if "elder" in t: return "Elder"
        if "basilisk" in t or "hunter" in t: return "Hunter"
        if "eyrie" in t or "redeemer" in t: return "Redeemer"
        if "adjudicator" in t or "warlord" in t or "conquest" in t: return "Warlord"
        if "crusader" in t: return "Crusader"
        if "exarch" in t or "cleansing_fire" in t: return "Exarch"
        if "eater" in t or "tangle" in t: return "Eater"

    if "shaper" in combined: return "Shaper"
    if "elder" in combined: return "Elder"
    if "hunter" in combined or "basilisk" in combined: return "Hunter"
    if "redeemer" in combined or "eyrie" in combined: return "Redeemer"
    if "warlord" in combined or "conquest" in combined or "adjudicator" in combined: return "Warlord"
    if "crusader" in combined: return "Crusader"
    return None

def format_stat_id_readable(stat_id, s_min, s_max):
    text = stat_id.replace("_", " ").replace("+%", "+#%").replace("%", "#%")
    val = f"{s_min}" if s_min == s_max else f"{s_min}–{s_max}"
    return f"{text}: {val}"

def main():
    raw_mods = fetch_json(URLS)
    stat_map = build_stat_translator()

    filtered_mods = {}

    for mod_id, mod in raw_mods.items():
        # 1. Filter: domain == 'item'
        if mod.get("domain") != "item":
            continue

        # 2. Filter: generation_type is 'prefix' or 'suffix'
        gen_type = mod.get("generation_type")
        if gen_type not in ("prefix", "suffix"):
            continue

        group = mod.get("group") or mod.get("type") or "Misc"
        spawn_weights = mod.get("spawn_weights", [])
        influence = detect_influence(spawn_weights, mod_id, mod.get("name", ""))

        stats = [
            {
                "id": s.get("id", ""),
                "min": s.get("min", 0),
                "max": s.get("max", 0)
            }
            for s in mod.get("stats", [])
        ]

        stat_ids = tuple(s["id"] for s in stats)
        description_template = stat_map.get(stat_ids) or (stat_map.get(stat_ids[0]) if stat_ids and len(stat_ids) == 1 else "")
        
        if not description_template:
            desc_parts = []
            for s in stats:
                desc_parts.append(format_stat_id_readable(s["id"], s["min"], s["max"]))
            description_template = ", ".join(desc_parts)

        filtered_mods[mod_id] = {
            "id": mod_id,
            "name": mod.get("name", "") or mod_id,
            "generation_type": gen_type,
            "group": group,
            "required_level": mod.get("required_level", 1),
            "stats": stats,
            "spawn_weights": spawn_weights,
            "influence": influence,
            "pattern": description_template
        }

    total_count = len(filtered_mods)
    print(f"Total matching item prefix/suffix mods: {total_count}")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(filtered_mods, f, indent=2, ensure_ascii=False)

    print(f"Successfully saved {total_count} mods to {OUTPUT_FILE} (utf-8, indent=2)")

if __name__ == "__main__":
    main()
