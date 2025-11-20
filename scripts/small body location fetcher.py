# mostly chatgpt code
# to be used against the website's outputs to double check calculations


import requests
import re
import math

def parse_horizons_ecliptic_longitude(raw: str) -> float:
    """
    Given a raw Horizons 'vectors' response (as a single giant string),
    extract heliocentric ecliptic longitude in degrees.
    """

    # Extract the text block between $$SOE and $$EOE
    m = re.search(r"\$\$SOE(.*?)\$\$EOE", raw, re.DOTALL)
    if not m:
        raise ValueError("Could not find $$SOE ... $$EOE block.")

    block = m.group(1)

    # Find X, Y, Z lines inside that block
    # Example format:
    #   X = 4.075517161348732E+08 Y = 1.371366588739077E+08 Z =-7.074026076609166E+07
    xyz_match = re.search(
        r"X\s*=\s*([\-0-9.E+]+)\s+Y\s*=\s*([\-0-9.E+]+)\s+Z\s*=\s*([\-0-9.E+]+)",
        block
    )
    if not xyz_match:
        raise ValueError("Could not parse X/Y/Z values.")

    x = float(xyz_match.group(1))
    y = float(xyz_match.group(2))
    # z = float(xyz_match.group(3))   # (not needed for longitude)

    # Compute ecliptic longitude
    lon = math.degrees(math.atan2(y, x)) % 360.0
    return lon

HORIZONS_API = "https://ssd.jpl.nasa.gov/api/horizons.api"

def get_ecliptic_longitude(body_name: str, date: str):
    """
    Query JPL Horizons JSON API and return ecliptic longitude (degrees)
    for the given body and date.
    
    date format example: '2025-11-20'
    """

    params = {
        "format": "json",
        "COMMAND": f"'{body_name}'",
        "OBJ_DATA": "NO",
        "EPHEM_TYPE": "VECTORS",
        "CENTER": "'@sun'",
        "TLIST": f"'{date}'",
        # Ecliptic-of-date frame (astrology uses true ecliptic-of-date)
        "REF_PLANE": "'ECLIPTIC'",
        "REF_SYSTEM": "'ICRF'"
    }

    # We bypass certificate issues here.
    response = requests.get(HORIZONS_API, params=params, verify=False)
    data = response.json()

    lon = parse_horizons_ecliptic_longitude(data["result"])
    lon = lon % 360

    return lon


if __name__ == "__main__":
    bodies = [
        "Ceres", "Pallas", "Juno", "Vesta",
        "Chiron", "Eris", "Makemake", "Haumea", "Sedna"
    ]

    date = "2025-11-20"

    for body in bodies:
        try:
            lon = get_ecliptic_longitude(body, date)
            print(f"{body:10s}  {lon:8.3f}°")
        except Exception as e:
            print(f"{body:10s}  ERROR: {e}")
