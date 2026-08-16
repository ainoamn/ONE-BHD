"""Render reproducible high-resolution PNG exports of the BHD vector identity."""

from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "brand"
TEAL = "#08a39f"
NAVY = "#174b70"


def cubic(p0, p1, p2, p3, steps=24):
    points = []
    for index in range(steps + 1):
        t = index / steps
        u = 1 - t
        points.append((
            u**3 * p0[0] + 3 * u**2 * t * p1[0] + 3 * u * t**2 * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u**2 * t * p1[1] + 3 * u * t**2 * p2[1] + t**3 * p3[1],
        ))
    return points


def mark_polygons():
    b = [(0, 0), (100, 0)]
    b += cubic((100, 0), (131, 0), (148, 17), (148, 43))[1:]
    b += cubic((148, 43), (148, 61), (139, 74), (123, 82))[1:]
    b += cubic((123, 82), (143, 88), (154, 104), (154, 124))[1:]
    b += cubic((154, 124), (154, 152), (133, 171), (101, 171))[1:]
    b += [(30, 171), (30, 143), (100, 143)]
    b += cubic((100, 143), (116, 143), (126, 135), (126, 123))[1:]
    b += cubic((126, 123), (126, 110), (115, 101), (97, 101))[1:]
    b += [(0, 101), (0, 74), (97, 74)]
    b += cubic((97, 74), (112, 74), (121, 66), (121, 53))[1:]
    b += cubic((121, 53), (121, 38), (111, 28), (96, 28))[1:]
    b += [(28, 28), (0, 0)]

    h = [(190, 109), (220, 82), (310, 82), (310, 0), (340, 0), (340, 171), (310, 171), (310, 109), (220, 109), (220, 171), (190, 171)]

    d = [(385, 0), (459, 0)]
    d += cubic((459, 0), (511, 0), (548, 35), (548, 85))[1:]
    d += cubic((548, 85), (548, 136), (511, 171), (459, 171))[1:]
    d += [(385, 171), (413, 143), (459, 143)]
    d += cubic((459, 143), (495, 143), (520, 120), (520, 85))[1:]
    d += cubic((520, 85), (520, 51), (495, 28), (459, 28))[1:]
    d += [(413, 28), (385, 0)]
    return b, h, d


def scaled(points, scale, offset=(0, 0)):
    ox, oy = offset
    return [(round(x * scale + ox), round(y * scale + oy)) for x, y in points]


def draw_mark(image, box):
    left, top, width, height = box
    scale = min(width / 548, height / 171)
    offset = (left + (width - 548 * scale) / 2, top + (height - 171 * scale) / 2)
    draw = ImageDraw.Draw(image)
    b, h, d = mark_polygons()
    draw.polygon(scaled(b, scale, offset), fill=TEAL)
    draw.polygon(scaled(h, scale, offset), fill=NAVY)
    draw.polygon(scaled(d, scale, offset), fill=TEAL)


def condensed_font(size):
    candidates = [
        Path("C:/Windows/Fonts/arialn.ttf"),
        Path("C:/Windows/Fonts/ARIALN.TTF"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default(size=size)


def render_full():
    width, height = 4096, 1331
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw_mark(image, (1112, 72, 1872, 585))

    label = "BIN HAMOOD DEVELOPMENT"
    font = condensed_font(265)
    scratch = Image.new("RGBA", (5000, 420), (0, 0, 0, 0))
    draw = ImageDraw.Draw(scratch)
    bbox = draw.textbbox((0, 0), label, font=font)
    draw.text((-bbox[0], -bbox[1]), label, font=font, fill=NAVY)
    crop = scratch.getbbox()
    wordmark = scratch.crop(crop)
    target_width = 3820
    target_height = round(wordmark.height * target_width / wordmark.width)
    wordmark = wordmark.resize((target_width, target_height), Image.Resampling.LANCZOS)
    image.alpha_composite(wordmark, ((width - target_width) // 2, 970))
    image.save(OUT / "bhd-logo-4096.png", optimize=True)


def render_mark():
    size = 2048
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_mark(image, (96, 690, 1856, 668))
    image.save(OUT / "bhd-mark-2048.png", optimize=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    render_full()
    render_mark()
    print(OUT / "bhd-logo-4096.png")
    print(OUT / "bhd-mark-2048.png")
