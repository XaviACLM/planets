import os
from pathlib import Path

SRC = Path(__file__).parent.parent / "src"

for root, dirs, files in os.walk(SRC):
    for f in files:
        if not f.endswith((".ts", ".tsx", ".css")):
            continue
        filepath = os.path.join(root, f)
        rel = os.path.relpath(filepath, SRC)
        with open(filepath, "r", encoding="utf-8") as fh:
            for i, line in enumerate(fh, 1):
                if "TODO" in line:
                    print(f"  {rel}:{i}\n{line.strip()}\n")
input()
