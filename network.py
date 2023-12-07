import networkx as nx
from read_data import read_data
import matplotlib.pyplot as plt


data = read_data("data/soc-redditHyperlinks-body.tsv")

G = nx.Graph()


G.add_nodes_from([2, 3])
G.add_nodes_from([2, 1])
G.add_nodes_from([1, 3])


G = nx.petersen_graph()

subax1 = plt.subplot(121)

nx.draw(G, with_labels=True, font_weight="bold", ax=subax1)

subax2 = plt.subplot(122)

nx.draw_shell(G, nlist=[range(5, 10), range(5)], with_labels=True, font_weight="bold")
plt.show()
