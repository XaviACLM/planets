# mostly chatgpt code

import requests
import json
from typing import Dict, Any

# List of target small bodies by name (SBDB “sstr” parameter)
TARGETS = [
    "Ceres", "Pallas", "Juno", "Vesta",
    "Chiron", "Eris", "Makemake", "Haumea", "Sedna"
]
TARGETS = [
    "Astraea", "Hygiea", "Pholus", "Nessus", "Chariklo", "Hylonome", "Cyllarus",
    "Gonggong", "Quaoar", "Orcus", "Salacia", "Varda", "Ixion", "Varuna",
    "Typhon", "Chaos", # "Radamanthus", "Gǃkúnǁʼhòmdímà"
]

SBDB_API = "https://ssd-api.jpl.nasa.gov/sbdb.api"

def fetch_orbit(sstr: str, full_precision: bool = False) -> Dict[str, Any]:
    """
    Fetch orbital data for a given small body from the JPL SBDB API.

    :param sstr: The search string (name or designation)
    :param full_precision: Whether to ask for full-precision orbital element values
    :return: A dict containing the JSON response from SBDB API
    """
    params = {
        "sstr": sstr,
        # optionally request full-precision floats
        "full-prec": "1" if full_precision else "0"
    }
    resp = requests.get(SBDB_API, params=params, verify=False)
    resp.raise_for_status()
    return resp.json()

def extract_elements(sbdb_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract the main osculating orbital elements from SBDB API response.

    :param sbdb_data: JSON data from SBDB API
    :return: Dict with key orbital elements (a, e, i, Ω, ω, M, epoch, etc.)
    """
    orbit = sbdb_data.get("orbit", {})
    elems = orbit.get("elements", [])
    result = {}
    for elem in elems:
        name = elem["name"]  # e, a, i, om, peri, ma, etc.
        value = elem["value"]
        sigma = elem.get("sigma")
        units = elem.get("units")
        result[name] = {
            "value": value,
            "sigma": sigma,
            "units": units
        }
    # Also get the epoch at which these elements apply:
    epoch = orbit.get("epoch") or orbit.get("cov_epoch")
    result["epoch"] = epoch
    # Also report the equinox
    result["equinox"] = orbit.get("equinox")
    return result

EPOCH = 2461000.5

def main():
    orbits = {}
    for name in TARGETS:
        print(f"Fetching {name} …")
        data = fetch_orbit(name, full_precision=True)
        if "orbit" not in data:
            print(f"Warning: no orbit data for {name}, response:", data)
            continue
        elems = extract_elements(data)
        orbits[name] = elems

    print("const NodeToParams: Partial<Record<Node, OrbitParams>> = {")
    for name, data in orbits.items():
        print(f"    [Node.{name.upper()}]: {{")
        for param, param_data in data.items():
            if param == "epoch":
                assert param_data == str(EPOCH)
                continue
            if param == "equinox":
                assert param_data == "J2000"
                continue
            if param not in ["a", "e", "i", "om", "w", "ma"]:
                continue
            
            print(f"        {param}: {param_data['value']},")
        print(f"        epoch: {EPOCH}")
        print("    },")
    print("}")



if __name__ == "__main__":
    main()
