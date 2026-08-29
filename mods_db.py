"""
Загрузка poe_mods.json, фильтры как на Craft of Exile
и сборка regex для текста предмета из Ctrl+C.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

MODS_PATH = Path(__file__).with_name("poe_mods.json")

# В тексте предмета PoE число может быть целым или с точкой.
_NUMBER = r"(\d+(?:\.\d+)?)"


@dataclass
class TierRange:
    """Один тир: имя аффикса, ilvl и диапазоны каждого # в шаблоне."""

    tier: int
    name: str
    ilvl: int
    mins: list[float]
    maxs: list[float]


@dataclass
class ModDef:
    """Одна запись из базы модов."""

    id: str
    pattern: str
    name: str
    kind: str  # Prefix / Suffix
    group: str
    groups: list[str]
    influence: str  # "" обычный, иначе Shaper / Elder / Crusader / ...
    tiers_by_class: dict[str, list[TierRange]]

    def tiers_for(self, item_class: str) -> list[TierRange]:
        if item_class in self.tiers_by_class:
            return self.tiers_by_class[item_class]
        return self.tiers_by_class.get("_default", [])


@dataclass
class CompiledTarget:
    """Готовый к проверке целевой мод: regex + допустимые числовые диапазоны."""

    id: str
    name: str
    pattern: str
    kind: str
    regex: re.Pattern[str]
    # None — любой тир; иначе список тиров, достаточно попасть в любой.
    allowed_tiers: Optional[list[TierRange]] = None
    min_tier: Optional[int] = None  # 1 = только T1, 3 = T1–T3, None = Any
    influence: str = ""

    def describe(self) -> str:
        tier_txt = "Any" if self.min_tier is None else f"T{self.min_tier}+"
        inf = f"  [{self.influence}]" if self.influence else ""
        return f"{self.pattern}  [{self.kind}]{inf}  {tier_txt}"


@dataclass
class ModsDatabase:
    item_classes: list[dict[str, Any]]
    mods: list[ModDef]
    class_groups: dict[str, list[str]] = field(default_factory=dict)

    def class_ids(self) -> list[str]:
        return [c["id"] for c in self.item_classes]

    def mods_for_class(self, item_class: str) -> list[ModDef]:
        groups = set(self.class_groups.get(item_class, []))
        result = []
        for mod in self.mods:
            if groups & set(mod.groups):
                result.append(mod)
        return result

    def get(self, mod_id: str) -> Optional[ModDef]:
        for mod in self.mods:
            if mod.id == mod_id:
                return mod
        return None

    def filter_mods(
        self,
        item_class: str,
        query: str = "",
        kind: str = "Any",
        influence: str = "Any",
    ) -> list[ModDef]:
        """Поиск по названию/шаблону и фильтр Prefix / Suffix / influence."""
        q = query.casefold().strip()
        kind_n = kind.strip().title()
        inf_n = influence.strip()
        out: list[ModDef] = []
        for mod in self.mods_for_class(item_class):
            if kind_n in ("Prefix", "Suffix") and mod.kind != kind_n:
                continue
            if inf_n == "Normal" and mod.influence:
                continue
            if inf_n not in ("Any", "Normal", "") and mod.influence != inf_n:
                continue
            hay = f"{mod.name} {mod.pattern} {mod.group} {mod.influence}".casefold()
            if q and q not in hay:
                continue
            out.append(mod)
        return out

    def influences(self) -> list[str]:
        found = sorted({m.influence for m in self.mods if m.influence})
        return found

    def classify_line(self, line: str, item_class: str) -> Optional[str]:
        """Определить Prefix/Suffix неизвестной строки предмета по базе."""
        for mod in self.mods_for_class(item_class):
            rx = pattern_to_regex(mod.pattern)
            if rx.search(line):
                return mod.kind
        return None


def load_mods_db(path: Path = MODS_PATH) -> ModsDatabase:
    raw = json.loads(path.read_text(encoding="utf-8"))
    class_groups = {c["id"]: list(c.get("groups", [])) for c in raw["item_classes"]}
    mods: list[ModDef] = []
    for row in raw["mods"]:
        tiers: dict[str, list[TierRange]] = {}
        for cls_name, entries in row.get("tiers_by_class", {}).items():
            tiers[cls_name] = [
                TierRange(
                    tier=int(t["tier"]),
                    name=str(t.get("name", "")),
                    ilvl=int(t.get("ilvl", 1)),
                    mins=[float(x) for x in t["min"]],
                    maxs=[float(x) for x in t["max"]],
                )
                for t in entries
            ]
        mods.append(
            ModDef(
                id=row["id"],
                pattern=row["pattern"],
                name=row["name"],
                kind=row["type"],
                group=row.get("group", ""),
                groups=list(row.get("groups", [])),
                influence=str(row.get("influence", "") or ""),
                tiers_by_class=tiers,
            )
        )
    return ModsDatabase(
        item_classes=list(raw["item_classes"]),
        mods=mods,
        class_groups=class_groups,
    )


def pattern_to_regex(pattern: str) -> re.Pattern[str]:
    """
    Шаблон Craft-of-Exile вида '+# to maximum Life' -> regex для Ctrl+C.

    '#' заменяется на число. Остальной текст экранируется.
    Регистр не важен: в игре 'Life' / 'life' встречаются одинаково.
    """
    sentinel = "<<<NUM>>>"
    stamped = pattern.replace("#", sentinel)
    escaped = re.escape(stamped)
    body = escaped.replace(re.escape(sentinel), _NUMBER)
    # В буфере иногда лишние пробелы вокруг плюса.
    body = body.replace(re.escape("+"), r"\+")
    return re.compile(body, re.IGNORECASE)


def allowed_tiers_for(mod: ModDef, item_class: str, min_tier: Optional[int]) -> Optional[list[TierRange]]:
    """
    min_tier=None -> любой тир (только текст мода).
    min_tier=1 -> только T1.
    min_tier=3 -> T1, T2 или T3 (этот тир или лучше).
    """
    all_tiers = mod.tiers_for(item_class)
    if min_tier is None:
        return None
    picked = [t for t in all_tiers if t.tier <= min_tier]
    return picked or all_tiers[:1]


def compile_target(
    db: ModsDatabase,
    mod_id: str,
    item_class: str,
    min_tier: Optional[int],
) -> CompiledTarget:
    mod = db.get(mod_id)
    if not mod:
        raise KeyError(f"Неизвестный мод: {mod_id}")
    return CompiledTarget(
        id=mod.id,
        name=mod.name,
        pattern=mod.pattern,
        kind=mod.kind,
        regex=pattern_to_regex(mod.pattern),
        allowed_tiers=allowed_tiers_for(mod, item_class, min_tier),
        min_tier=min_tier,
        influence=mod.influence,
    )


def line_matches_target(line: str, target: CompiledTarget) -> bool:
    """Проверка одной строки явного мода."""
    match = target.regex.search(line.strip())
    if not match:
        return False
    if target.allowed_tiers is None:
        return True
    values = [float(g) for g in match.groups()]
    for band in target.allowed_tiers:
        if _values_in_band(values, band):
            return True
    return False


def _values_in_band(values: list[float], band: TierRange) -> bool:
    if not band.mins and not band.maxs:
        return True
    if len(values) != len(band.mins):
        return False
    for val, lo, hi in zip(values, band.mins, band.maxs):
        if val < lo or val > hi:
            return False
    return True


def match_targets(explicit_lines: list[str], targets: list[CompiledTarget]) -> list[bool]:
    """Для каждого целевого мода — попал ли он на предмете."""
    hits = []
    for target in targets:
        hits.append(any(line_matches_target(line, target) for line in explicit_lines))
    return hits
