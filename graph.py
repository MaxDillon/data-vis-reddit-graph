import networkx as nx
import numpy as np


class Graph:
    def __init__(self, axis, nodes, edges) -> None:
        self.axis = axis
        self.nodes = nodes
        self.edges = edges

    def draw(self):
        G = nx.Graph()

        props = (
            {"weight": row["posts"] * 0.4, "color": row["color"]}
            for _, row in self.edges.iterrows()
        )
        G.add_edges_from(
            zip(self.edges["source_r"], self.edges["target_r"], props),
        )

        G.add_nodes_from(self.nodes["reddit"])

        width = np.array(list(nx.get_edge_attributes(G, "weight").values())) * 3
        print("start_layout")
        self.pos = nx.spring_layout(G, weight="weight", seed=440)
        print("end_layout")
        nx.draw(
            G,
            self.pos,
            ax=self.axis,
            with_labels=False,
            nodelist=self.nodes["reddit"],
            node_size=self.nodes["posts"] * 10,
            node_color=self.nodes["color"],
            edge_color=nx.get_edge_attributes(G, "color").values(),
            width=width,
        )
        pass
