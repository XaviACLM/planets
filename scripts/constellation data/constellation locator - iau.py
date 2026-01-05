from math import asin, atan2, sin, cos, tan, pi, sqrt
from matplotlib import pyplot as plt

# data from https://iauarchive.eso.org/public/themes/constellations/
# specifies that it is in J2000


constellation_codes = ["Ari", "Tau", "Gem", "Cnc", "Leo", "Vir", "Lib", "Sco", "Oph", "Sgr", "Cap", "Aqr", "Psc"]

ax_tilt = 23.43590*pi/180
def eq_to_ecl(ra, dec):
    lat = asin(sin(dec)*cos(ax_tilt)-cos(dec)*sin(ra)*sin(ax_tilt))
    x = cos(ra)
    y = sin(ra)*cos(ax_tilt)+tan(dec)*sin(ax_tilt)
    
    lon = atan2(y,x)%(2*pi)
    #lon = (lon+1)%(2*pi)
    return lat, lon

for code in constellation_codes:
    code = code.lower()
    with open(f"{code}.txt","r") as f:
        data = str(f.read())
    points = []
    for line in data.split("\n")[:-1]:
        ra_str, dec_str, _ = line.split("|")
        h_str, m_str, s_str = ra_str.split(" ")
        ra_hr = float(h_str)+float(m_str)/60+float(s_str)/3600
        ra = ra_hr*pi/12
        dec = float(dec_str)*pi/180
        lat, lon = eq_to_ecl(ra, dec)
        x,y,z = cos(lon)*cos(lat), sin(lon)*cos(lat), sin(lat)
        points.append((x,y,z))
    points.append(points[0])
    lons = []
    for (x1,y1,z1), (x2,y2,z2) in zip(points, points[1:]):
        if z1*z2<0:
            k = z1/(z1-z2)
            x, y = x1+k*(x2-x1), y1+k*(y2-y1)
            n = sqrt(x*x+y*y)
            x,y = x/n,y/n
            lon = atan2(y,x)%(2*pi)
            lons.append(lon)
    l1, l2 = sorted(lons)
    lon = l1 if abs(l1-l2)<pi else l2
    print(code, lon)

"""
ari 0.5006710809308025
tau 0.932292091737694
gem 1.5732392440197722
cnc 2.059288010209377
leo 2.4092369528387416
vir 3.034271715326123
lib 3.801490778565342
sco 4.208082360282873
oph 4.3220852335887985
sgr 4.646721441014687
cap 5.229995888867893
aqr 5.715748880259971
psc 6.13567725989199
"""

"""
values from spherical approach, to compare
ari 0.610481957714658
tau 0.809283631691531
gem 1.5267809525908373
cnc 2.1034634737766833
leo 2.4448001259141483
vir 3.010302580817891
lib 3.7901704662198483
sco 4.18304646518869
oph 4.291068045815738
sgr 4.666853099398361
cap 5.177419308949345
aqr 5.664778889649456
psc 6.137074041724778
"""
