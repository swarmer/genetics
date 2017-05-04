# because everything is broken as always

import matplotlib
matplotlib.use('Agg')

from networkx.drawing.nx_agraph import graphviz_layout
import networkx
networkx.graphviz_layout = graphviz_layout
