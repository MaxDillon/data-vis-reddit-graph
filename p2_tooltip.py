from selectable_plot_tooltip import SelectableGraph
from widgets import DropdownWidget
from PyQt6.QtCore import pyqtSlot

from PyQt6 import QtWidgets
from PyQt6.QtWidgets import QHBoxLayout, QWidget, QVBoxLayout, QPushButton
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
import sys


class MplCanvas(FigureCanvas):
    def __init__(self, plot: SelectableGraph):
        self.plot = plot
        super(MplCanvas, self).__init__(self.plot.fig)


def donothing(str):
    pass


class MainWindow(QtWidgets.QMainWindow):
    def __init__(self, *args, **kwargs):
        super(MainWindow, self).__init__(*args, **kwargs)

        self.resize(1000, 800)

        central_widget = QWidget(self)
        self.setCentralWidget(central_widget)

        layout = QVBoxLayout(central_widget)

        self.graph = SelectableGraph()
        canvas = MplCanvas(self.graph)

        self.graph.hook(post_hook=canvas.draw)

        layout.addWidget(canvas)

        button = QPushButton("Click Me!")
        button.setCheckable(True)
        button.clicked.connect(self.on_click)
        layout.addWidget(button)

        self.show()

    def on_click(self):
        print("button was clicked")
        self.graph.reset_view()


app = QtWidgets.QApplication(sys.argv)
w = MainWindow()
app.exec()
