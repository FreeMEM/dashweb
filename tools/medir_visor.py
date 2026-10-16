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
    ap.add_argument("--pagina", default="prueba.html", help="file of tests/pages/ (or /route of tests/servers/http.py); several, with commas")
    ap.add_argument("--maquina", choices=sorted(MAQUINAS), default="a1200")
    ap.add_argument("--captura", metavar="FILE.png", help="screen picture after the first paint")
    ap.add_argument("--fases", action="store_true", help="run tests/bench/fases.dash instead (no window)")
    ap.add_argument("--programa", default="src/visor.dash", help="the program to run (e.g. src/dashweb.dash, "
                    "with --sistema ~/.cache/dash-emu/sys31muiweb)")
    ap.add_argument("--sistema", metavar="DIR", help="emulated system (default $DASH_EMU_SYS; with fonts: "
                    "tools/emu_sys_fuentes.sh)")
    ap.add_argument("--acciones", metavar="'TÍTULO e 100 c X Y ...'",
                    help="tools/amiga/clicar.dash in the background: clicks and keys in that window")
    ap.add_argument("--local", action="store_true",
                    help="the page from the emulated disk, without network: FS-UAE's bsdsocket.library makes the "
                         "emulated CPU many times slower (measure the A1200 like this)")
    ap.add_argument("--perfil", action="store_true", help="build with ./dash --profile (the table goes to the output)")
    ap.add_argument("--guardar", metavar="DIR", help="keep the emulated disk there (outputs: out0.txt, bg0.txt)")
    ap.add_argument("--segundos", type=int, default=40, help="the visor closes itself after this")
    ap.add_argument("--host", default="127.0.0.1", help="the server name in the addresses (e.g. x.lento with --dns-lento)")
    ap.add_argument("--dns-lento", type=int, metavar="MS", help="names ending in .lento take MS ms to look up "
                    "(tools/lento/dns_lento.c in FS-UAE with LD_PRELOAD) and give 127.0.0.1")
    ap.add_argument("--tls-lento", action="store_true", help="HTTPS whose server waits 4 s before the handshake "
                    "(needs a system with AmiSSL, e.g. ~/.cache/dash-emu/sys31muisslweb)")
    ap.add_argument("--tls", action="store_true", help="HTTPS (the test CA's certificate is for localhost and 127.0.0.1)")
    ap.add_argument("--captura-en", type=float, metavar="S", help="take --captura S seconds after boot (default: "
                    "5 s before the end)")
    args = ap.parse_args()

    sys.path.insert(0, str(DASH / "tools"))
    from emu_run import run_programs
    # emu_run compiles .dash (clicar.dash) with "python3 -m compiler.main": Dash's compiler
    os.environ["PYTHONPATH"] = str(DASH) + os.pathsep + os.environ.get("PYTHONPATH", "")

    with tempfile.TemporaryDirectory(prefix="visor_") as tmp:
        exe = Path(tmp) / "visor"
        env = dict(os.environ, DASH_TEST_AUTOCLOSE=str(args.segundos))
        if args.perfil:
            env["DASH_PROFILE"] = "1"
        r = subprocess.run([str(DASH / "dash"), str(ROOT / ("tests/bench/fases.dash" if args.fases else args.programa)), "-o", str(exe)],
                           cwd=DASH, env=env, capture_output=True, text=True)
        if r.returncode != 0:
            sys.exit("compile failed:\n" + r.stdout + r.stderr)
        size = exe.stat().st_size
        modo = ["tls-lento"] if args.tls_lento else ["tls"] if args.tls else []
        server = subprocess.Popen([sys.executable, str(ROOT / "tests" / "servers" / "http.py"), str(PORT)] + modo,
                                  stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(3 if modo else 1)
        if args.dns_lento:
            shim = Path(tmp) / "dns_lento.so"
            subprocess.run(["gcc", "-shared", "-fPIC", "-O2", "-o", str(shim),
                            str(ROOT / "tools" / "lento" / "dns_lento.c"), "-ldl"], check=True)
            os.environ["LD_PRELOAD"] = str(shim)          # FS-UAE inherits it
            os.environ["DNS_LENTO_MS"] = str(args.dns_lento)
        try:
            shot = (args.captura_en or args.segundos - 5, args.captura) if args.captura else None
            esquema = "https" if modo else "http"
            programs = [str(exe)]
            prog_args = [" ".join(f"{esquema}://{args.host}:{PORT}{p}" if p.startswith("/")
                                  else f"{esquema}://{args.host}:{PORT}/pages/{p}" for p in args.pagina.split(","))]
            red = "bsdsocket_library = 1\n"
            if args.local:
                # the page goes to the disk as a second "program" (DH0:p1; running it just fails)
                programs.append(str(ROOT / "tests" / "pages" / args.pagina))
                prog_args = ["DH0:p1", ""]
                red = ""
            out = run_programs(programs, timeout=args.segundos + 60,
                               kickstart=os.environ.get("DASH_KICKSTART"),
                               extra_config=red + MAQUINAS[args.maquina],
                               screenshot=shot, system=args.sistema, keep=args.guardar,
                               background=[(str(ROOT / "tools" / "amiga" / "clicar.dash"), args.acciones)]
                               if args.acciones else None, args=prog_args)[0]
        finally:
            server.kill()
            server.wait()
    print(f"{args.maquina}, programa de {size} bytes, rc {out.rc}")
    print(out.output or "(sin salida)")


if __name__ == "__main__":
    main()
