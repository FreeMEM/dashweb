#!/usr/bin/env python3
"""Runs the Amiga QuickJS build in FS-UAE with .js files as arguments.

    emu_qjs.py EXE JSDIR "cmd line 1" ["cmd line 2" ...] [--set key=value ...] [--timeout N]

Each command line runs as  DH0:qjs <line>  from DH0:js (JSDIR copied there); outputs
are printed in order. Kickstart: $DASH_KICKSTART; Libs/C from $DASH_EMU_SYS.
"""
import argparse, os, shutil, signal, subprocess, sys, tempfile, time
from pathlib import Path

CONFIG = """[fs-uae]
amiga_model = A1200
fast_memory = 8192
hard_drive_0 = {hd}
hard_drive_0_label = DH0
fullscreen = 0
automatic_input_grab = 0
floppy_drive_volume = 0
kickstart_file = {ks}
"""

ap = argparse.ArgumentParser()
ap.add_argument("exe"); ap.add_argument("jsdir"); ap.add_argument("lines", nargs="+")
ap.add_argument("--set", action="append", default=[]); ap.add_argument("--timeout", type=float, default=600)
a = ap.parse_args()

with tempfile.TemporaryDirectory(prefix="qjs_emu_") as tmp:
    tmp = Path(tmp); hd = tmp / "hd"; (hd / "S").mkdir(parents=True)
    sysdir = Path(os.environ["DASH_EMU_SYS"])
    for sub in ("Libs", "C"):
        shutil.copytree(sysdir / sub, hd / sub, dirs_exist_ok=True)
    for d in ("Fonts", "Locale", "Devs/Keymaps"):
        (hd / d).mkdir(parents=True, exist_ok=True)
    shutil.copy(a.exe, hd / "qjs")
    shutil.copytree(a.jsdir, hd / "js")
    seq = ["C:MakeDir RAM:T RAM:ENV", "C:Assign ENV: RAM:ENV", "C:Assign T: RAM:T",
           "C:Assign LOCALE: SYS:Locale", "C:Assign KEYMAPS: DEVS:Keymaps", "CD DH0:js"]
    for i, line in enumerate(a.lines):
        seq.append(f"DH0:qjs {line} >DH0:out{i}.txt")
        seq.append(f'Echo "$RC" >DH0:rc{i}.txt')
    seq.append('Echo "fin" >DH0:done.txt')
    (hd / "S" / "Startup-Sequence").write_text("\n".join(seq) + "\n")
    cfg = CONFIG.format(hd=hd, ks=os.environ["DASH_KICKSTART"])
    cfg += "".join(f"{kv.split('=', 1)[0].strip()} = {kv.split('=', 1)[1].strip()}\n" for kv in a.set)
    (tmp / "run.fs-uae").write_text(cfg)
    env = dict(os.environ, SDL_VIDEODRIVER="offscreen", SDL_AUDIODRIVER="dummy")
    t0 = time.time()
    p = subprocess.Popen(["fs-uae", str(tmp / "run.fs-uae")], cwd=tmp, env=env, stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL, start_new_session=True)
    try:
        while time.time() - t0 < a.timeout and not (hd / "done.txt").exists() and p.poll() is None:
            time.sleep(0.5)
        time.sleep(0.5)
    finally:
        try:
            os.killpg(p.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        p.wait()
    for i, line in enumerate(a.lines):
        out = (hd / f"out{i}.txt"); rc = (hd / f"rc{i}.txt")
        print(f"=== {line}: RC={rc.read_text().strip() if rc.exists() else 'TIMEOUT'}")
        if out.exists():
            print(out.read_text(errors="replace").rstrip())
    print(f"(host seconds: {time.time() - t0:.0f})")
