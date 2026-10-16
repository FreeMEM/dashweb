# dashweb: plan de trabajo (para `/loop`)

Arranque (desde cualquier directorio):

```
/loop Sigue las instrucciones de ~/Projects/dashweb/docs/DASHWEB_LOOP.md: haz UNA tarea y actualiza la bitácora. No hagas pausas entre vuelta y vuelta
```

## Objetivo

Un navegador ligero para AmigaOS 3.x escrito en Dash, con interfaz MUI 5: XHTML, CSS, JavaScript
(QuickJS, ya portado en `third_party/quickjs`) y HTTPS (AmiSSL).

**dashweb existe para hacer crecer Dash** (usuario, 2026-10-15): todo lo que le falte a Dash se le añade a
Dash. Nada de rodeos con `@native`: eso queda para lo que es C por naturaleza (el pegamento con QuickJS).

Máquina objetivo (decisión del usuario del 2026-10-15): **PiStorm (Emu68) y emulación (UAE con JIT)**.
No se optimiza para la velocidad de un 68k real ni se piden medidas en hardware real. Se compila para
68020 con FPU (`./dash --fpu`, `-m68020 -m68881`) y la versión sin FPU debe seguir compilando.

Dos fases:

- **Fase A (ya):** todo lo que no necesita MUI: red, HTTP/HTTPS, HTML, CSS, maquetación, dibujo en una
  ventana normal de Intuition, imágenes y JavaScript con su DOM.
- **Fase B:** la interfaz MUI. Empieza cuando Dash tenga MUI: tareas 1 a 11 de `docs/MUI_LOOP.md` en la
  rama `mui` de `~/Projects/FreeMEMLang` marcadas `[x]` (de eso se encarga otra sesión con su propio loop).

## Reglas de cada iteración

1. **Vigilar MUI.** Mira cómo va la otra sesión:
   `git -C ~/Projects/FreeMEMLang show mui:docs/MUI_LOOP.md | grep -E '^- \[.\] ([1-9]|1[01])\.'`.
   - Si las tareas 1-11 están todas `[x]` y la fase B aún no está "abierta" en la bitácora: pon al día la
     rama `dashweb` de Dash (regla 3), apunta en la bitácora "Fase B abierta" y avisa con PushNotification. Desde ahí
     las tareas de la fase B ya se pueden coger.
   - Si no quedan tareas `[ ]` de la fase A ni de Dash y MUI no ha terminado: no hagas nada más. Programa la siguiente
     vuelta con ScheduleWakeup a 1800 s (`noop: true`) y termina.
2. **Rama.** Trabaja en `~/Projects/dashweb`, rama local `dev` (sale de `main`). Sin push.
3. **Dash.** Lo que le falte a Dash se añade a Dash, como tarea `D<n>` de la lista (sección "Dash").
   - **Dónde:** el worktree `~/Projects/FreeMEMLang-dashweb`, rama `dashweb` (sale de `mui`). `DASH` apunta ahí
     (es el valor por defecto de `tests/run.py`). **No toques `~/Projects/FreeMEMLang`**: allí trabaja la
     sesión de MUI, en la misma copia.
   - **Al día con `main`:** (desde el 2026-10-16 la otra sesión trabaja en `main`, que ya tiene `mui` y
     `dashweb` hasta D25) al empezar la vuelta, si `main` tiene commits que `dashweb` no tiene
     (`git -C ~/Projects/FreeMEMLang-dashweb log --oneline dashweb..main`), haz
     `git -C ~/Projects/FreeMEMLang-dashweb rebase main`. Si hay conflictos y no los resuelves bien,
     `git rebase --abort` y apúntalo en la bitácora.
   - **Reglas de Dash:** cada cambio con su test en `tests/` de Dash (normal, de error, `# expect-c:` o
     `# expect-out:`); antes y después `python3 tests/run_tests.py` y `./compile_all.sh`, y al cerrar
     `python3 tests/run_tests.py --emu --emu-a500 --emu-32`: nada que funcionaba puede romperse. Un programa
     que no usa lo nuevo sale con el mismo C: compruébalo con `tools/cmp_dash_c.sh <commit> WORK` (no con
     `python3 -m compiler.main` desde el worktree: carga el compilador del directorio actual). Documenta en `docs/QUICK_REFERENCE.md`,
     `docs/MANUAL_REFERENCIA.md` y, si hay builtins nuevos, `python3 tools/gen_builtins_doc.py`. Commit en la
     rama `dashweb`: `dashweb: D<n> - <resumen>`. Sin push.
   - Para enlazar objetos de C (QuickJS) mientras no exista la tarea D10: `DASH_CFLAGS="... ficheros.o"`.
4. **Base.** `python3 tests/run.py` (cuando exista) antes de empezar. Anota si cambia respecto a la última entrada.
5. **Tarea.** Coge la primera tarea `[ ]` de la fase abierta. Si dice "necesita D<n>" y esa tarea de
   Dash no está `[x]`, haz antes la de Dash (la primera que falte). Márcala `[~]` mientras trabajas. Una por
   iteración. Si es grande, divídela en la lista y haz solo la primera parte.
6. **Hacer.** Código del navegador en Dash (`src/`), módulos reutilizables en `lib/`. C solo en
   `third_party/` y en el pegamento con él. Cada cosa con su test en `tests/`, ejecutado en el emulador.
   Entorno (no va al repo):
   `export DASH_KICKSTART="/home/freemem/Descargas/Telegram Desktop/ks31a1200.rom"`,
   `DASH_EMU_SYS=~/.cache/dash-emu/sys31`, para MUI `DASH_EMU_SYS_MUI=~/.cache/dash-emu/sys31mui`, para AmiSSL
   `DASH_EMU_SYS_SSL=~/.cache/dash-emu/sys31ssl` y `DASH_EMU_SYS_32_SSL=~/.cache/dash-emu/sys32ssl`
   (`tools/get_amissl.sh` y `tools/emu_sys_amissl.sh` de Dash).
   **Sin `DASH_KICKSTART` se usa la ROM AROS** y los resultados no valen. Para medir "como el objetivo":
   FS-UAE con `cpu = 68040`, `fpu = 68040`, `jit_compiler = 1`, `uae_cpu_speed = max`.
7. **Verificar.** Repite el paso 4. Nada que antes funcionaba puede romperse. Si algo se rompe y no lo
   arreglas en esta iteración, revierte.
8. **Cerrar.** Marca `[x]`, añade una entrada a la bitácora y haz commit local `<tarea> - <resumen>`.
9. **Fin.** Si no quedan tareas `[ ]` en ninguna fase, escribe el resumen final, para el loop y avisa
   con PushNotification.

## Límites

- No instales paquetes del sistema. Un `venv` en `~/.cache/dashweb` sí vale.
- Nada con licencia que lo prohíba en git (SDK de MUI, AmiSSL, ROMs, Workbench): scripts que lo
  descargan a `~/.cache`, como hace Dash con MUI.
- No hagas push ni toques `main` de dashweb. No toques `~/Projects/FreeMEMLang`.
- Las pruebas de red usan servidores locales (Python en el PC; FS-UAE con `bsdsocket_library = 1` da
  red al Amiga emulado). Nada de pruebas automáticas contra webs de terceros.
- Si una tarea exige una decisión del usuario, déjala `[?]` con la pregunta y pasa a la siguiente.

## Coordinación con la sesión de MUI (`freememlang-49`, rama `mui`)

Acordado el 2026-10-15 por mensaje entre sesiones (escribirle con SendMessage si algo cambia):

- **Sus tareas, no las dupliques:** 8 (`mui_wait_event_signals`) y 9 (imágenes con `Dtpic`). Las imágenes
  fuera de MUI (datatypes a bitmap pintado con `gfx_`, D12) son nuestras: al hacerlas, avísale del nombre de
  los builtins, que su tarea 9 se apoyará en ellos.
- **Para no chocar en Dash:** lo nuestro va en diccionarios y plantillas propios (`NET_FUNCTIONS`/`NET_RUNTIME`,
  `FONT_FUNCTIONS`...), no en `MUI_FUNCTIONS` ni `CTemplates.MUI_RUNTIME` (suyos), y en líneas separadas de
  `_RUNTIME_FLAGS` y `GROUPS` de `tools/gen_builtins_doc.py`. Docs: secciones propias.
- **Convención de builtins:** los objetos (sockets, fuentes, imágenes...) son `LONG` en Dash, como ficheros y
  buffers. Runtime con nombre `_dash_*` y plantilla que es una llamada simple: así codegen hace los casts y la
  inclusión del runtime (`runtime_index` por nombre) sola.
- **Latin-1:** su tarea 3 trae `compiler/latin1.py` (los literales no ASCII salen en Latin-1) y `emu_run.py` lee
  la salida como Latin-1. Las páginas en UTF-8 las convierte dashweb (tarea 4).
- **Avisos técnicos:** MUI pide 32 KB de pila (codegen la sube sola). Las funciones `__inline` de los SDK que
  pasan `&tags` dan etiquetas basura con `-O2` (usar `NO_INLINE_STDARG` y arrays). En 68000, las macros
  `register asm` del NDK se machacan con llamadas a libgcc (`__mulsi3`...): calcular antes en variables.
- **Temporizadores:** su tarea 8 trae `mui_timer(ms, id)` (un disparo, timer.device) además de
  `mui_wait_event_signals(mask)` y `mui_signals()`. `setTimeout`/`setInterval` de JS (tarea 16) y las
  animaciones usan eso: no hacer temporizadores propios.
- **Coste de pintar (medido por ellos, A1200 3.1):** zona de 320x200, 20 ms el fondo y ~4,7 ms por línea de 50
  caracteres con `gfx_text_at` (página llena ~115 ms): el pintor (tarea 13) debe repintar por partes
  (solo lo que cambia) y usar `ScrollRaster` al desplazar.
- **Procesos:** cada sesión para solo sus procesos por PID (nada de `pkill fs-uae` ni `pkill -f run_tests`):
  el 2026-10-16 un `pkill` de la otra sesión tumbó una batería nuestra.
- **Zona de dibujo (en commit eec3247):** la API de `docs/MUI_DISEÑO.md` (`mui_canvas_on_draw(c, f)` con `f(x, y, ancho, alto)`
  pintando con `gfx_`). Nos avisará antes de cambiarla.

## Tareas

### Dash: lo que dashweb necesita (rama `dashweb`, regla 3)

Se hacen cuando una tarea de dashweb las pide ("necesita D<n>"). Los nombres concretos se deciden en cada
tarea, con el estilo de Dash.

- [x] D1. **Errores encontrados.** `lista + [x]` transpila pero da C inválido (error de gcc); `String < String`
      compara punteros (debe comparar el texto o dar error). Test de cada uno.
- [x] D2. **Texto.** Código de un carácter y carácter desde código; buscar un texto (desde una posición);
      empieza/termina por; mayúsculas/minúsculas; quitar espacios; texto a número (decimal y hex); comparar
      orden. Sin crear un texto por carácter. **Coste:** hoy `s[i]` recorre el texto desde el principio
      (`DashString_char_at` comprueba el final carácter a carácter) y `s.length` es `strlen`: recorrer un texto
      por posición es cuadrático. Arreglarlo (acceso directo; longitud guardada o calculada una vez).
- [x] D3. **Constructor de textos.** Añadir trozos sin coste cuadrático (para tokenizadores y para montar
      peticiones/respuestas). Medir con `bench`.
- [x] D4a. **Tipos de lista.** `[T]` en globales, `var`, parámetros, retornos y campos (conservan el tipo de sus
      elementos); `for x in` cualquier expresión de lista.
- [x] D4b. **Listas que crecen.** Añadir, quitar, insertar (sin copiar la lista entera); lista vacía con tipo
      que ya sepa qué guarda.
- [ ] D4c. **Campo de un elemento.** `l[0].x = 5` (hoy hay que pasar por una variable).
- [x] D5. **Diccionario** texto → valor (con tipo), para cabeceras HTTP, propiedades CSS, entidades.
- [x] D6. **Referencia débil** (campo que no cuenta, para `padre` en el DOM) o romper ciclos, con `--memcheck`.
- [x] D7. **Ficheros a texto.** Leer un fichero entero a un `String` (y escribirlo); texto desde un buffer con
      longitud. Bytes nulos: decidir qué pasa.
- [x] D8. **Red.** Builtins sobre `bsdsocket.library`: resolver nombre, conectar, enviar, recibir, cerrar,
      tiempo límite, sin bloqueo y su máscara de señales (para `mui_wait_event_signals`). Test en FS-UAE
      (`bsdsocket_library = 1`) con un servidor Python local.
- [x] D9. **Fuentes y colores.** Abrir fuentes de disco con tamaño, estilo (negrita, cursiva, subrayado),
      medir texto con la fuente actual, colores RGB en pantallas de paleta (`ObtainBestPen`/`ReleasePen`) y en RTG.
- [x] D10. **C externo.** Enlazar objetos o librerías C desde el programa (directiva o opción) y llamar a
      funciones Dash desde C (callbacks), para QuickJS.
- [x] D11. **AmiSSL.** Conexiones TLS sobre los sockets de D8 (módulo o builtins), con verificación de
      certificado.
- [x] D12. **Imágenes.** Cargar PNG/GIF/JPEG por datatypes a un bitmap y pintarlo con `gfx_` (fuera de MUI).
      Avisar a la sesión de MUI del nombre (su tarea 9 lo usará).
- [x] D13. **`elif`.** (lo pidió la tarea 3)
- [ ] D14. **Variables locales que tapan funciones.** Hoy, si un programa define `func b()`, ningún módulo puede
      usar una variable local `b` ("Cannot assign to 'b' - it's not a variable"): los módulos se rompen según
      los nombres del programa que los importa. Una variable local (o parámetro) debe tapar la función.
      Visto también en la tarea 18: una global del programa (`var actual`) es la misma variable que las
      locales `actual` de los módulos importados (css.dash), y una función `inicio()` del programa tapa las
      variables `inicio` de los módulos. En `src/dashweb.dash` se usan nombres `dw_*` mientras tanto.
- [x] D24. **Pila desde un módulo.** `@stack N` (lo pide la tarea 15: QuickJS necesita 256 KB).
- [x] D25. **Salir con el stdio de libnix.** Dash dejaba `DOSBase` a NULL al salir y libnix lo usa después:
      un programa con QuickJS (o `printf` en una `@native`) se colgaba al terminar. (Lo encontró la tarea 15.)
- [x] D26. **`@native(borrow)`.** La `@native` solo usa sus argumentos durante la llamada (lo pidió la 16a:
      el documento y el código de cada evaluación quedaban retenidos hasta salir).
- [x] D27. **Clic y temporizador en el EventLoop.** `On Click` (`click_x()`, `click_y()`) y `On Timer N`
      (lo pidió la 16b).
- [x] D28. **Medir textos sin ventana.** `font_*` sobre un RastPort propio si no hay `_dash_rp` (lo pidió la 18:
      con MUI la página se maqueta fuera de la zona de dibujo). D12b: `IMAGE_RUNTIME` con el prototipo de
      `DoMethod` (chocaba con las cabeceras de MUI).
- [x] D29. **Programas en segundo plano en `emu_run`.** Para las pruebas de interfaz del navegador (tarea 19).
- [ ] D23. **Perfilador.** `./dash --profile`: cuántas veces se llama cada función y en cuál está el programa
      (muestras a 50 Hz desde la interrupción VBlank), escrito al salir. Lo pide la tarea 13: estilo y maqueta
      tardan 7 y 8 s en un A1200 con una página de 9 KB y no se ve dónde.
- [x] D22. **Textos largos sin copias.** (lo pidió la tarea 13)
- [x] D21. **Interior de una ventana.** `Win.inner_left/_top/_width/_height` (lo pidió el visor).
- [x] D20. **Reloj.** `time_ms()` (para medir el visor).
- [x] D19. **Argumentos del programa.** `arg_count()`, `arg(i)` (lo pidió el visor, tarea 13).
- [x] D18. **Funciones privadas por módulo.** Dos módulos con `_fuente` chocaban (lo pidió la tarea 12).
- [x] D17. **Texto prestado adoptado.** `s = t` con `t` un parámetro temporal del que llama lo liberaba al volver
      (lo encontró la tarea 11 con `--memcheck`).
- [x] D16. **`for` sobre una lista prestada.** La liberaba al acabar (lo encontró la tarea 9).
- [x] D15. **Carácter contra literal con escape.** `c == "\r"` comparaba punteros (lo pidió la tarea 5).

### Fase A: sin MUI

- [x] 1. **Base del repo.** Clon de Dash (regla 3). `tests/run.py`: compila `tests/test_*.dash` con
      `$DASH/dash --fpu` y los ejecuta en FS-UAE con `$DASH/tools/emu_run.py`, comparando con sus
      `# expect-out:` (como el runner de Dash). Un test trivial. `CLAUDE.md` de dashweb (corto: qué es,
      comandos, reglas de este fichero). `.gitignore` de `build/`.
- [x] 2. **Arquitectura.** `docs/ARQUITECTURA.md`: módulos (red, URL, HTTP, TLS, texto, HTML, DOM, CSS,
      estilo, maquetación, dibujo, imágenes, JS, interfaz), qué va en Dash y qué en C, quién es dueño de la
      memoria de cada cosa, cómo se pasa de una fase a otra (bytes → tokens → DOM → estilo → cajas → dibujo).
      Repasa qué tiene Dash hoy (structs, listas, textos, `@native`, contador de referencias) y convierte
      lo que falte en tareas `D<n>` de la sección "Dash", con la tarea de dashweb que las necesita.
- [x] 3. **URL.** (necesita D1, D2, D13) Analizar y resolver URLs relativas (subconjunto de RFC 3986: esquema, host, puerto,
      ruta, consulta, fragmento; `..` y `.`). Tests con casos raros.
- [x] 4. **Texto.** (necesita D2, D3, D7, D4a) UTF-8 a Latin-1 (el juego de caracteres del Amiga), con sustituto para lo que no
      exista; entidades HTML (`&amp;`, `&#233;`, `&eacute;`...). Tests.
- [x] 5. **TCP.** (necesita D8) `lib/red.dash` sobre los builtins de red: conexión con tiempo límite y
      lectura por trozos. `tests/run.py` arranca el servidor Python local que pida el test (directiva nueva).
- [x] 6. **HTTP/1.1.** (necesita D3, D4, D5) GET con cabeceras, `Content-Length`, `chunked`, redirecciones (máx. 5),
      `Content-Type` y juego de caracteres, errores. Tests contra un servidor local que cubra cada caso.
- [x] 7. **HTTPS.** (necesita D11) AmiSSL 5 para OS3: script que lo descarga a `~/.cache` y lo mete en el sistema
      emulado; conexión TLS con verificación de certificado. Test contra un servidor HTTPS local con una CA
      propia. Si hace falta decidir algo de licencias o versiones, `[?]`.
- [x] 8. **Tokenizador HTML.** (necesita D2, D3, D4) Etiquetas, atributos (con y sin comillas), texto, comentarios, `DOCTYPE`,
      entidades, `<script>`/`<style>` como texto crudo. Tolerante con HTML mal formado; XHTML también.
- [x] 9. **Árbol DOM.** (necesita D4, D6) Nodos (elemento, texto, comentario), etiquetas implícitas (`html`, `head`, `body`),
      cierres implícitos (`p`, `li`, `td`...), elementos vacíos (`br`, `img`...). Tests con páginas reales
      pequeñas guardadas en `tests/pages/`.
- [x] 10. **CSS: lectura.** (necesita D2, D4) Tokenizador y analizador: reglas, selectores (tipo, clase, id, descendiente,
      hijo, atributo, `:hover` ignorado), declaraciones, `!important`, `@media` (solo `screen`/`all`),
      hojas `<style>` y `<link rel=stylesheet>` (vía HTTP).
- [x] 11. **CSS: estilo.** (necesita D4, D5) Incluye reunir las hojas del documento: `<style>`, `<link rel=stylesheet>`
      (HTTP o fichero) y sus `@import` (la tarea 10 solo los lee). Selección de elementos, cascada (origen, especificidad, orden), herencia,
      hoja por defecto del navegador, atributo `style`. Estilo calculado por nodo para las propiedades que
      se vayan a usar (display, colores, fuente, márgenes, relleno, bordes, ancho/alto, alineación, listas).
- [x] 12. **Maquetación.** (necesita D9) Cajas de bloque y en línea, cortes de línea con las medidas de la fuente
      (`TextLength`), márgenes/relleno/bordes, anchos y altos, listas. Sale una lista de cosas que dibujar.
      Tablas y `float`, más adelante (añadir tareas si hace falta).
- [x] 13. **Dibujo y visor sin MUI.** (necesita D9) Dibujar esa lista en una ventana normal de Intuition con los
      builtins `gfx_` de Dash (texto, rectángulos, bordes, colores). Programa `src/visor.dash`: abre un
      fichero HTML local, lo pinta y hace scroll con teclas. Captura de pantalla en el emulador. Medir el tiempo
      de cada fase en la configuración "objetivo" (regla 6).
- [x] 14. **Imágenes.** (necesita D12) Hace falta un cuerpo HTTP en buffer (`http_get` da texto: los bytes 0
      pasan a espacios y una imagen se rompería). Datatypes (PNG, GIF, JPEG) a bitmap y dibujarlas en la página; `width`/`height`
      del HTML; imágenes que llegan por HTTP.
- [x] 15. **QuickJS enlazable.** (necesita D10) Compilar QuickJS como objetos que se enlazan con un programa Dash
      (`tools/build_qjs.sh` con modo librería), fdlibm para que `Math.*` sea exacto (ver
      `docs/quickjs_amiga.md`), y un módulo `lib/js.dash` con `@native`: crear el motor, evaluar, errores,
      `console.log`. Test.
- [x] 16a. **DOM en JavaScript.** `document`, `getElementById`, `querySelector(All)` (con el selector
      de CSS de la tarea 11), `textContent`, `innerHTML`, `createElement`, `appendChild`, `setAttribute`;
      los `<script>` de la página (en línea y `src`). Tests en JS dentro de páginas.
- [x] 16b. **Eventos y temporizadores.** `addEventListener` (clic), `setTimeout`/`setInterval` (cola de
      temporizadores), volver a dar estilo y maquetar tras los cambios (`jsdom_cambios`).
- [x] 17. **Repaso de la fase A.** Tamaño del ejecutable, memoria (`--memcheck`), tiempos por fase en la
      configuración objetivo y en el A1200, páginas de prueba. Resumen en la bitácora y en el README.

### Fase B: con MUI (cuando la regla 1 la abra)

- [x] 18. **Ventana del navegador.** Con la API de MUI de Dash (`docs/MUI_DISEÑO.md` del clon): barra
      de URL, atrás/adelante/recargar, barra de estado y de progreso. La zona de página es la clase de dibujo
      propia de MUI (su tarea 7) pintando con el código de la tarea 13.
      Nota de la sesión de MUI (2026-10-16): la ventana se puede describir en un `.dashui` (formato en
      `docs/MUI_EDITOR.md` del clon) e importarla; `Principal_create()` devuelve un struct con los objetos.
      Ejemplo hecho: `examples/mui_navegador.dashui` + `examples/mui_navegador_editor.dash` (mui 2dd0e0a, plan MUI terminado).
- [x] 19. **Navegación.** Clic en enlaces, historial, recargar, scroll con ratón y teclado, título de la
      ventana, errores de red mostrados en la página.
- [x] 20a. **Bucle de eventos: la página principal.** Se recibe sin congelar la ventana (sondeo cada 50 ms
      con `mui_timer`, junto con los temporizadores del JS) y se puede parar.
- [x] 20b. **Bucle de eventos: imágenes.** Las imágenes llegan sin esperar (4 a la vez) y la página se vuelve a
      maquetar al llegar cada una.
- [ ] 20c. **Bucle de eventos: el resto.** CSS y `<script src>` sin esperar (hoy se traen al montar la página;
      los scripts tienen que ejecutarse en orden); conectar, DNS y la negociación TLS sin bloquear. Si una pila
      TCP/IP real da `SIGIO`, usarlo con `mui_wait_event_signals` (FS-UAE no lo da).
- [ ] 21. **Formularios.** `input`, `button`, `select`, `textarea`, `checkbox`; envío GET y POST.
- [ ] 22. **Varias ventanas o pestañas**, marcadores sencillos, preferencias mínimas (página de inicio).
- [ ] 23. **Repaso final.** Tamaño, memoria, tiempos en la configuración objetivo, documentación,
      paquete LHA con instrucciones de instalación (MUI 5, AmiSSL 5, pila TCP/IP).

## Bitácora

Formato:

### YYYY-MM-DD — Tarea N
- Hecho:
- Tests:
- Pendiente / riesgos:

### 2026-10-15 — Plan
- Hecho: plan creado. Estado de MUI en Dash: tarea 1 hecha, tarea 2 en curso (otra sesión, rama `mui`).
- Fase B: cerrada.

### 2026-10-15 — Tarea 1 (base del repo)
- Hecho: clon de Dash en `~/.cache/dashweb/dash` (rama `mui`, commit b8439a1). `tests/run.py`: compila con
  `$DASH/dash --fpu` (con `PYTHONPATH=$DASH`: `./dash` ejecuta `python3 -m compiler.main` y escribe `build/` en
  el directorio actual) y ejecuta en FS-UAE (A1200 + 68882) los que tienen `# expect-out:`; directivas
  `# dash-flags:`, `# cflags:`, `# emu-config:` (agrupa arranques por opciones) y `# emu-needs:`.
  `tests/test_hola.dash`. `CLAUDE.md` de dashweb. `.gitignore` ya tenía `build/`.
- Tests: 1/1. Comprobado que el runner detecta una línea distinta y que `import "../lib/x.dash"` funciona.
- Pendiente / riesgos: MUI en Dash va por la tarea 2 (diseño hecho), fase B cerrada.

### 2026-10-15 — Tarea 2 (arquitectura)
- Hecho: `docs/ARQUITECTURA.md` (flujo de una página, módulos, datos, memoria, juego de caracteres, red, JS).
  Probado qué tiene Dash: `s.length`, `s[i]` (da un `char`, sin crear texto), `"n=" + 42`, recursión con `nil`,
  `@native` con `String`. No tiene: listas que crecen, funciones de texto, diccionarios, fuentes/colores RGB,
  red. Errores: `a + [3]` transpila a C inválido; `"abc" < "abd"` compara punteros.
- Cambio de reglas (usuario): lo que falte a Dash se añade a Dash. Worktree `~/Projects/FreeMEMLang-dashweb`,
  rama `dashweb` desde `mui` (b8439a1); borrado el clon de `~/.cache`. Tareas D1-D12. `tests/run.py` usa el worktree.
- Coordinación con la sesión de MUI por mensaje: reparto y convenciones en la sección "Coordinación".
- Tests: 1/1.
- Pendiente / riesgos: choques al hacer `rebase mui` en `amiga_builtins.py`/`codegen.py` (minimizados con
  bloques propios).

### 2026-10-15 — D1 (Dash: sumar listas, orden de textos)
- Hecho (rama `dashweb` de Dash, commit 3db48f3 tras el rebase): `a + b` une listas en una nueva
  (`DashArray_concat`, toma el tipo de la primera tipada y es dueña de sus textos y structs); `[1] + ["a"]` y
  `lista + 3` son errores claros (antes C inválido). `<`, `>`, `<=`, `>=` entre textos usan `strcmp`. Los
  parámetros `Array` se tratan como listas en codegen (antes `"number"`). Docs: manual y referencia rápida.
- Tests (Dash): `test_list_concat` (con `--memcheck`, 0 vivos), `test_string_order`, `errors/list_add_mixed`,
  `errors/list_add_number`. Mismo C en los 115 tests y ejemplos previos. 293/293 con `--emu --emu-a500
  --emu-32`, ejemplos 31/31. Tras el rebase sobre `mui` (24cd343, tarea 3 de MUI con `latin1.py`): sin
  emulador todo pasa y los dos tests nuevos pasan en el emulador.
- dashweb: 1/1.
- Pendiente / riesgos: sumar en un bucle copia la lista entera (cuadrático): `push` llega en D4. Encontrado
  para D2: `s[i]` y `s.length` cuestan O(n).

### 2026-10-15 — D2 (Dash: texto)
- Hecho (rama `dashweb`, af3ca65 tras rebase sobre la tarea 5 de MUI): `TEXT_RUNTIME` y builtins `str_code`,
  `str_char`, `str_find`, `str_find_from`, `str_starts`, `str_ends`, `str_lower`, `str_upper` (Latin-1),
  `str_trim`, `str_to_int`, `str_from_int`, `str_replace`; `Int("42")`, `Int(s[i])` (0-255). `s[i]` y `s.length`
  usan una caché de longitudes de textos largos (>= 64 bytes, 4 entradas, se olvida en `_dash_str_drop`):
  recorrer 8 KB por posición, 91,9 s → 0,15 s en el A1200 real. Campo `reads_only` en `BuiltinFunc`: los
  builtins que solo leen no copian para siempre sus argumentos (sin él, cada llamada dejaba un texto escapado).
- Corrección de D1: la comparación "mismo C" de D1 estaba mal (`python3 -m compiler.main` carga el compilador
  del directorio actual: las dos pasadas usaban el nuevo). Hecha bien (script `cmpc.sh` en el scratchpad): la
  suma de listas pasa a `ARRAY_CONCAT_RUNTIME` (solo si se usa) y los parámetros `Array` cuentan referencias
  como los structs (cambia `test_refcount_paths`, que pasa con `--memcheck`). Ahora solo cambia el C de los
  programas que usan `s[i]`, `s.length`, `str_*` o la suma de listas.
- Tests (Dash): `test_text` (con `--memcheck`, 0 vivos y 0 escapados); `expect-c` de `test_loops` y
  `test_arrays_adv` al nombre nuevo. 298/298 con `--emu --emu-a500 --emu-32` (con esos dos ya corregidos),
  ejemplos 32/32. Tras el rebase: 130/130 sin emulador y los tests de D1/D2 en el emulador.
- Pendiente / riesgos: un texto modificado por dentro desde C con la misma dirección daría una longitud vieja
  (los textos de Dash no se modifican; documentarlo si aparece algún caso).

### 2026-10-15 — D13 (Dash: `elif`)
- Hecho (rama `dashweb`, a20e520): `elif` en la gramática; el transformador lo pliega en `if` anidados dentro del
  `else`, así que el C es el mismo de siempre (comprobado con `tools/cmp_dash_c.sh`: solo aparece el test nuevo).
  Manual y referencia rápida.
- Tests (Dash): `test_elif` en A1200, A500 y 3.2. 131/131 sin emulador, ejemplos 32/32. No relancé la batería
  completa con emuladores: el C de todos los programas anteriores es idéntico.
- Encontrado: `for x in [1, 2]` no compila (solo variables): apuntado en D4.
- Pendiente: `lib/url.dash` escrito (tarea 3, sin probar ni commit): la siguiente vuelta.

### 2026-10-15 — Tarea 3 (URL)
- Hecho: `lib/url.dash`: `struct Url` (esquema y host en minúsculas, puerto -1 si no se da, `tiene_*` para
  distinguir partes vacías de ausentes), `url_parse`, `url_resolve` (RFC 3986 5.2.2), `url_remove_dots` (5.2.4),
  `url_text`, `url_port` (80/443). IPv6 entre corchetes, usuario, URLs relativas.
- `tests/run.py --memcheck`: compila con `--memcheck` y falla si la línea de resumen no dice 0 vivos y 0 errores.
- Tests: `test_url` con los 42 ejemplos del RFC 3986 (5.4.1 y 5.4.2) y 6 de análisis: todo a la primera.
  2/2, y 2/2 con `--memcheck` (0 objetos y 0 textos vivos).
- Pendiente / riesgos: sin `%xx` (codificar/decodificar): cuando haga falta (HTTP y formularios).

### 2026-10-16 — D3 (Dash: textos que crecen)
- Hecho (rama `dashweb`, cb49e29 tras rebase sobre la tarea 7 de MUI): `s = s + a + b...` sobre una variable
  String dueña de su texto (local, global, o parámetro reasignado, que Dash ya copia) emite
  `_dash_str_append` por cada parte: copia al final si cabe; si no, bloque del doble. La caché de longitudes de
  D2 se actualiza (`_dash_str_setlen`). No se aplica si otra parte de la suma lee la variable. No hizo falta
  una API nueva. Construir 20.000 caracteres de uno en uno: 231 s → 0,87 s en el A1200 real.
- Tests (Dash): `test_string_append` (`--memcheck`, global, parámetro, `s = s + s`). 318/318 con
  `--emu --emu-a500 --emu-32`, 195/195 con `--emu --memcheck`, ejemplos 32/32. Tras el rebase: 134/134 sin
  emulador y 199/199 en el A1200 (incluidos los de MUI).
- C: cambian los programas que hacen `s = s + ...` y los que ya usaban el runtime de texto (trae dos funciones
  más).
- Pendiente / riesgos: campos de structs (`self.t = self.t + x`) siguen copiando: si el HTML los necesita, ampliar.

### 2026-10-16 — D7 (Dash: ficheros y buffers como texto)
- Hecho (rama `dashweb`, f710a0e tras rebase sobre la tarea 8 de MUI): `file_read_text` (fichero entero; `nil`
  si no se puede leer), `file_write_text`, `str_from_buffer`, `str_to_buffer`. Los bytes 0 pasan a espacios (un
  String termina en el 0). En `TEXT_IO_RUNTIME`, solo si se usan: mismo C en todos los programas anteriores.
- Tests (Dash): `test_text_files` (`--memcheck`, fichero de 30 KB, fichero que no existe, vacío, buffers) en
  A1200, A500 y 3.2. Tras el rebase: 136/136 sin emulador, 203/203 en el A1200 (con MUI), ejemplos 32/32.
- Pendiente: los conflictos del rebase son siempre `docs/BUILTINS.md` (generado): se regenera.

### 2026-10-16 — D4a (Dash: tipos de lista)
- Motivo: la tabla de entidades HTML de la tarea 4 (lista de textos global) se leía como enteros: una lista
  perdía el tipo de sus elementos en globales, parámetros, retornos y campos. D4 dividida en D4a/D4b/D4c.
- Hecho (rama `dashweb`, 392b05c): tipo `[T]` (terminal `TYPE_NAME`, sin espacios); el analizador da
  `elem_struct`/`ARRAY_STRING` a globales, `var`, parámetros (funciones, lambdas, métodos) y mira el tipo
  declarado de llamadas y campos; codegen lleva `array:string`/`array:struct:X`/`array:array` a esos sitios
  y a los accesos `f()[i]`, `obj.campo[i]`. `for x in <expresión>` (antes solo una variable): campos,
  llamadas y literales, con el tipo de sus elementos. Error claro para `[Cosa]` inexistente.
- Tests (Dash): `test_list_types` (`--memcheck`) en A1200, A500 y 3.2; `errors/list_type_unknown`. 138/138
  sin emulador, ejemplos 32/32. Mismo C en los 129 programas previos (`tools/cmp_dash_c.sh`).
- Pendiente: la tarea 4 (`lib/texto.dash`) sigue a medias; `lib/entidades.dash` generado debe usar `[String]`.

### 2026-10-16 — Tarea 4 (texto)
- Hecho: `lib/texto.dash`: `utf8_a_latin1` (tramos ASCII de una vez; bytes sueltos se toman como Latin-1),
  `cp1252_a_latin1`, `texto_decodificar(s, juego)` (ISO-8859-1 se lee como Windows-1252, como los navegadores),
  `latin1_de(cp)` con sustitutos (comillas, guiones, "...", EUR, (TM), OE...), `html_entidades` (con nombre,
  `&#nnn;`, `&#xhh;`; sin `;` solo amp/lt/gt/quot) y `entidad_codigo` (búsqueda binaria con el `<` de textos de
  D1). `lib/entidades.dash` (159 entidades) generado por `tools/gen_entidades.py` desde `html.entities` de Python,
  como listas globales `[String]`/`[Int]` (D4a).
- Tests: `test_texto` (UTF-8 de 2, 3 y 4 bytes, inválido, Windows-1252, entidades, búsqueda). 3/3, también con
  `--memcheck`.
- Encontrado: una función del programa llamada `b` impide a los módulos usar una variable local `b` → D14.

### 2026-10-16 — D8 (Dash: red TCP)
- Hecho (rama `dashweb`): `NET_FUNCTIONS`/`NET_RUNTIME`: `net_connect(host, puerto, ms)` (DNS o dirección,
  conexión sin bloqueo con `WaitSelect` y tiempo límite), `net_send`, `net_send_buffer`, `net_recv` (texto; `""` si
  nada en el tiempo dado, `nil` al cerrarse), `net_recv_buffer`, `net_wait`, `net_close`, `net_resolve`,
  `net_error` (en español). `bsdsocket.library` se abre al usarla y se cierra al salir. Runner de Dash:
  `# emu-net: PUERTO` → arranque aparte con `bsdsocket_library = 1` y un servidor de eco en 127.0.0.1 del PC.
- Tests (Dash): `test_net` (resolver, conectar, enviar, recibir hasta el cierre, puerto cerrado, host
  inexistente) en A1200, A500 y 3.2 y con `--memcheck`. 140/140 sin emulador, ejemplos 32/32. Mismo C en los
  programas previos.
- Pendiente: señales de los sockets para el bucle de MUI (apuntado en la tarea 20).

### 2026-10-16 — Tarea 5 (TCP) y D15
- Hecho: `lib/red.dash`: `struct Conexion` (socket, espera, lo pendiente con su posición, cerrada, error),
  `red_abrir`, `red_enviar`, `red_leer_linea` (quita `\r\n`; nil al cerrarse), `red_leer(c, n)`,
  `red_leer_todo`, `red_cerrar`. Lo ya leído se descarta antes de traer más. `tests/run.py`: directiva
  `# emu-server: script.py PUERTO` (FS-UAE con `bsdsocket_library = 1` y el script de `tests/servers/` en el PC).
- D15 (Dash, e7d2a1e): `c == "\r"` comparaba un carácter con un puntero (nunca cierto); ahora con `'\r'`.
  Test `test_char_escapes` en A1200, A500 y 3.2; 141/141 sin emulador; solo cambia el C de ese test.
- Tests: `test_red` contra `tests/servers/lineas.py` (líneas con `\r\n` y `\n`, 3000 bytes en dos envíos, hasta el
  cierre, eco, puerto cerrado). 4/4, también con `--memcheck`.

### 2026-10-16 — D4b (Dash: listas que crecen)
- Hecho (rama `dashweb`, b2097c7): `l.push(x)`, `l.pop()`, `l.insert(i, x)`, `l.remove(i)`, `l.clear()` en
  `LIST_RUNTIME` (solo si se usa): el bloque de datos se dobla al llenarse; con listas tipadas, `_obj`/`_str` (la
  lista retiene structs y es dueña de textos; `pop` los entrega como temporales; `remove`/`clear` los sueltan).
  Gramática: llamadas a métodos como instrucción a través de campos (`n.hijos.push(h)`, `self.l.clear()`). El
  analizador revisa nombre, número de argumentos y tipo del elemento. 20.000 `push` en 0,44 s (A1200 real, con
  `--memcheck`).
- Tests (Dash): `test_list_methods` (`--memcheck`) en A1200, A500 y 3.2; errores `list_method_unknown`,
  `list_push_type`, `list_method_args`. 141/141 + nuevos sin emulador. Mismo C en los 133 programas previos.

### 2026-10-16 — D5 (Dash: diccionarios)
- Hecho (rama `dashweb`, 6cb1367 tras rebase sobre la tarea 10 de MUI): tipo `{String: T}`, literal `{"k": v}`,
  `d[k]`, `d[k] = v`, `has`, `remove`, `keys` (lista de textos), `clear`, `length`; valores Int, Bool, String,
  structs y listas. `DICT_RUNTIME` (solo si se usa): tabla hash (djb2, sondeo lineal, borrado desplazando hacia
  atrás, crece al 75 %), dueña de claves y valores. Gramática: asignar a un índice a través de campos
  (`h.reglas["k"] = v`, `self.l[i] = v`). Errores: claves no texto, `for k in d`, métodos que no existen.
  2.000 altas + 2.000 lecturas + 1.000 bajas con claves `"k" + i`: 3,4 s en el A1200 real.
- Tests (Dash): `test_dict` (`--memcheck`) en A1200, A500 y 3.2; errores `dict_int_key`, `dict_for`,
  `dict_method_unknown`. Mismo C en los 134 programas previos. Tras el rebase: todo pasa sin emulador y en el A1200.

### 2026-10-16 — Tarea 6 (HTTP/1.1)
- Hecho: `lib/http.dash`: `struct Respuesta` (estado, razón, cabeceras `{String: String}` en minúsculas —las
  repetidas se unen con ", "—, cuerpo, URL final, tipo y juego de caracteres de `Content-Type`, error);
  `http_get(url, ms)` sigue hasta 5 redirecciones (301/302/303/307/308, `Location` relativa o absoluta);
  cuerpo por `Content-Length`, `chunked` (con cabeceras finales) o hasta el cierre; `http_texto(r)` lo pasa a
  Latin-1 con `lib/texto.dash`. Petición con `Host`, `User-Agent`, `Accept-Encoding: identity`, `Connection: close`.
- Tests: `test_http` contra `tests/servers/http.py` (longitud, chunked, UTF-8, redirección relativa y absoluta,
  bucle, 404 con cabeceras repetidas, sin longitud, petición enviada sin el fragmento, esquema no admitido, puerto
  cerrado). 5/5, también con `--memcheck`.
- Pendiente: HTTPS (tarea 7); cuerpos binarios en buffer (apuntado en la tarea 14); conexiones persistentes y
  compresión, más adelante si hace falta.

### 2026-10-16 — D11 (Dash: TLS con AmiSSL)
- Hecho (rama `dashweb`, 692ca21 tras rebase sobre la tarea 12 de MUI): `tls_connect(socket, host)` (verifica
  certificado y nombre contra `AmiSSL:Certs`), `tls_send`, `tls_send_buffer`, `tls_recv`, `tls_recv_buffer`,
  `tls_close`; errores por `net_error()` ("hostname mismatch"...). AmiSSL 5.27 (Apache 2.0) fuera de git:
  `tools/get_amissl.sh` (descarga del GitHub oficial con SHA-256) y `tools/emu_sys_amissl.sh` (sistema emulado con
  AmiSSL y una CA de prueba en `~/.cache/dash-amissl/testca`, puesta en `AmiSSL:Certs`; `UserCerts` no se lee por
  defecto). `./dash` y el runner añaden `-I` del SDK si el C usa AmiSSL (`compiler/cflags.amissl_flags`).
- Encontrado: OpenSSL 3 (AmiSSL) se cuelga en `SSL_CTX_new` con poca pila: el programa pide 64 KB si usa TLS.
- Runner de Dash: `# emu-net-tls: PUERTO` (servidor de eco TLS con certificado para 127.0.0.1 firmado por la CA de
  prueba); los tests con `# emu-needs: amisslmaster.library` arrancan `$DASH_EMU_SYS_SSL`/`$DASH_EMU_SYS_32_SSL`
  y se saltan en el A500 (AmiSSL pide 68020).
- Tests (Dash): `test_tls` (`--memcheck`) en A1200 y 3.2 (~30 s cada uno: cargar AmiSSL en la emulación). Tras
  el rebase: 151/151 sin emulador, 226/226 en el A1200, ejemplos 33/33.

### 2026-10-16 — Fase B abierta
- MUI 1-11 completas en la rama `mui` (f63dbcf, aviso de la otra sesión). La rama `dashweb` ya está encima
  (rebase hecho). Referencias: `examples/mui_navegador.dash` del worktree; capturas con
  `tools/emu_run.py --autoclose 30 --screenshot 20 shot.png prog.dash`. Medidas suyas en A1200: abrir app y
  ventana 1,9 s; `mui_list_add` 35 ms por línea (7 ms con `mui_list_quiet`).
- Orden: se siguen haciendo primero las tareas `[ ]` de la fase A (regla 5: la primera `[ ]` de la fase
  abierta; las dos fases están abiertas, se van cogiendo en orden de la lista).

### 2026-10-16 — Tarea 7 (HTTPS)
- Hecho: `lib/red.dash`: campo `tls` en `Conexion`, `red_abrir_tls` (conexión + `tls_connect` con certificado y nombre
  comprobados), envío y lectura por TLS cuando lo hay; `red_cerrar` termina TLS y cierra el socket.
  `lib/http.dash`: `https:` (puerto 443 por defecto). AmiSSL (descarga, sistema emulado, CA de prueba) quedó en D11 de Dash.
- `tests/run.py`: los tests con `# emu-needs: amisslmaster.library` arrancan `$DASH_EMU_SYS_SSL`.
  `tests/servers/http.py PUERTO tls`: el mismo servidor con HTTPS (certificado firmado por la CA de prueba).
- Tests: `test_https` (longitud, chunked, redirección a https, nombre que no coincide). 6/6, también con `--memcheck`.

### 2026-10-16 — Tarea 8 (tokenizador HTML)
- Hecho: `lib/html.dash`: `html_tokenizador(texto)` y `html_siguiente(t)` (un token cada vez; nil al final):
  `HT_TEXTO`, `HT_INICIO` (nombre en minúsculas, `[Atributo]` en orden —el primero gana si se repite—,
  `autocierre`), `HT_FIN`, `HT_COMENTARIO`, `HT_DOCTYPE`. Atributos con comillas dobles, simples o sin ellas, y
  sin valor. Entidades cambiadas en texto y atributos. Texto crudo en script, style, textarea, title, xmp, iframe,
  noembed, noframes, plaintext (hasta su cierre sin mirar mayúsculas; entidades solo en textarea y title).
  XHTML: `<![CDATA[...]]>` como texto, `<?xml ...?>` como comentario. Un `<` que no abre etiqueta es texto; como
  en HTML5, `<y<input` es una etiqueta llamada `y<input`. `html_atributo(tok, nombre)`.
- `tests/run.py`: directiva `# memcheck` (siempre con `--memcheck`).
- Tests: `test_html_tokens` (`--memcheck`). 7/7, también con `--memcheck`.

### 2026-10-16 — D6 (Dash: campos weak)
- Hecho (rama `dashweb`, d00c956): `weak padre: Nodo` en un struct: el constructor, la asignación y el destructor
  no cuentan esa referencia. Con `--memcheck`, leer un `weak` cuyo objeto ya se liberó da
  `memcheck: ERROR campo weak de un objeto ya liberado` y `nil` (`WEAK_RUNTIME`, solo si hay campos weak).
  Error si se usa con Int/String/... Medido: 101 árboles con padre fuerte dejan 1010 objetos y 505 textos vivos
  al salir; con `weak`, 0.
- Tests (Dash): `test_weak`, `test_weak_dangling` (los dos con `--memcheck`) en A1200, A500 y 3.2;
  `errors/weak_int`. 154/154 sin emulador, ejemplos 33/33. Mismo C en los programas previos.

### 2026-10-16 — Tarea 9 (árbol DOM) y D16
- Hecho: `lib/dom.dash`: `struct Nodo` (tipo, nombre, texto, `[Atributo]`, `hijos: [Nodo]`, `weak padre`),
  `dom_desde_html(texto)` con pila de elementos abiertos: html/head/body implícitos (lo de head mientras no empieza
  el cuerpo), cierres implícitos (`p` ante bloques, `li`, `dt`/`dd`, `option`, `tr`, `td`/`th`, `thead`/`tbody`/
  `tfoot`, con límites de tabla y lista), elementos vacíos, autocierre XHTML, cierres sueltos ignorados (`</br>`
  = `<br>`), textos seguidos unidos, DOCTYPE en el documento. `dom_buscar`, `dom_por_id`, `dom_texto`,
  `dom_atributo`, `dom_esquema` (para pruebas).
- D16 (Dash, 2d13636 tras rebase sobre la 13b de MUI): un `for` sobre una lista prestada (temporal del que llama)
  la liberaba al acabar: un bucle que la recorría dos veces leía memoria liberada (6 → 2). Ahora `_dash_hold`.
  Test `test_for_lent_list`. Batería: 380/380 con `--emu --emu-a500 --emu-32` y 233/233 con `--emu --memcheck`
  (la primera pasada la tumbó un `pkill fs-uae` de la otra sesión). Tras el rebase: 157/157 y 237/237 en el A1200.
- Tests: `test_dom` (`--memcheck`, 0 vivos). 8/8.
- Pendiente: las páginas de prueba como ficheros en `tests/pages/` (el runner aún no copia ficheros al emulador):
  para el visor (tarea 13).

### 2026-10-16 — Tarea 10 (CSS: lectura)
- Hecho: `lib/css.dash`: `css_leer(texto, orden)` → `HojaCSS` (reglas con su número de orden e `importes`);
  `css_declaraciones` (bloques y atributo `style`, `!important`); `css_selector` (tipo, `*`, `#id`, `.clase`,
  `[atr]` con `= ~= |= ^= $= *=`, `:pseudo(...)`, `::pseudo` y los de CSS2 con un `:`, combinadores descendiente,
  `>`, `+`, `~`; especificidad como ids*10000 + clases*100 + tipos); `css_selector_texto` para pruebas. Comentarios
  fuera; `;` dentro de comillas o paréntesis (`url("a;b")`) respetados; `@media` solo screen/all/consultas; `@import`
  a `importes`; `@charset`, `@font-face` y demás reglas `@` saltadas; selectores que no se entienden, descartados.
- Tests: `test_css` (`--memcheck`). 9/9.
- Pendiente: reunir `<style>`/`<link>`/`@import` del documento → tarea 11.

### 2026-10-16 — Tarea 11 (CSS: estilo)
- Hecho: `lib/estilo.dash`: hoja del navegador (bloques, display none de head/script/style, márgenes de p y h1-h6,
  negritas y cursivas, listas, pre, a:link, tablas...); `estilo_hojas(doc, base)` reúne en orden `<style>` y
  `<link rel=stylesheet>` (HTTP(S) o fichero) con sus `@import` (hasta 4 niveles); selectores evaluados de derecha a
  izquierda con los cuatro combinadores, atributos y pseudo-clases sin interacción (first/last/only-child, link,
  root, empty; hover y demás no se cumplen; pseudo-elementos no); cascada por importancia, origen (con !important gana
  el navegador), especificidad y orden; atributo `style`; atajos (margin, padding, border y lados, border-*-*,
  background, list-style, font); herencia de las propiedades que se heredan; `inherit`; font-size calculado en px
  (keywords, smaller/larger, em, %, pt); `estilo_px` (px, em, ex, %, pt, pc, in, cm, mm, dos decimales).
  Estilo guardado en `nodo.estilo` (`{String: String}`, campo nuevo de `Nodo`). Tamaño normal: 13 px.
- `css_partir` público (lo usa estilo).
- Tests: `test_estilo` (`--memcheck`), `test_estilo_enlaces` (link + @import por HTTP contra `tests/servers/http.py`).
  11/11. Corrección: al cerrar escribí "también con `--memcheck`" sin haberlo visto; con `--memcheck` fallaba
  `test_estilo_enlaces` (la hoja enlazada no cargaba). Causa: fallo de Dash, D17 (un texto prestado se adoptaba y se
  liberaba). Con D17 arreglado: 11/11 con `--memcheck`.
- Pendiente: rendimiento con muchas reglas (todas contra todos los elementos; indexar por id/clase/etiqueta si
  hace falta, se medirá en la tarea 17).

### 2026-10-16 — D17 (Dash: texto prestado adoptado)
- Hecho (rama `dashweb`, 295e2e1 tras rebase sobre la 14 de MUI): al guardar un parámetro o variable de bucle String
  (en variable, campo, lista, diccionario o constructor) se copia (`_dash_str_dup(t, TRUE)`); antes
  `_dash_str_set` adoptaba el temporal del que llama y lo liberaba al volver. Test `test_lent_string`. Cambia el C
  de 3 programas previos (los que guardan parámetros de texto, entre ellos `examples/mui_navegador`).
- Batería: 392/392 con `--emu --emu-a500 --emu-32`; con `--emu --memcheck` 238/239 (`test_window_handles`, timeout:
  solo pasa en las dos versiones, con y sin D17; se tomó por carga de la máquina, con la otra sesión usando
  emuladores a la vez). Tras el rebase: 159/159 y 240/240 en el A1200. dashweb: 11/11 con `--memcheck`.

### 2026-10-16 — D9 (Dash: fuentes y colores)
- Hecho (rama `dashweb`): `font_open(nombre, tamaño)` (OpenDiskFont, o OpenFont para la de la ROM; 0 si no hay),
  `font_use`, `font_close`, `font_style` (1 subrayado, 2 negrita, 4 cursiva), `font_height`, `font_baseline`,
  `font_text_width` (TextExtent), `font_size`; `color_pen(r, g, b)` (ObtainBestPen en la pantalla de la ventana del
  RastPort —vale también en la zona de MUI— o la pública por defecto; caché de 128; se devuelven al salir).
- Encontrado: `SetSoftStyle` con la máscara de `AskSoftStyle` dejaba la negrita de topaz en subrayado; se usa la
  máscara fija de los tres estilos. La negrita del sistema no ensancha el texto (mismo ancho medido).
- Tests (Dash): `test_fonts` (`--memcheck`) en A1200, A500 y 3.2. 160/160 sin emulador, ejemplos 33/33. Mismo C
  en los programas previos.
- Pendiente: el sistema emulado de los tests no tiene `FONTS:` (solo topaz de la ROM): para la maquetación y el visor
  hará falta uno con las fuentes del Workbench (amitools en un venv en `~/.cache/dashweb`).

### 2026-10-16 — Tarea 12 (maquetación) y D18
- Hecho: `lib/maqueta.dash`: `maquetar(doc, ancho)` → `Pagina` (lista de `Dibujo`: D_RECT, D_TEXTO, D_LINEA, D_IMAGEN;
  alto; fondo de html/body). Bloques con márgenes (los de hermanos seguidos se funden), bordes (anchos thin/medium/
  thick o px; color o el del texto), relleno, `width` (y centrado con `margin: auto`), `height`, fondo puesto antes del
  contenido y medido al final. Texto en línea: palabras medidas con las fuentes del Amiga (`font_` de D9: familia
  serif → times, sans → helvetica, mono → courier; la topaz de la ROM si no hay), espacios colapsados (o `pre`),
  cortes, `text-align`, negrita/cursiva/subrayado, tachado, enlaces (el `href` va en el dibujo), `br`, `img` como
  hueco de `width`x`height`. Las palabras seguidas con el mismo aspecto van en un solo texto (pintar texto cuesta).
  Listas con marca (cuadrado o número). Tablas sencillas: celdas del mismo ancho. `lib/colores.dash`: `css_color`
  (nombres, #rgb, #rrggbb, rgb()/rgba()).
- D18 (Dash, 535f94f): las funciones `_x` de cada módulo se renombran (`_x_m<n>_<fichero>`) con sus llamadas: dos
  módulos pueden tener su `_fuente`. Llamar a la privada de otro módulo sigue dando "is private to module". Test
  `test_private_per_module`; `test_import_nested` actualizado al nombre nuevo. 161/161 y 247/247 en el A1200.
- Encontrado y arreglado: doble espacio cuando un texto acababa en blanco y el siguiente elemento empezaba palabra.
- Tests: `test_maqueta` (`--memcheck`, 26 líneas comprobadas a mano con la topaz 8: márgenes, centrado, sangrías,
  marcas, celdas, caja con borde y relleno, pre). 12/12, también con `--memcheck`.
- Pendiente: `float`, `position`, anchos de tabla según contenido, `line-height`, `vertical-align`; fuentes reales en
  las pruebas (sistema con `FONTS:`).

### 2026-10-16 — D19 (Dash: argumentos del programa)
- Hecho (rama `dashweb`, 0d07cda, sobre la 15a de MUI): `arg_count()`, `arg(i)` (`ARGS_RUNTIME`; `main(argc, argv)`
  solo en los programas que los usan). `tools/emu_run.py`: `run_programs(..., args=[...])`; runner: `# emu-args:`.
  Test `test_args` (comillas incluidas) en A1200, A500 y 3.2. 165/165 sin emulador, 250/250 en el A1200, ejemplos.
- Sigue la tarea 13 (pintor y visor).

### 2026-10-16 — D20 y D21 (Dash: reloj e interior de ventana)
- D20 (6cfad76): `time_ms()` (EClock de timer.device desde el arranque; `TIME_RUNTIME` solo si se usa; `TimerBase`
  como definición provisional para convivir con `bench_lib`). Test `test_time_ms` en las tres máquinas.
- D21: `Win.inner_left`, `.inner_top`, `.inner_width`, `.inner_height` (bordes reales de la ventana abierta; 0
  cerrada). Test `test_window_inner` en las tres máquinas. Mismo C en los programas previos en los dos.

### 2026-10-16 — Tarea 13 (pintor y visor), D21b y D22
- Hecho: `lib/pintor.dash`: `pintar(p, desde, x, y, ancho, alto)` pinta la franja de la página en un rectángulo del
  RastPort actual (fondo, rectángulos y bordes recortados, texto con `font_use`/`font_style` y lápices por
  `color_pen`, imagen como marco gris; una línea de texto que no cabe entera no se pinta). `src/visor.dash`: sin
  argumentos, página de demostración; con un fichero o una URL http(s), esa página. Teclas: abajo/arriba (20 px),
  espacio/retroceso (una pantalla), Esc; escribe el tiempo de cada fase antes del bucle de eventos.
- `tools/medir_visor.py`: sirve `tests/pages/` por HTTP (`tests/servers/http.py` sirve `/pages/<fichero>`), abre la
  página en el visor dentro de FS-UAE y escribe los tiempos; `--maquina objetivo` (68040 + JIT a toda velocidad),
  `--captura`, `--fases` (`tests/bench/fases.dash`: tokenizar, árbol, hojas, estilo, maqueta por separado),
  `--sistema`. `tools/emu_sys_fuentes.sh`: copia un sistema emulado y le añade `Fonts/` del disco del Workbench
  (amitools en el venv `~/.cache/dashweb/venv`); `~/.cache/dash-emu/sys31web` = sys31ssl + fuentes.
- `tests/pages/prueba.html`: 8,8 KB (títulos, párrafos, listas, tabla, enlaces, `<style>`).
- Medidas (prueba.html, ms): A1200 antes de D22: carga 5013, html 18290, estilo 6947, maqueta 8211, pintar 61.
  Tokenizar eran 45 ms por token: cada `s = t.texto` copiaba los 9 KB y cada `s[a:b]` medía el texto con `strlen`.
  Después: A1200 carga 3728, html 1627, estilo 7394, maqueta 8531, pintar 61; objetivo carga 36, html 27,
  estilo 96, maqueta 121, pintar 19 (con fuentes de disco: maqueta 289, por abrir y escalar fuentes).
- D22 (Dash): un campo String pasado a una función va sin copia si ningún código asigna ese campo de ese struct y
  el dueño es una variable local o un parámetro (macro `_DASH_LEND_<Struct>_<campo>`, decidida al final de generar
  el C); `DashString_slice` y `_dash_str_dup` usan y llenan la caché de longitudes (8 entradas, antes 4).
  `lib/html.dash` pasa el texto como parámetro en vez de copiarlo en cada token. Test `test_text_field_lend`
  (`--memcheck`; el campo asignado sigue copiándose). Manual y referencia rápida.
- D21b (Dash, ya en la rama): las ventanas de Dash son GimmeZeroZero: `inner_left`/`inner_top` = 0 y el ancho es
  el de la capa interior.
- Encontrado y arreglado: `más</a>.` cortaba la línea entre "más" y "."; las piezas sin blanco entre ellas
  (`Pieza.pegada`) pasan juntas a la línea siguiente. Caso nuevo en `test_maqueta`.
- Capturas en el emulador: con topaz (sys31) y con helvetica/times (sys31web); la franja gris de la izquierda
  era de `shot.c` (arreglado en la rama mui).
- Tests: dashweb 12/12, también con `--memcheck`. Dash (D22, 3c7c357): 169/169 sin emulador, 427/427 en A1200, A500
  y 3.2, ejemplos 33/33; el C solo cambia en los programas con textos (lo previsto).
- No probado: el desplazamiento con teclas en el emulador (no hay forma de mandar teclas); repintar por partes
  (ScrollRaster) queda para la fase B. Pendiente: la carga por HTTP tarda 3,7 s en el A1200 (9 KB en red local).

### 2026-10-16 — D12 (Dash: imágenes por datatypes)
- Rebase de `dashweb` sobre `mui` (tareas 15-22 de MUI: ReAction, varias ventanas, editor `.dashui`). Los conflictos
  eran todos el mismo trozo (`needs_asl` en `codegen.py`, quedó la versión de MUI) y `docs/BUILTINS.md` (regenerado;
  commit aparte "BUILTINS.md al día tras el rebase").
- Hecho: `image_load(fichero)` (datatypes, con remap a la pantalla de la ventana actual), `image_width`,
  `image_height`, `image_draw(img, x, y)`, `image_draw_part(img, sx, sy, x, y, w, h)`, `image_scale(img, w, h)`
  (copia con `BitMapScale`, máscara incluida), `image_free`. `IMAGE_RUNTIME` solo si se usa; las que quedan se
  liberan al salir. Transparencia: la máscara del datatype (`PDTA_MaskPlane`) o el canal alfa leído con
  `PDTM_READPIXELARRAY` antes del layout, copiada a chip con las filas del bitmap (para `BltMaskBitMapRastPort`).
- Test `test_image` (Dash): ILBM de 8x4 escrito con `file_write_byte`, entero, trozo, al doble, imagen liberada dos
  veces, fichero que no existe; A1200, A500 y 3.2, y con `--memcheck`.
- A mano en 3.2: GIF transparente (máscara del datatype) bien, también escalado. PNG con alfa: el `png.datatype`
  de 3.2 da alfa 0 en todos los píxeles, sin transparencia (documentado). 3.1 solo trae ILBM.
- Mismo C en todos los programas previos (`cmp_dash_c.sh`). Avisada la sesión de MUI de los nombres.
- Dash (3839f52, tras el último rebase sobre `mui` 2dd0e0a: el plan de MUI está terminado y esa rama queda quieta):
  174/174 sin emulador, 440/440 en A1200, A500 y 3.2 (antes del último rebase, que entró limpio), ejemplos 34/34.
  dashweb 12/12.

### 2026-10-16 — Tarea 14 (imágenes)
- `lib/red.dash` recibe en un buffer de bytes (`net_recv_buffer`/`tls_recv_buffer`): las líneas y los textos salen
  de ahí con `str_from_buffer` y `red_copiar(c, fichero, n)` lleva los bytes tal cual a un fichero (n = -1: hasta el
  cierre). El buffer crece si una línea no cabe; se libera en `red_cerrar`.
- `lib/http.dash`: `http_a_fichero(url, fichero, espera)`: el cuerpo de una respuesta 2xx va al fichero (con
  longitud, por trozos o hasta el cierre; `r.bytes`); otra respuesta deja su cuerpo en `r.cuerpo`.
- `lib/imagenes.dash`: `imagenes_cargar(im, doc, base)` trae cada `<img>` (HTTP/HTTPS a `T:dashweb_img<n>`, o de
  disco), la carga con `image_load` (D12) y pone el `width`/`height` que falte (tamaño real, o proporción si viene
  uno). `imagenes_a_tamano` da la copia escalada (guardada). `imagenes_liberar` libera y borra los ficheros.
- `lib/pintor.dash`: `pintar(p, im, ...)` pinta las imágenes recortadas al rectángulo (`image_draw_part`); sin
  imagen, el marco gris. `src/visor.dash` las carga (tiempo "imagenes").
- Encontrado y arreglado: el blanco detrás de una imagen se sumaba a su `src` y a su ancho; ahora lo toma la pieza
  siguiente (`Maquetador.blanco`).
- Tests: `test_http` (20.000 bytes con todos los valores, con longitud y por trozos; un 404), `test_imagenes` (ILBM
  por HTTP a su tamaño, con `width`, y uno que no existe; posiciones y lápices leídos de la ventana; `--memcheck`).
  13/13, también con `--memcheck`. `tests/pages/imagenes.html` + `dibujo.iff`: captura en el emulador con la imagen
  a su tamaño y al doble dentro del texto.
- Medidas: objetivo, imagenes.html: imágenes 6 ms. A1200, prueba.html: carga 3771 ms (igual que antes: lo lento
  no era la red de textos; queda para el perfilador D23).
- Pendiente: GIF/PNG solo con los datatypes del sistema (3.1 trae ILBM); CSS `width`/`height` de las imágenes;
  `alt` cuando no se puede cargar.

### 2026-10-16 — D10 (Dash: C de fuera)
- Hecho: `@link "ruta"` enlaza un fuente C, un objeto o una librería (`.c`, `.o`, `.a`; ruta relativa al `.dash`
  que lo dice, también en módulos importados; si no existe, error del compilador). El C generado lleva
  `/* dash-link: ruta */` y `./dash` y el runner (también en modo multifichero) se lo pasan a gcc detrás del C,
  con su directorio en `-I` (`compiler/cflags.py` `link_flags`). `@c """ ... """ end`: C libre después de los
  prototipos de Dash y antes de las `@native` (callbacks con firma de C que llaman a funciones Dash). `@header`
  entiende `\"`.
- Tests de Dash: `test_c_link` (un `.c` enlazado, una `@native` que le pasa un callback de `@c` que llama a una
  función Dash, un texto de C), `errors/link_missing`. Mismo C en los programas previos. Manual y referencia rápida.
  176/176 sin emulador, 445/445 en A1200, A500 y 3.2, ejemplos 34/34.
- Para la tarea 15: QuickJS se enlaza como `libqjs.a` con `@link` desde `lib/js.dash`, con `quickjs.h` al lado.

### 2026-10-16 — D24 (Dash: `@stack`)
- La tarea 15 necesita 256 KB de pila para QuickJS y un módulo (`lib/js.dash`) no podía pedirla. Hecho: `@stack N`
  en un programa o un módulo; el programa toma la mayor (sobre 16 KB, 32 KB con MUI y 64 KB con TLS); `--stack`
  sigue mandando. Test `test_stack_directive` (módulo con 40000 sobre el programa con 20000; la pila de la tarea
  se mide con `FindTask`) en A1200, A500 y 3.2, y en modo multifichero. 178/178 sin emulador, ejemplos 34/34. Mismo
  C en los programas previos, así que la batería completa en emulador no cambia (no se repitió).

### 2026-10-16 — Tarea 15 (QuickJS enlazable), D10b y D25
- `third_party/fdlibm`: la fdlibm 5.3 de Sun (de GNU Classpath, en las fuentes de GCC del toolchain; licencia
  de Sun en cada fichero), sin `mprec.h`. `tools/build_qjs.sh lib` deja `build/qjs-lib/libqjs.a` (QuickJS,
  fdlibm y fp-bit) con `quickjs.h` al lado; `tests/run.py` lo construye si falta o está viejo.
- `lib/js.dash`: `js_nuevo()`, `js_evaluar(js, código, nombre)` (resultado como texto; "" con excepción),
  `js_error(js)` (mensaje y pila), `js_liberar(js)`; `console.log/info/warn/error` a la salida; Latin-1 <->
  UTF-8 al entrar y al salir. `@link` de la librería, `@header` de `quickjs.h`, `@stack 262144` y el C de
  apoyo en un `@c`.
- D10b (Dash): el C de `@native` y `@c` que nombra funciones del runtime (`_dash_str_dup`) trae su runtime.
  En `test_c_link`.
- D25 (Dash): al terminar, Dash cerraba `dos.library` y dejaba `DOSBase` a NULL; `DOSBase` es de libnix y su
  stdio lo usa al salir (QuickJS usa stdio): el programa se colgaba al acabar. Ahora cierra su apertura y deja
  el puntero. Test `test_libnix_stdio` (se colgaba antes del arreglo). Cambia el C de todos los programas
  (una línea de la limpieza). Dash (commit aparte): 179/179 sin emulador, 454/454 en A1200, A500 y 3.2,
  273/273 con `--memcheck`, ejemplos 34/34.
- Test `test_js`: resultado, `console.log`, acentos de ida y vuelta, excepción con pila, `Math` (los dígitos
  de fdlibm en un PC: `exp(1)` = 2.7182818284590455; V8 da ...045), JSON, estado entre evaluaciones;
  también con `--memcheck`.
- Medidas: ejecutable mínimo 889 KB. A1200: crear el motor 429 ms, `fib(20)` 5,95 s (el lanzador de pruebas
  daba 4,3 s: pendiente), liberar 131 ms. Objetivo: 7, 59 y 2 ms.

### 2026-10-16 — Tarea 16a (DOM en JavaScript) y D26
- Tarea 16 partida en 16a (DOM y scripts) y 16b (eventos, temporizadores, volver a maquetar).
- `lib/jsdom.dash`: la parte Dash (`jsdom_selector` con los selectores de `css.dash` y `estilo_cumple`, textos,
  atributos, crear, agregar (mueve el nodo; no deja meter un nodo dentro de sí mismo), quitar, `innerHTML` leído
  como HTML escapado y puesto leyendo el trozo como un `<body>`) y la de C: una clase `Node` de QuickJS con un
  objeto por nodo (tabla por dirección: `a === b`), que retiene su `Nodo` hasta `js_liberar` (enganche
  `liberar_extra` de `js.dash`). `tagName`, `nodeName`, `nodeType`, `textContent`, `innerHTML`, `id`, `className`,
  `parentNode`, `children`, `childNodes`, `firstChild`, `lastChild`, `get/set/has/removeAttribute`,
  `appendChild`, `removeChild`, `querySelector(All)`, `getElementsByTagName`; `document.getElementById`,
  `createElement`, `createTextNode`, `body`, `documentElement`, `title`; `window`. `jsdom_ejecutar_scripts`:
  en orden, en línea y `src` (http(s) o fichero); un error se escribe en una línea y se sigue. `jsdom_cambios`.
- El visor ejecuta los scripts antes del estilo (si la página tiene alguno). `tests/pages/js.html`: lista hecha
  por un script, captura en el emulador; js 12 ms en el objetivo.
- D26 (Dash, 4c63280 tras el rebase sobre main): `@native(borrow)`: los argumentos se prestan durante la llamada como a una función Dash,
  en vez de retenerse hasta salir. `--memcheck` daba 131 objetos y 86 textos vivos en `test_jsdom`; ahora 0.
  Cabecera de `tools/emu_sys_amissl.sh` corregida (`DASH_EMU_SYS_SSL`, lo vio la sesión de MUI).
- Tests: `test_jsdom` (página con 5 scripts: búsquedas, selectores, mismo objeto, `src` por HTTP, un error
  que no para el resto, crear/mover/quitar, `innerHTML`, atributos; el árbol visto después desde Dash;
  `--memcheck`). dashweb 15/15, también con `--memcheck`. Dash: 180/180 sin emulador, ejemplos 34/34.
- La sesión de MUI fusiona `dashweb` (hasta 942d2b3) en `main` y lo sube a GitHub a petición del usuario.

### 2026-10-16 — Tarea 16b (eventos y temporizadores) y D27
- Rebase de `dashweb` sobre `main` (la sesión de MUI fusionó y subió `main` = 942d2b3 + documentación,
  3dafc57; desde ahora trabaja en `main`). Regla 3 actualizada: la base es `main`.
- D27 (Dash, 8832a2e): `On Click` (botón izquierdo en la ventana; `click_x()`, `click_y()` dentro de los
  bordes, tomados antes de devolver el mensaje) y `On Timer N` (número o variable, leída cada vez;
  `timer.device` mientras el bucle espera). Test `test_on_click_timer` (un proceso hace clic con
  `input.device`) en A1200, A500 y 3.2. Mismo C en los programas previos. 181/181, ejemplos 34/34.
- `lib/jsdom.dash`: preludio en JS con `addEventListener`/`removeEventListener`, `onclick` (propiedad y
  atributo, `return false`), el evento sube hasta `document` (`target`, `currentTarget`), `preventDefault`,
  `stopPropagation`, `dispatchEvent`, `click()`; `setTimeout` (también con texto), `setInterval`,
  `clearTimeout`/`clearInterval` con una cola ordenada por tiempo (`__dashweb_reloj` = `time_ms`). Desde
  Dash: `jsdom_clic(js, nodo)` (false si se paró) y `jsdom_temporizadores(js)` (ms al siguiente, -1 si no
  hay). Los errores de JS en eventos y temporizadores salen en una línea.
- `lib/maqueta.dash`: cada `Dibujo` (texto, imagen, fondo de caja) sabe su elemento (`nodo`);
  `maqueta_nodo_en(p, x, y)` da el elemento bajo un punto. Textos de elementos distintos ya no se juntan
  en un solo dibujo.
- `src/visor.dash`: `On Click` busca el nodo y despacha el clic; `On Timer` corre los temporizadores; si
  `jsdom_cambios` cambió, estilo, imágenes y maqueta otra vez, y se pinta. `tests/pages/reloj.html`: un
  contador con `setInterval` que sube solo en la captura (unos 140 ms por vuelta en el objetivo, sobre todo
  por volver a maquetar entera la página).
- Tests: `test_jsdom_eventos` (burbujeo, `preventDefault`, `onclick` del atributo, orden de temporizadores,
  nodo bajo un punto; `--memcheck`). dashweb 16/16, también con `--memcheck`.
- No probado: el clic dentro del visor en el emulador (sí `jsdom_clic` y `maqueta_nodo_en` por separado).
  Pendiente: seguir enlaces (tarea 19), volver a maquetar solo lo que cambió.

### 2026-10-16 — Tarea 17 (repaso de la fase A)
- Medidas con el visor (`tools/medir_visor.py`, fuentes del Workbench en `sys31web`), en ms, objetivo / A1200:
  prueba.html (8,8 KB): carga 40/3770, html 28/1626, estilo 102/7363, maqueta 295/9463, pintar 21/90.
  imagenes.html: estilo 33/2501, imágenes 6/316, maqueta 157/769. js.html: js 29/1633 (crear el motor y
  ejecutar), estilo 34/2589, maqueta 157/793. Memoria (libre antes - después): 357, 173 y 333 KB. El visor
  ocupa 1.040.908 bytes (QuickJS casi todo). El visor escribe ahora la memoria gastada.
- Lo que más pesa en un A1200: el estilo tiene un coste fijo de unos 2,5 s aunque la página sea mínima (la hoja
  del navegador se lee y se aplica cada vez) y la maqueta de una página de 9 KB son 9,5 s; la carga por HTTP de
  9 KB, 3,8 s. En el objetivo todo va en menos de medio segundo. Para el A1200 hace falta el perfilador (D23).
- `--memcheck`: los 16 tests de dashweb con 0 vivos. README con el estado, las medidas y cómo probar.
- Fase A terminada. Siguiente: fase B (tarea 18, ventana del navegador con MUI).

### 2026-10-16 — Tarea 18 (ventana del navegador con MUI), D28 y D12b
- `src/dashweb.dash` + `src/navegador.dashui` (el `.dashui` del ejemplo de la sesión de MUI, con la zona de
  dibujo más baja para caber en 640x256): barra de URL (Return), atrás/adelante, recargar, historial,
  barra de estado (bytes y ms) y de progreso, título de la página en la ventana, barra de desplazamiento
  y rueda; clic en la zona → `jsdom_clic`; temporizadores del JS con `mui_timer`. Página de inicio propia;
  con un argumento abre esa dirección.
- `lib/documento.dash`: abrir (cargar, árbol, scripts, hojas, estilo, imágenes), maquetar a un ancho,
  `documento_al_dia` (si el JS cambió algo: estilo, imágenes y maqueta otra vez), liberar.
- Encontrado: `mui_width` del lienzo (441) no es el ancho que recibe la función de dibujo (424); la página se
  maqueta otra vez al pintar y pide `ID_RANGO` con `mui_timer`, que es uno solo y cancelaba el del JS (el
  contador de reloj.html se quedaba en 1). `ID_RANGO` vuelve a poner los temporizadores del JS.
- D28 (Dash, 5b196e0): medir textos sin ventana. D12b (Dash, db39ece): `DoMethod` con prototipo.
- `tests/run.py` compila también los programas de `src/` (sin ejecutarlos) y construye `libqjs.a` si hace
  falta. `tools/medir_visor.py --programa src/dashweb.dash`; `~/.cache/dash-emu/sys31muiweb` = sys31mui +
  fuentes. Capturas en el emulador: js.html, reloj.html (el contador sube) y prueba.html con la barra de
  estado. dashweb 18/18 (16 tests y los 2 programas), también con `--memcheck`.
- No probado en el emulador: botones, historial, barra y rueda (no hay forma de mandarles eventos desde
  `medir_visor`). Pendiente: los nombres que chocan entre programa y módulos (D14).

### 2026-10-16 — Tarea 19 (navegación)
- `src/dashweb.dash`: un clic va primero al JavaScript (`jsdom_clic`) y, si no lo para, sigue el `<a href>` que
  contiene al nodo (`javascript:` no). Navegar descarta lo que había delante en el historial; atrás, adelante,
  la lista y recargar abren la entrada que toca. Un enlace `#ancla` de la misma página solo desplaza; al abrir
  una dirección con fragmento, la página empieza en él (`id` o `<a name>`). Teclas en la zona de la página:
  abajo/arriba 20 px, espacio/retroceso una pantalla (las da `mui_canvas_key` con el ratón encima); la rueda,
  30 px. El título de la página va al de la ventana y los errores de red salen como página ("No se pudo
  cargar").
- `lib/documento.dash`: `documento_enlace`, `documento_y_de`, `documento_sin_fragmento`/`documento_fragmento`.
- Test `test_navegacion` (sin ventana, gracias a D28; `--memcheck`). dashweb 19/19 compila.
- Pruebas de interfaz: D29 (Dash, `tools/emu_run.py` con programas en segundo plano) y
  `tools/amiga/clicar.dash` (espera una ventana por su título, la trae al frente y le manda clics y teclas con
  `input.device`); `tools/medir_visor.py --acciones "dashweb e 150 c 150 62 ..." --guardar DIR`. Probado en el
  emulador: clic en un enlace de `tests/pages/enlaces.html` → abre `js.html` (historial con dos entradas, "<"
  activo); después el botón "<" → vuelve (">" activo). Encontrado al montarlo: la consola de arranque quedaba
  delante (la salida del programa en segundo plano iba a ella).
- Aún sin probar en el emulador: anclas, teclas en la zona, rueda, historial por la lista.

### 2026-10-16 — Tarea 20a (cargar sin congelar la ventana) y D29
- Tarea 20 partida en 20a (la página principal) y 20b (el resto de recursos, conectar sin bloquear).
- Intento de D30 (señal de los sockets): `SocketBaseTagList(SBTC_SIGIOMASK)` + `FIOASYNC`, y también
  `SetSocketSignals`; el `bsdsocket.library` de FS-UAE no manda la señal en ninguna de las tres máquinas, así
  que no se puede probar aquí y no se quedó en Dash (revertido). En su lugar, sondeo: leer sin esperar.
- `lib/red.dash`: `red_recibir_ya` (lo que haya, sin esperar; -1 cerrada), `red_pendientes`. `lib/http.dash`:
  conectar y leer separados (`_http_conectar`, `_http_leer`); carga por pasos: `http_empezar` (conecta y pide:
  eso aún espera), `http_avanzar` (true al acabar: la respuesta se analiza cuando la conexión se cierra o ya llegó
  todo el `Content-Length`; redirecciones; tiempo agotado si nada llega en `espera` ms), `http_recibidos`,
  `http_total` (cabeceras + `Content-Length`, -1 si aún no se sabe), `http_cancelar`.
- `src/dashweb.dash`: por http(s) `abrir` empieza la carga y vuelve; un solo `mui_timer` (ID_TIC) cada 50 ms
  mientras llega y, si no, al siguiente temporizador del JS (`programar`); barra de progreso por bytes;
  botón "Parar" (nuevo en `navegador.dashui`). `lib/documento.dash`: `documento_desde_respuesta`. El historial
  apunta la dirección pedida (la página aún no ha llegado).
- `tests/servers/http.py`: `/lento` (media respuesta, 1,5 s de pausa, el resto). `tools/medir_visor.py --pagina
  /ruta`. Test `test_http_carga` (longitud, chunked, redirección, 404, progreso a medias, cancelar, rechazada;
  `--memcheck`). En el emulador: reloj.html llega y el contador sigue; clic en "Parar" durante /lento → "Parado".
  dashweb 20/20, también con `--memcheck`.

### 2026-10-16 — Tarea 20b (imágenes sin esperar)
- Tarea 20b acotada a las imágenes; CSS, scripts y conectar sin bloquear pasan a 20c.
- `lib/http.dash`: `http_empezar_a_fichero` (el cuerpo de una 2xx al fichero, como `http_a_fichero`, sin
  esperar; `Carga.fichero`). `lib/imagenes.dash`: `imagenes_pedir` (las de http(s) a una cola, las de disco
  ya), `imagenes_avanzar(im, doc)` (como mucho 4 descargas a la vez; al llegar una, `image_load` y el tamaño en
  todos sus `<img>`; cuántas llegaron), `imagenes_pendientes`; `imagenes_liberar` cancela las que faltan.
  `imagenes_cargar` (esperando) sigue para el visor.
- `lib/documento.dash`: pide las imágenes sin esperar; `documento_imagenes(d)` (true si llegó alguna: vuelve a
  maquetar). `src/dashweb.dash`: el tic sigue cada 50 ms mientras faltan imágenes, repinta cuando llegan y lo
  dice en la barra de estado.
- Test `test_imagenes_carga` (mismo `src` dos veces, uno con `width`, uno que no existe; `--memcheck`). En el
  emulador: imagenes.html en el navegador, las imágenes salen tras la página. dashweb 21/21, también con
  `--memcheck`.

