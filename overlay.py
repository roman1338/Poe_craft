"""Маленькое перетаскиваемое окно-пин для записи экранной позиции."""

from __future__ import annotations

from PyQt6.QtCore import QPoint, Qt, pyqtSignal
from PyQt6.QtGui import QColor, QFont, QMouseEvent, QPainter, QPen
from PyQt6.QtWidgets import QHBoxLayout, QLabel, QPushButton, QVBoxLayout, QWidget

PIN_W, PIN_H = 168, 72
# Точка прицеливания — центр кружка относительно окна.
DOT_X, DOT_Y = 22, 28


class PositionPin(QWidget):
    """Окно с точкой: перетащите на предмет/сферу и нажмите «Готово»."""

    confirmed = pyqtSignal(str, int, int)

    def __init__(self, slot: str, title: str, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.slot = slot
        self._drag: QPoint | None = None
        self.setWindowFlags(
            Qt.WindowType.Tool
            | Qt.WindowType.FramelessWindowHint
            | Qt.WindowType.WindowStaysOnTopHint
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, False)
        self.setFixedSize(PIN_W, PIN_H)
        self.setStyleSheet(
            "QWidget { background: #1e1a24; color: #efe8d8; border: 1px solid #d4b45a; }"
            "QLabel { border: none; background: transparent; }"
            "QPushButton { background: #5a4a22; color: #ffe7a0; border: 1px solid #d4b45a;"
            " padding: 4px 8px; border-radius: 3px; }"
        )

        col = QVBoxLayout(self)
        col.setContentsMargins(44, 8, 8, 8)
        name = QLabel(title)
        name.setFont(QFont("Segoe UI Semibold", 10))
        col.addWidget(name)
        row = QHBoxLayout()
        done = QPushButton("Готово")
        done.clicked.connect(self._confirm)
        close_btn = QPushButton("✕")
        close_btn.setFixedWidth(28)
        close_btn.clicked.connect(self.close)
        row.addWidget(done)
        row.addWidget(close_btn)
        col.addLayout(row)

    def paintEvent(self, _event) -> None:  # noqa: N802
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        painter.setPen(QPen(QColor("#d4b45a"), 2))
        painter.setBrush(QColor("#d4b45a"))
        painter.drawEllipse(QPoint(DOT_X, DOT_Y), 7, 7)
        painter.setPen(QPen(QColor("#16141c"), 2))
        painter.drawLine(DOT_X - 10, DOT_Y, DOT_X + 10, DOT_Y)
        painter.drawLine(DOT_X, DOT_Y - 10, DOT_X, DOT_Y + 10)

    def mousePressEvent(self, event: QMouseEvent) -> None:  # noqa: N802
        if event.button() == Qt.MouseButton.LeftButton:
            self._drag = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()

    def mouseMoveEvent(self, event: QMouseEvent) -> None:  # noqa: N802
        if self._drag is not None and event.buttons() & Qt.MouseButton.LeftButton:
            self.move(event.globalPosition().toPoint() - self._drag)
            event.accept()

    def mouseReleaseEvent(self, event: QMouseEvent) -> None:  # noqa: N802
        self._drag = None
        event.accept()

    def aim_global(self) -> tuple[int, int]:
        """Экранные координаты центра точки."""
        pt = self.mapToGlobal(QPoint(DOT_X, DOT_Y))
        return int(pt.x()), int(pt.y())

    def place_aim_at(self, x: int, y: int) -> None:
        """Поставить окно так, чтобы точка совпала с (x, y)."""
        self.move(x - DOT_X, y - DOT_Y)

    def _confirm(self) -> None:
        gx, gy = self.aim_global()
        self.confirmed.emit(self.slot, gx, gy)
        self.close()
