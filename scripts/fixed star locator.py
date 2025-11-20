# Requires: pip install astropy astroquery
from astroquery.simbad import Simbad
from astropy import units as u
from astropy.coordinates import SkyCoord, FK5
from astropy.time import Time

Simbad.add_votable_fields('ra(d)', 'dec(d)')  # RA/Dec in degrees (J2000)
names = ["Aldebaran","Algol","Sirius","Procyon","Regulus","Alkaid","Alcyone",
         "Capella","Spica","Arcturus","Alphecca","Antares","Vega","Deneb Algedi",
         "Unukalhai","Fomalhaut"]

results = {}
for name in names:
    r = Simbad.query_object(name)
    if r is None:
        print("not found:", name); continue
    ra_deg = float(r['ra'][0])
    dec_deg = float(r['dec'][0])
    # create SkyCoord in FK5 J2000 (equatorial)
    sc = SkyCoord(ra=ra_deg*u.deg, dec=dec_deg*u.deg, frame=FK5, equinox='J2000.0')
    # convert to ecliptic (mean ecliptic of J2000)
    ecl = sc.barycentrictrueecliptic  # or use astropy's ecliptic frame if available
    lam = ecl.lon.wrap_at(360*u.deg).degree
    beta = ecl.lat.degree
    results[name] = (lam, beta)

print(results)
