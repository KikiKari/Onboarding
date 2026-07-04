#!/usr/bin/env python3
"""Chroma-key pond textures to add a clean alpha channel.

The leaf/blossom source webps ship on solid backgrounds (dark green or white)
rather than transparency, so `alphaTest` clipping in three.js has nothing to
key on. This produces RGBA PNGs with a soft alpha mask so the R3F planes clip
to the real silhouette.
"""
import numpy as np
from PIL import Image, ImageFilter

BASE = "public/media/pond"
OUT = "public/media/pond/processed"

import os
os.makedirs(OUT, exist_ok=True)


def key_out(path, out, mode, feather=2.0):
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im).astype(np.float32)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]

    if mode == "green":
        # Dark-green background: low overall brightness AND green-dominant-but-dark.
        # Foreground leaf is much brighter / lighter green.
        lum = (r + g + b) / 3.0
        # background pixels: very dark (lum < ~35) — the bg is ~(3,50,0)=17
        bg = lum < 40.0
        alpha = np.where(bg, 0.0, 255.0)
    elif mode == "white":
        # White background: near-white, low saturation.
        mn = np.minimum(np.minimum(r, g), b)
        mx = np.maximum(np.maximum(r, g), b)
        # background: bright and low chroma
        white = (mn > 218.0) & ((mx - mn) < 28.0)
        alpha = np.where(white, 0.0, 255.0)
    else:
        raise ValueError(mode)

    a_img = Image.fromarray(alpha.astype(np.uint8), "L")
    # Feather the mask edges to avoid hard aliasing.
    a_img = a_img.filter(ImageFilter.GaussianBlur(feather))
    rgba = im.convert("RGBA")
    rgba.putalpha(a_img)

    # Bound to content to keep the plane tight and reduce empty texels.
    bbox = a_img.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    rgba.save(out)
    print(f"{os.path.basename(path)} -> {os.path.basename(out)} {rgba.size} ({mode})")


# Lily pads
key_out(f"{BASE}/blaetter/12130585.webp", f"{OUT}/leaf-a.png", "green")
key_out(f"{BASE}/blaetter/48178242.webp", f"{OUT}/leaf-b.png", "white")

# Blossoms with white backgrounds -> clean cutouts (only these two key cleanly)
key_out(f"{BASE}/blueten/78370994.webp", f"{OUT}/blossom-a.png", "white", feather=3.0)
key_out(f"{BASE}/blueten/70017289.webp", f"{OUT}/blossom-b.png", "white", feather=3.0)

print("done")
