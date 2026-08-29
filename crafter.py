"""Цикл Alt/Aug: Ctrl+C, проверка regex целевых модов, клики по сферам."""

from __future__ import annotations

import json
import random
import re
import threading
import time
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Callable, Optional

import pyautogui
import pyperclip

from mods_db import CompiledTarget, ModsDatabase, line_matches_target, match_targets

pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.01

SETTINGS_PATH = Path(__file__).with_name("settings.json")

LogFn = Callable[[str], None]
VoidFn = Callable[[], None]


@dataclass
class AppSettings:
    delay_after_move: float = 0.05
    delay_after_ctrl_c: float = 0.12
    delay_after_click: float = 0.18
    delay_between: float = 0.05
    item: Optional[list[int]] = None
    alteration: Optional[list[int]] = None
    augmentation: Optional[list[int]] = None
    always_on_top: bool = True
    item_class: str = "Body Armour"
    selected: list = field(default_factory=list)
    # Alt на клике по предмету использует Aug, без наведения на вторую сферу.
    alt_key_swap: bool = False
    # Случайные паузы и траектория мыши.
    humanize: bool = True

    def pos(self, name: str) -> Optional[tuple[int, int]]:
        raw = getattr(self, name)
        if not raw or len(raw) != 2:
            return None
        return int(raw[0]), int(raw[1])

    def set_pos(self, name: str, point: tuple[int, int]) -> None:
        setattr(self, name, [int(point[0]), int(point[1])])


@dataclass
class Stats:
    alts: int = 0
    augs: int = 0
    copies: int = 0
    started_at: float = field(default_factory=time.monotonic)
    finished: bool = False
    success: bool = False

    def elapsed(self) -> float:
        return time.monotonic() - self.started_at

    def summary(self) -> str:
        return (
            f"Alt={self.alts}  Aug={self.augs}  копий={self.copies}  "
            f"время={self.elapsed():.1f}с"
        )


def load_settings() -> AppSettings:
    if not SETTINGS_PATH.exists():
        return AppSettings()
    try:
        data = json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
        known = {f.name for f in AppSettings.__dataclass_fields__.values()}
        filtered = {k: v for k, v in data.items() if k in known}
        # старый ключ target_mod больше не используется
        return AppSettings(**filtered)
    except (OSError, json.JSONDecodeError, TypeError):
        return AppSettings()


def save_settings(settings: AppSettings) -> None:
    SETTINGS_PATH.write_text(
        json.dumps(asdict(settings), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


class CraftRunner:
    """Цикл: скопировать предмет → regex модов → Alt или Aug → повтор."""

    def __init__(
        self,
        settings: AppSettings,
        db: ModsDatabase,
        log: LogFn,
        on_finished: Optional[VoidFn] = None,
    ) -> None:
        self.settings = settings
        self.db = db
        self.log = log
        self.on_finished = on_finished
        self.stop_event = threading.Event()
        self.running = False
        self._lock = threading.Lock()
        self.stats = Stats()
        self.targets: list[CompiledTarget] = []
        self.item_class = settings.item_class
        self._orb_on_cursor = False

    def save_point(self, name: str) -> tuple[int, int]:
        point = pyautogui.position()
        return self.save_point_at(name, int(point.x), int(point.y))

    def save_point_at(self, name: str, x: int, y: int) -> tuple[int, int]:
        xy = (int(x), int(y))
        self.settings.set_pos(name, xy)
        labels = {
            "item": "предмет",
            "alteration": "Сфера перемен (Alt)",
            "augmentation": "Сфера усиления (Aug)",
        }
        self.log(f"[позиция] {labels.get(name, name)}: {xy}")
        save_settings(self.settings)
        return xy

    def missing_positions(self) -> list[str]:
        missing = []
        if not self.settings.pos("item"):
            missing.append("предмет")
        if not self.settings.pos("alteration"):
            missing.append("Alt")
        # Вторая сфера не нужна, если Aug берётся удержанием клавиши Alt.
        if not self.settings.alt_key_swap and not self.settings.pos("augmentation"):
            missing.append("Aug")
        return missing

    def start(self, targets: list[CompiledTarget], item_class: str) -> Optional[str]:
        if not targets:
            return "Выберите 1 или 2 целевых мода."
        if len(targets) > 2:
            return "Для синего предмета достаточно 1–2 модов."
        kinds = [t.kind for t in targets]
        if len(targets) == 2 and kinds[0] == kinds[1]:
            return (
                "На magic-предмете только 1 префикс и 1 суффикс. "
                "Выберите префикс и суффикс, а не два одинаковых типа."
            )
        missing = self.missing_positions()
        if missing:
            return "Сначала задайте позиции: " + ", ".join(missing)

        with self._lock:
            if self.running:
                return "Уже запущено."
            self.running = True
            self.stop_event.clear()
            self.stats = Stats()
            self.targets = list(targets)
            self.item_class = item_class
            self._orb_on_cursor = False

        save_settings(self.settings)
        if self.settings.alt_key_swap:
            self.log("[настройка] Aug через клавишу Alt (сфера Alt на курсоре).")
        if self.settings.humanize:
            self.log("[настройка] Человеческие задержки и движение мыши.")
        for t in targets:
            self.log(f"[цель] {t.describe()}")
            self.log(f"[regex] {t.regex.pattern}")
        threading.Thread(target=self._loop, name="craft-loop", daemon=True).start()
        return None

    def stop(self) -> None:
        if not self.running:
            self.log("[стоп] Скрипт и так остановлен.")
            return
        self.log("[стоп] Останавливаю…")
        self.stop_event.set()

    def peek_item(self) -> Optional[str]:
        if not self.settings.pos("item"):
            return None
        return self._copy_item_text(count=False)

    def _loop(self) -> None:
        try:
            while not self.stop_event.is_set():
                text = self._copy_item_text()
                if text is None:
                    break

                lines = parse_explicit_mods(text)
                self.log(f"[предмет] моды: {lines or '(нет явных модов)'}")

                hits = match_targets(lines, self.targets)
                for target, ok in zip(self.targets, hits):
                    mark = "да" if ok else "нет"
                    self.log(f"  · {target.name}: {mark}")

                action = decide_orb(lines, self.targets, self.db, self.item_class)
                if action == "done":
                    self.stats.success = True
                    self.log(f"[успех] Все цели найдены. {self.stats.summary()}")
                    break
                if action == "aug":
                    self.log("[крафт] Augmentation.")
                    self._use_currency("aug")
                    self.stats.augs += 1
                else:
                    self.log("[крафт] Alteration.")
                    self._use_currency("alt")
                    self.stats.alts += 1

                self._pause(self.settings.delay_between)
        except pyautogui.FailSafeException:
            self.log("[стоп] Failsafe: мышь уехала в угол экрана.")
        except Exception as exc:
            self.log(f"[ошибка] {exc}")
        finally:
            self.stats.finished = True
            self.log(f"[итог] {self.stats.summary()}")
            with self._lock:
                self.running = False
            self.stop_event.set()
            if self.on_finished:
                self.on_finished()

    def _copy_item_text(self, count: bool = True) -> Optional[str]:
        if self.stop_event.is_set() and count:
            return None

        item = self.settings.pos("item")
        if not item:
            return None

        pyperclip.copy("")
        self._move_to(*item)
        self._pause(self.settings.delay_after_move)
        pyautogui.hotkey("ctrl", "c")
        self._pause(self.settings.delay_after_ctrl_c)

        text = pyperclip.paste() or ""
        if count:
            self.stats.copies += 1

        if not text.strip():
            self.log("[предупреждение] Буфер пуст. Активно ли окно PoE?")
            self._pause(0.4)
            if self.stop_event.is_set():
                return None
            return ""

        return text

    def _pause(self, base: float) -> None:
        if self.settings.humanize:
            time.sleep(max(0.015, random.uniform(base * 0.65, base * 1.55)))
        else:
            time.sleep(base)

    def _move_to(self, x: int, y: int) -> None:
        if self.settings.humanize:
            jx = x + random.randint(-2, 2)
            jy = y + random.randint(-2, 2)
            duration = random.uniform(0.07, 0.24)
            tween = random.choice(
                (
                    pyautogui.easeInOutQuad,
                    pyautogui.easeOutQuad,
                    pyautogui.easeInOutSine,
                )
            )
            pyautogui.moveTo(jx, jy, duration=duration, tween=tween)
        else:
            pyautogui.moveTo(x, y, duration=0.05)

    def _pick_alteration(self) -> None:
        orb = self.settings.pos("alteration")
        if not orb:
            raise RuntimeError("Позиция Сферы перемен не задана.")
        self._move_to(*orb)
        self._pause(self.settings.delay_after_move)
        pyautogui.click(button="right")
        self._pause(self.settings.delay_after_click)
        self._orb_on_cursor = True

    def _use_currency(self, which: str) -> None:
        """which: 'alt' | 'aug'."""
        item = self.settings.pos("item")
        if not item:
            raise RuntimeError("Позиция предмета не задана.")

        if self.settings.alt_key_swap:
            if not self._orb_on_cursor:
                self._pick_alteration()
            self._move_to(*item)
            self._pause(self.settings.delay_after_move)
            if which == "aug":
                pyautogui.keyDown("alt")
                try:
                    self._pause(random.uniform(0.03, 0.08) if self.settings.humanize else 0.04)
                    pyautogui.click(button="left")
                finally:
                    pyautogui.keyUp("alt")
            else:
                pyautogui.click(button="left")
            self._pause(self.settings.delay_after_click)
            return

        orb = self.settings.pos("augmentation" if which == "aug" else "alteration")
        self._use_orb(orb)

    def _use_orb(self, orb_pos: Optional[tuple[int, int]]) -> None:
        if not orb_pos:
            raise RuntimeError("Позиция сферы не задана.")
        item = self.settings.pos("item")
        self._move_to(*orb_pos)
        self._pause(self.settings.delay_after_move)
        pyautogui.click(button="right")
        self._pause(self.settings.delay_after_click)
        self._move_to(*item)
        self._pause(self.settings.delay_after_move)
        pyautogui.click(button="left")
        self._pause(self.settings.delay_after_click)


def parse_explicit_mods(item_text: str) -> list[str]:
    if not item_text.strip():
        return []

    normalized = item_text.replace("\r\n", "\n").replace("\r", "\n")
    blocks = [b.strip() for b in normalized.split("--------") if b.strip()]

    skip_prefixes = (
        "rarity:",
        "item class:",
        "requirements:",
        "sockets:",
        "item level:",
        "quality:",
        "armour:",
        "evasion rating:",
        "energy shield:",
        "chance to block:",
        "physical damage:",
        "elemental damage:",
        "critical strike chance:",
        "attacks per second:",
        "weapon range:",
        "stack size:",
        "note:",
    )

    mods: list[str] = []
    for block in blocks:
        lines = [ln.strip() for ln in block.split("\n") if ln.strip()]
        if not lines:
            continue
        first = lines[0].lower()
        if any(first.startswith(p) for p in skip_prefixes):
            continue
        if first.startswith("rarity"):
            continue
        for line in lines:
            low = line.lower()
            if low.startswith(("unidentified", "corrupted", "mirrored", "split")):
                continue
            if " (implicit)" in low or " (enchant)" in low or " (crafted)" in low:
                continue
            if re.search(r"[\d%+]", line):
                mods.append(line)
    return mods


def decide_orb(
    lines: list[str],
    targets: list[CompiledTarget],
    db: ModsDatabase,
    item_class: str,
) -> str:
    """
    done — все цели на предмете.
    aug  — один мод и свободный слот нужного типа.
    alt  — два мода или занят слот нужного префикса/суффикса.
    """
    hits = match_targets(lines, targets)
    if hits and all(hits):
        return "done"
    if len(lines) >= 2:
        return "alt"
    if not lines:
        return "aug"

    line = lines[0]
    remaining = [t for t, ok in zip(targets, hits) if not ok]
    matched_here = [t for t in targets if line_matches_target(line, t)]

    if matched_here:
        occupied = matched_here[0].kind
    else:
        occupied = db.classify_line(line, item_class)

    if occupied and any(t.kind == occupied for t in remaining):
        return "alt"
    return "aug"
