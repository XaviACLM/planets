from math import asin, atan2, sin, cos, tan, pi, sqrt
from matplotlib import pyplot as plt

# data from https://github.com/astronoray/constellation_figures/

with open("constellationship.fab","r") as f:
    constellation_data = str(f.read())

with open("hygdata_v3.csv","r") as f:
    star_data = str(f.read())

constellation_data = {line_items[0]: list(zip(line_items[2::2], line_items[3::2])) for line_items in map(lambda line: line.split(" "), constellation_data.split("\n"))}

"""
looking for

Oph ophiuchus
Ari aries
Tau taurus
Gem gemini
Car/Cnc cancer
Leo leo
Vir virgo
Lib libra
Sco scorpio
Sgr saggitarius
Cap/Car capricorn
Aqr aquarius
Pic/Psc pisces
"""

constellation_codes = ["Ari", "Tau", "Gem", "Cnc", "Leo", "Vir", "Lib", "Sco", "Oph", "Sgr", "Cap", "Aqr", "Psc"]
constellation_data = {code:constellation_data[code] for code in constellation_codes}

star_data = star_data.split("\n")
columns = star_data[0].split(",")
hip_idx = columns.index("hip")
ra_idx = columns.index("ra")
dsc_idx = columns.index("dec")
star_data = {data[hip_idx]:(float(data[ra_idx])*pi/12, float(data[dsc_idx])*pi/180) for data in map(lambda line: line.split(","), star_data[1:-1])}

"""
# alright, looks correct

for constellation_code in constellation_codes:
    constellation = constellation_data[constellation_code]
    for s1_hip, s2_hip in constellation:
        ra1, dec1 = star_data[s1_hip]
        ra2, dec2 = star_data[s2_hip]
        plt.plot([ra1, ra2], [dec1, dec2])
plt.show()
"""

ax_tilt = 23.43590*pi/180
def eq_to_ecl(ra, dec):
    lat = asin(sin(dec)*cos(ax_tilt)-cos(dec)*sin(ra)*sin(ax_tilt))
    x = cos(ra)
    y = sin(ra)*cos(ax_tilt)+tan(dec)*sin(ax_tilt)
    
    lon = atan2(y,x)%(2*pi)
    #lon = (lon+1)%(2*pi)
    return lat, lon


"""
# just projecting all stars down to the ecliptic: doesn't look very clean, particularly with scorpio/ophiuchus. let's eschew this.
for c_idx, constellation_code in enumerate(constellation_codes):
    constellation = constellation_data[constellation_code]
    longitudes = set()
    for s1_hip, s2_hip in constellation:
        lat1, lon1 = eq_to_ecl(*star_data[s1_hip])
        lat2, lon2 = eq_to_ecl(*star_data[s2_hip])
        longitudes.add(lon1)
        longitudes.add(lon2)
        plt.plot([lon1, lon2], [lat1, lat2],c="black")

    k = -0.01 if c_idx%2==0 else 0.01

    min_lon, max_lon = min(longitudes), max(longitudes)
    if max_lon - min_lon > pi:
        min_lon = min(filter(lambda x:x>pi,longitudes))
        max_lon = max(filter(lambda x:x<pi,longitudes))
        plt.plot([min_lon, 2*pi],[k,k],c="red")
        plt.plot([0, max_lon],[k,k],c="red")
    else:
        plt.plot([min_lon, max_lon],[k,k],c="red")
    print(constellation_code, min_lon, "-", max_lon)     
plt.show()
"""

"""
# what about intersections?
for c_idx, constellation_code in enumerate(constellation_codes):
    constellation = constellation_data[constellation_code]
    longitudes = set()
    for s1_hip, s2_hip in constellation:
        lat1, lon1 = eq_to_ecl(*star_data[s1_hip])
        lat2, lon2 = eq_to_ecl(*star_data[s2_hip])
        if lat1*lat2<0:
            lon_int = lon1 + lat1*(lon2-lon1)/(lat1-lat2)
            longitudes.add(lon_int)
        if abs(lon1-lon2)<pi:
            plt.plot([lon1, lon2], [lat1, lat2],c="black")

    if not longitudes: continue

    k = -0.01 if c_idx%2==0 else 0.01
    k=0

    min_lon, max_lon = min(longitudes), max(longitudes)
    if max_lon - min_lon > pi:
        min_lon = min(filter(lambda x:x>pi,longitudes))
        max_lon = max(filter(lambda x:x<pi,longitudes))
        plt.plot([min_lon, 2*pi],[k,k],c="red")
        plt.plot([0, max_lon],[k,k],c="red")
    else:
        plt.plot([min_lon-0.01, max_lon+0.01],[k,k],c="red")
    print(constellation_code, min_lon, "-", max_lon)     
plt.show()
# not that good either. some of that shit doesn't even touch the ecliptic
"""

#let's do straight up gd distance

import numpy as np
"""
idxs = []
lats = []
lons = []
for c_idx, constellation_code in enumerate(constellation_codes):
    constellation = constellation_data[constellation_code]
    for s1_hip, s2_hip in constellation:
        lat1, lon1 = eq_to_ecl(*star_data[s1_hip])
        lat2, lon2 = eq_to_ecl(*star_data[s2_hip])
        if abs(lon2-lon1)>pi:
            if lon2<pi:
                lon2 += 2*pi
            else:
                lon1 += 2*pi
            for k in np.linspace(0,1,1001):
                lat = lat1 + k*(lat2-lat1)
                lon = (lon1 + k*(lon2-lon1))%(2*pi)
                idxs.append(c_idx)
                lats.append(lat)
                lons.append(lon)
        else:
            for k in np.linspace(0,1,1001):
                lat = lat1 + k*(lat2-lat1)
                lon = lon1 + k*(lon2-lon1)
                idxs.append(c_idx)
                lats.append(lat)
                lons.append(lon)
"""

idxs = []
xs = []
ys = []
for c_idx, constellation_code in enumerate(constellation_codes):
    constellation = constellation_data[constellation_code]
    for s1_hip, s2_hip in constellation:
        lat1, lon1 = eq_to_ecl(*star_data[s1_hip])
        lat2, lon2 = eq_to_ecl(*star_data[s2_hip])
        x1, y1, z1 = cos(lon1)*cos(lat1), sin(lon1)*cos(lat1), sin(lat1)
        x2, y2, z2 = cos(lon2)*cos(lat2), sin(lon2)*cos(lat2), sin(lat2)
        
        n1 = sqrt(x1*x1+y1*y1+z1*z1)
        x1, y1, z1 = x1/n1, y1/n1, z1/n1
        
        for k in np.linspace(0,1,1001):
            x, y, z = x1+k*(x2-x1), y1+k*(y2-y1), z1+k*(z2-z1)
            n = sqrt(x*x+y*y+z*z)
            x, y, z = x/n, y/n, z/n
            idxs.append(c_idx)
            xs.append(x)
            ys.append(y)
"""
lats = np.array(lats)
lons = np.array(lons)
sq_lats = np.square(lats)
def closest_constellation_idx(lon):
    return idxs[np.argmin(sq_lats+np.square(lons-lon))]
x_term = np.cos(lons)*np.cos(lats)
y_term = np.sin(lons)*np.cos(lats)
def closest_constellation_idx(lon):
    return idxs[np.argmin(np.arccos(cos(lon)*x_term+sin(lon)*y_term))]
"""
x_term = np.array(xs)
y_term = np.array(ys)
def closest_constellation_idx(lon):
    return idxs[np.argmin(np.arccos(cos(lon)*x_term+sin(lon)*y_term))]

xs = []
ys = []
last_idx = closest_constellation_idx(0)
last_lon = 0
for current_lon in np.linspace(0,2*pi,1000):
    current_idx = closest_constellation_idx(current_lon)
    if current_idx != last_idx:
        lower_lon = last_lon
        lower_idx = last_idx
        upper_lon = current_lon
        upper_idx = current_idx
        while abs(upper_lon-lower_lon)>1e-10:
            mid_lon = (lower_lon+upper_lon)/2
            mid_idx = closest_constellation_idx(mid_lon)
            if mid_idx == lower_idx:
                lower_lon = mid_lon
            else:
                upper_lon = mid_lon
        print("switch btw idxs",last_idx, current_idx,"(",constellation_codes[last_idx],constellation_codes[current_idx],")","at lon",mid_lon)
    last_idx = current_idx
    last_lon = current_lon

"""
Pisces - 0.6104967379962906 - Aries - 0.8105057114798916 - Taurus - 1.5267759869050548 - Gemini - 2.1033385365075885 - Cancer - 2.444639600917877 - Leo - 3.010281704956398 - Virgo - 3.790183028887541 - Libra - 4.183094543606233 - Scorpio - 4.291067023887651 - Ophiuchus - 4.666857876143661 - Saggitarius - 5.177384974452394 - Capricorn - 5.664644920350497 - Aquarius - 6.137075512573954 - Pisces
"""
# wait, but when is this true??
# J2000? ok, let's think about it.
# we started with star positions in RA/dec. Does that depend on time?
# then we transferred that to ecliptic lat/lon. Does that transfer depend on time?
# everything else is canonical, so it's just those two things.
# right. first question: yes, i'll need to find the epoch for that
# second question: also yes (because of axial tilt), but that doesn't matter because the ecliptic is fixed relative to the celestial background
# so all you need to do is account for the drift of the vernal equinox and offset accordingly.
# but again, what's the epoch of our data?
# oh, also, straight euclidean doesn't make sense here. We need spherical (cosine) distance - redo that.
# okay, slowly checked that the original data is J2000. good. let's do the cosine stuff now.
"""
updated values
Pisces - 0.6104783869644631 - Aries - 0.8101614932229749 - Taurus - 1.5267809525908373 - Gemini - 2.1033401145729895 - Cancer - 2.4448001259141483 - Leo - 3.010278247795422 - Virgo - 3.790219827108406 - Libra - 4.183094901805898 - Scorpio - 4.291067820699151 -Ophiuchus - 4.666853311206641 - Saggitarius - 5.177420977361285 - Capricorn - 5.664644247062586 - Aquarius - 6.137074041724778 - Pisces
"""

# great. now about the 'official' constellation borders.
# wait. i'm realizing now we're still wrong. we interpolated those lines like we were in R2
# we have to account for sphere geometry.

# ugh let's do this sagain then
"""
updated values
Pisces - 0.610481957714658 - Aries - 0.809283631691531 - Taurus - 1.5267809525908373 - Gemini - 2.1034634737766833 - Cancer - 2.4448001259141483 - Leo - 3.010302580817891 - Virgo - 3.7901704662198483 - Libra - 4.18304646518869 - Scorpio - 4.291068045815738 - Ophiuchus - 4.666853099398361 - Saggitarius - 5.177419308949345 - Capricorn - 5.664778889649456 - Aquarius - 6.137074041724778 - Pisces
"""
