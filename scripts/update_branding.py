"""Update the site logo and favicon from a source image.

Removes the white background so the artwork sits nicely on any background
color. Resizing is done on the opaque image and white-removal runs last at
each target size, keeping anti-aliased edges clean (no white fringes).

Writes:
  - the logo as public/assets/images/app_logo.png (trimmed to content)
  - a multi-size favicon at public/favicon.ico (16/32/48/64 px)

Usage:
    python scripts/update_branding.py [source_image]

Defaults:
    source image: public/assets/images/image-1790160044114.png
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = PROJECT_ROOT / "public" / "assets" / "images" / "image-1790160044114.png"
DEFAULT_LOGO = PROJECT_ROOT / "public" / "assets" / "images" / "app_logo.png"
DEFAULT_FAVICON = PROJECT_ROOT / "public" / "favicon.ico"
FAVICON_SIZES = (16, 32, 48, 64)

# Whiteness ramp: d = 255 - min(R,G,B). Alpha ramps 0 -> 255 as d goes
# from WHITE_LOW (treated as pure background) to WHITE_HIGH (solid artwork).
WHITE_LOW = 8
WHITE_HIGH = 60


def _load(source: Path) -> Image.Image:
    if not source.is_file():
        raise FileNotFoundError(f"Source image not found: {source}")
    im = Image.open(source)
    im.load()
    # Flatten any existing transparency onto white: the background removal
    # assumes the artwork is composited on pure white.
    bg = Image.new("RGBA", im.size, (255, 255, 255, 255))
    return Image.alpha_composite(bg, im.convert("RGBA")).convert("RGB")


def remove_white_background(
    im: Image.Image,
    low: int = WHITE_LOW,
    high: int = WHITE_HIGH,
) -> Image.Image:
    """Make near-white pixels transparent.

    The artwork is treated as if alpha-composited on pure white: alpha is
    ramped on the per-pixel distance from white, and semi-transparent edge
    pixels are un-blended (C = (P - (1-a)*255) / a) so no white fringe
    shows on dark backgrounds.
    """
    rgb = np.asarray(im.convert("RGB"), dtype=np.float64)

    dist = 255.0 - rgb.min(axis=2)
    alpha = np.clip((dist - low) / (high - low), 0.0, 1.0)

    a3 = alpha[..., None]
    # Un-blend edge colors from white; solid pixels keep their color.
    unblended = np.clip((rgb - (1.0 - a3) * 255.0) / np.maximum(a3, 1e-6), 0.0, 255.0)
    solid = (alpha >= 1.0)[..., None]
    out_rgb = np.where(solid, rgb, unblended)

    out = np.empty((*rgb.shape[:2], 4), dtype=np.uint8)
    out[..., :3] = out_rgb.round()
    out[..., 3] = (alpha * 255.0).round()
    return Image.fromarray(out, "RGBA")


def _content_bbox(im: Image.Image) -> tuple[int, int, int, int]:
    alpha = np.asarray(remove_white_background(im))[..., 3]
    ys, xs = np.nonzero(alpha)
    if xs.size == 0:
        raise ValueError("Image is fully transparent after background removal")
    return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)


def _fit_square(im: Image.Image, size: int, pad_frac: float = 0.08) -> Image.Image:
    """Scale im to fit centered on a white size x size canvas."""
    content = max(1, size - 2 * round(size * pad_frac))
    scale = content / max(im.width, im.height)
    scaled = im.resize(
        (max(1, round(im.width * scale)), max(1, round(im.height * scale))),
        Image.LANCZOS,
    )
    canvas = Image.new("RGB", (size, size), (255, 255, 255))
    canvas.paste(scaled, ((size - scaled.width) // 2, (size - scaled.height) // 2))
    return canvas


def update_logo_and_favicon(
    source: Path | str = DEFAULT_SOURCE,
    logo_path: Path | str = DEFAULT_LOGO,
    favicon_path: Path | str = DEFAULT_FAVICON,
    logo_max_size: int = 800,
    favicon_sizes: tuple[int, ...] = FAVICON_SIZES,
) -> tuple[Path, Path]:
    """Generate the transparent site logo and favicon from ``source``.

    Returns (logo_path, favicon_path) paths written.
    """
    source = Path(source)
    logo_path = Path(logo_path)
    favicon_path = Path(favicon_path)

    base = _load(source)
    art = base.crop(_content_bbox(base))
    print(f"Artwork trimmed:  {art.width}x{art.height} (white background removed)")

    # Logo: resize while opaque, then remove the white background at the
    # final resolution so edges stay clean.
    scale = min(1.0, logo_max_size / max(art.width, art.height))
    logo = remove_white_background(
        art.resize(
            (max(1, round(art.width * scale)), max(1, round(art.height * scale))),
            Image.LANCZOS,
        )
    )
    logo_path.parent.mkdir(parents=True, exist_ok=True)
    logo.save(logo_path, "PNG", optimize=True)
    print(f"Logo written:   {logo_path} ({logo.width}x{logo.height}, transparent)")

    # Favicon: fit onto white squares, then remove the white so the margins
    # and edges become transparent. Largest frame must be first or Pillow
    # skips sizes larger than frame 0.
    favicon_path.parent.mkdir(parents=True, exist_ok=True)
    icons = [
        remove_white_background(_fit_square(art, s))
        for s in sorted(favicon_sizes, reverse=True)
    ]
    icons[0].save(
        favicon_path,
        "ICO",
        sizes=[(i.width, i.height) for i in icons],
        append_images=icons[1:],
    )
    print(f"Favicon written: {favicon_path} (sizes: {sorted(favicon_sizes)})")

    return logo_path, favicon_path


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "source",
        nargs="?",
        default=str(DEFAULT_SOURCE),
        help="Path to the source image",
    )
    args = parser.parse_args(argv)
    try:
        update_logo_and_favicon(source=args.source)
    except (FileNotFoundError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
