#!/usr/bin/env python3
"""Los iconos de la barra de dashweb como ficheros ILBM (los lee cualquier Workbench 3.1).

    python3 tools/iconos.py            # escribe iconos/*.iff

Dibujos de 16x14 píxeles con los cuatro colores del Workbench (gris, negro, blanco, azul): en una
pantalla de 4 colores salen tal cual y en una de más colores MUI los pone igual. El fondo es el
gris del botón."""

from pathlib import Path
import struct

ROOT = Path(__file__).resolve().parent.parent
ANCHO, ALTO = 16, 14
PALETA = [(0xAA, 0xAA, 0xAA), (0x00, 0x00, 0x00), (0xFF, 0xFF, 0xFF), (0x66, 0x88, 0xBB)]

# . gris (fondo), # negro, o blanco, + azul
DIBUJOS = {
    "atras": [
        "................",
        "......#.........",
        ".....##.........",
        "....#+#.........",
        "...#++#########.",
        "..#+++++++++++#.",
        ".#++++++++++++#.",
        "..#+++++++++++#.",
        "...#++#########.",
        "....#+#.........",
        ".....##.........",
        "......#.........",
        "................",
        "................",
    ],
    "recargar": [
        "................",
        ".....######.#...",
        "...##......###..",
        "..#.......####..",
        ".#..........#...",
        ".#..............",
        "#...............",
        "#.............#.",
        ".#...........#..",
        ".#...........#..",
        "..#.........#...",
        "...##.....##....",
        ".....#####......",
        "................",
    ],
    "parar": [
        "................",
        "..##.......##...",
        "..###.....###...",
        "...###...###....",
        "....###.###.....",
        ".....#####......",
        "......###.......",
        ".....#####......",
        "....###.###.....",
        "...###...###....",
        "..###.....###...",
        "..##.......##...",
        "................",
        "................",
    ],
    "inicio": [
        "................",
        ".......##.......",
        "......#oo#......",
        ".....#oooo#.....",
        "....#oooooo#....",
        "...#oooooooo#...",
        "..##oooooooo##..",
        "....#oooooo#....",
        "....#oo##oo#....",
        "....#oo#+#o#....",
        "....#oo#+#o#....",
        "....########....",
        "................",
        "................",
    ],
    "historial": [
        "................",
        ".....######.....",
        "...##oooooo##...",
        "..#ooooo#oooo#..",
        ".#oooooo#ooooo#.",
        ".#oooooo#ooooo#.",
        ".#oooooo####oo#.",
        ".#ooooooooooo+#.",
        ".#oooooooooo++#.",
        "..#oooooooo++#..",
        "...##oooo+++#...",
        ".....######.....",
        "................",
        "................",
    ],
}


def espejo(filas):
    return [f[::-1] for f in filas]


def apagado(filas):
    """La versión sin uso: solo el contorno, en blanco (MUI taparía con una trama la imagen desactivada)."""
    return [f.replace("+", ".").replace("#", "o") for f in filas]


DIBUJOS["adelante"] = espejo(DIBUJOS["atras"])
DIBUJOS["atras_apagado"] = apagado(DIBUJOS["atras"])
DIBUJOS["adelante_apagado"] = apagado(DIBUJOS["adelante"])

COLOR = {".": 0, "#": 1, "o": 2, "+": 3}


def ilbm(filas) -> bytes:
    """ILBM de 2 planos sin comprimir (BMHD, CMAP, BODY)."""
    assert len(filas) == ALTO and all(len(f) == ANCHO for f in filas), filas
    bytes_fila = (ANCHO + 15) // 16 * 2
    body = bytearray()
    for fila in filas:
        for plano in range(2):
            bits = bytearray(bytes_fila)
            for x, c in enumerate(fila):
                if (COLOR[c] >> plano) & 1:
                    bits[x // 8] |= 0x80 >> (x % 8)
            body += bits
    # xAspect 10, yAspect 11: píxeles casi cuadrados; pageWidth/Height de la pantalla de 640x256
    bmhd = struct.pack(">HHhhBBBBHBBhh", ANCHO, ALTO, 0, 0, 2, 0, 0, 0, 0, 10, 11, 640, 256)
    cmap = bytes(v for rgb in PALETA for v in rgb)

    def trozo(nombre, datos):
        return nombre + struct.pack(">I", len(datos)) + datos + (b"\0" if len(datos) % 2 else b"")

    cuerpo = b"ILBM" + trozo(b"BMHD", bmhd) + trozo(b"CMAP", cmap) + trozo(b"BODY", bytes(body))
    return b"FORM" + struct.pack(">I", len(cuerpo)) + cuerpo


def main():
    destino = ROOT / "iconos"
    destino.mkdir(exist_ok=True)
    for nombre, filas in DIBUJOS.items():
        (destino / f"{nombre}.iff").write_bytes(ilbm(filas))
    print(f"{len(DIBUJOS)} iconos en {destino}")


if __name__ == "__main__":
    main()
