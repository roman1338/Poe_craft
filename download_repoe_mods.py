import json
import urllib.request
import sys
import os

URL = "https://raw.githubusercontent.com/repoe-fork/repoe/gh-pages/data/mods.json"
OUTPUT_FILE = "poe_mods_db.json"

def download_and_process():
    print(f"Downloading RePoE mods from {URL}...")
    req = urllib.request.Request(
        URL,
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            raw_data = response.read().decode('utf-8')
            all_mods = json.loads(raw_data)
    except Exception as e:
        print(f"Error downloading from primary URL: {e}", file=sys.stderr)
        # Try fallback official repoe url if needed
        fallback_url = "https://raw.githubusercontent.com/brather1ng/RePoE/gh-pages/data/mods.json"
        print(f"Trying fallback URL: {fallback_url}...")
        req = urllib.request.Request(
            fallback_url,
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        with urllib.request.urlopen(req) as response:
            raw_data = response.read().decode('utf-8')
            all_mods = json.loads(raw_data)

    print(f"Total raw mods downloaded: {len(all_mods)}")

    filtered_mods = {}

    for mod_id, mod in all_mods.items():
        # Domain filter: item
        if mod.get("domain") != "item":
            continue
        
        # Generation type: prefix or suffix
        gen_type = mod.get("generation_type")
        if gen_type not in ("prefix", "suffix"):
            continue

        # Extract only key fields
        filtered_mods[mod_id] = {
            "id": mod_id,
            "name": mod.get("name", ""),
            "generation_type": gen_type,
            "group": mod.get("group", ""),
            "required_level": mod.get("required_level", 1),
            "stats": [
                {
                    "id": s.get("id", ""),
                    "min": s.get("min", 0),
                    "max": s.get("max", 0)
                }
                for s in mod.get("stats", [])
            ],
            "spawn_weights": mod.get("spawn_weights", []),
            "type": mod.get("type", "")
        }

    print(f"Filtered item prefix/suffix mods: {len(filtered_mods)}")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(filtered_mods, f, indent=2, ensure_ascii=False)

    print(f"Successfully saved {len(filtered_mods)} mods to {OUTPUT_FILE}")

if __name__ == "__main__":
    download_and_process()
