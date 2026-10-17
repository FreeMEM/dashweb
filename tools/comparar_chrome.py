#!/usr/bin/env python3
"""dashweb contra Chrome (tarea 31a): la misma web en Chrome (sin ventana, al tamaño de la zona de la página de
dashweb en la máquina RTG) y en dashweb (tools/medir_visor.py --maquina rtg), una al lado de la otra.

    tools/comparar_chrome.py https://freemem.space/            # una web
    tools/comparar_chrome.py                                   # las de tools/webs_prueba.txt
    tools/comparar_chrome.py --solo-chrome URL ...             # solo la captura de Chrome
    tools/comparar_chrome.py --dir /tmp/comparar --segundos 180 URL

Deja en --dir (por omisión build/comparar) <web>_chrome.png, <web>_dashweb.png y <web>.png (las dos juntas). Solo a
mano: son webs de terceros (no va en la batería). Necesita google-chrome-stable (o $CHROME), $DASH_KICKSTART_32 y
el sistema de la máquina RTG (~/.cache/dash-emu/sys32rtg), como medir_visor.
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
# la zona de la página de dashweb en la pantalla de 1024x768 de la máquina RTG (ventana abierta como la abre)
ZONA = (32, 84, 972, 698)
ANCHO, ALTO = ZONA[2] - ZONA[0], ZONA[3] - ZONA[1]


def nombre(url: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", url.lower().split("://", 1)[-1]).strip("_")[:60]


def chrome(url: str, destino: Path) -> bool:
    exe = os.environ.get("CHROME") or shutil.which("google-chrome-stable") or shutil.which("chromium")
    if not exe:
        print("sin Chrome (google-chrome-stable, chromium o $CHROME)", file=sys.stderr)
        return False
    with tempfile.TemporaryDirectory(prefix="comparar_chrome_") as perfil:
        try:
            # (virtual-time-budget: no esperar para siempre a una página que nunca acaba de cargar)
            r = subprocess.run([exe, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
                                f"--user-data-dir={perfil}", f"--window-size={ANCHO},{ALTO}",
                                "--virtual-time-budget=20000", f"--screenshot={destino}", url],
                               capture_output=True, text=True, timeout=120)
        except subprocess.TimeoutExpired:
            return False
    return r.returncode == 0 and destino.exists()


def dashweb(url: str, destino: Path, segundos: int) -> str:
    """La página en dashweb (recortada a su zona); lo que escribió (p. ej. "entera en N ms")"""
    with tempfile.TemporaryDirectory(prefix="comparar_dw_") as tmp:
        captura = Path(tmp) / "pantalla.png"
        r = subprocess.run([sys.executable, str(ROOT / "tools" / "medir_visor.py"), "--programa", "src/dashweb.dash",
                            "--maquina", "rtg", "--pagina", url, "--segundos", str(segundos),
                            "--captura", str(captura), "--captura-en", str(segundos - 10)],
                           cwd=ROOT, capture_output=True, text=True, timeout=segundos + 300)
        if captura.exists():
            Image.open(captura).crop(ZONA).save(destino)
        return r.stdout + r.stderr


def juntar(a: Path, b: Path, destino: Path, titulo: str):
    ia = Image.open(a).convert("RGB") if a.exists() else Image.new("RGB", (ANCHO, ALTO), "gray")
    ib = Image.open(b).convert("RGB") if b.exists() else Image.new("RGB", (ANCHO, ALTO), "gray")
    ia, ib = ia.crop((0, 0, ANCHO, ALTO)), ib.crop((0, 0, ANCHO, ALTO))
    junta = Image.new("RGB", (ANCHO * 2 + 12, ALTO + 24), "white")
    junta.paste(ia, (0, 24))
    junta.paste(ib, (ANCHO + 12, 24))
    d = ImageDraw.Draw(junta)
    d.text((4, 6), "Chrome: " + titulo, fill="black")
    d.text((ANCHO + 16, 6), "dashweb", fill="black")
    junta.save(destino)


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("urls", nargs="*")
    ap.add_argument("--dir", default=str(ROOT / "build" / "comparar"))
    ap.add_argument("--segundos", type=int, default=150, help="lo que se deja a dashweb antes de la captura (+10)")
    ap.add_argument("--solo-chrome", action="store_true")
    args = ap.parse_args()
    urls = args.urls or [l.strip() for l in (ROOT / "tools" / "webs_prueba.txt").read_text().splitlines()
                         if l.strip() and not l.startswith("#")]
    out = Path(args.dir)
    out.mkdir(parents=True, exist_ok=True)
    for url in urls:
        n = nombre(url)
        c, w = out / f"{n}_chrome.png", out / f"{n}_dashweb.png"
        ok = chrome(url, c)
        print(f"{url}: Chrome {'sí' if ok else 'no'}", flush=True)
        if args.solo_chrome:
            continue
        salida = dashweb(url, w, args.segundos)
        for linea in salida.splitlines():
            if "entera en" in linea or linea.startswith("JS:"):
                print("   " + linea[:200], flush=True)
        juntar(c, w, out / f"{n}.png", url)
        print(f"   -> {out / (n + '.png')}", flush=True)


if __name__ == "__main__":
    main()
