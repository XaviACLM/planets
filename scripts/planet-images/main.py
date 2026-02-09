from PIL import Image
from pathlib import Path
import numpy as np
from matplotlib import pyplot as plt
INPUT_DIR = Path(__file__).parent / "original-images"
OUTPUT_DIR = Path(__file__).parent
TARGET_SIZE = (1024, 1024)

def process_image(input_path: Path, output_path: Path):
    """Load image, resize to 1024x1024, convert to grayscale, and save."""
    with Image.open(input_path) as img:
        # Resize (may deform if not square)
        resized = img.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
        # Convert to grayscale
        grayscale = resized.convert("L")

        im = np.array(grayscale)
        values = im.reshape(-1)
        
        # print(input_path)
        # plt.hist(values,bins=256)
        # plt.show()
        # learned: almost (not all) images have perfectly black backgrounds
        # good enough to filter out 0-5

        values = sorted(filter(lambda x: x>=5, values[::100]))
        quantiles = [0.4, 0.6, 0.8, 0.95, 0.99] # plus the 5/255 quantile we add right after
        quantile_values = [5] + [ values[int(len(values)*quantile)] for quantile in quantiles]
        quantile_mid_values = [(int(a)+int(b))//2 for a,b in zip(quantile_values, quantile_values[1:])] + [255]
        quantile_diffs = [quantile_mid_values[0]]+[q2-q1 for q1, q2 in zip(quantile_mid_values, quantile_mid_values[1:])]
        
        quantized_im = sum([(im > quantile_value)*(quantile_diff) for quantile_value, quantile_diff in zip(quantile_values, quantile_diffs)], np.zeros(im.shape))
        # plt.imshow(255-im, vmin=0, vmax=255, cmap="Greys")
        # plt.show()
        # plt.imshow(255-quantized_im, vmin=0, vmax=255, cmap="Greys")
        # plt.show()

        #Image.fromarray(quantized_im.astype(np.uint8),"L").save(output_path)

        quantized_im = im

        rgba_array = 255*np.ones((*quantized_im.shape, 4), dtype=np.uint8)
        rgba_array[...,3] = quantized_im
        Image.fromarray(rgba_array, 'RGBA').save(output_path)
        
        print(f"Processed: {input_path.name} -> {output_path.name}")

def main():
    png_files = list(INPUT_DIR.glob("*.png"))
    print(f"Found {len(png_files)} PNG files to process")

    for input_path in png_files:
        output_path = OUTPUT_DIR / input_path.name
        process_image(input_path, output_path)

    print("Done!")

if __name__ == "__main__":
    main()
