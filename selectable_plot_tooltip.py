from __future__ import annotations
from pandas import DataFrame
import numpy as np
from read_data import get_posts, get_nodes_edges
import graphviz as gviz
from networkx.drawing.nx_agraph import graphviz_layout
from graph import Graph

import networkx as nx
import matplotlib.pyplot as plt

from matplotlib.widgets import RectangleSelector
from matplotlib.figure import Figure


class SelectableGraph:
    def __init__(self) -> None:
        self.prehook = None
        self.posthook = None

        self.fig = Figure()

        self.posts = get_posts().sample(2000)

        self.nodes, self.edges = get_nodes_edges(self.posts)

        self.edges["selected"] = True
        self.nodes["selected"] = True

        self.redraw()
        self.fig.tight_layout(pad=0)

    def hook(self, pre_hook=None, post_hook=None):
        self.prehook = pre_hook
        self.posthook = post_hook

    def onselect(self, eclick, erelease):
        x_start, x_end, y_start, y_end = self.rect_selector.extents

        new_items = []
        for node, position in self.graph.pos.items():
            x = position[0]
            y = position[1]

            if x >= x_start and x <= x_end and y >= y_start and y <= y_end:
                new_items.append(node)

        edge_criteria = (self.edges["source_r"].isin(new_items)) & (
            self.edges["target_r"].isin(new_items)
        )
        self.edges.loc[edge_criteria, "selected"] = True
        self.edges.loc[~edge_criteria, "selected"] = False

        node_criteria = self.nodes["reddit"].isin(new_items)
        self.nodes.loc[node_criteria, "selected"] = True
        self.nodes.loc[~node_criteria, "selected"] = False

        self.redraw()

    def redraw(self):
        if self.prehook:
            self.prehook()

        self.fig.clf()
        self.axis = self.fig.add_subplot(111)

        self.rect_selector = RectangleSelector(self.axis, self.onselect, button=[1])

        selected_edges = self.edges[self.edges["selected"] == True]
        selected_nodes = self.nodes[self.nodes["selected"] == True]

        self.graph = Graph(self.axis, selected_nodes, selected_edges)
        self.graph.draw()

        if self.posthook:
            self.posthook()

    def reset_view(self):
        self.edges["selected"] = True
        self.nodes["selected"] = True
        self.redraw()
