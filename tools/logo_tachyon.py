#!/usr/bin/env python3
"""El logo de Tachyon: una esfera con un anillo plano en perspectiva y dos cortes que siguen sus paralelos (la
esfera está incompleta y el ojo la completa). Letras: Audiowide (Google Fonts, licencia OFL).

    python3 tools/logo_tachyon.py docs/logo [fonts.conf]   # SVG y PNG, claro y oscuro, logo y marca cuadrada
    python3 tools/logo_tachyon.py --icono                  # la marca en píxeles para ICONO_TACHYON (iconos_wb.py)

Para el logo con letras hacen falta inkscape (pasa el texto a trazos: el SVG final no necesita la fuente) y
rsvg-convert; fonts.conf es un fontconfig que encuentre Audiowide si no está instalada."""

import math
import os
import subprocess
import sys
from pathlib import Path

TINTA, AZUL, TINTA_OSCURO = "#0B1736", "#2E5BFF", "#E8ECF8"
CX, CY, R = 92, 64, 27                  # la esfera
RO, RI, K, ANG = 50, 33, 0.31, -12      # el anillo: radios de fuera y de dentro, aplastado (seno de la vista), giro
HUECO = 3.5                             # separación entre anillo y esfera


def elipse(rx, ry, t0, t1, n=160):
    a = math.radians(ANG)
    for i in range(n + 1):
        t = math.radians(t0 + (t1 - t0) * i / n)
        u, v = rx * math.cos(t), ry * math.sin(t)
        yield CX + u * math.cos(a) - v * math.sin(a), CY + u * math.sin(a) + v * math.cos(a)


def camino(p):
    return "M" + " L".join(f"{x:.2f},{y:.2f}" for x, y in p) + " Z"


def corte(lat, t1, ancho, t0=158, n=80):
    """Corte por el paralelo de latitud lat (cara de delante), de t0 a t1, afilándose; por la izquierda sigue la
    tangente y sale de la esfera sin escalón"""
    a = math.radians(ANG)
    rl = R * math.cos(math.radians(lat))
    oy = -R * math.sin(math.radians(lat)) * math.cos(math.asin(K))
    tr = math.radians(t0)
    tu, tv = -math.sin(tr), K * math.cos(tr)
    tn = math.hypot(tu, tv)
    arriba, abajo = [], []
    for i in range(-1, n + 1):
        x = max(i, 0) / n
        t = math.radians(t0 - (t0 - t1) * x)
        w = ancho * (1 - x) / 2
        u, v = rl * math.cos(t), oy + rl * K * math.sin(t)
        if i < 0:
            u, v = u + tu / tn * 30, v + tv / tn * 30
        for lista, s in ((arriba, -1), (abajo, 1)):
            vv = v + s * w
            lista.append((CX + u * math.cos(a) - vv * math.sin(a), CY + u * math.sin(a) + vv * math.cos(a)))
    return camino(arriba + abajo[::-1])


def marca(tinta):
    anillo = camino(elipse(RO, RO * K, 0, 360)) + " " + camino(elipse(RI, RI * K, 0, 360))
    M = 'maskUnits="userSpaceOnUse" x="-50" y="-50" width="300" height="250"'
    blanco = '<rect x="-50" y="-50" width="300" height="250" fill="white"/>'
    giro = f'transform="rotate({ANG} {CX} {CY})"'
    hueco = (f'<path d="{anillo}" fill="black" fill-rule="evenodd" stroke="black" stroke-width="{2 * HUECO}" '
             f'stroke-linejoin="round"/>')
    cortes = "".join(f'<path d="{corte(*c)}" fill="black"/>' for c in ((50, 55, 6.0), (20, 25, 6.0)))
    # la mitad de atrás del anillo la tapa la esfera; la de delante abre un hueco en la esfera
    return f'''<defs>
  <clipPath id="atras"><rect x="-50" y="-50" width="300" height="{CY + 50}" {giro}/></clipPath>
  <clipPath id="delante"><rect x="-50" y="{CY}" width="300" height="200" {giro}/></clipPath>
  <mask id="m-anillo" {M}>{blanco}<g clip-path="url(#atras)"><circle cx="{CX}" cy="{CY}" r="{R + HUECO}"/></g></mask>
  <mask id="m-esfera" {M}>{blanco}<g clip-path="url(#delante)">{hueco}</g>{cortes}</mask>
</defs>
<circle cx="{CX}" cy="{CY}" r="{R}" fill="{AZUL}" mask="url(#m-esfera)"/>
<path d="{anillo}" fill="{tinta}" fill-rule="evenodd" mask="url(#m-anillo)"/>'''


def svg_marca(tinta):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="{CX - 64} {CY - 64} 128 128">'
            f'{marca(tinta)}</svg>\n')


def svg_logo(tinta):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="580" height="128" viewBox="0 0 580 128">{marca(tinta)}'
            f'<text x="160" y="86" font-family="Audiowide" font-size="58" fill="{tinta}">Tachyon</text></svg>\n')


def icono(ancho=54, alto_pixel=1.35):
    """La marca en ancho x alto píxeles de 4 colores (. gris, N negro, A azul): cada píxel toma el color que más
    ocupa en su celda. Los píxeles se cuentan alto_pixel veces más altos que anchos."""
    from PIL import Image
    escala = 16
    x0, x1, y0, y1 = CX - 53, CX + 53, CY - 30, CY + 30
    alto = round((y1 - y0) / (x1 - x0) * ancho / alto_pixel)
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{ancho * escala}" height="{alto * escala}" '
         f'viewBox="{x0} {y0} {x1 - x0} {y1 - y0}" preserveAspectRatio="none">{marca(TINTA)}</svg>')
    png = subprocess.run(["rsvg-convert"], input=s.encode(), capture_output=True, check=True).stdout
    import io
    img = Image.open(io.BytesIO(png)).convert("RGBA")
    filas = []
    for y in range(alto):
        fila = ""
        for x in range(ancho):
            cuenta = {".": 0, "N": 0, "A": 0}
            for yy in range(y * escala, (y + 1) * escala, 2):
                for xx in range(x * escala, (x + 1) * escala, 2):
                    r, g, b, al = img.getpixel((xx, yy))
                    cuenta["." if al < 128 else ("A" if b > 200 and r < 120 else "N")] += 1
            fila += max(cuenta, key=cuenta.get)
        filas.append(fila)
    return filas


def main():
    if sys.argv[1:2] == ["--icono"]:
        for f in icono():
            print(f'    "{f}",')
        return
    dest = Path(sys.argv[1])
    dest.mkdir(parents=True, exist_ok=True)
    entorno = dict(os.environ)
    if len(sys.argv) > 2:
        entorno["FONTCONFIG_FILE"] = sys.argv[2]
    for suf, tinta, fondo in (("", TINTA, "white"), ("_oscuro", TINTA_OSCURO, "#14161f")):
        (dest / f"tachyon_marca{suf}.svg").write_text(svg_marca(tinta))
        bruto = dest / f"tachyon{suf}.texto.svg"
        bruto.write_text(svg_logo(tinta))
        subprocess.run(["inkscape", str(bruto), "--export-text-to-path", "--export-plain-svg",
                        f"--export-filename={dest / f'tachyon{suf}.svg'}"], env=entorno, check=True,
                       capture_output=True)
        bruto.unlink()
        subprocess.run(["rsvg-convert", "-w", "1160", "-b", fondo, str(dest / f"tachyon{suf}.svg"),
                        "-o", str(dest / f"tachyon{suf}.png")], check=True)
        subprocess.run(["rsvg-convert", "-w", "512", str(dest / f"tachyon_marca{suf}.svg"),
                        "-o", str(dest / f"tachyon_marca{suf}.png")], check=True)


if __name__ == "__main__":
    main()
