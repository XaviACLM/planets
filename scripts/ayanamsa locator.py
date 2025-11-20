import swisseph as swe

# Set ephemeris path if needed
# swe.set_ephe_path('/path/to/ephemeris/files')

# J2000 epoch (Julian Day)
jd_j2000 = 2451545.0

# Map of mode name → swisseph sidereal mode constant
ayanamsha_modes = {
    "Fagan/Bradley": swe.SIDM_FAGAN_BRADLEY,
    "Lahiri": swe.SIDM_LAHIRI,
    "Raman": swe.SIDM_RAMAN,
    "Krishnamurti": swe.SIDM_KRISHNAMURTI,
    "Yukteshwar": swe.SIDM_YUKTESHWAR,
    "Babylonian/Huber": swe.SIDM_BABYL_HUBER,
    "Suryasiddhanta": swe.SIDM_SURYASIDDHANTA,
    "True Citra": swe.SIDM_TRUE_CITRA,
    "True Revati": swe.SIDM_TRUE_REVATI,
}

# Compute ayanāṃśa for each
results = {}
for name, mode in ayanamsha_modes.items():
    swe.set_sid_mode(mode, 0, 0)  # using default t0 and ayan_t0
    ayan_deg = swe.get_ayanamsa_ut(jd_j2000)
    results[name] = ayan_deg

print("Ayanāṃśas at J2000 (degrees):")
for name, deg in results.items():
    print(f"{name}: {deg:.6f}°")
cmd
