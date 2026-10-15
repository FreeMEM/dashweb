# dashweb

Navegador web ligero para **Commodore Amiga**, escrito en [Dash](https://github.com/FreeMEM/dash) con
interfaz **MUI 5**: XHTML, CSS, JavaScript moderno y HTTPS.

Es también el banco de pruebas de Dash: un programa grande y exigente que obliga a hacer crecer el
lenguaje, sus librerías y su rendimiento.

## Estado

Empezando. Lo que hay:

- `third_party/quickjs`: el motor JavaScript, [QuickJS](https://bellard.org/quickjs/) de Fabrice Bellard
  (versión 2026-06-04, ES2023+, licencia MIT), con tres cambios de una línea para AmigaOS
  (ver [docs/quickjs_amiga.md](docs/quickjs_amiga.md)). Sus tests pasan en un A1200 emulado.
- `tools/build_qjs.sh`, `tools/emu_qjs.py`: compilarlo y ejecutar JavaScript en FS-UAE.

## Requisitos previstos

- AmigaOS 3.x con un 68030 o superior y FPU (68881/68882 o la del 040/060), y mucha memoria Fast.
  Un A500 o un A1200 sin ampliar no son el objetivo.
- MUI 5, AmiSSL 5 (HTTPS), una pila TCP/IP (`bsdsocket.library`).

## Compilar el motor JavaScript

Necesita el toolchain de Dash (`m68k-amigaos-gcc` en `/opt/amiga`) y el repo de Dash al lado
(`../FreeMEMLang`, o la variable `DASH`), del que se usa el float por software.

```bash
tools/build_qjs.sh 000                       # 68000, float por software (fp-bit)
tools/build_qjs.sh 020fpu -m68020 -m68881    # 68020+ con FPU
export DASH_KICKSTART=... DASH_EMU_SYS=...   # como en Dash
tools/emu_qjs.py build/qjs-000/qjs tests/js "hello.js" "test_language.js"
```

## Licencia

MIT (ver [LICENSE](LICENSE)). `third_party/quickjs` también es MIT.
