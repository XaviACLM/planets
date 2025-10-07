target = 512
import os
from PIL import Image

for item in os.listdir():
    print(item)
    if not item.endswith(".png"): continue
    i = Image.open(item)
    w, h = i.width, i.height
    if w==h:
        tw, th = target, target
    elif w>h:
        tw = target
        th = int(target*h/w)
    else:
        th = target
        tw = int(target*w/h)
    i.thumbnail((tw,th),Image.Resampling.LANCZOS)
    i.save(item)
