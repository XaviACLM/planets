from math import sin, cos, pi
from typing import List
from itertools import permutations
from matplotlib import pyplot as plt
from random import uniform, randint

def distance(p1: float, p2: float) -> float:
    p1, p2 = sorted([p1%(2*pi), p2%(2*pi)])
    return min(p2-p1, 2*pi-(p2-p1))

def regular_arrangement(n: int, phase: float) -> List[float]:
    phase %= (2*pi/n)
    return [2*pi*i/n+phase for i in range(n)]

def random_arrangement(n: int) -> List[float]:
    return sorted([uniform(0,2*pi) for _ in range(n)])

def rotate_arrangement(a: List[float], phase: float) -> List[float]:
    return [(p+phase)%(2*pi) for p in a]

def draw(arrangement: List[float]):
    plt.plot(*zip(*[(cos(a), sin(a)) for a in arrangement]))
    plt.show()
    
def em_distance(a1: List[float], a2: List[float]) -> float:
    assert len(a1)==len(a2)
    return min((sum((distance(p1,p2) for (p1,p2) in zip(a1, pa2))) for pa2 in permutations(a2)))

#arrangements are always sorted (modulo cycle business)

def em_distance_from_basis(a1: List[float], a2: List[float], n: int):
    
    assert len(a1)==len(a2)==n

    return min((em_distance_with_known_basis(a1, a2, 0, i, n) for i in range(n)))
    

def em_distance_with_known_basis(a1: List[float], a2: List[float], i1:int, i2:int, n:int):

    # for certain uses yes, but not necessarily
    # assert abs(ai[i1]-a2[i2])<1e-10

    assert len(a1)==len(a2)==n

    d = 0
    for i in range(n):
        i1a, i2a = (i1+i)%n, (i2+i)%n
        d += distance(a1[i1a], a2[i2a])
    return d


"""
# test em_distance = em_distance_from_basis
c = 0
for _ in range(1000):
    n = randint(1,8)
    a1, a2 = random_arrangement(n), random_arrangement(n)
    d1 = em_distance(a1, a2)
    d2 = em_distance_from_basis(a1, a2, n)
    if abs(d1-d2)>1e-10:
        c += 1
print(c/1000)
"""

"""
# test that when an arrangement and a regular arrangement match at one point, em_distance == em_distance_with_known_basis at that point
# turns out that this isn't true.
# which is fine. what we really want to know is...
c = 0
for _ in range(100):
    n = randint(1,8)
    a = random_arrangement(n)
    i = randint(0, n-1)
    p = a[i]
    ri = int(p//(2*pi/n))
    ra = regular_arrangement(n, p)

    assert abs(a[i]-ra[ri])<1e-10

    d1 = em_distance(a, ra)
    d2 = em_distance_with_known_basis(a, ra, i, ri, n)
    if abs(d1-d2)>1e-10:
        c+=1
print(c/100)
"""

"""
# test that the minimum distance btw an arrangement and ANY regular arrangement (of the same cardinality)
# is achieved (at least) at a regular arrengement that has one point in common w/ the arrangement

# and in particular where in that arrangement the em distance is equal to the distance with basis at the overlap
# is the last part true? unsure. let's not test it /yet/.

# having skipped the last part. the first claim appears to be true only for odd values of n. really curious.
# let's investigate further. it was stupid to only do those graphs ealier for 7. check what 6 or 4 tell us.

# okay, nevermind, it _is_ true, but requires tolerance check for evens. okay, good! down below I leave the graphing code commented also.

def min_em_distance_to_regular_overlapping(a: List[float], n:int):
    assert len(a) == n

    phases = [p%(2*pi/n) for p in a]

    arrangement = regular_arrangement(n,0)

    ds = []
    for phase in phases:
        rotated_arrangement = rotate_arrangement(arrangement, phase)
        d = em_distance(a, rotated_arrangement)
        ds.append(d)

    return min(ds)

def min_em_distance_to_regular_bruteforce(a: List[float], n:int):
    assert len(a) == n

    arrangement = regular_arrangement(n,0)

    ds = []
    for i in range(100):
        phase = i/100*(2*pi/n)
        rotated_arrangement = rotate_arrangement(arrangement, phase)
        d = em_distance(a, rotated_arrangement)
        ds.append(d)

    return min(ds)

c = 0
for _ in range(100):
    n = randint(2,5)
    a = random_arrangement(n)
    d1 = min_em_distance_to_regular_overlapping(a, n)
    d2 = min_em_distance_to_regular_bruteforce(a, n)
    if d1 > d2 + 1e-10:
        c += 1
print(c)
print(jjsj)


n = 6
a = random_arrangement(n)
ra = regular_arrangement(n, 0)

ds = []
ps = []
for i in range(1000):
    phase = (i/1000)*(2*pi/n)
    rra = rotate_arrangement(ra, phase)
    d = em_distance(a, rra)
    ps.append(phase)
    ds.append(d)
        
mx, mn = max(ds), min(ds)

points_by_n = [p%(2*pi/n) for p in a]
for pbn in points_by_n:
    plt.plot((pbn,pbn),(mn,mx),c="r")

plt.plot(ps,ds)
plt.show()
"""

"""
# final test: same as above but the overlap distance uses the overlap as basis.
def min_em_distance_to_regular_overlapping(a: List[float], n:int):
    assert len(a) == n

    phases = [p%(2*pi/n) for p in a]

    arrangement = regular_arrangement(n,0)

    ds = []
    for phase in phases:
        rotated_arrangement = rotate_arrangement(arrangement, phase)
        d = em_distance(a, rotated_arrangement)
        ds.append(d)

    return min(ds)

def min_em_distance_to_regular_overlapping_with_basis(a: List[float], n:int):
    assert len(a) == n

    phases = [p%(2*pi/n) for p in a]

    arrangement = regular_arrangement(n,0)

    ds = []
    for i, phase in enumerate(phases):
        rotated_arrangement = rotate_arrangement(arrangement, phase)
        ri = int(a[i]//(2*pi/n))
        d = em_distance_with_known_basis(a, rotated_arrangement, i, ri, n)
        ds.append(d)

    return min(ds)

c = 0
for _ in range(1000):
    n = randint(2,5)
    a = random_arrangement(n)
    d1 = min_em_distance_to_regular_overlapping(a, n)
    d2 = min_em_distance_to_regular_overlapping_with_basis(a, n)
    if abs(d1 - d2) > 1e-10:
        c += 1
print(c)
"""

# right, that worked. so we know that we can compute the minimum em to a regular arrangement with:

def em_distance_with_known_basis(a1: List[float], a2: List[float], i1:int, i2:int, n:int) -> float:
    #print(n,i1,i2)
    #assert abs(a1[i1%n]-a2[i2%n])<1e-10
    assert len(a1)==len(a2)==n

    d = 0
    for i in range(n):
        i1a, i2a = (i1+i)%n, (i2+i)%n
        d += distance(a1[i1a], a2[i2a])
    return d

def min_em_distance_to_regular(arrangement: List[float], n:int) -> float:
    assert len(arrangement) == n

    distances = []
    for i,p in enumerate(arrangement):
        phase = p%(2*pi/n)
        rotated_arrangement = regular_arrangement(n, phase)
        ri = int(p//(2*pi/n))
        d = em_distance_with_known_basis(arrangement, rotated_arrangement, i, ri, n)
        distances.append(d)

    return min(distances)

"""
# let's work on the distributions now
amt_runs = 1000000
percentiles = dict()
for n in [2,3,4,6]:
    n_percentiles = dict()
    distances = []
    for _ in range(amt_runs):
        arrangement = random_arrangement(n)
        d = min_em_distance_to_regular(arrangement, n)
        distances.append(d)
    distances.sort(key=lambda x:-x)

    for exp in range(4):
        for p in range(1,10):
            p = 100-10**(2-exp) + p*10**(1-exp)
            n_percentiles[f"{p}"] = distances[int(p/100*amt_runs)]

    percentiles[f"{n}"] = n_percentiles
    
    plt.plot(distances)
print(percentiles)
plt.show()
"""

percentiles = {'2': {'10': 2.82492183405002, '20': 2.512041226571723, '30': 2.196411448548795, '40': 1.8833191534301896, '50': 1.569921378032447, '60': 1.2565291282897997, '70': 0.943533088305391, '80': 0.6289363773733934,
                     '90': 0.31426461359944025, '91': 0.28295033258869606, '92': 0.2515173548879527, '93': 0.2198807155608602, '94': 0.18836926606823035, '95': 0.156681304618711, '96': 0.12505089992205187, '97': 0.09376445765856845,
                     '98': 0.06261846817645944, '99': 0.030974986598556242, '99.1': 0.027730709593221547, '99.2': 0.024610971758071365, '99.3': 0.021292932878626214, '99.4': 0.01830529033281625, '99.5': 0.015244978397931597,
                     '99.6': 0.012309232548422422, '99.7': 0.009199138048033184, '99.8': 0.006261577693059683, '99.9': 0.0030901848856057512, '99.91': 0.0027720456600333065, '99.92': 0.002437166039547911,
                     '99.93': 0.00215310303920635, '99.94': 0.0018285670722661962, '99.95': 0.0015746806831060528, '99.96': 0.0012591241475501391, '99.97': 0.0009524308855546337, '99.98': 0.0006672645240300978,
                     '99.99': 0.0003276868002454192},
               '3': {'10': 3.0433980889212435, '20': 2.5663016323864913, '30': 2.202845884191832, '40': 1.98801913665014, '50': 1.815081392549216, '60': 1.623343087799249, '70': 1.4059043377043596, '80': 1.1466470558154458,
                     '90': 0.8115627097763858, '91': 0.7699958135339398, '92': 0.7255806614732099, '93': 0.6788806715105213, '94': 0.6296097321664045, '95': 0.5745558614550759, '96': 0.5140696466163157, '97': 0.4456329036665362,
                     '98': 0.36326532020019453, '99': 0.2553297808209758, '99.1': 0.2416539062470937, '99.2': 0.22790125078946266, '99.3': 0.21458409285450064, '99.4': 0.19846511792718619, '99.5': 0.1816169971798196,
                     '99.92': 0.07326885358201485, '99.93': 0.06882048558514198, '99.94': 0.0638312549184959, '99.95': 0.058498528643549985,'99.96': 0.05368625534037133, '99.97': 0.04652398288526749,
                     '99.98': 0.038326443743930017, '99.99': 0.025862032539675894},
               '4': {'10': 3.9688370515063665, '20': 3.366192207397342, '30': 2.953952825302361, '40': 2.646158770106605, '50': 2.3777607525037605, '60': 2.123381297800478, '70': 1.8702420189090312, '80': 1.606233836129107,
                     '90': 1.2740754773747365, '91': 1.2298418954913422, '92': 1.182766245072856, '93': 1.1304085360141483, '94': 1.0741913727443777, '95': 1.011725679942291, '96': 0.939552870925971, '97': 0.8548837011422066,
                     '98': 0.7454112479134012, '99': 0.5923037906530073, '99.1': 0.5719726816038473, '99.2': 0.5502923150442507, '99.3': 0.5255723352180417, '99.4': 0.4991385603366061, '99.5': 0.4689258108271657,
                     '99.6': 0.4367472810938051, '99.7': 0.39619422850092784, '99.8': 0.34753838589917463, '99.9': 0.2757971182914186, '99.91': 0.2646780346879165, '99.92': 0.25416998306586214, '99.93': 0.24294073388148685,
                     '99.94': 0.23240263630500624, '99.95': 0.21876192560498597, '99.96': 0.2032878359611795, '99.97': 0.18271250779903936, '99.98': 0.1609410282549268, '99.99': 0.1277382351705474},
               '6': {'10': 4.861979942391542, '20': 4.165824147541702, '30': 3.7050527406016895, '40': 3.3430431451880844, '50': 3.0316183170212065, '60': 2.7436445212860034, '70': 2.46340007805307, '80': 2.1664567198443647,
                     '90': 1.8032908060598274, '91': 1.7581808252833215, '92': 1.7105679094026873, '93': 1.6576819941120893, '94': 1.601416904121481, '95': 1.5390897157787307, '96': 1.4667360484390772, '97': 1.379112684234093,
                     '98': 1.2705770909966823, '99': 1.1033306952679172, '99.1': 1.0792459662262117, '99.2': 1.0536308331925373, '99.3': 1.0252700011827163, '99.4': 0.9951440299783612, '99.5': 0.960482623760968,
                     '99.6': 0.9168232482962224, '99.7': 0.8660127685300232, '99.8': 0.8015203693709417, '99.9': 0.6976027753857931, '99.91': 0.6824202124925003, '99.92': 0.666886200704681, '99.93': 0.6509126734912764,
                     '99.94': 0.6352925787636964, '99.95': 0.6113891098888175, '99.96': 0.5843961138596394, '99.97': 0.5524004297143547, '99.98': 0.5130397320937039, '99.99': 0.4444125711664664}}

# 2 works for conjunction, opposition, and any non-grand

# so now we have to write code s.t. given an n and em distance, we find the corresponding percentile

def find_quantile(d: float, n: int) -> float:
    # relying on the dict being ordered, which is dubious. will this work in ts?
    percentile_items = list(percentiles[str(n)].items())
    for i,(percentile, pd) in enumerate(percentile_items):
        if pd < d:
            break
    else:
        return 99.99
    if i==0:
        return 0.0
    lower_percentile, lower_pd = percentile_items[i-1]
    f = (d-pd)/(lower_pd-pd)
    estimated_percentile = float(percentile) + (float(lower_percentile)-float(percentile))*f
    return estimated_percentile/100

            
# alright, so the big thing: we get all thirteen symbols and compute all possible
# conjunctions, oppositions, trines, squares, sextiles, grand trines, grand squares, grand sextiles
# discard all those with percentile <90
# return the remainder ordered by percentile

# we're missing some code for the non-grands. straightforward, but I don't want to ad-hoc it.
# but maybe i will. it's kind of stupid to complicate it considering that for 2 elements we know the percentile curves precisely (them being linear)
# in fact, we could remove percentiles['2'] altogether
# anyway

from itertools import combinations # problematic if ts doesn't have something like this
from enum import Enum
from dataclasses import dataclass
from typing import Dict

class AspectType(Enum):
    CONJUNCTION = 0
    SEXTILE = 1
    SQUARE = 2
    TRINE = 3
    OPPOSITION = 4
    GRAND_SEXTILE = 5
    GRAND_SQUARE = 6
    GRAND_TRINE = 7

class Node(Enum):
    SUN = 0
    MOON = 1
    ASCENDANT = 2
    LUNAR_ASCENDING = 3
    LUNAR_DESCENDING = 4
    MERCURY = 5
    MARS = 6
    VENUS = 7
    JUPITER = 8
    NEPTUNE = 9
    PLUTO = 10
    URANUS = 11
    SATURN = 12

@dataclass
class Aspect:
    type_: AspectType
    positions: List[Node]
    error: float
    percentile: float

    
def find_aspects(
    positions: Dict[Node, float],
    threshold_pairs: float = 0.95,
    threshold_grand_trines: float = 0.99,
    threshold_grand_squares: float = 0.995,
    threshold_grand_sextiles: float = 0.999
) -> List[Aspect]:

    # threshold from 0 to 1, discards everything with lower quantile
    
    aspects = []
    
    for n1, n2 in combinations(Node, 2):
        p1, p2 = positions[n1], positions[n2]
        d = distance(p1, p2)
        if d<pi*(1-threshold_pairs):
            aspects.append(Aspect(AspectType.CONJUNCTION, (n1, n2), d, 100*(1-d/pi)))
        if abs(d-pi/3)<pi*(1-threshold_pairs):
            aspects.append(Aspect(AspectType.SEXTILE, (n1, n2), abs(d-pi/3), 100*(1-abs(d-pi/3)/pi)))
        if abs(d-pi/2)<pi*(1-threshold_pairs):
            aspects.append(Aspect(AspectType.SQUARE, (n1, n2), abs(d-pi/2), 100*(1-abs(d-pi/2)/pi)))
        if abs(d-pi*2/3)<pi*(1-threshold_pairs):
            aspects.append(Aspect(AspectType.TRINE, (n1, n2), abs(d-pi*2/3), 100*(1-abs(d-pi*2/3)/pi)))
        if abs(d-pi)<pi*(1-threshold_pairs):
            aspects.append(Aspect(AspectType.OPPOSITION, (n1, n2), abs(d-pi), 100*(1-abs(d-pi)/pi)))

    threshold_grands = [None, None, None, threshold_grand_trines, threshold_grand_squares, None, threshold_grand_sextiles]
    aspect_grands = [None, None, None, AspectType.GRAND_TRINE, AspectType.GRAND_SQUARE, None, AspectType.GRAND_SEXTILE]

    for n in [3, 4, 6]:
        for node_subset in combinations(Node, n):
            positions_subset = [positions[node] for node in node_subset]
            error = min_em_distance_to_regular(positions_subset, n)
            quantile = find_quantile(error, n)
            if quantile > threshold_grands[n]:
                aspects.append(Aspect(
                    aspect_grands[n],
                    node_subset,
                    error,
                    quantile*100
                ))

    aspects.sort(key = lambda aspect: -aspect.percentile)

    return aspects

fake_positions = {
    Node.SUN: 1,
    Node.MOON: 2,
    Node.ASCENDANT: 3,
    Node.LUNAR_ASCENDING: 4,
    Node.LUNAR_DESCENDING: 5,
    Node.MERCURY: 6,
    Node.MARS: 7,
    Node.VENUS: 8,
    Node.JUPITER: 9,
    Node.NEPTUNE: 10,
    Node.PLUTO: 11,
    Node.URANUS: 12,
    Node.SATURN: 13
}
fake_positions = {
    Node.SUN: 1.1,
    Node.MOON: 2,
    Node.ASCENDANT: 3.3,
    Node.LUNAR_ASCENDING: 4.7,
    Node.LUNAR_DESCENDING: 5.1,
    Node.MERCURY: 6,
    Node.MARS: 7.3,
    Node.VENUS: 8.7,
    Node.JUPITER: 9.1,
    Node.NEPTUNE: 10,
    Node.PLUTO: 11.3,
    Node.URANUS: 12.7,
    Node.SATURN: 13.1
}

for aspect in find_aspects(fake_positions):
    print(aspect)
