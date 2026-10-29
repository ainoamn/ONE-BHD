"""Package the generated BHD brand kit for the website and Git delivery."""

from __future__ import annotations

import hashlib
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KIT = ROOT / "brand-kit"
DOWNLOADS = ROOT / "public" / "downloads"
PDF = ROOT / "output" / "pdf" / "BHD-Visual-Identity-Guidelines.pdf"
BOARD = KIT / "brand-board" / "BHD-Brand-Board-4K.png"
ZIP = DOWNLOADS / "BHD-Brand-Kit.zip"


def digest(path: Path) -> str:
    hasher = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def main() -> None:
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    docs = KIT / "documentation"
    docs.mkdir(parents=True, exist_ok=True)
    shutil.copy2(PDF, docs / PDF.name)

    files = sorted(path for path in KIT.rglob("*") if path.is_file() and path.name not in {"MANIFEST.txt", "SHA256SUMS.txt"})
    manifest = [
        "BHD BRAND KIT - VERSION 1.0",
        "Bin Hamood Development - Build Higher Dreams",
        "Generated 2026-08-16",
        "",
        f"Total files before manifest/checksums: {len(files)}",
        "",
    ]
    manifest.extend(f"{path.relative_to(KIT).as_posix()}  ({path.stat().st_size} bytes)" for path in files)
    (KIT / "MANIFEST.txt").write_text("\n".join(manifest) + "\n", encoding="utf-8")

    checksum_files = sorted(path for path in KIT.rglob("*") if path.is_file() and path.name != "SHA256SUMS.txt")
    sums = [f"{digest(path)}  {path.relative_to(KIT).as_posix()}" for path in checksum_files]
    (KIT / "SHA256SUMS.txt").write_text("\n".join(sums) + "\n", encoding="ascii")

    with zipfile.ZipFile(ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(p for p in KIT.rglob("*") if p.is_file()):
            archive.write(path, Path("BHD-Brand-Kit") / path.relative_to(KIT))

    shutil.copy2(PDF, DOWNLOADS / PDF.name)
    shutil.copy2(BOARD, DOWNLOADS / BOARD.name)
    print(f"Packaged {sum(1 for p in KIT.rglob('*') if p.is_file())} files into {ZIP}")


if __name__ == "__main__":
    main()
