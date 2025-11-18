import json
from timezonefinderL import TimezoneFinder

INPUT_FILE = "cities.json"
OUTPUT_FILE = "cities_enriched.json"

def main():
    tf = TimezoneFinder()

    # Load the JSON
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        cities = json.load(f)

    enriched = []
    for c in cities:
        try:
            lat = float(c["lat"])
            lon = float(c["lon"])
        except (KeyError, ValueError):
            c["timezone"] = None
            enriched.append(c)
            continue

        tz = tf.timezone_at(lat=lat, lng=lon)
        c["timezone"] = tz   # may be None if something weird happens
        enriched.append(c)

    # Save new file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(enriched, f, ensure_ascii=False, indent=2)

    print(f"Processed {len(enriched)} cities → {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
