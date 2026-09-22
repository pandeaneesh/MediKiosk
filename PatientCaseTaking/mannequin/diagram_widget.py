"""
Interactive Companion Diagram Panel
Displays modern 2-line anatomical quadrant cards with crisp titles and clinical subtitles.
"""

from PySide6.QtWidgets import (
    QFrame, QVBoxLayout, QHBoxLayout, QPushButton, QLabel, QWidget, QGridLayout
)
from PySide6.QtCore import Qt, Signal
from mannequin.config import REGIONAL_DIAGRAMS, DARK_PANEL_STYLE


class QuadrantCard(QFrame):
    clicked = Signal(dict)

    def __init__(self, title, subtitle, data, parent=None):
        super().__init__(parent)
        self.data = data
        self.is_active = False
        self.setCursor(Qt.PointingHandCursor)
        self.setMinimumHeight(76)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(14, 12, 14, 12)
        layout.setSpacing(4)
        layout.setAlignment(Qt.AlignCenter)

        self.lbl_title = QLabel(title)
        self.lbl_title.setAlignment(Qt.AlignCenter)
        self.lbl_title.setWordWrap(True)

        self.lbl_sub = QLabel(subtitle)
        self.lbl_sub.setAlignment(Qt.AlignCenter)
        self.lbl_sub.setWordWrap(True)

        layout.addWidget(self.lbl_title)
        layout.addWidget(self.lbl_sub)
        self.set_inactive()

    def set_inactive(self):
        self.is_active = False
        self.setStyleSheet("""
            QFrame {
                background-color: #FFFFFF;
                border: 2px solid #E2E8F0;
                border-radius: 14px;
            }
            QFrame:hover {
                background-color: #EFF6FF;
                border: 2px solid #2563EB;
            }
        """)
        self.lbl_title.setStyleSheet("color: #0F172A; font-size: 15px; font-weight: 800; background: transparent; border: none;")
        self.lbl_sub.setStyleSheet("color: #64748B; font-size: 13px; font-weight: 600; background: transparent; border: none;")

    def set_active(self):
        self.is_active = True
        self.setStyleSheet("""
            QFrame {
                background-color: #DBEAFE;
                border: 3px solid #2563EB;
                border-radius: 14px;
            }
        """)
        self.lbl_title.setStyleSheet("color: #1E40AF; font-size: 15px; font-weight: 800; background: transparent; border: none;")
        self.lbl_sub.setStyleSheet("color: #2563EB; font-size: 13px; font-weight: 700; background: transparent; border: none;")

    def enterEvent(self, event):
        if not self.is_active:
            self.lbl_title.setStyleSheet("color: #2563EB; font-size: 15px; font-weight: 800; background: transparent; border: none;")
            self.lbl_sub.setStyleSheet("color: #1D4ED8; font-size: 13px; font-weight: 700; background: transparent; border: none;")
        super().enterEvent(event)

    def leaveEvent(self, event):
        if not self.is_active:
            self.lbl_title.setStyleSheet("color: #0F172A; font-size: 15px; font-weight: 800; background: transparent; border: none;")
            self.lbl_sub.setStyleSheet("color: #64748B; font-size: 13px; font-weight: 600; background: transparent; border: none;")
        super().leaveEvent(event)

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.clicked.emit(self.data)
        super().mousePressEvent(event)


class RegionalDiagramWidget(QFrame):
    quadrant_selected = Signal(dict)
    refocus_requested = Signal()
    confirmed = Signal(dict)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.active_cards = []
        self.current_selection = None
        self.init_ui()

    def init_ui(self):
        self.setStyleSheet(DARK_PANEL_STYLE)
        self.panel_layout = QVBoxLayout(self)
        self.panel_layout.setContentsMargins(22, 22, 22, 22)
        self.panel_layout.setSpacing(16)

        # -------------------------------------------------------------
        # State A: Default Placeholder (Elderly-Friendly Onboarding)
        # -------------------------------------------------------------
        self.placeholder = QWidget()
        ph_layout = QVBoxLayout(self.placeholder)
        ph_layout.setAlignment(Qt.AlignCenter)
        ph_layout.setSpacing(18)

        # Big Center Icon Badge
        icon_frame = QFrame()
        icon_frame.setFixedSize(84, 84)
        icon_frame.setStyleSheet("""
            QFrame {
                background-color: #EFF6FF;
                border: 2.5px solid #BFDBFE;
                border-radius: 42px;
            }
        """)
        ic_lay = QVBoxLayout(icon_frame)
        ic_lay.setContentsMargins(0, 0, 0, 0)
        icon = QLabel("📍")
        icon.setAlignment(Qt.AlignCenter)
        icon.setStyleSheet("font-size: 40px; background: transparent; border: none;")
        ic_lay.addWidget(icon)
        ph_layout.addWidget(icon_frame, alignment=Qt.AlignCenter)

        # Title & Clear Guidance Subtitle
        title_box = QVBoxLayout()
        title_box.setSpacing(4)
        title = QLabel("Where Does It Hurt?")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("color: #020617; font-size: 24px; font-weight: 800; letter-spacing: -0.4px;")
        title_box.addWidget(title)

        tagline = QLabel("EASY 3-STEP PAIN LOCATOR")
        tagline.setAlignment(Qt.AlignCenter)
        tagline.setStyleSheet("color: #2563EB; font-size: 12px; font-weight: 800; letter-spacing: 1.2px;")
        title_box.addWidget(tagline)
        ph_layout.addLayout(title_box)

        # High-Legibility Instructions Box
        steps_box = QFrame()
        steps_box.setStyleSheet("""
            QFrame {
                background-color: #F8FAFC;
                border: 1.5px solid #CBD5E1;
                border-radius: 14px;
                padding: 16px 20px;
            }
        """)
        steps_layout = QVBoxLayout(steps_box)
        steps_layout.setSpacing(12)

        step1 = QLabel("👉 <b>Step 1:</b> Tap the body on the left where you feel pain.")
        step1.setStyleSheet("color: #1E293B; font-size: 14px; background: transparent; border: none;")
        steps_layout.addWidget(step1)

        step2 = QLabel("👉 <b>Step 2:</b> Pick the matching area from the list.")
        step2.setStyleSheet("color: #1E293B; font-size: 14px; background: transparent; border: none;")
        steps_layout.addWidget(step2)

        step3 = QLabel("👉 <b>Step 3:</b> Press the green <b>Confirm Location</b> button.")
        step3.setStyleSheet("color: #1E293B; font-size: 14px; background: transparent; border: none;")
        steps_layout.addWidget(step3)

        ph_layout.addWidget(steps_box)
        self.panel_layout.addWidget(self.placeholder)

        # -------------------------------------------------------------
        # State B: Active Regional Diagram
        # -------------------------------------------------------------
        self.active_container = QWidget()
        self.active_layout = QVBoxLayout(self.active_container)
        self.active_layout.setContentsMargins(0, 0, 0, 0)
        self.active_layout.setSpacing(14)

        # Header with High-Contrast Tag
        head_box = QVBoxLayout()
        head_box.setSpacing(6)

        self.lbl_category = QLabel("● STEP 2: TAP YOUR EXACT PAIN SPOT")
        self.lbl_category.setStyleSheet("""
            background-color: #EFF6FF;
            color: #2563EB;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 1px;
            padding: 5px 12px;
            border-radius: 8px;
            border: 1.5px solid #BFDBFE;
        """)
        head_box.addWidget(self.lbl_category, alignment=Qt.AlignLeft)

        self.lbl_title = QLabel("ANATOMICAL DIAGRAM")
        self.lbl_title.setStyleSheet("color: #020617; font-size: 22px; font-weight: 800; letter-spacing: -0.3px;")
        head_box.addWidget(self.lbl_title)

        self.lbl_sub_hint = QLabel("Click or tap the box that best matches where you feel pain:")
        self.lbl_sub_hint.setStyleSheet("color: #64748B; font-size: 14px; font-weight: 600;")
        head_box.addWidget(self.lbl_sub_hint)

        self.active_layout.addLayout(head_box)

        # 2-Line Quadrant Grid with Generous Spacing
        self.grid_layout = QGridLayout()
        self.grid_layout.setSpacing(12)
        self.active_layout.addLayout(self.grid_layout)

        # -------------------------------------------------------------
        # Large High-Visibility Confirmation Card
        # -------------------------------------------------------------
        self.confirm_card = QFrame()
        self.confirm_card.setStyleSheet("""
            QFrame {
                background-color: #F0FDF4;
                border: 2px solid #86EFAC;
                border-radius: 16px;
                padding: 16px 20px;
            }
        """)
        c_layout = QVBoxLayout(self.confirm_card)
        c_layout.setSpacing(10)

        self.lbl_selected_title = QLabel("📍 SELECTED LOCATION:")
        self.lbl_selected_title.setStyleSheet("color: #15803D; font-size: 13px; font-weight: 800; letter-spacing: 0.8px;")
        c_layout.addWidget(self.lbl_selected_title)

        self.lbl_selected_text = QLabel("Selected: None")
        self.lbl_selected_text.setStyleSheet("color: #14532D; font-size: 18px; font-weight: 800;")
        c_layout.addWidget(self.lbl_selected_text)

        btn_row = QHBoxLayout()
        btn_row.setSpacing(12)

        self.btn_refocus = QPushButton("🔍 Re-focus View")
        self.btn_refocus.setCursor(Qt.PointingHandCursor)
        self.btn_refocus.setStyleSheet("""
            QPushButton {
                background-color: #FFFFFF;
                color: #166534;
                font-size: 14px;
                font-weight: 700;
                padding: 12px 18px;
                border-radius: 10px;
                border: 2px solid #86EFAC;
            }
            QPushButton:hover {
                background-color: #DCFCE7;
                border-color: #22C55E;
            }
            QPushButton:pressed {
                background-color: #BBF7D0;
            }
        """)
        self.btn_refocus.clicked.connect(lambda: self.refocus_requested.emit())
        btn_row.addWidget(self.btn_refocus)

        self.btn_confirm = QPushButton("✔ Confirm Location")
        self.btn_confirm.setCursor(Qt.PointingHandCursor)
        self.btn_confirm.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #16A34A, stop:1 #22C55E);
                color: #FFFFFF;
                font-size: 15px;
                font-weight: 800;
                padding: 14px 26px;
                border-radius: 10px;
                border: none;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #15803D, stop:1 #16A34A);
            }
            QPushButton:pressed {
                background-color: #14532D;
            }
        """)
        self.btn_confirm.clicked.connect(self.on_confirm_clicked)
        btn_row.addWidget(self.btn_confirm)

        c_layout.addLayout(btn_row)
        self.confirm_card.setVisible(False)
        self.active_layout.addWidget(self.confirm_card)

        self.active_container.setVisible(False)
        self.panel_layout.addWidget(self.active_container)
        self.panel_layout.addStretch()

    def show_diagram(self, region_key: str):
        while self.grid_layout.count():
            item = self.grid_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        self.active_cards.clear()
        self.confirm_card.setVisible(False)
        self.current_selection = None

        diagram_data = REGIONAL_DIAGRAMS.get(region_key)
        if not diagram_data:
            return

        self.lbl_title.setText(diagram_data["title"])
        cols = diagram_data["cols"]

        for idx, (title, subtitle, data) in enumerate(diagram_data["quadrants"]):
            r, c = divmod(idx, cols)
            card = QuadrantCard(title, subtitle, data)
            card.clicked.connect(lambda d, c_ref=card: self.on_quadrant_clicked(d, c_ref))
            self.active_cards.append(card)
            self.grid_layout.addWidget(card, r, c)

        self.placeholder.setVisible(False)
        self.active_container.setVisible(True)

    def on_quadrant_clicked(self, data, clicked_card):
        for card in self.active_cards:
            card.set_inactive()
        clicked_card.set_active()

        self.current_selection = data
        self.lbl_selected_text.setText(f"{data['label']}")

        # Reset button state
        self.btn_confirm.setText("✔ Confirm Location")
        self.btn_confirm.setEnabled(True)
        self.btn_confirm.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #16A34A, stop:1 #22C55E);
                color: #FFFFFF;
                font-size: 15px;
                font-weight: 800;
                padding: 14px 26px;
                border-radius: 10px;
                border: none;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #15803D, stop:1 #16A34A);
            }
            QPushButton:pressed {
                background-color: #14532D;
            }
        """)

        self.confirm_card.setVisible(True)
        self.quadrant_selected.emit(data)

    def on_confirm_clicked(self):
        if self.current_selection:
            self.btn_confirm.setText("✔ Location Confirmed!")
            self.btn_confirm.setEnabled(False)
            self.btn_confirm.setStyleSheet("""
                QPushButton {
                    background-color: #DCFCE7;
                    color: #15803D;
                    font-size: 15px;
                    font-weight: 800;
                    padding: 14px 26px;
                    border-radius: 10px;
                    border: 2px solid #22C55E;
                }
            """)
            self.confirmed.emit(self.current_selection)

    def reset_view(self):
        self.current_selection = None
        self.active_container.setVisible(False)
        self.placeholder.setVisible(True)