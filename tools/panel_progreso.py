#!/usr/bin/env python3
"""Los datos del panel de progreso (artefacto "Progreso de dashweb"): las tareas del plan, las baterías de la
bitácora y los commits desde la última versión, de docs/DASHWEB_LOOP.md y git; las medidas, Acid2 y las pruebas de
estándares y el avance por áreas (a ojo), de docs/panel/*.json (los mantiene el loop). Escribe un JSON por dataset en el directorio que se le dé.

    python3 tools/panel_progreso.py /tmp/panel
"""
import json, re, subprocess, sys, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLAN = ROOT / "docs" / "DASHWEB_LOOP.md"
VERSION = "v0.2.0-alfa"

def tareas(texto):
    filas = []
    padre = ""
    for linea in texto.splitlines():
        m = re.match(r'^(\s*)(?:- )?\[( |x|~)\] ([A-Za-z]?\d+[a-z]?\d*)\. (.*)$', linea)
        if not m:
            continue
        sangria, marca, ident, resto = m.groups()
        if not sangria:
            padre = re.match(r'[A-Za-z]?\d+', ident).group(0)
        estado = {"x": "hecha", "~": "en curso", " ": "pendiente"}[marca]
        resto = re.sub(r'\*\*', '', resto)
        resto = re.sub(r'^\([^)]*\)\s*', '', resto)
        titulo = resto.split('. ')[0].strip()
        if len(titulo) > 90:
            titulo = titulo[:87].rstrip() + "..."
        filas.append({"id": ident, "grupo": padre if sangria else ident, "nivel": 1 if sangria else 0,
                      "tarea": titulo, "estado": estado})
    return filas

def baterias(texto):
    filas = []
    entrada = ""
    fecha = ""
    for linea in texto.splitlines():
        h = re.match(r'^### (\d{4}-\d{2}-\d{2}) — (.*)$', linea)
        if h:
            fecha, entrada = h.groups()
            continue
        for a, t in re.findall(r'[Bb]atería[^:]*: (\d+)/(\d+)', linea):
            filas.append({"n": len(filas) + 1, "fecha": fecha, "entrada": entrada[:80], "aprobadas": int(a),
                          "total": int(t)})
    return filas

def commits():
    salida = subprocess.run(["git", "-C", str(ROOT), "log", "--reverse", "--format=%h%x09%cI%x09%s",
                             VERSION + "..HEAD"], capture_output=True, text=True).stdout
    filas = []
    for linea in salida.splitlines():
        h, fecha, asunto = linea.split("\t", 2)
        m = re.match(r'^([0-9]+[a-z]?\d*(?: ?\(\d+\))?)\s*-\s*(.*)$', asunto)
        tarea = m.group(1) if m else ""
        filas.append({"hash": h, "fecha": fecha, "tarea": tarea, "resumen": asunto[:120]})
    return filas

def main():
    destino = Path(sys.argv[1] if len(sys.argv) > 1 else "panel")
    destino.mkdir(parents=True, exist_ok=True)
    texto = PLAN.read_text()
    datos = {"tareas": tareas(texto), "baterias": baterias(texto), "commits": commits()}
    for nombre in ("medidas", "acid2", "estandares", "areas"):
        datos[nombre] = json.loads((ROOT / "docs" / "panel" / (nombre + ".json")).read_text())
    for nombre, filas in datos.items():
        (destino / (nombre + ".json")).write_text(json.dumps(filas, ensure_ascii=False, indent=0))
        print(nombre, len(filas))

main()
