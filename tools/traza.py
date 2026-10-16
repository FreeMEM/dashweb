#!/usr/bin/env python3
"""Corre tools/traza_maqueta.dash en el emulador (máquina objetivo) con una página de disco o de la red.

    tools/traza.py pagina.html [ancho] [niveles]
    tools/traza.py https://ejemplo.org/ [ancho] [niveles]
"""
import os, sys, tempfile, subprocess
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
DASH = Path(os.environ.get("DASH", Path.home() / "Projects" / "FreeMEMLang-dashweb"))
sys.path.insert(0, str(DASH / "tools"))
from emu_run import run_programs

pagina, ancho, niveles = sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "940", sys.argv[3] if len(sys.argv) > 3 else "6"
servidor = None
if not pagina.startswith("http") and Path(pagina).resolve().parent == ROOT / "tests" / "pages":
    # una página de tests/pages: por la red de pruebas (tests/servers/http.py), que es mucho más rápido
    # que copiarla al disco emulado como un programa más
    import time
    servidor = subprocess.Popen([sys.executable, str(ROOT / "tests" / "servers" / "http.py"), "40862"])
    time.sleep(1)
    pagina = "http://127.0.0.1:40862/pages/" + Path(pagina).name
if len(sys.argv) > 5:            # y además los dibujos entre dos alturas
    niveles = niveles + " " + sys.argv[4] + " " + sys.argv[5]
with tempfile.TemporaryDirectory(prefix="traza_") as tmp:
    exe = Path(tmp) / "traza"
    r = subprocess.run([str(DASH / "dash"), str(ROOT / "tools" / "traza_maqueta.dash"), "-o", str(exe)], cwd=DASH,
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(r.stdout + r.stderr)
    cfg = "cpu = 68040\nfpu = 68040\njit_compiler = 1\nuae_cpu_speed = max\nzorro_iii_memory = 131072\n"
    if pagina.startswith("http"):
        # por la red: AmiSSL para https
        out = run_programs([str(exe)], timeout=900, kickstart=os.environ.get("DASH_KICKSTART"),
                           extra_config=cfg + "bsdsocket_library = 1\n",
                           system=os.path.expanduser("~/.cache/dash-emu/sys31muisslweb"), args=[pagina + " " + ancho + " " + niveles])[0]
    else:
        out = run_programs([str(exe), pagina], timeout=600, kickstart=os.environ.get("DASH_KICKSTART"), extra_config=cfg,
                           system=os.path.expanduser("~/.cache/dash-emu/sys31muiweb"), args=["DH0:p1 " + ancho + " " + niveles, ""])[0]
    print(out.output)
if servidor:
    servidor.terminate()
