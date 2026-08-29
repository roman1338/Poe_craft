"""
Окно выбора модов в духе Craft of Exile + управление автокрафтом.

PyQt6: база, поиск, Prefix/Suffix, тир, список целей, старт/стоп.
"""

from __future__ import annotations

import queue
import sys
from typing import Optional

from pynput import keyboard
from PyQt6.QtCore import Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QColor, QFont, QTextCursor
from PyQt6.QtWidgets import (
    QApplication,
    QButtonGroup,
    QCheckBox,
    QComboBox,
    QGridLayout,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QListWidget,
    QListWidgetItem,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QRadioButton,
    QSplitter,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from crafter import CraftRunner, load_settings, parse_explicit_mods, save_settings
from mods_db import compile_target, load_mods_db, match_targets
from overlay import PositionPin

try:
    from ctypes import windll

    windll.shcore.SetProcessDpiAwareness(1)
except Exception:
    pass

# Тир в выпадающем списке: Any или «этот и лучше».
TIER_OPTIONS = [
    ("Any", None),
    ("T1 (только лучший)", 1),
    ("T1–T2", 2),
    ("T1–T3", 3),
]

STYLESHEET = """
QMainWindow, QWidget { background: #16141c; color: #efe8d8; font-family: Segoe UI; font-size: 13px; }
QGroupBox {
    border: 1px solid #3a3344; border-radius: 8px; margin-top: 12px; padding: 10px 8px 8px 8px;
    font-weight: 600; color: #d4b45a;
}
QGroupBox::title { subcontrol-origin: margin; left: 12px; padding: 0 6px; }
QLineEdit, QComboBox, QListWidget, QTextEdit {
    background: #2a2533; color: #efe8d8; border: 1px solid #4a4354; border-radius: 4px; padding: 4px;
}
QListWidget::item { padding: 6px; }
QListWidget::item:selected { background: #4a3d22; color: #ffe7a0; }
QLineEdit:focus, QComboBox:focus { border: 1px solid #d4b45a; }
QPushButton {
    background: #3d3548; color: #efe8d8; border: 1px solid #5a5166; border-radius: 5px;
    padding: 8px 12px; font-weight: 600;
}
QPushButton:hover { background: #4d4558; }
QPushButton#startBtn { background: #2f5a40; border-color: #3d7a55; }
QPushButton#startBtn:hover { background: #3d7a55; }
QPushButton#stopBtn { background: #5a2f2f; border-color: #7a3d3d; }
QPushButton#stopBtn:hover { background: #7a3d3d; }
QPushButton#goldBtn { background: #5a4a22; border-color: #d4b45a; color: #ffe7a0; }
QRadioButton, QCheckBox { color: #efe8d8; }
QLabel#statusIdle { background: #24302a; color: #9a9284; border-radius: 4px; padding: 8px; }
QLabel#statusRun { background: #3a3220; color: #d4b45a; border-radius: 4px; padding: 8px; font-weight: 700; }
QLabel#statusOk { background: #1e3a2c; color: #5cbf8a; border-radius: 4px; padding: 8px; font-weight: 700; }
QLabel#muted { color: #9a9284; font-weight: 400; font-size: 12px; }
QLabel#regex { color: #8ec8c0; font-family: Consolas; font-size: 12px; }
QLabel#stat { color: #d4b45a; font-size: 20px; font-weight: 700; }
QLabel#statCap { color: #9a9284; font-size: 11px; }
"""


class MainWindow(QMainWindow):
    sig_start = pyqtSignal()
    sig_stop = pyqtSignal()
    sig_save = pyqtSignal(str)

    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("PoE Crafter")
        self.resize(1080, 820)

        self.db = load_mods_db()
        self.settings = load_settings()
        self.log_queue: queue.Queue[str] = queue.Queue()
        self.runner = CraftRunner(self.settings, self.db, self._enqueue_log, self._on_craft_finished)
        self._capturing: Optional[str] = None
        self._hotkeys: Optional[keyboard.Listener] = None
        self._pins: dict[str, PositionPin] = {}

        self._build_ui()
        self._load_fields()
        self._refresh_mod_list()
        self._refresh_selected()
        self._refresh_positions()
        self._set_always_on_top(self.settings.always_on_top)
        self.sig_start.connect(self._on_start)
        self.sig_stop.connect(self._on_stop)
        self.sig_save.connect(self._hotkey_save)
        self._start_hotkeys()

        self.log_timer = QTimer(self)
        self.log_timer.timeout.connect(self._pump_log)
        self.log_timer.start(80)
        self.stats_timer = QTimer(self)
        self.stats_timer.timeout.connect(self._tick_stats)
        self.stats_timer.start(200)

        self._enqueue_log("Перетащите пин с точкой на предмет/сферу и нажмите «Готово».")
        self._enqueue_log("F6 предмет · F7 Alt · F10 Aug · F8 старт · F9 стоп")

    def _build_ui(self) -> None:
        root = QWidget()
        self.setCentralWidget(root)
        layout = QVBoxLayout(root)

        title = QLabel("PoE Crafter")
        title.setFont(QFont("Segoe UI Semibold", 18))
        title.setStyleSheet("color: #d4b45a;")
        layout.addWidget(title)
        hint = QLabel("Выбор модов как на Craft of Exile. Синий предмет: один префикс и один суффикс.")
        hint.setObjectName("muted")
        layout.addWidget(hint)

        split = QSplitter(Qt.Orientation.Horizontal)
        layout.addWidget(split, 1)
        split.addWidget(self._build_mod_picker())
        split.addWidget(self._build_craft_panel())
        split.setStretchFactor(0, 3)
        split.setStretchFactor(1, 2)

    def _build_mod_picker(self) -> QWidget:
        box = QGroupBox("Целевые модификаторы")
        col = QVBoxLayout(box)

        row = QHBoxLayout()
        row.addWidget(QLabel("База предмета"))
        self.class_combo = QComboBox()
        self.class_combo.addItems(self.db.class_ids())
        self.class_combo.currentTextChanged.connect(self._on_class_changed)
        row.addWidget(self.class_combo, 1)
        col.addLayout(row)

        self.search_edit = QLineEdit()
        self.search_edit.setPlaceholderText("Поиск мода: life, resistance, attack speed…")
        self.search_edit.textChanged.connect(self._refresh_mod_list)
        col.addWidget(self.search_edit)

        filters = QHBoxLayout()
        self.kind_group = QButtonGroup(self)
        for i, label in enumerate(("Any", "Prefix", "Suffix")):
            radio = QRadioButton(label)
            if i == 0:
                radio.setChecked(True)
            self.kind_group.addButton(radio, i)
            filters.addWidget(radio)
        self.kind_group.buttonClicked.connect(self._refresh_mod_list)
        filters.addStretch(1)
        filters.addWidget(QLabel("Тир"))
        self.tier_combo = QComboBox()
        for label, _ in TIER_OPTIONS:
            self.tier_combo.addItem(label)
        self.tier_combo.currentIndexChanged.connect(self._update_regex_preview)
        filters.addWidget(self.tier_combo)
        col.addLayout(filters)

        inf_row = QHBoxLayout()
        inf_row.addWidget(QLabel("Influence"))
        self.influence_combo = QComboBox()
        self.influence_combo.addItems(["Any", "Normal"] + self.db.influences())
        self.influence_combo.currentTextChanged.connect(self._refresh_mod_list)
        inf_row.addWidget(self.influence_combo, 1)
        col.addLayout(inf_row)

        col.addWidget(QLabel("Доступные моды (двойной клик или «Добавить»)"))
        self.mod_list = QListWidget()
        self.mod_list.itemSelectionChanged.connect(self._update_regex_preview)
        self.mod_list.itemDoubleClicked.connect(lambda _: self._add_selected_mod())
        col.addWidget(self.mod_list, 1)

        self.regex_label = QLabel("Regex: —")
        self.regex_label.setObjectName("regex")
        self.regex_label.setWordWrap(True)
        col.addWidget(self.regex_label)

        add_row = QHBoxLayout()
        add_btn = QPushButton("Добавить в цели")
        add_btn.setObjectName("goldBtn")
        add_btn.clicked.connect(self._add_selected_mod)
        add_row.addWidget(add_btn)
        col.addLayout(add_row)

        col.addWidget(QLabel("Выбранные моды (1 или 2 для magic)"))
        self.selected_list = QListWidget()
        self.selected_list.setMaximumHeight(120)
        col.addWidget(self.selected_list)

        rm = QPushButton("Убрать выбранный")
        rm.clicked.connect(self._remove_selected_mod)
        col.addWidget(rm)
        return box

    def _build_craft_panel(self) -> QWidget:
        wrap = QWidget()
        col = QVBoxLayout(wrap)
        col.setContentsMargins(0, 0, 0, 0)

        pos = QGroupBox("Позиции курсора")
        pos_l = QVBoxLayout(pos)
        muted = QLabel("Кнопка открывает пин: перетащите точку на нужное место и нажмите «Готово».")
        muted.setObjectName("muted")
        pos_l.addWidget(muted)
        self.pos_labels: dict[str, QLabel] = {}
        pos_l.addLayout(self._pos_row("item", "Предмет", "F6"))
        pos_l.addLayout(self._pos_row("alteration", "Сфера перемен (Alt)", "F7"))
        pos_l.addLayout(self._pos_row("augmentation", "Сфера усиления (Aug)", "F10"))
        self.capture_hint = QLabel("")
        self.capture_hint.setObjectName("muted")
        pos_l.addWidget(self.capture_hint)
        col.addWidget(pos)

        craft_opt = QGroupBox("Настройки крафта")
        opt_l = QVBoxLayout(craft_opt)
        self.alt_swap_check = QCheckBox("Aug через клавишу Alt (сфера Alt на курсоре)")
        self.alt_swap_check.setToolTip(
            "Правый клик по Alteration один раз. Клик по предмету — Alt, "
            "удержание Alt + клик — Augmentation. Позиция Aug не нужна."
        )
        self.humanize_check = QCheckBox("Человеческий фактор (рандом задержек и мыши)")
        self.humanize_check.setToolTip("Случайные паузы и слегка кривая траектория курсора.")
        opt_l.addWidget(self.alt_swap_check)
        opt_l.addWidget(self.humanize_check)
        col.addWidget(craft_opt)

        delays = QGroupBox("Паузы (сек)")
        grid = QGridLayout(delays)
        self.delay_edits: dict[str, QLineEdit] = {}
        for i, (key, caption) in enumerate(
            (
                ("delay_after_move", "move"),
                ("delay_after_ctrl_c", "Ctrl+C"),
                ("delay_after_click", "клик"),
                ("delay_between", "между"),
            )
        ):
            grid.addWidget(QLabel(caption), 0, i)
            edit = QLineEdit()
            self.delay_edits[key] = edit
            grid.addWidget(edit, 1, i)
        self.top_check = QCheckBox("Поверх всех окон")
        self.top_check.toggled.connect(self._toggle_top)
        grid.addWidget(self.top_check, 2, 0, 1, 4)
        col.addWidget(delays)

        btns = QHBoxLayout()
        self.start_btn = QPushButton("Начать крафт  (F8)")
        self.start_btn.setObjectName("startBtn")
        self.start_btn.clicked.connect(self._on_start)
        self.stop_btn = QPushButton("Стоп  (F9)")
        self.stop_btn.setObjectName("stopBtn")
        self.stop_btn.clicked.connect(self._on_stop)
        peek = QPushButton("Тест Ctrl+C")
        peek.setObjectName("goldBtn")
        peek.clicked.connect(self._on_peek)
        btns.addWidget(self.start_btn)
        btns.addWidget(self.stop_btn)
        btns.addWidget(peek)
        col.addLayout(btns)

        self.status_label = QLabel("Остановлен")
        self.status_label.setObjectName("statusIdle")
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        col.addWidget(self.status_label)

        stats = QGroupBox("Статистика")
        sgrid = QGridLayout(stats)
        self.stat_alt = self._stat_cell(sgrid, 0, "ALT")
        self.stat_aug = self._stat_cell(sgrid, 1, "AUG")
        self.stat_copy = self._stat_cell(sgrid, 2, "КОПИЙ")
        self.stat_time = self._stat_cell(sgrid, 3, "ВРЕМЯ")
        col.addWidget(stats)

        log_box = QGroupBox("Лог")
        log_l = QVBoxLayout(log_box)
        self.log_text = QTextEdit()
        self.log_text.setReadOnly(True)
        self.log_text.setFont(QFont("Consolas", 9))
        log_l.addWidget(self.log_text)
        col.addWidget(log_box, 1)
        return wrap

    def _pos_row(self, name: str, title: str, hotkey: str) -> QHBoxLayout:
        row = QHBoxLayout()
        row.addWidget(QLabel(title), 1)
        lbl = QLabel("не задано")
        lbl.setObjectName("muted")
        self.pos_labels[name] = lbl
        row.addWidget(lbl)
        btn = QPushButton(f"Пин ({hotkey})")
        btn.setObjectName("goldBtn")
        btn.clicked.connect(lambda: self._start_capture(name))
        row.addWidget(btn)
        return row

    def _stat_cell(self, grid: QGridLayout, col: int, caption: str) -> QLabel:
        value = QLabel("0")
        value.setObjectName("stat")
        value.setAlignment(Qt.AlignmentFlag.AlignCenter)
        cap = QLabel(caption)
        cap.setObjectName("statCap")
        cap.setAlignment(Qt.AlignmentFlag.AlignCenter)
        grid.addWidget(value, 0, col)
        grid.addWidget(cap, 1, col)
        return value

    def _current_kind(self) -> str:
        btn = self.kind_group.checkedButton()
        return btn.text() if btn else "Any"

    def _current_min_tier(self) -> Optional[int]:
        return TIER_OPTIONS[self.tier_combo.currentIndex()][1]

    def _on_class_changed(self, _text: str) -> None:
        self.settings.item_class = self.class_combo.currentText()
        allowed = {m.id for m in self.db.mods_for_class(self.settings.item_class)}
        self.settings.selected = [r for r in self.settings.selected if r.get("id") in allowed]
        self._refresh_mod_list()
        self._refresh_selected()
        self._update_regex_preview()

    def _refresh_mod_list(self) -> None:
        item_class = self.class_combo.currentText()
        mods = self.db.filter_mods(
            item_class,
            self.search_edit.text(),
            self._current_kind(),
            self.influence_combo.currentText(),
        )
        self.mod_list.clear()
        for mod in mods:
            tag = f" · {mod.influence}" if mod.influence else ""
            item = QListWidgetItem(f"{mod.pattern}    · {mod.kind}{tag} · {mod.group}")
            item.setData(Qt.ItemDataRole.UserRole, mod.id)
            if mod.influence:
                item.setForeground(QColor("#c9a0ff"))
            elif mod.kind == "Prefix":
                item.setForeground(QColor("#7ec8a0"))
            else:
                item.setForeground(QColor("#7ea0d4"))
            self.mod_list.addItem(item)
        self._update_regex_preview()

    def _selected_mod_id(self) -> Optional[str]:
        item = self.mod_list.currentItem()
        if not item:
            return None
        return str(item.data(Qt.ItemDataRole.UserRole))

    def _update_regex_preview(self) -> None:
        mod_id = self._selected_mod_id()
        if not mod_id:
            self.regex_label.setText("Regex: выберите мод в списке")
            return
        try:
            target = compile_target(
                self.db,
                mod_id,
                self.class_combo.currentText(),
                self._current_min_tier(),
            )
            self.regex_label.setText(f"Regex: {target.regex.pattern}")
        except Exception as exc:
            self.regex_label.setText(f"Regex: ошибка ({exc})")

    def _add_selected_mod(self) -> None:
        mod_id = self._selected_mod_id()
        if not mod_id:
            QMessageBox.information(self, "PoE Crafter", "Сначала выберите мод в списке.")
            return
        if any(row.get("id") == mod_id for row in self.settings.selected):
            QMessageBox.information(self, "PoE Crafter", "Этот мод уже в целях.")
            return
        if len(self.settings.selected) >= 2:
            QMessageBox.warning(self, "PoE Crafter", "Для синего предмета можно выбрать не больше 2 модов.")
            return
        self.settings.selected.append({"id": mod_id, "min_tier": self._current_min_tier()})
        self._refresh_selected()
        save_settings(self.settings)

    def _remove_selected_mod(self) -> None:
        row = self.selected_list.currentRow()
        if row < 0 or row >= len(self.settings.selected):
            return
        self.settings.selected.pop(row)
        self._refresh_selected()
        save_settings(self.settings)

    def _refresh_selected(self) -> None:
        self.selected_list.clear()
        item_class = self.class_combo.currentText()
        for row in self.settings.selected:
            try:
                target = compile_target(self.db, row["id"], item_class, row.get("min_tier"))
                self.selected_list.addItem(target.describe())
            except KeyError:
                self.selected_list.addItem(f"{row.get('id')} (нет в базе)")

    def _load_fields(self) -> None:
        idx = self.class_combo.findText(self.settings.item_class)
        if idx >= 0:
            self.class_combo.setCurrentIndex(idx)
        self.delay_edits["delay_after_move"].setText(str(self.settings.delay_after_move))
        self.delay_edits["delay_after_ctrl_c"].setText(str(self.settings.delay_after_ctrl_c))
        self.delay_edits["delay_after_click"].setText(str(self.settings.delay_after_click))
        self.delay_edits["delay_between"].setText(str(self.settings.delay_between))
        self.top_check.setChecked(self.settings.always_on_top)
        self.alt_swap_check.setChecked(self.settings.alt_key_swap)
        self.humanize_check.setChecked(self.settings.humanize)

    def _sync_fields(self) -> Optional[str]:
        self.settings.item_class = self.class_combo.currentText()
        self.settings.always_on_top = self.top_check.isChecked()
        self.settings.alt_key_swap = self.alt_swap_check.isChecked()
        self.settings.humanize = self.humanize_check.isChecked()
        try:
            self.settings.delay_after_move = float(self.delay_edits["delay_after_move"].text().replace(",", "."))
            self.settings.delay_after_ctrl_c = float(self.delay_edits["delay_after_ctrl_c"].text().replace(",", "."))
            self.settings.delay_after_click = float(self.delay_edits["delay_after_click"].text().replace(",", "."))
            self.settings.delay_between = float(self.delay_edits["delay_between"].text().replace(",", "."))
        except ValueError:
            return "Паузы должны быть числами."
        return None

    def _refresh_positions(self) -> None:
        for name, lbl in self.pos_labels.items():
            pos = self.settings.pos(name)
            lbl.setText(f"{pos[0]}, {pos[1]}" if pos else "не задано")

    def _open_pin(self, name: str) -> None:
        if self.runner.running:
            QMessageBox.information(self, "PoE Crafter", "Сначала остановите крафт (F9).")
            return
        titles = {
            "item": "Предмет",
            "alteration": "Сфера перемен",
            "augmentation": "Сфера усиления",
        }
        existing = self._pins.get(name)
        if existing is not None and existing.isVisible():
            existing.raise_()
            existing.activateWindow()
            return
        pin = PositionPin(name, titles.get(name, name))
        pin.confirmed.connect(self._on_pin_confirmed)
        saved = self.settings.pos(name)
        if saved:
            pin.place_aim_at(*saved)
        else:
            screen = self.screen().availableGeometry().center()
            pin.place_aim_at(screen.x(), screen.y())
        pin.show()
        pin.raise_()
        self._pins[name] = pin
        self.capture_hint.setText(f"Перетащите пин «{titles.get(name, name)}» на цель.")

    def _on_pin_confirmed(self, slot: str, x: int, y: int) -> None:
        self.runner.save_point_at(slot, x, y)
        self._refresh_positions()
        self.capture_hint.setText(f"Позиция записана: {x}, {y}")

    def _start_capture(self, name: str) -> None:
        self._open_pin(name)

    def _compiled_targets(self):
        item_class = self.class_combo.currentText()
        targets = []
        for row in self.settings.selected:
            targets.append(compile_target(self.db, row["id"], item_class, row.get("min_tier")))
        return targets

    def _on_start(self) -> None:
        err = self._sync_fields()
        if err:
            QMessageBox.warning(self, "PoE Crafter", err)
            return
        try:
            targets = self._compiled_targets()
        except KeyError as exc:
            QMessageBox.warning(self, "PoE Crafter", str(exc))
            return
        err = self.runner.start(targets, self.class_combo.currentText())
        if err:
            QMessageBox.warning(self, "PoE Crafter", err)
            return
        self._set_status("Работает", "run")

    def _on_stop(self) -> None:
        self.runner.stop()

    def _on_peek(self) -> None:
        if self._sync_fields():
            return
        if not self.settings.pos("item"):
            QMessageBox.warning(self, "PoE Crafter", "Сначала запишите позицию предмета.")
            return
        self._enqueue_log("[тест] Копирую предмет… переключитесь в PoE.")
        QTimer.singleShot(400, self._do_peek)

    def _do_peek(self) -> None:
        text = self.runner.peek_item()
        if text is None:
            self._enqueue_log("[тест] Нет позиции предмета.")
            return
        lines = parse_explicit_mods(text)
        self._enqueue_log("[тест] моды: " + (str(lines) if lines else "(не разобраны)"))
        try:
            targets = self._compiled_targets()
            for target, ok in zip(targets, match_targets(lines, targets)):
                self._enqueue_log(f"[тест] {target.name}: {'совпало' if ok else 'нет'}")
        except Exception as exc:
            self._enqueue_log(f"[тест] {exc}")
        preview = (text[:400] + "…") if len(text) > 400 else text
        if preview.strip():
            self._enqueue_log("[тест] фрагмент буфера:\n" + preview.strip())

    def _toggle_top(self, checked: bool) -> None:
        self.settings.always_on_top = checked
        self._set_always_on_top(checked)
        save_settings(self.settings)

    def _set_always_on_top(self, value: bool) -> None:
        self.setWindowFlag(Qt.WindowType.WindowStaysOnTopHint, value)
        if self.isVisible():
            self.show()

    def _set_status(self, text: str, mode: str) -> None:
        self.status_label.setText(text)
        names = {"idle": "statusIdle", "run": "statusRun", "ok": "statusOk"}
        self.status_label.setObjectName(names.get(mode, "statusIdle"))
        self.status_label.style().unpolish(self.status_label)
        self.status_label.style().polish(self.status_label)

    def _enqueue_log(self, message: str) -> None:
        self.log_queue.put(message)

    def _pump_log(self) -> None:
        try:
            while True:
                msg = self.log_queue.get_nowait()
                self.log_text.append(msg)
                self.log_text.moveCursor(QTextCursor.MoveOperation.End)
        except queue.Empty:
            pass

    def _tick_stats(self) -> None:
        s = self.runner.stats
        self.stat_alt.setText(str(s.alts))
        self.stat_aug.setText(str(s.augs))
        self.stat_copy.setText(str(s.copies))
        if self.runner.running:
            self.stat_time.setText(f"{s.elapsed():.0f}с")
            self._set_status("Работает", "run")
        elif s.finished:
            self.stat_time.setText(f"{s.elapsed():.0f}с")

    def _on_craft_finished(self) -> None:
        def apply() -> None:
            if self.runner.stats.success:
                self._set_status("Мод найден — остановлен", "ok")
            else:
                self._set_status("Остановлен", "idle")

        QTimer.singleShot(0, apply)

    def _start_hotkeys(self) -> None:
        def on_press(key) -> None:
            try:
                if key == keyboard.Key.f6:
                    self.sig_save.emit("item")
                elif key == keyboard.Key.f7:
                    self.sig_save.emit("alteration")
                elif key == keyboard.Key.f8:
                    self.sig_start.emit()
                elif key == keyboard.Key.f9:
                    self.sig_stop.emit()
                elif key == keyboard.Key.f10:
                    self.sig_save.emit("augmentation")
            except Exception as exc:
                self._enqueue_log(f"[клавиша] {exc}")

        self._hotkeys = keyboard.Listener(on_press=on_press)
        self._hotkeys.daemon = True
        self._hotkeys.start()

    def _hotkey_save(self, name: str) -> None:
        self._open_pin(name)

    def closeEvent(self, event) -> None:  # noqa: N802
        self._sync_fields()
        save_settings(self.settings)
        self.runner.stop()
        for pin in self._pins.values():
            pin.close()
        if self._hotkeys:
            self._hotkeys.stop()
        event.accept()


def main() -> None:
    app = QApplication(sys.argv)
    app.setStyleSheet(STYLESHEET)
    win = MainWindow()
    win.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
