from PyQt6 import QtCore, QtWidgets

from PyQt6.QtWidgets import QComboBox, QLabel
from typing import Callable
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from PyQt6.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget, QComboBox, QVBoxLayout
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas


def createLabelWidget(text):
    label = QtWidgets.QLabel(text)
    label.setFixedHeight(20)
    return label


def createDropdownWidget(options: list[str], handler, index=0):
    selectbox = QComboBox()
    
    selectbox.addItems(options)
    selectbox.setCurrentIndex(index)
    selectbox.setFixedWidth(220)

    selectbox.currentIndexChanged.connect(handler)

    return selectbox


class DropdownWidget(QtWidgets.QWidget):

    def __init__(self, label: str, options: list[str], handler: Callable[[str], any], index=0, *args, **kwargs) -> None:
        super(DropdownWidget, self).__init__(*args, **kwargs)
        self.handler = handler

        self.setFixedHeight(60)
        self.setFixedWidth(200)

        layout = QtWidgets.QHBoxLayout()
        self.setLayout(layout)

        self.labelbox = QtWidgets.QLabel(label)

        self.selectbox = QComboBox()
        self.selectbox.addItems(options)
        self.selectbox.setCurrentIndex(index)
        self.selectbox.currentIndexChanged.connect(self.call_handler)
        
        layout.addWidget(self.labelbox)
        layout.addWidget(self.selectbox)

    def call_handler(self):
        selected_option = self.selectbox.currentText()
        self.handler(selected_option)





