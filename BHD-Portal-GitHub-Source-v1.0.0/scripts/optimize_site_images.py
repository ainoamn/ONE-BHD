"""Create the lightweight hero derivative while retaining the full social image."""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "og.png"
TARGET = ROOT / "public" / "images" / "bhd-philosophy-hero.webp"

with Image.open(SOURCE) as image:
    image = image.convert("RGB")
    image.thumbnail((1200, 630), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (1200, 630), "#092d24")
    offset = ((canvas.width - image.width) // 2, (canvas.height - image.height) // 2)
    canvas.paste(image, offset)
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(TARGET, "WEBP", quality=84, method=6)

print(TARGET)
