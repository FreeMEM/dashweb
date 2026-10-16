# dashweb

Navegador web ligero para **Commodore Amiga**, escrito en [Dash](https://github.com/FreeMEM/dash) con
interfaz **MUI 5**: XHTML, CSS, JavaScript moderno y HTTPS.

Es también el banco de pruebas de Dash: un programa grande y exigente que obliga a hacer crecer el
lenguaje, sus librerías y su rendimiento.

## Estado

Fase A (sin MUI): `src/visor.dash` abre una página (fichero o URL http/https), la maqueta, la pinta en una
ventana normal y ejecuta su JavaScript. Fase B (MUI 5): `src/dashweb.dash`, el navegador: barra de dirección,
atrás/adelante, recargar, parar, historial desplegable, marcadores, página de inicio, hasta 4 ventanas, atajos de
menú; las páginas llegan sin congelar la ventana (consulta DNS, conexión y negociación TLS incluidas, con un
indicador de actividad; imágenes, hojas y scripts a la vez); enlaces, anclas, formularios (GET y POST). Plan y bitácora en
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

`objetivo` = 68040 + JIT a toda velocidad (lo más parecido a un PiStorm); `A1200` = 68020 a 14 MHz. En ms,
con las fuentes del Workbench (helvetica, times, courier).

| Página | Máquina | carga | html | js | estilo | imágenes | maqueta | pintar |
|---|---|---|---|---|---|---|---|---|
| prueba.html (8,8 KB) | objetivo | 7 | 17 | 0 | 76 | 0 | 242 | 22 |
| prueba.html | A1200 | 459 | 1091 | 15 | 5545 | 15 | 5829 | 92 |
| imagenes.html | objetivo | 2 | 2 | 0 | 15 | 5 | 155 | 24 |
| imagenes.html | A1200 | 53 | 113 | 1 | 1023 | 193 | 640 | 94 |
| js.html | objetivo | 2 | 2 | 28 | 15 | 1 | 156 | 16 |
| js.html | A1200 | 57 | 97 | 1635 | 1108 | 6 | 681 | 51 |

Memoria: 350 KB para prueba.html (con el motor JS, 330 KB para una página pequeña). El visor ocupa 1 MB y el
navegador MUI 1,1 MB (casi todo QuickJS). En la configuración objetivo una página va en menos de medio segundo.
En un A1200 el estilo y la maqueta son lo lento: `./dash --profile` (Dash D23) señala la cascada (`_estilo_nodo`,
`_cumple_desde`: cada elemento prueba todos los selectores) y el corte en palabras (`_palabras`).

Las primeras medidas del A1200 (tarea 17) eran el triple de lentas: el modo de pruebas de Dash (`--autoclose`)
miraba el reloj en cada vuelta de cada `while` (arreglado en Dash, D34).

## Requisitos previstos

- AmigaOS 3.x con un 68030 o superior y FPU (68881/68882 o la del 040/060), y mucha memoria Fast.
  Un A500 o un A1200 sin ampliar no son el objetivo.
- MUI 5, AmiSSL 5 (HTTPS), una pila TCP/IP (`bsdsocket.library`).

## Paquete

`tools/paquete.sh` deja `build/dashweb.lha` (el navegador, el visor, `LEEME` con la instalación y las licencias).
Requisitos en el Amiga: AmigaOS 3.x, 68020 o mejor, MUI 3.8 o 5, una pila TCP/IP (bsdsocket.library) y, para
HTTPS, AmiSSL 5.

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
