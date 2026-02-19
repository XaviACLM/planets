"""
Rewrite imports in all .ts/.tsx files under src/ to reflect
the new subfolder structure.

Run from anywhere — uses its own location to find the project root.
"""

import os
import re
from pathlib import Path

PROJECT = Path(__file__).parent.parent
SRC = PROJECT / "src"

# Step 1: Build map of filename -> path relative to src (e.g. "astroDefs.ts" -> "defs/astroDefs.ts")
# If a filename appears more than once, mark it as a collision and skip it.

file_map: dict[str, str | None] = {}  # filename -> rel path, or None if collision

for root, dirs, files in os.walk(SRC):
    rel_root = Path(root).relative_to(SRC)
    for f in files:
        rel_path = str((rel_root / f).as_posix())
        if f in file_map:
            if file_map[f] is not None:
                print(f"  COLLISION: {f} found at {file_map[f]} and {rel_path} (and possibly more)")
                file_map[f] = None
        else:
            file_map[f] = rel_path

# Step 2: Process each .ts/.tsx file

# Match: from './whatever' or from "./whatever" (with optional whitespace)
IMPORT_RE = re.compile(r"""(from\s+)(['"])(\.\/[^'"]+)\2""")


def fix_line(line: str, file_rel_dir: str) -> str:
    def replacer(match: re.Match) -> str:
        prefix = match.group(1)  # "from "
        quote = match.group(2)   # ' or "
        old_path = match.group(3)  # ./foo or ./foo.ts etc

        # Extract the filename from the import path
        basename = old_path.split("/")[-1]

        # If no extension, try common ones
        candidates = [basename] if "." in basename else [
            basename + ".ts",
            basename + ".tsx",
        ]

        target_rel = None
        for cand in candidates:
            if cand in file_map and file_map[cand] is not None:
                target_rel = file_map[cand]
                break

        if target_rel is None:
            return match.group(0)  # leave unchanged

        # Compute relative path from importing file's dir to target
        target_abs = SRC / target_rel
        importer_dir_abs = SRC / file_rel_dir
        new_rel = os.path.relpath(target_abs, importer_dir_abs).replace("\\", "/")

        # Strip extension if the original import didn't have one
        if "." not in basename:
            # Remove the extension we found
            new_rel = new_rel.rsplit(".", 1)[0]

        # Ensure starts with ./ or ../
        if not new_rel.startswith("."):
            new_rel = "./" + new_rel

        return prefix + quote + new_rel + quote

    return IMPORT_RE.sub(replacer, line)


for root, dirs, files in os.walk(SRC):
    rel_root = Path(root).relative_to(SRC)
    for f in files:
        if not f.endswith((".ts", ".tsx")):
            continue
        filepath = os.path.join(root, f)
        file_rel_dir = str(rel_root.as_posix())

        with open(filepath, "r", encoding="utf-8") as fh:
            lines = fh.readlines()

        new_lines = [fix_line(line, file_rel_dir) for line in lines]

        if new_lines != lines:
            with open(filepath, "w", encoding="utf-8") as fh:
                fh.writelines(new_lines)
            print(f"  UPDATED: {(rel_root / f).as_posix()}")

print("Done.")
