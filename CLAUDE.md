# dashweb — guía para Claude

Navegador web ligero para AmigaOS 3.x escrito en Dash (`~/Projects/FreeMEMLang`, repo FreeMEM/dash), con
interfaz MUI 5, QuickJS (`third_party/quickjs`) y HTTPS (AmiSSL). Objetivo: PiStorm (Emu68) y emulación
(UAE con JIT); se compila para 68020 + FPU.

Plan, reglas y bitácora: `docs/DASHWEB_LOOP.md` (se trabaja con `/loop`, rama local `dev`, sin push).

## Dash

No se toca `~/Projects/FreeMEMLang` (otra sesión trabaja ahí). Se compila con un clon:
`~/.cache/dashweb/dash` (`$DASH`), actualizado con `git -C ~/.cache/dashweb/dash pull`. Lo que le falte
a Dash va a `docs/DASH_NECESIDADES.md`, con el rodeo usado.

## Comandos

```bash
export DASH_KICKSTART="/home/freemem/Descargas/Telegram Desktop/ks31a1200.rom"
export DASH_EMU_SYS=~/.cache/dash-emu/sys31
python3 tests/run.py            # compila tests/test_*.dash y los ejecuta en FS-UAE (A1200 + 68882)
python3 tests/run.py url -v     # solo los que contienen "url", con la salida de los que fallan
tools/build_qjs.sh 020fpu -m68020 -m68881   # QuickJS suelto
```

Directivas de los tests (`tests/run.py` las explica): `# expect-out:`, `# dash-flags:`, `# cflags:`,
`# emu-config:`, `# emu-needs:`. Los módulos se importan relativos al fichero (`import "../lib/x.dash"`).

## Estructura

- `src/`: el navegador. `lib/`: módulos reutilizables (red, URL, HTML, CSS...). `tests/`: tests y páginas.
- `third_party/quickjs`: QuickJS 2026-06-04 con tres cambios para AmigaOS (`docs/quickjs_amiga.md`).
- `tools/`: compilar QuickJS y ejecutarlo en el emulador.
