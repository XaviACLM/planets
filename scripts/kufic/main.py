from PIL import Image
from pathlib import Path
import numpy as np
from matplotlib import pyplot as plt
INPUT_DIR = Path(__file__).parent / "hand-drawn"
OUTPUT_DIR = Path(__file__).parent
TARGET_SIZE = (512, 512)

blowup_factor = 30
expand_amt = blowup_factor//6
corner_cut = blowup_factor//6

def first_last_truthy_index(iterable):
    first_idx = None
    last_idx = None
    for index, item in enumerate(iterable):
        if item:
            if first_idx is None:
                first_idx = index
            last_idx = index
    return first_idx, last_idx

def expand(arr, amt):
    up = np.roll(arr, -amt, axis=0)
    down = np.roll(arr, amt, axis=0)
    upleft = np.roll(up, -amt, axis=1)
    upright = np.roll(up, amt, axis=1)
    downleft = np.roll(down, -amt, axis=1)
    downright = np.roll(down, amt, axis=1)
    return (upleft+upright+downleft+downright)
    

def corner_helper(arr, amt):
    up = np.roll(arr, -amt, axis=0)
    down = np.roll(arr, amt, axis=0)
    left = np.roll(arr, -amt, axis=1)
    right = np.roll(arr, amt, axis=1)
    return (up*down)+(left*right)

def corner_inset(arr, amt):
    while amt != 0:
        curr_amt = amt//2 + (amt%2==1)
        arr = corner_helper(arr, curr_amt)
        amt -= curr_amt
    return arr

arrs = []

def process_image(input_path: Path, output_path: Path):
    """Load image, resize to 1024x1024, convert to grayscale, and save."""
    with Image.open(input_path) as img:
        print(f"Processing: {input_path.name} -> {output_path.name}")
        arr = np.asarray(img)
        # 0 and 1 will be bw (first two values found)
        arr = arr > 1

        xmn, xmx = first_last_truthy_index(np.sum(arr, axis=0))
        ymn, ymx = first_last_truthy_index(np.sum(arr, axis=1))

        arr = arr[ymn-1:ymx+2, xmn-1:xmx+2]


        h, w = arr.shape
        assert w == h

        arr = np.stack([arr]*blowup_factor,axis=1)
        arr = arr.reshape((h*blowup_factor, w))
        arr = np.stack([arr]*blowup_factor,axis=2)
        arr = arr.reshape((h*blowup_factor, w*blowup_factor))

        arr = expand(arr, expand_amt)
        arr = corner_inset(arr, corner_cut)
        arr = arr[blowup_factor-expand_amt:-blowup_factor+expand_amt, blowup_factor-expand_amt:-blowup_factor+expand_amt]

        rgba_array = 255*np.ones((*arr.shape, 4), dtype=np.uint8)
        rgba_array[...,3] = 255*arr
        img = Image.fromarray(rgba_array, 'RGBA').resize(TARGET_SIZE, Image.Resampling.LANCZOS)
        img.save(output_path)
        
        arrs.append(np.asarray(img))
        

def main():
    png_files = list(INPUT_DIR.glob("*.png"))
    print(f"Found {len(png_files)} PNG files to process")

    for input_path in png_files:
        output_path = OUTPUT_DIR / input_path.name
        process_image(input_path, output_path)

    print("Done!")

if __name__ == "__main__":
    main()

    Image.fromarray(np.concatenate(arrs)).save("allkufics.png")
    
"""
This is a conscious choice, but it is not a _limitation_ 

but what about implementing linked lists? huh? what about the linked lists clever guy???

I swear some people listened once in data structures 101 and never again
"""
