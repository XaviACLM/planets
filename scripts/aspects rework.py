from enum import Enum

class Node(Enum):
    SUN = 1
    MOON = 2
    MERCURY = 3
    MARS = 4
    SATURN = 5
    JUPITER = 6
    NEPTUNE = 7
    URANUS = 8
    VENUS = 9
    PLUTO = 10
    ERIS = 11
    HAUMEA = 12
    MAKEMAKE = 13
    VESTA = 26
    CERES = 27
    CHIRON = 28
    VARUNA = 29
    IXION = 30

    KRONOS = 14
    ZEUS = 15
    ADMETOS = 16
    CUPIDO = 17
    VULCANUS = 15
    HADES = 23
    APOLLON = 24
    POSEIDON = 25

    ASCENDANT = 16
    DESCENDANT = 17
    MIDHEAVEN = 18
    IMUM_COELI = 19
    PART_OF_FORTUNE = 20
    VERTEX = 21
    ANTIVERTEX = 22

class NodeType(Enum):
    PHYSICAL = 1
    POINT = 2
    HYPOTHETICAL = 3










from matplotlib import pyplot as plt
import math

for x in range(100):
    x = x/100*2*math.pi
    plt.scatter(math.cos(x), math.sin(x))

import random
random.seed(415)
node_positions = {node:random.uniform(0,2*math.pi) for node in Node}

def draw_aspect(aspect, **kwargs):
    ordered_nodes = aspect.nodes[aspect.basis_node_idx:]+aspect.nodes[:aspect.basis_node_idx]
    xs = [math.cos(node_positions[node]) for node in ordered_nodes]
    ys = [math.sin(node_positions[node]) for node in ordered_nodes]
    plt.scatter(xs[0], ys[0], **kwargs)
    plt.plot(xs, ys, **kwargs)











from typing import List, Dict, Optional
from dataclasses import dataclass
import math

class AspectKind(Enum):
    CONJUNCTION = 1 # 0
    OPPOSITION = 2 # 1/2
    TRINE = 3 # 1/3
    SQUARE = 4 # 1/4
    SEXTILE = 6 # 1/6
    PARALLEL = 30 # same eq. latitude
    CONTRAPARALLEL = 31 # opposite eq. latitude

    VIGINTILE = 10 # 1/20
    SEMISEXTILE = 11 # 1/12
    UNDECILE = 12 # 1/11
    DECILE = 13 # 1/10
    NOVILE = 14 # 1/9
    SEMI_SQUARE = 15 # 1/8
    SEPTILE = 16 # 1/7
    QUINTILE = 17 # 1/5
    BINOVILE = 18 # 2/9
    BISEPTILE = 19 # 2/7
    TREDECILE = 20 # 3/10
    SESQUIQUADRATE = 21 # 3/8
    BIQUINTILE = 22 # 2/5
    QUINCUNX = 23 # 5/12
    TRISEPTILE = 24 # 3/7
    QUADRANOVILE = 25 # 4/9

    GRAND_TRINE = 7 # 3 in trines
    GRAND_SQUARE = 8 # 4 in consecutive squares
    GRAND_SEXTILE = 9 # 6 in consecutive sextiles
    T_SQUARE = 26 # a square missing one noded
    MYSTIC_RECTANGLE = 27 # grand sextile missing two opposed nodes
    FINGER_OF_YOD = 28 # two nodes in sextile are quincunx a third
    KITE = 29 # grand sextile missing nodes 1 and 3



class Aspect: # might be good for this to be a dataclass somehow
    def __init__(self, kind: AspectKind, nodes: List[Node], basis_node_idx: Optional[int] = None, error: Optional[float] = None):
        self.kind = kind
        self.nodes = nodes
        self.basis_node_idx = basis_node_idx
        self.error = error

# nodes are always ordered increasingly by their position 0-2pi
# basis node is only present for non-regular grand aspects (t-square, rectangle, yod, kite)
# it specifies an index at which we can start reading the node list (with wraparound) and be sure that the nodes come in a certain order w.r.t. the aspect's structure
# for t-square, this means the inter-node angles will be 90, 90 (180)
# for rectangle, 60, 120, 60, (120)
# for yod, 30, 165 (165)
# for kite, 120, 60, 60, (120)

def ensure_correct_ordering_in_aspect(aspect: Aspect, node_positions: Dict[Node, float]) -> None:
    if aspect.basis_node_idx is None:
        aspect.nodes = tuple(sorted(aspect.nodes, key=node_positions.__getitem__))
    else:
        nodes_alt = [[node, False] for node in aspect.nodes]
        nodes_alt[aspect.basis_node_idx][1] = True
        nodes_alt.sort(key=lambda item:node_positions[item[0]])
        aspect.nodes = [node for node,_ in nodes_alt]
        for idx,(node, is_basis) in enumerate(nodes_alt):
            if is_basis:
                aspect.basis_node_idx = idx
                return
        
def ensure_correct_ordering_in_aspect_list(aspect_list: List[Aspect], node_positions: Dict[Node, float]) -> None:
    for aspect in aspect_list:
        ensure_correct_ordering_in_aspect(aspect, node_positions)

def subaspects_of(aspect: Aspect, node_positions: Dict[Node, float]):
    n = aspect.nodes
    if len(n) == 2:
        return []
    i = aspect.basis_node_idx
    match aspect.kind:
        case AspectKind.GRAND_TRINE:
            n1, n2, n3 = n
            return [
                Aspect(AspectKind.TRINE, (n1, n2)),
                Aspect(AspectKind.TRINE, (n2, n3)),
                Aspect(AspectKind.TRINE, (n1, n3)),
            ]
        case AspectKind.GRAND_SQUARE:
            n1, n2, n3, n4 = n
            return [
                Aspect(AspectKind.SQUARE, (n1, n2)),
                Aspect(AspectKind.SQUARE, (n2, n3)),
                Aspect(AspectKind.SQUARE, (n3, n4)),
                Aspect(AspectKind.SQUARE, (n1, n4)),
                Aspect(AspectKind.OPPOSITION, (n1, n3)),
                Aspect(AspectKind.OPPOSITION, (n2, n4)),
                Aspect(AspectKind.T_SQUARE, (n1, n2, n3), basis_node_idx=0),
                Aspect(AspectKind.T_SQUARE, (n2, n3, n4), basis_node_idx=0),
                Aspect(AspectKind.T_SQUARE, (n1, n3, n4), basis_node_idx=1),
                Aspect(AspectKind.T_SQUARE, (n1, n2, n4), basis_node_idx=2),
            ]
        case AspectKind.GRAND_SEXTILE:
            n1, n2, n3, n4, n5, n6 = n
            return [
                Aspect(AspectKind.SQUARE, (n1, n2)),
                Aspect(AspectKind.SQUARE, (n2, n3)),
                Aspect(AspectKind.SQUARE, (n3, n4)),
                Aspect(AspectKind.SQUARE, (n4, n5)),
                Aspect(AspectKind.SQUARE, (n5, n6)),
                Aspect(AspectKind.SQUARE, (n1, n6)),
                Aspect(AspectKind.TRINE, (n1, n3)),
                Aspect(AspectKind.TRINE, (n3, n5)),
                Aspect(AspectKind.TRINE, (n1, n5)),
                Aspect(AspectKind.TRINE, (n2, n4)),
                Aspect(AspectKind.TRINE, (n4, n6)),
                Aspect(AspectKind.TRINE, (n2, n6)),
                Aspect(AspectKind.OPPOSITION, (n1, n4)),
                Aspect(AspectKind.OPPOSITION, (n2, n5)),
                Aspect(AspectKind.OPPOSITION, (n3, n6)),
                Aspect(AspectKind.GRAND_TRINE, (n1, n3, n5)),
                Aspect(AspectKind.GRAND_TRINE, (n2, n4, n6)),
                Aspect(AspectKind.MYSTIC_RECTANGLE, (n1, n2, n4, n5), basis_node_idx=0),
                Aspect(AspectKind.MYSTIC_RECTANGLE, (n2, n3, n5, n6), basis_node_idx=0),
                Aspect(AspectKind.MYSTIC_RECTANGLE, (n1, n3, n4, n6), basis_node_idx=1),
                Aspect(AspectKind.KITE, (n1, n3, n4, n5), basis_node_idx=0),
                Aspect(AspectKind.KITE, (n2, n4, n5, n6), basis_node_idx=0),
                Aspect(AspectKind.KITE, (n1, n3, n5, n6), basis_node_idx=1),
                Aspect(AspectKind.KITE, (n1, n2, n4, n6), basis_node_idx=2),
                Aspect(AspectKind.KITE, (n1, n2, n3, n5), basis_node_idx=3),
                Aspect(AspectKind.KITE, (n2, n3, n4, n6), basis_node_idx=3),
            ]
        case AspectKind.T_SQUARE:
            n1, n2, n3 = n[i:]+n[:i]
            subaspects = [
                Aspect(AspectKind.SQUARE, (n1, n2)),
                Aspect(AspectKind.SQUARE, (n2, n3)),
                Aspect(AspectKind.OPPOSITION, (n1, n3)),
            ]
            ensure_correct_ordering_in_aspect_list(subaspects, node_positions)
            return subaspects
        case AspectKind.MYSTIC_RECTANGLE:
            n1, n2, n3, n4 = n[i:]+n[:i]
            subaspects = [
                Aspect(AspectKind.SEXTILE, (n1, n2)),
                Aspect(AspectKind.TRINE, (n2, n3)),
                Aspect(AspectKind.SEXTILE, (n3, n4)),
                Aspect(AspectKind.TRINE, (n1, n4)),
                Aspect(AspectKind.OPPOSITION, (n1, n3)),
                Aspect(AspectKind.OPPOSITION, (n2, n4)),
            ]
            ensure_correct_ordering_in_aspect_list(subaspects, node_positions)
            return subaspects
        case AspectKind.FINGER_OF_YOD:
            n1, n2, n3 = n[i:]+n[:i]
            subaspects = [
                Aspect(AspectKind.SEXTILE, (n1, n2)),
                Aspect(AspectKind.QUINCUNX, (n2, n3)),
                Aspect(AspectKind.QUINCUNX, (n1, n3)),
            ]
            ensure_correct_ordering_in_aspect_list(subaspects, node_positions)
            return subaspects
        case AspectKind.KITE:
            n1, n2, n3, n4 = n[i:]+n[:i]
            subaspects = [
                Aspect(AspectKind.TRINE, (n1, n2)),
                Aspect(AspectKind.OPPOSITION, (n1, n3)),
                Aspect(AspectKind.TRINE, (n1, n4)),
                Aspect(AspectKind.SEXTILE, (n2, n3)),
                Aspect(AspectKind.TRINE, (n2, n4)),
                Aspect(AspectKind.SEXTILE, (n3, n4)),
                Aspect(AspectKind.GRAND_TRINE, (n1, n2, n4)),
            ]
            ensure_correct_ordering_in_aspect_list(subaspects, node_positions)
            return subaspects
            
TAU = 2*math.pi

# this function is actually in util.ts
def angle_distance(a1, a2):
    d = abs(a1-a2)
    return min(d, TAU-d)

# this function is actually in util.ts
def sawtooth_sine(a):
    if a<math.pi/2:
        return a
    if a<math.pi*3/2:
        return math.pi-a
    return a-2*math.pi

class AspectGroup:
    def __init__(self):
        self.aspects = dict()

    @staticmethod
    def _key(aspect):
        # technically doesn't guarantee equality, but works for any reasonable max error value
        return (aspect.kind, *aspect.nodes)
    
    def insert(self, aspect: Aspect):
        key = self._key(aspect)
        present_aspect = self.aspects.get(key, None)
        if (present_aspect is None) or (present_aspect.error is None) or (present_aspect.error > aspect.error):
            self.aspects[key] = aspect
            
    def contains(self, aspect: Aspect):
        return self._key(aspect) in self.aspects

def find_aspects(
    node_positions: Dict[Node, float],
    max_error_per_node: float = 0.01,
) -> List[Aspect]: # todo just do max error as a multiple of the total amt of nodes

    # should be unnecessary, but let's make sure
    for node, position in node_positions.items():
        node_positions[node] = position%TAU

    # canonical ordering during search
    ordered_nodes = sorted(node_positions.keys(), key=node_positions.__getitem__)

    aspects = AspectGroup() # holds every aspect we find
    subaspects = dict() # maps every aspect to its subaspects
    excluded_aspects = AspectGroup() # holds every subaspect of an aspect we've found, to avoid reintroduction

    # we start with the grands, in a reverse topological order of inclusion
    # grand sextile, kite, grand square, finger of yod, mystic rectangle, t-square, grand trine
    # populate and use aspects, subaspects, and excluded_aspects during search
    for kind, angles, requires_basis in [
        (AspectKind.GRAND_SEXTILE, (1/6, 2/6, 3/6, 4/6, 5/6), False),
        (AspectKind.KITE, (2/6, 3/6, 4/6), True),
        (AspectKind.GRAND_SQUARE, (1/4, 2/4, 3/4), False),
        (AspectKind.FINGER_OF_YOD, (2/12, 7/12), True),
        (AspectKind.MYSTIC_RECTANGLE, (1/6, 3/6, 4/6), True),
        (AspectKind.T_SQUARE, (1/4, 2/4), True),
        (AspectKind.GRAND_TRINE, (1/3, 2/3), False),
    ]:

        angles = [angle*TAU for angle in angles]
        num_vertices = len(angles)+1
        
        for basis_node in ordered_nodes:
            basis_position = node_positions[basis_node]
            # node_error[vertex_idx][node] = how far away node at idx is from the required position to be the vertex-idx-th vertex of the aspect
            node_error = [{node: abs(angle_distance(basis_position, node_positions[node])-angle) for node in ordered_nodes} for angle in angles]
            node_error = [{node: abs(((node_positions[node] - basis_position)%TAU)-angle) for node in ordered_nodes} for angle in angles]
            # remove everything above max error
            node_error = [{node:error for node, error in vertex_error.items() if error<num_vertices*max_error_per_node} for vertex_error in node_error]

            aspects_on_basis = []
            # complicated search time. dfs but exhaustive and with error
            def search(current_nodes, current_error, depth):
                if current_error >= num_vertices*max_error_per_node:
                    return
                if depth + 1 == num_vertices:
                    # we could make things complicated here to ensure correct node ordering
                    # but we don't. we'll just reorder these later.
                    # for now, all we do is point at the basis idx if necessary
                    aspects_on_basis.append(Aspect(kind, current_nodes, basis_node_idx=0 if requires_basis else None,error=current_error))
                    return
                for node, local_error in node_error[depth].items():
                    search(current_nodes+(node,), current_error+local_error, depth+1)

            # do search
            search((basis_node,), 0, 0)

            # ensure correct ordering
            ensure_correct_ordering_in_aspect_list(aspects_on_basis, node_positions)

            # upddate aspects, excluded_aspects, subaspects
            for aspect in aspects_on_basis:
                if excluded_aspects.contains(aspect):
                    continue
                aspects.insert(aspect)
                subaspects[aspect] = subaspects_of(aspect, node_positions)
                for subaspect in subaspects[aspect]:
                    excluded_aspects.insert(subaspect)
    
    # then the binary aspects. just do pairwise
    for idx, n1 in enumerate(ordered_nodes):
        for n2 in ordered_nodes[idx+1:]:
            p1, p2 = node_positions[n1], node_positions[n2]
            d = angle_distance(p1, p2)

            # standard binary aspects
            for target, kind in [
                (0 , AspectKind.CONJUNCTION),
                (1/2 , AspectKind.OPPOSITION),
                (1/3 , AspectKind.TRINE),
                (1/4 , AspectKind.SQUARE),
                (1/6 , AspectKind.SEXTILE),
                (1/20 , AspectKind.VIGINTILE),
                (1/12 , AspectKind.SEMISEXTILE),
                (1/11 , AspectKind.UNDECILE),
                (1/10 , AspectKind.DECILE),
                (1/9 , AspectKind.NOVILE),
                (1/8 , AspectKind.SEMI_SQUARE),
                (1/7 , AspectKind.SEPTILE),
                (1/5 , AspectKind.QUINTILE),
                (2/9 , AspectKind.BINOVILE),
                (2/7 , AspectKind.BISEPTILE),
                (3/10 , AspectKind.TREDECILE),
                (3/8 , AspectKind.SESQUIQUADRATE),
                (2/5 , AspectKind.BIQUINTILE),
                (5/12 , AspectKind.QUINCUNX),
                (3/7 , AspectKind.TRISEPTILE),
                (4/9 , AspectKind.QUADRANOVILE),
            ]:
                error = abs(d - target*TAU)
                if error < 2*max_error_per_node:
                    aspect = Aspect(kind, (n1, n2), error=error)
                    if not excluded_aspects.contains(aspect):
                        aspects.insert(aspect)

            # paralells / contraparallels: skip if conjunct
            if d < 2*max_error_per_node:
                continue
            # otherwise do the usual sawtooth approach
            s1, s2 = sawtooth_sine(p1), sawtooth_sine(p2)
            error = abs(s1-s2)
            if error < 2*max_error_per_node:
                aspect = Aspect(AspectKind.PARALLEL, (n1, n2), error=error)
                if not excluded_aspects.contains(aspect):
                    aspects.insert(aspect)
            error = abs(s1+s2)
            if error < 2*max_error_per_node:
                aspect = Aspect(AspectKind.CONTRAPARALLEL, (n1, n2), error=error)
                if not excluded_aspects.contains(aspect):
                    aspects.insert(aspect)

    return list(aspects.aspects.values()), subaspects

# TODO ensure everything (subaspects) has a computed error

# symbols: like in wikipedia, but for grands we fill them in
# some funny business about how to draw grands : you want all the inner lines so it doesn't look like you're missing anything, but mouseover highlight should only highlight a few of them
# it'll be fine to find all possible aspects and later go through them



aspects, subaspects = find_aspects(node_positions)

for aspect in aspects:
    if len(aspect.nodes)>2:
        print(aspect.kind, aspect.nodes, aspect.error, aspect.basis_node_idx)
        for subaspect in subaspects[aspect]:
            print("\t",subaspect.kind, subaspect.nodes)
    else:
        print(aspect.kind, aspect.nodes, aspect.error, aspect.basis_node_idx)
    continue
    ordered_nodes = aspect.nodes[aspect.basis_node_idx:]+aspect.nodes[:aspect.basis_node_idx]
    for node in ordered_nodes:
        print(node, node_positions[node])
    draw_aspect(aspect)
plt.show()
