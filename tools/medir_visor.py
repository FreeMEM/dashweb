#!/usr/bin/env python3
"""Measure src/visor.dash in FS-UAE: serves tests/pages/ by HTTP (tests/servers/http.py), opens
a page in the visor and prints the times it reports (load, html, style, layout, paint).

    tools/medir_visor.py                       # tests/pages/prueba.html on the stock A1200
    tools/medir_visor.py --maquina objetivo    # 68040 + JIT at full speed (PiStorm-like)
    tools/medir_visor.py --pagina otra.html --captura visor.png
    tools/medir_visor.py --sistema ~/.cache/dash-emu/sys31web     # with fonts (tools/emu_sys_fuentes.sh)

Needs $DASH_KICKSTART and $DASH_EMU_SYS, like tests/run.py; Dash is $DASH (default the worktree).
"""
import argparse
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DASH = Path(os.environ.get("DASH", Path.home() / "Projects" / "FreeMEMLang-dashweb"))
PORT = 40861
MAQUINAS = {
    "a1200": "",
    "objetivo": "cpu = 68040\nfpu = 68040\njit_compiler = 1\nuae_cpu_speed = max\n",
}


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--pagina", default="prueba.html", help="file of tests/pages/")
    ap.add_argument("--maquina", choices=sorted(MAQUINAS), default="a1200")
    ap.add_argument("--captura", metavar="FILE.png", help="screen picture after the first paint")
    ap.add_argument("--fases", action="store_true", help="run tests/bench/fases.dash instead (no window)")
    ap.add_argument("--programa", default="src/visor.dash", help="the program to run (e.g. src/dashweb.dash, "
                    "with --sistema ~/.cache/dash-emu/sys31muiweb)")
    ap.add_argument("--sistema", metavar="DIR", help="emulated system (default $DASH_EMU_SYS; with fonts: "
                    "tools/emu_sys_fuentes.sh)")
    ap.add_argument("--segundos", type=int, default=40, help="the visor closes itself after this")
    args = ap.parse_args()

    sys.path.insert(0, str(DASH / "tools"))
    from emu_run import run_programs

    with tempfile.TemporaryDirectory(prefix="visor_") as tmp:
        exe = Path(tmp) / "visor"
        env = dict(os.environ, DASH_TEST_AUTOCLOSE=str(args.segundos))
        r = subprocess.run([str(DASH / "dash"), str(ROOT / ("tests/bench/fases.dash" if args.fases else args.programa)), "-o", str(exe)],
                           cwd=DASH, env=env, capture_output=True, text=True)
        if r.returncode != 0:
            sys.exit("compile failed:\n" + r.stdout + r.stderr)
        size = exe.stat().st_size
        server = subprocess.Popen([sys.executable, str(ROOT / "tests" / "servers" / "http.py"), str(PORT)],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(1)
        try:
            shot = (args.segundos - 5, args.captura) if args.captura else None
            out = run_programs([str(exe)], timeout=args.segundos + 60,
                               kickstart=os.environ.get("DASH_KICKSTART"),
                               extra_config="bsdsocket_library = 1\n" + MAQUINAS[args.maquina],
                               screenshot=shot, system=args.sistema, args=[f"http://127.0.0.1:{PORT}/pages/{args.pagina}"])[0]
        finally:
            server.kill()
            server.wait()
    print(f"{args.maquina}, programa de {size} bytes, rc {out.rc}")
    print(out.output or "(sin salida)")


if __name__ == "__main__":
    main()
