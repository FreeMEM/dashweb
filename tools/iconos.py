#!/usr/bin/env python3
"""Los iconos de la barra de Tachyon como ficheros ILBM (los lee cualquier Workbench 3.x por datatypes).

    python3 tools/iconos.py            # escribe iconos/*.iff

Salen de los SVG de Lucide (third_party/lucide, licencia ISC) pintados a 20x20 con rsvg-convert, con bordes
suavizados sobre el gris de los botones de MUI y en 32 colores como mucho (MUI los ajusta a la pantalla). Cada uno
lleva su color: azul oscuro los de navegar, rojo parar, verde actualizar, dorado el candado de HTTPS; los "apagados"
(atrás y adelante sin a dónde ir), en gris. Antes eran dibujos de 16x14 en los 4 colores del Workbench (tarea 45)."""

from pathlib import Path
import io
import re
import struct
import subprocess

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SVG = ROOT / "third_party" / "lucide"
LADO = 20
FONDO = (0xAA, 0xAA, 0xAA)        # el gris de los botones de MUI (el lápiz 0 del Workbench)
COLORES = 32

AZUL = "#1d3557"
GRIS = "#7a7a7a"

# nombre: (svg, color del trazo, relleno de la forma principal o None, grueso del trazo en el viewBox de 24[, borde de
# la forma rellena si no es el trazo])
ICONOS = {
    "atras": ("arrow-left", AZUL, None, 2.4),
    "adelante": ("arrow-right", AZUL, None, 2.4),
    "atras_apagado": ("arrow-left", GRIS, None, 2.0),
    "adelante_apagado": ("arrow-right", GRIS, None, 2.0),
    "recargar": ("rotate-cw", AZUL, None, 2.2),
    "parar": ("x", "#b3261e", None, 2.6),
    "inicio": ("house", AZUL, None, 2.0),
    "historial": ("history", AZUL, None, 2.0),
    "actualizar": ("circle-arrow-down", "#ffffff", "#2e9e48", 2.2, "#1e7a34"),
    "reiniciar": ("refresh-cw", "#1e7a34", None, 2.4),
    "candado": ("lock", "#5c4400", "#e8b100", 2.0),
    "candado_abierto": ("lock-open", "#555555", "#d0d0d0", 2.0),
    "estrella": ("star", "#4a4a4a", None, 2.0),
    "estrella_llena": ("star", "#a36b00", "#f5b400", 2.0),
}


def svg_coloreado(nombre, trazo, relleno, grueso, borde=None):
    """El SVG de Lucide con su color y grueso; con relleno, la primera forma (el círculo, el cuerpo del candado, la
    estrella) va rellena de ese color."""
    t = (SVG / f"{nombre}.svg").read_text()
    t = t.replace('stroke="currentColor"', f'stroke="{trazo}"').replace('stroke-width="2"', f'stroke-width="{grueso}"')
    if relleno:
        extra = f' stroke="{borde}"' if borde else ""
        t = re.sub(r"<(circle|rect|path)\b", lambda m: f'<{m.group(1)} fill="{relleno}"{extra}', t, count=1)
    return t


def pintar(svg, ancho=LADO, alto=LADO):
    png = subprocess.run(["rsvg-convert", "-w", str(ancho), "-h", str(alto)], input=svg.encode(),
                         capture_output=True, check=True).stdout
    icono = Image.open(io.BytesIO(png)).convert("RGBA")
    fondo = Image.new("RGBA", icono.size, FONDO + (255,))
    return Image.alpha_composite(fondo, icono).convert("RGB")


def ilbm(im) -> bytes:
    """ILBM sin comprimir (BMHD, CMAP, BODY) con los colores justos (2 a 32: los planos que hagan falta)."""
    q = im.quantize(colors=COLORES, method=Image.Quantize.MEDIANCUT)
    paleta = q.getpalette()[:3 * COLORES]
    usados = q.getextrema()[1] + 1
    planos = max(1, (usados - 1).bit_length())
    ancho, alto = q.size
    bytes_fila = (ancho + 15) // 16 * 2
    body = bytearray()
    px = q.load()
    for y in range(alto):
        for plano in range(planos):
            bits = bytearray(bytes_fila)
            for x in range(ancho):
                if (px[x, y] >> plano) & 1:
                    bits[x // 8] |= 0x80 >> (x % 8)
            body += bits
    # xAspect 1, yAspect 1: píxeles cuadrados (pantallas de tarjeta gráfica y las de 640x512)
    bmhd = struct.pack(">HHhhBBBBHBBhh", ancho, alto, 0, 0, planos, 0, 0, 0, 0, 1, 1, 640, 512)
    cmap = bytes(paleta[:3 * (1 << planos)]).ljust(3 * (1 << planos), b"\0")

    def trozo(nombre, datos):
        return nombre + struct.pack(">I", len(datos)) + datos + (b"\0" if len(datos) % 2 else b"")

    cuerpo = b"ILBM" + trozo(b"BMHD", bmhd) + trozo(b"CMAP", cmap) + trozo(b"BODY", bytes(body))
    return b"FORM" + struct.pack(">I", len(cuerpo)) + cuerpo


def main():
    destino = ROOT / "iconos"
    destino.mkdir(exist_ok=True)
    for nombre, datos in ICONOS.items():
        (destino / f"{nombre}.iff").write_bytes(ilbm(pintar(svg_coloreado(*datos))))
    # el logo de la ventana Acerca de (docs/logo/tachyon.svg, 580x128) a 260 de ancho
    logo = (ROOT / "docs" / "logo" / "tachyon.svg").read_text()
    (destino / "logo.iff").write_bytes(ilbm(pintar(logo, 260, 57)))
    print(f"{len(ICONOS) + 1} iconos en {destino}")


if __name__ == "__main__":
    main()
