# dashweb

Navegador web ligero para **Commodore Amiga**, escrito en [Dash](https://github.com/FreeMEM/dash) con
interfaz **MUI 5**: XHTML, CSS, JavaScript moderno y HTTPS.

Es también el banco de pruebas de Dash: un programa grande y exigente que obliga a hacer crecer el
lenguaje, sus librerías y su rendimiento.

## Estado

Fase A terminada (sin MUI): `src/visor.dash` abre una página (fichero o URL http/https), la maqueta, la pinta
en una ventana normal y ejecuta su JavaScript. Fase B (MUI 5) por empezar. Plan y bitácora en
[docs/DASHWEB_LOOP.md](docs/DASHWEB_LOOP.md), módulos en [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

- Red: TCP (`bsdsocket.library`), HTTP/1.1 (longitud, `chunked`, redirecciones) y HTTPS con AmiSSL 5.
- HTML tolerante (como los navegadores), árbol DOM, entidades, UTF-8 a Latin-1.
- CSS: selectores (con especificidad), cascada, herencia, atajos, `<style>`, `<link>`, `@import`.
- Maquetación en bloque y en línea con las fuentes del Amiga, listas, tablas sencillas, bordes, fondos.
- Imágenes por datatypes (ILBM siempre; PNG, GIF y JPEG con los datatypes de 3.2), escaladas.
- JavaScript con QuickJS (ES2023+) y `Math.*` de fdlibm: DOM (`getElementById`, `querySelector(All)`,
  `innerHTML`, crear y mover nodos...), eventos de clic, `setTimeout`/`setInterval`.

Lo que dashweb ha necesitado y no tenía Dash se ha añadido a Dash (rama `dashweb`, tareas D1-D27): textos
rápidos, listas y diccionarios con tipo, red, TLS, fuentes, imágenes, C de fuera (`@link`, `@c`), etc.

### Medidas (FS-UAE, 2026-10-16)

`objetivo` = 68040 + JIT a toda velocidad (lo más parecido a un PiStorm); `A1200` = 68020 a 14 MHz. En ms.

| Página | Máquina | carga | html | js | estilo | imágenes | maqueta | pintar | memoria |
|---|---|---|---|---|---|---|---|---|---|
| prueba.html (8,8 KB) | objetivo | 40 | 28 | 0 | 102 | 0 | 295 | 21 | 357 KB |
| prueba.html | A1200 | 3770 | 1626 | 15 | 7363 | 17 | 9463 | 90 | 357 KB |
| imagenes.html | objetivo | 4 | 3 | 0 | 33 | 6 | 157 | 26 | 173 KB |
| imagenes.html | A1200 | 304 | 182 | 2 | 2501 | 316 | 769 | 94 | 173 KB |
| js.html | objetivo | 5 | 3 | 29 | 34 | 0 | 157 | 16 | 333 KB |
| js.html | A1200 | 380 | 155 | 1633 | 2589 | 9 | 793 | 51 | 333 KB |

Con las fuentes del Workbench (helvetica, times, courier). El visor ocupa 1 MB (casi todo QuickJS). En la
configuración objetivo una página va en menos de medio segundo; en un A1200 estilo y maqueta son lentos (hay
un coste fijo de unos 2,5 s en el estilo, por mirar).

## Requisitos previstos

- AmigaOS 3.x con un 68030 o superior y FPU (68881/68882 o la del 040/060), y mucha memoria Fast.
  Un A500 o un A1200 sin ampliar no son el objetivo.
- MUI 5, AmiSSL 5 (HTTPS), una pila TCP/IP (`bsdsocket.library`).

## Probar

Necesita el toolchain de Dash (`m68k-amigaos-gcc` en `/opt/amiga`) y Dash en `~/Projects/FreeMEMLang-dashweb`
(o la variable `DASH`). Las variables del emulador son las de Dash (`docs/INSTALACION.md` de Dash).

```bash
python3 tests/run.py                   # compila los tests y los ejecuta en FS-UAE
python3 tests/run.py --memcheck        # con la comprobación de memoria de Dash
tools/medir_visor.py --pagina prueba.html --maquina objetivo --captura visor.png
tools/emu_sys_fuentes.sh ~/.cache/dash-emu/sys31ssl <disco del Workbench .hdf> ~/.cache/dash-emu/sys31web
```

## Compilar el motor JavaScript

Necesita el toolchain de Dash (`m68k-amigaos-gcc` en `/opt/amiga`) y el repo de Dash al lado
(`../FreeMEMLang`, o la variable `DASH`), del que se usa el float por software.

```bash
tools/build_qjs.sh 000                       # 68000, float por software (fp-bit)
tools/build_qjs.sh 020fpu -m68020 -m68881    # 68020+ con FPU
tools/build_qjs.sh lib                       # build/qjs-lib/libqjs.a para lib/js.dash (con fdlibm)
export DASH_KICKSTART=... DASH_EMU_SYS=...   # como en Dash
tools/emu_qjs.py build/qjs-000/qjs tests/js "hello.js" "test_language.js"
```

## Licencia

MIT (ver [LICENSE](LICENSE)). `third_party/quickjs` también es MIT; `third_party/fdlibm` lleva la licencia
de Sun de cada fichero.
