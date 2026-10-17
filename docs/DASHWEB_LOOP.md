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
7b. **Capturas.** El usuario quiere ver cómo evoluciona (2026-10-16): cuando una tarea cambie lo que se ve, una
   captura del emulador enviada con SendUserFile (sin esperar al final).
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
- [x] D4c. **Campo de un elemento.** `l[0].x = 5`.
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
- [x] D14. **Variables locales que tapan funciones.** Hoy, si un programa define `func b()`, ningún módulo puede
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
- [x] D31. **Teclas como texto en la zona de dibujo de MUI.** `mui_canvas_char` (lo pidió la 21a).
- [x] D37. **Métodos de elementos.** `d["k"].push(x)`, `l[0].mover(1)` como sentencia, y el tipo de los elementos de
      `{String: [T]}` y `[[T]]` (lo pidió el índice de CSS).
- [x] D38. **Barra de herramientas.** `mui_image_button`, `mui_help`, `mui_window_size` (y en `.dashui`
      `image_button`, `help`, `size`) para una interfaz de navegador actual.
- [x] D40. **Imágenes desde píxeles.** `image_from_rgb(buffer, ancho, alto, alfa)` con picture.datatype V43
      (lo pidió la 29).
- [x] D41. **Plazos de la red sin espera.** El tiempo en que el programa no consulta no cuenta y el de la
      negociación TLS empieza de nuevo con cada paso (lo encontró la 28c: los fondos de freemem.space fallaban).
- [x] D36. **Conectar sin esperar.** `net_connect_start`/`_poll`/`_stage` (el nombre se busca en otro proceso,
      la conexión sin bloquear) y `tls_connect_start`/`_poll` (lo pidió la 20d).
- [x] D35. **Atajos de menú de MUI.** Amiga+tecla colgaba el programa (barra de menús puesta con `SetAttrs`
      después de crear la ventana) y cada elección daba además un evento 11 falso (`MUIA_UserData` de los
      elementos). Lo encontró la 22c.
- [x] D34. **Modo de pruebas sin frenar los bucles.** `--autoclose` miraba el reloj en cada vuelta (lo encontró D23).
- [x] D32. **Ventana activa en MUI.** `mui_window_active` (lo pidió la 22b).
- [x] D23. **Perfilador.** `./dash --profile`: cuántas veces se llama cada función y en cuál está el programa
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
- [x] 20c. **Bucle de eventos: hojas y scripts.** CSS (con sus `@import`) y `<script src>` llegan a la vez y sin
      esperar; la página se monta cuando están todos, en el orden del documento.
- [x] 21a. **Formularios: controles y GET.** `input` (texto, password, checkbox, radio, submit, hidden), `button`,
      `select` dibujados en la página; clic y teclado (foco, escribir, marcar, elegir); enviar por GET.
- [x] 21b. **Formularios: textarea, POST y JS.** `textarea`; envío POST (`application/x-www-form-urlencoded`);
      `.value`/`.checked` y `submit`/`onsubmit` en JavaScript.
- [x] 22a. **Marcadores y página de inicio.** Menú Proyecto: Página de inicio, Marcadores (una página con los
      enlaces), Añadir marcador, Usar como página de inicio.
- [x] 22b. **Varias ventanas.** Cada una con su página, historial y carga (hoy el estado del navegador es global).
- [x] 22c. **Atajos de menú.** Respuesta del usuario (2026-10-16): hay que hacerlos funcionar; averiguar si el
      fallo es de Dash. Hay otro emulador en esta máquina (Amiberry). Intentado sin éxito: tecla con cualificador,
      secuencia completa y ratón (MUI 5 usa menús propios). Inyectar Amiga derecha + tecla con `input.device` en un
      programa MUI cuelga el sistema con 68040+JIT (también un programa MUI mínimo con un menú) y en el A1200 sin JIT
      el atajo no llega. Averiguar si es la inyección, MUI, Dash o FS-UAE (un programa MUI mínimo en C; Amiberry).
- [x] 22d. **Historial plegable.** Preferencia del usuario (2026-10-16, vía la sesión de MUI): la lista de historial
      de la izquierda, oculta al abrir y accesible si se despliega. Patrón de `examples/mui_navegador.dash` de Dash:
      botón "_Historial" en la barra; la lista y el balance llevan `"hidden": true` en el `.dashui` y el botón los
      alterna con `mui_set_visible`.
- [x] 20d. **Bucle de eventos: conectar.** Respuesta del usuario (2026-10-16): la consulta DNS, la conexión y la
      negociación TLS no pueden congelar el navegador; mientras, un indicador de actividad (como los navegadores
      modernos). Hoy `http_empezar` espera a que conecte. Si una pila TCP/IP real da `SIGIO`, usarlo con
      `mui_wait_event_signals` (FS-UAE no lo da). Probarlo con un retraso artificial (servidor que tarda en
      aceptar o en responder al TLS).
- [x] 24. **Interfaz actual y la web real.** Petición del usuario (2026-10-16): "la interfaz debería asemejarse a un
      browser sencillo pero actual y con un buen UX", y cargar https://freemem.space.
- [x] 25. **jQuery.** freemem.space (WordPress) usa jQuery 3.7: falta DOM (createDocumentFragment, cloneNode,
      insertBefore, hermanos, eventos en document/window, readyState), `navigator`, `location`...
- [x] 26. **Maqueta más rápida.** 5 s en el A1200 para la página de prueba de 9 KB; ahora es la fase más lenta.
- [x] 27. **Emulación RTG.** Petición del usuario (2026-10-16): "poner la emulación en RTG a una resolución más alta".
      Un sistema emulado con tarjeta gráfica (uaegfx de FS-UAE con Picasso96, o el RTG de AmigaOS 3.2), pantalla
      de 1024x768 o más en 16/24 bits, con MUI, AmiSSL y fuentes; `medir_visor --maquina objetivo` lo usa. Como una
      PiStorm con RTG.
- [ ] 28. **Igual de bien que Chrome.** Petición del usuario (2026-10-16): comparar https://freemem.space en Chrome (en
      esta máquina, shiva) y en dashweb con RTG, al mismo ancho, y "tratar de alcanzar que se vea igual de bien".
      Capturas lado a lado; cada vuelta, la diferencia más visible (columnas con float/flex, position, márgenes,
      fuentes, imágenes, menús...) hasta que se parezcan. Partir en subtareas según lo que salga.
- [x] 28a. **@media con el ancho de la página.** Se evalúan como 640 px: con RTG (unos 940) salen las reglas de
      móvil (la barra superior de freemem.space se esconde). El ancho real de la zona de dibujo; volver a leer las
      hojas si cambia de lado de un corte.
- [x] 28b. **float.** left/right y clear en la maqueta (la fecha, el logotipo, las cinco entradas destacadas).
- [x] 28c. **Imágenes de fondo y position.** background-image (cover, center, no-repeat) en bloques;
      position relative/absolute (el título encima de la imagen), top/left/bottom.
- [x] 28d. **Tipografía.** text-transform, letter-spacing, fuentes web (Lato...) a las del Amiga, tamaños.
- [x] 28e. **Iconos.** Los de Font Awesome más comunes (menú, lupa, calendario, comentario) dibujados.
- [x] 28f. **Degradados.** linear-gradient (los títulos de las entradas destacadas sobre una sombra) leído y en la
      maqueta (`D_DEGRADADO`); pintarlo mezclado con lo de debajo necesita D42 (tarea 6 de la otra sesión:
      `gfx_blend_rect`, `gfx_gradient_rect`). Mientras, solo los tramos casi opacos.
- [x] 30. **Vídeo dentro de la página (prioridad del usuario, 2026-10-16).** `<video>` y YouTube reproducidos en su
      recuadro y a pantalla completa, "directo al vídeo integrado" (sin el paso de abrir MintVID aparte), con el
      núcleo de MintVID (github.com/boingball/MintVID, MIT; C99 portable): H.264 con libavc (Apache-2.0) y AAC.
      MintVID saca el MP4 de 360p (itag 18) o el HLS de la página de YouTube en el propio Amiga; en PiStorm/Emu68
      con RTG reproduce 360p. Licencias: dashweb es MIT; fuera libmpeg2 y a52dec (GPL); AAC: buscar un
      decodificador de licencia permisiva o usar el Helix de MintAMP (RPSL: publicar sus fuentes y avisos).
      Partes: 30a traer y compilar el núcleo y libavc (decodificar un MP4 local en el emulador); 30b reproducir en
      el recuadro de `<video>` (imagen por imagen en la zona de dibujo, sonido); 30c YouTube (de la página del
      vídeo al MP4/HLS); 30d controles y pantalla completa.
- [x] 30e. **Vídeo: el cartel antes del clic.** La miniatura del vídeo (la de YouTube, i.ytimg.com/vi/ID/hqdefault.jpg;
      el atributo poster de `<video>`) antes del clic. Captura del artículo de freemem.space con su YouTube.
- [x] 30f. **Vídeo: que empiece antes.** Reproducir mientras se baja (hoy espera el fichero entero).
- [x] 28g. **JavaScript más rápido.** El perfil de la otra sesión (carga real de freemem.space, 12 s en la máquina
      objetivo): QuickJS 24 %. libqjs.a va sin FPU (fp-bit): compilarlo para 68020+FPU como dashweb.
- [x] 28h. **Menos negociaciones TLS.** red_abrir_avanzar 14 % y red_recibir_ya 7 %: conexiones keep-alive para los
      recursos del mismo servidor.
- [x] 29. **Imágenes con decodificadores propios.** Pregunta del usuario (2026-10-16): ¿son óptimos los datatypes? No:
      decodifican a tamaño completo (una foto de freemem.space no acabó en 5 min en la máquina RTG), sin límites de
      memoria ni tiempo, sin WebP/SVG y distintos en cada sistema. Decodificar en C (third_party: stb_image para
      JPEG/PNG/GIF/BMP, libwebp para WebP) al tamaño en que se va a ver (JPEG a 1/2, 1/4, 1/8 al decodificar), sin
      esperar y con límites; datatypes solo para lo demás.
- [x] 29b. **SVG.** Logos e iconos en SVG (muchas webs): un subconjunto (path, rect, circle, fill/stroke) dibujado
      con gfx_ o rasterizado a RGB (nanosvg, zlib) al tamaño en que se ve.
- [x] 28i. **Lo que le falta al JavaScript de las webs de hoy.** commodoremalacca.club (Next.js), probado a mano
      por el usuario el 2026-10-17: "ReferenceError: 'TextEncoder' is not defined" en su webpack. TextEncoder y
      TextDecoder (UTF-8) en jsdom; luego, lo siguiente que pida esa página.
- [x] 28l. **Repintar menos (el usuario, 2026-10-17: "todo se re-renderiza varias veces").** Imágenes que llegan
      pintadas juntas; doble búfer en la zona de dibujo (D48, encargada).
- [~] 31. **CSS de verdad, módulo a módulo (decisión del usuario, 2026-10-17).** Hasta ahora el motor es general (nada
      a medida de una web), pero se iba completando con lo que pedía freemem.space, y otras webs se ven mal. Ahora,
      cada módulo de CSS entero según su especificación, con sus tests (páginas propias en tests/pages), y
      comprobado a mano contra Chrome (capturas al mismo ancho, tools/comparar_chrome.py) en la lista de webs de
      abajo. Orden:
      [x] 31a. Herramienta de comparación: captura de Chrome (headless, ancho de la zona de dibujo de dashweb en la
           máquina RTG) y de dashweb, una al lado de la otra, para una web o la lista entera. Solo a mano (no en la
           batería: son webs de terceros).
      [x] 31b. Flexbox (CSS Flexible Box Layout 1): flex-direction, flex-wrap, flex-grow/shrink/basis, justify-content,
           align-items/self/content, order, gap, márgenes auto, inline-flex, mínimos automáticos.
      [x] 31c. calc(), min(), max(), clamp() y las unidades que faltan (vw, vh, vmin, vmax, ch, ex; rem y em en todo).
      [x] 31d. Grid (CSS Grid 1): grid-template-columns/rows (fr, repeat, minmax, auto-fill/fit), áreas, gap, colocación
           automática y explícita, alineación.
      [x] 31e. Apilado y recorte: z-index (contextos de apilado), overflow (hidden, auto, scroll: recorte), position
           sticky.
      [x] 31f. border-radius de verdad (esquinas redondeadas con su radio, también en fondos e imágenes), box-shadow.
      [x] 31g. vertical-align, tablas completas (colspan/rowspan, anchos automáticos), aspect-ratio, object-fit.
      31h. @font-face (fuentes de la web: woff/woff2/ttf) y font-weight/style reales.
      [x] 31k. Selectors 4: :is(), :where(), :has(), :not() con listas (ami64.com usa :is() en querySelector).
      [x] 31l. Transforms completo: translate con %, scale, rotate de cualquier ángulo (en cajas e imágenes).
      [x] 31m. Transitions y Animations: el estado final (sin animar) y lo que pidan las webs de la lista.
      [x] 31n. Color 4: hsl(), hwb(), lab()/oklch(), color-mix(), y la sintaxis nueva rgb(r g b / a).
      [x] 31o. Text 3: text-overflow: ellipsis, overflow-wrap, word-break, text-shadow, hyphens básico.
      [x] 31p. @supports y @layer (Conditional 3 y Cascade 5): antes se perdía todo lo de dentro.
      34. Instalador e iconos (lo pide el usuario, 2026-10-17, para la alfa): iconos de Workbench (.info clásicos de 4
          colores, de 3.0 a 3.2) para el cajón, dashweb, el visor, el LEEME y el instalador, hechos con un script; un
          guion para el Installer del sistema que pregunte dónde instalar, copie el cajón y avise si faltan MUI,
          AmiSSL o una pila TCP/IP. Probarlo en el emulador con el Installer del disco de AmigaOS 3.2.
      33. RENDIMIENTO (lo pide el usuario, 2026-10-17: "está relento"; pasa delante de lo demás). freemem.space tarda
          105-120 s en la máquina RTG (68040 con JIT: medido que el JIT va, sin él todo tarda 2-2,5 veces). Primero
          medir con `tools/medir_visor.py --perfil` (tabla de tiempo por función de ./dash --profile) en las webs de
          la lista y atacar lo que más pese (cascada, maqueta repetida al llegar imágenes y fuentes, pintado entero,
          JavaScript, TLS), midiendo antes y después.
          33b. gzip (lo pregunta el usuario, 2026-10-17): lib/http.dash pide `Accept-Encoding: identity`, así que todo
               llega sin comprimir (la portada de freemem.space: 91 KB frente a 15 KB con gzip). Pedir gzip y
               deflate y descomprimir con el inflate de stb_image (ya va en libimg.a); medir antes y después, y
               apuntar dónde se va la espera (Main propio 80 %: red, TLS o temporizadores).
      36. HTML5 de verdad con Hubbub (el usuario, 2026-10-17, señala https://www.netsurf-browser.org/projects/hubbub/ y el código en https://github.com/netsurf-browser/libhubbub, con https://github.com/netsurf-browser/libparserutils;
          va detrás de la línea de tiempo de la carga de la tarea 33, antes que la 35): el analizador de NetSurf
          (C, licencia MIT, con libparserutils, también MIT; ya funciona en AmigaOS 3 dentro de NetSurf) en
          third_party/, compilado a una librería como libimg.a. Su árbol se construye por funciones de vuelta
          (crear elemento, añadir hijo, mover hijos...): el lado de C apunta las operaciones en una lista con números
          de nodo y Dash la repite creando los Nodo de lib/dom.dash (nada de punteros de C dentro del DOM). Trae lo
          que falta: etiquetas mal anidadas (adoption agency), contenido suelto en tablas (foster parenting), los
          modos de inserción, todas las entidades y el juego de caracteres de <meta charset>. Comprobar con los
          tests de html5lib (tree-construction) unos cuantos casos en el emulador, medir velocidad y memoria
          contra lib/html.dash + lib/dom.dash en las webs de la lista, y dejar el viejo solo si Hubbub no cabe.
      35. Lo que le falta frente a NetSurf (tabla del usuario, 2026-10-17), por este orden: (a) cookies HTTP
          (Set-Cookie y Cookie por dominio y ruta, Secure, caducidad; las mismas que document.cookie; guardadas en
          PROGDIR: entre sesiones); (b) estabilidad: Next.js lo deja sin memoria y se cierra (medir qué se come la
          memoria y fallar con un aviso, nunca cerrarse); (c) descargas (lo que no es una página se guarda con un
          requester de ficheros), guardar la página y la imagen; (d) imprimir (printer.device, la vista pintada).
      31q. Animar el CSS de verdad (lo pide el usuario, 2026-10-17: trainalong.fit dibuja sus curvas con @keyframes al
           abrirse). Ahora (31m) solo se pinta el estado final. Plan: (1) un reloj de animaciones con el tic de dashweb
           (unos 10-20 por segundo mientras haya alguna viva) y las funciones de tiempo (linear, ease y cubic-bezier,
           steps), delay, duración, vueltas, direction y fill-mode; (2) lo que no mueve la maqueta se aplica sobre los
           dibujos ya colocados del elemento y se repinta solo su caja: opacity, color y background-color, transform;
           (3) transitions (al cambiar :hover o las clases desde JavaScript); (4) lo que mueve la maqueta (width,
           height, margin...) rehaciendo la maqueta a pocos fotogramas; (5) SVG (stroke-dashoffset, transform de sus
           partes) volviendo a rasterizar el SVG en cada fotograma. Medir el coste en la máquina RTG.
      (El usuario, 2026-10-17: "mejor CSS 3". CSS 3 es el conjunto de módulos posteriores a CSS 2.1, que sigue siendo
      la base: el bloque 31 los va completando.)
      31j. ami64.com sale en blanco (averiguar); amigang.com, la cabecera rota; muylinux.com, el menú escondido sale
           a la vista; dpms.freemem.space, la imagen de fondo enorme (primera comparación, 2026-10-17).
      [x] 31i. SVG dentro de la página (<svg> con sus hijos, <use href="#icono"> de un sprite): los iconos y logos de
           casi todas las webs de la lista salen como cuadraditos vacíos (xataka.com, la primera comparación).
      Webs de prueba (del usuario): https://trainalong.fit/ https://meneame.net https://xataka.com
      https://dpms.freemem.space https://commodoremalacca.club https://www.muylinux.com/ https://amigaworld.net/
      https://www.ami64.com/ https://amigastore.eu/es/ https://aminet.net/ https://amiga.abime.net/
      https://amigang.com/community/ y https://freemem.space.
- [ ] 32. **JavaScript de las webs de hoy (pregunta del usuario, 2026-10-17).** El lenguaje está completo (QuickJS,
      ES2023); falta navegador. Orden:
      32z. Primero, los errores de JavaScript de las webs de la lista: amigastore.eu (jQuery 1.7: "not a function" al
           poner un style), amigang.com ("cannot read property 'replace' of undefined" en sus enlaces: ¿a.hash,
           a.pathname?), ami64.com (Wix: "'set'/'get' of undefined"; :is() en querySelector).
      32a. fetch y XMLHttpRequest (sobre las cargas sin espera de lib/http.dash; promesas y eventos), con Headers,
           Request/Response básicos.
      32b. URL y URLSearchParams, FormData, Blob (lo básico), crypto.getRandomValues y randomUUID.
      32c. <script type="module"> e import estáticos (traídos con la red de dashweb), import() dinámico.
      32d. customElements (define, connectedCallback) y los observadores de verdad (MutationObserver al menos).
      32f. Intl (QuickJS no lo trae): toLocaleString de números y fechas, Intl.NumberFormat, DateTimeFormat,
           Collator, PluralRules y Segmenter básicos (es y en), en el preludio.
      32g. Fallos de QuickJS que salgan con las webs de la lista: arreglados en C (parches pequeños, anotados en
           third_party/quickjs, con su test) y avisados a su autor.
      32e. Canvas 2D (lo básico: rectángulos, texto, imágenes) sobre la zona de dibujo.
- [ ] 28j. **Next.js sin agotar la memoria.** Con ReadableStream (escrita en el preludio como
      __dashweb_ReadableStream, sin poner), el JavaScript de commodoremalacca.club sigue (React montando la página) y
      deja el Amiga sin memoria (malloc falla: no es QuickJS, que ya tiene tope de 48 MB) y dashweb se cierra; salen
      también excepciones "null". Averiguar qué crece (¿el DOM de Dash?) y ponerle freno; luego poner ReadableStream.
- [ ] 28k. **commodoremalacca.club como en Chrome.** Su portada sale con el texto blanco sobre fondo claro (falta el
      fondo oscuro del bloque principal) y el botón redondeado "Ver Eventos" dibujado como una elipse.
- [x] 29c. **Decodificar sin parar la interfaz.** Hoy una imagen se decodifica entera en imagenes_avanzar (la
      ventana no responde mientras): por trozos (TJpgDec por bloques, libwebp incremental) o en otra tarea.
- [x] 23. **Repaso final.** Tamaño, memoria, tiempos en la configuración objetivo, documentación,
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

### 2026-10-16 — Tarea 20c (hojas y scripts sin esperar)
- `lib/recursos.dash`: `recursos_del_documento` pide los `<link rel=stylesheet>`, los `<script src>` y los
  `@import` de los `<style>`; `recursos_avanzar` (4 a la vez; los `@import` de una hoja que llega se piden; las
  de disco se leen ya); `recursos_pendientes`, `recursos_cancelar`; `r.traidos` (dirección → texto, "" si
  falló). `lib/estilo.dash`: `estilo_hojas_con(doc, base, traidos)`; la hoja del navegador se lee una vez por
  programa (global `estilo_ua_leida`; antes, en cada página). `lib/jsdom.dash`: `jsdom_ejecutar_scripts_con`.
- `lib/documento.dash`: `documento_empezar` (árbol y recursos pedidos) y `documento_avanzar` (cuando están
  todos: scripts en orden, estilo, imágenes pedidas). `src/dashweb.dash`: tras la página, "Trayendo hojas de
  estilo y scripts: faltan N"; "Parar" también corta eso (`parar_carga`).
- Tarea 20 partida otra vez: lo que falta (conectar, DNS y TLS sin bloquear) es 20d.
- Tests: `test_recursos` (hoja con `@import` descubierto al llegar, script, uno que no existe; estilo y script
  con lo traído; `--memcheck`). En el emulador: `tests/pages/externos.html` en el navegador (colores de la hoja
  y de su `@import`, el script de fuera usado por uno de dentro). dashweb 22/22, también con `--memcheck`.

### 2026-10-16 — Tarea 21a (formularios: controles y GET) y D31
- 20d (conectar sin bloquear) movida al final de la fase B: en el emulador conectar es instantáneo.
- D31 (Dash, 637977b): `mui_canvas_char(zona)`: el carácter de la última tecla con mayúsculas y keymap (la zona
  guarda cualificadores y tecla muerta; `_dash_map_key`). Test con un proceso que teclea por `input.device`, en
  A1200 y 3.2, también con `--memcheck` (lo preguntó la sesión de MUI).
- `lib/maqueta.dash`: `input`, `select` y `button` son piezas de control (`D_CONTROL`, del tamaño de su fuente:
  `size` caracteres, el texto del botón, la opción más ancha); `hidden` no ocupa. `formulario_etiqueta`,
  `formulario_opcion`. `lib/pintor.dash`: botones en relieve, casillas y radios con su marca, campos y
  desplegables con su valor (password con asteriscos, lo último escrito si no cabe), borde azul y cursor en el
  campo con el foco (`pintor_foco`). `lib/url.dash`: `url_codificar` (UTF-8, `+` para el espacio).
- `lib/formularios.dash`: `formulario_clic` (foco, casilla, radios del mismo nombre, desplegable a la opción
  siguiente, enviar), `formulario_tecla` (escribir, retroceso, `maxlength`, Return envía),
  `formulario_datos`/`formulario_destino` (GET a `action` con los datos; el botón con nombre cuenta).
- `src/dashweb.dash`: clic → JS → formulario → enlace; las teclas van al campo con el foco. Encontrado: un texto
  largo en la barra de estado ensanchaba el mínimo de la ventana más que la pantalla y MUI la desordenaba (barras
  de desplazamiento): `dw_estado` corta a 48 caracteres. Otra vez D14 (`func estado` chocaba con variables
  `estado` de los módulos).
- Tests: `test_formularios` (sin ventana; `--memcheck`). En el emulador con `clicar`: clic en el campo, "hola",
  Return → el navegador pide `GET /eco?q=hola&todo=on&orden=fecha` y muestra la respuesta. dashweb 23/23,
  también con `--memcheck`.

### 2026-10-16 — D14 (Dash: nombres del programa y de sus módulos)
- Dash (e952095): las funciones de un módulo no ven las globales del programa principal (`actual = 0` en un módulo
  es su local aunque el programa tenga `var actual`; analizador y codegen), y asignar un nombre que es una
  función crea una variable nueva en vez de dar error. Test `test_module_scope` (también multifichero). Mismo C
  en los programas previos; 185/185, ejemplos 34/34. Los nombres `dw_*` de `src/dashweb.dash` se quedan (no
  hacen daño).

### 2026-10-16 — Tarea 21b (textarea, POST y formularios en JavaScript)
- `lib/http.dash`: método y cuerpo en la petición (`_http_conectar_con`), `http_empezar_post(direccion, cuerpo,
  tipo, espera)` (`application/x-www-form-urlencoded` por defecto); una redirección tras un POST se sigue con
  GET (salvo 307/308). `tests/servers/http.py`: `/eco` devuelve también el cuerpo; `/tras_post` (303 → GET).
- `lib/formularios.dash`: `textarea` (foco, Return salta de línea, su valor es su texto), `formulario_valor` y
  `formulario_poner_valor` (input, textarea, select), `formulario_envio` → `Envio` (GET con la consulta, o POST
  con el cuerpo). `lib/maqueta.dash`/`lib/pintor.dash`: el `textarea` (`cols` x `rows`, las últimas líneas que
  caben, cursor).
- `lib/jsdom.dash`: `.value` (input, textarea, select) y `.checked`; `form.submit()` (lo recoge
  `jsdom_envio`); `jsdom_evento(js, nodo, tipo)` para cualquier evento (el navegador manda `submit` al form antes
  de enviarlo: `onsubmit`/`preventDefault` lo paran).
- `src/dashweb.dash`: `enviar` (evento submit, después GET o POST), `abrir_post`, `envio_del_js` tras clics y
  temporizadores; `apuntar` (historial).
- Tests: `test_formularios_post` (POST, 303, textarea, `.value`/`.checked` desde JS, `onsubmit`, `submit()`;
  `--memcheck`). En el emulador: post.html, escribir "hola", Return, "ab" y clic en Enviar → el servidor recibe
  `nota=hola%0Aab`. dashweb 24/24, también con `--memcheck`.

### 2026-10-16 — Tarea 22a (marcadores y página de inicio)
- Tarea 22 partida: 22a (marcadores e inicio), 22b (varias ventanas), 22c (atajos de menú en el emulador).
- `lib/marcadores.dash`: marcadores en `PROGDIR:dashweb.marcadores` (`dirección<TAB>título`, sin repetir),
  `marcadores_html` (una página con un enlace por marcador), preferencias `clave=valor`
  (`preferencia`, `preferencia_poner`) en `PROGDIR:dashweb.prefs`.
- `src/navegador.dashui`: menú Proyecto con Página de inicio (H), Marcadores (B), Añadir marcador (D), Usar como
  página de inicio, Acerca de, Salir. `src/dashweb.dash`: páginas internas `dashweb:inicio` y `dashweb:marcadores`;
  sin argumentos abre la preferencia `inicio` si la hay.
- Test `test_marcadores` (`--memcheck`). dashweb 25/25, también con `--memcheck`. El navegador arranca con el
  menú nuevo (captura).
- No probado en el emulador: los elementos del menú. `tools/amiga/clicar.dash` aprendió `a COD` (tecla con Amiga
  derecha), pero un atajo de menú inyectado cuelga el emulador con 68040+JIT, también en un programa MUI mínimo
  con un solo menú (Amiga+Q), y en el A1200 sin JIT no llega al programa. No es de dashweb; queda como 22c.

### 2026-10-16 — Tarea 22b (varias ventanas) y D32
- D32 (Dash, 71dc1df): `mui_window_active(win)`: las ventanas hechas con el mismo `.dashui` comparten los números
  de evento y la activa dice de cuál viene. Test en A1200 y 3.2. Cambia el C de los programas MUI (una función más
  en el runtime, sin usar): los tests mui y dashui en las dos máquinas.
- `src/dashweb.dash` reescrito con el estado por ventana (`struct Ventana`: documento, historial, carga, recursos,
  temporizadores, foco); hasta 4 ventanas, cada una con su función de dibujo (`pinta0`..`pinta3`: MUI no dice qué
  zona pinta); un `mui_timer` para todas; cada ventana con su evento de cerrar (`ID_CERRADA + k`); al cerrar la
  última, se acaba. Menú: Nueva ventana (N), Cerrar ventana (K). Con varios argumentos, una ventana por dirección;
  las ventanas nuevas se corren un poco (`MoveWindow`: MUI las ponía en el mismo sitio).
- En el emulador: dos ventanas (reloj.html y enlaces.html); clic en el enlace de la segunda → navega ella sola
  mientras el reloj de la primera sigue; cerrar la segunda con su botón → queda la primera contando; cerrar la
  única → el programa acaba (10 s en vez de los 60 del cierre automático).
- Intentos para 22c: la secuencia completa de teclado (Amiga derecha 0x67 y la tecla, consejo de la sesión de MUI)
  tampoco funciona; con el ratón no se puede porque MUI 5 usa menús propios (`MenuStrip` vacío). `clicar` aprendió
  `m MENÚ ELEMENTO` (menús de Intuition, para otros programas). Sin probar: Nueva ventana y Cerrar ventana desde
  el menú.
- dashweb 25/25.

### 2026-10-16 — D4c, D23 y D34 (Dash), y medidas corregidas
- D4c (Dash, 4078996): `l[0].x = 5`, `caja.items[i].nombre = "z"` (regla `indexed_member_assign`). Test con
  `--memcheck`. Mismo C en los programas previos.
- D23 (Dash, 2c6f140): `./dash --profile`: cada función se apunta en una pila (variable con `cleanup`, también en
  los `return`) y una interrupción VBlank mira 50 veces por segundo dónde está el programa; al salir, la tabla
  (propio, total, llamadas). Runner de Dash: `# profile`, `# ignore-out:`. `tools/medir_visor.py --perfil`.
- Lo que encontró el perfil: el 15 % del tiempo en `utf8_a_latin1` (una llamada de 3,6 s para 9 KB). Buscando la
  causa (no era la caché de longitudes: un intento, D33, no mejoró nada y se deshizo; ni la red de FS-UAE): el modo
  de pruebas (`DASH_TEST_AUTOCLOSE`, que usan `emu_run --autoclose` y `medir_visor`) llamaba a `DateStamp` en cada
  vuelta de cada `while`. D34 (Dash, 748748a): una vez cada 1024 vueltas; runner `# autoclose: N`, test.
- Medidas buenas (A1200, prueba.html): carga 459 ms (antes 3770), html 1091 (1626), estilo 5545 (7363), maqueta
  5829 (9463). El README tiene la tabla nueva. Perfil real del A1200: `_estilo_nodo` 16 % propio y 40 % total,
  `_palabras` 14 %, `_cumple_desde` 12 % (11.262 llamadas para 271 elementos: cada uno prueba todos los
  selectores), `estilo_px` 6 %. Mejora apuntada para después: agrupar las reglas por el último selector
  (etiqueta, id, clase) como los navegadores.
- La sesión de MUI paró la fusión a `main` por un fallo de `test_mui_canvas_char` (D31): el programa salía sin
  esperar a su proceso que teclea y en 3.2 se colgaban las pruebas MUI siguientes. Arreglo suyo commiteado en la
  rama `dashweb-fusion` (9ee00c3, sobre e952095), probado en un worktree aparte; `main` avanzará hasta ahí.
- Pendientes con pregunta: 20d y 22c (`[?]`).

### 2026-10-16 — Tarea 23 (repaso final y paquete)
- `tools/paquete.sh` → `build/dashweb.lha`: `dashweb` (MUI, 1,1 MB), `visor` (1 MB), `LEEME` (requisitos: AmigaOS 3,
  68020, MUI 3.8/5, pila TCP/IP, AmiSSL 5 para HTTPS; instalación, uso, menús, lo que falta) y `Licencias/`. Lhasa
  (el `lha` de Linux) solo descomprime: `tools/lha_lh0.py` escribe el LHA sin comprimir (`-lh0-`, cabeceras de
  nivel 0, CRC-16/ARC), que LhA lee; comprobado con Lhasa (lista, CRC, lo extraído igual). 2,1 MB.
- El `dashweb` del paquete arranca en el emulador (sistema con MUI y fuentes) con su página de inicio.
- Tamaño, memoria y tiempos: en el README (tabla de la tarea 17 rehecha sin el freno del modo de pruebas).
- Quedan `[?]` 20d y 22c (preguntas al usuario).


### 2026-10-16 — Resumen final (regla 9)
- Rama `dashweb` de Dash rebasada sobre `main` (9ee00c3): D32 (50f577c), D4c (6e9f50f), D23 (3df25fa), D34
  (305e84c). Mismo árbol que el probado: run_tests 189/189, compile_all 34/34, `--emu --emu-a500 --emu-32`
  489/489, `--emu --memcheck` 292/292. Una primera pasada falló al arrancar ("Address already in use" en el
  servidor de eco de `# emu-net`): las dos sesiones probaban red a la vez; repetida, bien. La sesión de MUI
  hará la fusión a `main`.
- dashweb: tareas 1-23 hechas. Navegador MUI con pestañas de carga sin bloquear, CSS, imágenes, JavaScript
  (QuickJS), formularios GET/POST, marcadores, varias ventanas y paquete `build/dashweb.lha`.
- Pendientes con pregunta al usuario: 20d (conectar/DNS/TLS sin bloquear) y 22c (atajos de menú: ¿probar en
  hardware real?).
- Mejora apuntada: agrupar las reglas CSS por el último selector (el estilo es lo más lento: 5,5 s en A1200).

### 2026-10-16 — Respuestas del usuario a 20d y 22c
- 20d: la consulta DNS, la conexión y la negociación TLS no pueden congelar el navegador; un indicador de
  actividad mientras tanto. 22c: hay que hacer funcionar los atajos; averiguar si es cosa de Dash (otro
  emulador en esta máquina: Amiberry). Las dos vuelven a `[ ]`.
- La sesión de MUI pasa una preferencia del usuario: el historial de la izquierda, oculto y desplegable (22d).

### 2026-10-16 — Tarea 22c (atajos de menú) y D35
- Un programa MUI mínimo en C con un menú (Amiga+P, Amiga+Q) y las mismas teclas inyectadas por `input.device`
  funciona en el A1200 y con 68040+JIT: ni la inyección ni MUI ni FS-UAE tenían la culpa. El mismo programa en
  Dash se colgaba. Montando el menú en C como lo monta Dash se cuelga igual: la causa es poner la barra de menús
  con `SetAttrs(MUIA_Window_Menustrip)` después de crear la ventana (MUI 21.227 lo admite según su autodoc, pero
  se cuelga con el primer atajo; MUI 3.8 ni lo admite). Con la barra dada al crear la ventana, aunque vacía y
  llenada después, funciona. No hizo falta Amiberry.
- Segundo fallo: cada elección de menú daba además un evento 11. MUI devuelve el `MUIA_UserData` del elemento
  elegido como evento, y Dash guardaba ahí el tipo de objeto (11 = elemento de menú). En dashweb el 11 es
  `ID_TIC` (un tic de más, sin daño); en el ejemplo de la sesión de MUI era su botón de historial.
- D35 (Dash, 1985971): `mui_window_begin` crea la barra vacía con la ventana; los elementos de menú
  dejan el `UserData` a 0 y se reconocen por `MUIA_Menuitem_Title`. Test `test_mui_menu_keys` (un proceso
  teclea Amiga+P, Amiga+O sobre un elemento desactivado y Amiga+Q; `mui_press` sobre un elemento): pasa en 3.1 y
  3.2 y se cuelga sin el arreglo. Dash: 190/190, 34/34, `--emu --emu-a500 --emu-32` 492/492.
- `clicar` aprendió `r X Y` (pulsar el botón derecho), `p X Y` (llevarlo pulsado a un punto de la pantalla) y
  `s` (soltarlo): los menús de MUI 5 se dibujan en la barra de la pantalla y no están en `MenuStrip`.
- En el navegador (68040+JIT): Amiga+D añade el marcador y Amiga+B abre la página de marcadores con él;
  Amiga+N dos veces y Amiga+K dejan dos ventanas; Amiga+Q cierra el programa. Con el ratón: botón derecho,
  Proyecto, Marcadores → la página de marcadores.

### 2026-10-16 — Tarea 22d (historial plegable)
- Botón "Historial" (evento 20) en la barra; la lista y el balance (`separador`) llevan `"hidden": true` en
  `navegador.dashui` y el botón los alterna con `mui_set_visible` (patrón de `examples/mui_navegador.dash`).
  Sin subrayado en la etiqueta: una letra de atajo le quitaría esa tecla a los campos de los formularios.
- Sin la lista la ventana salía estrecha: la página pide 500 de ancho (antes 400) y el campo de dirección tiene
  peso 400. En el emulador: oculto al abrir; un clic lo despliega (la ventana se ensancha) y otro lo esconde (la
  página se maqueta al ancho nuevo).

### 2026-10-16 — Tarea 20d (conectar sin congelar) y D36
- D36 (Dash, 5d99337): `net_connect_start(host, puerto, ms)` crea el socket y busca el nombre en un proceso aparte (la
  pila no tiene consulta DNS sin espera; el proceso abre su propia `bsdsocket.library`, empieza con más
  prioridad para recoger su trabajo y baja a la del programa); `net_connect_poll` conecta sin bloquear y dice
  1/0/-1; `net_connect_stage` 0 buscando, 1 conectando. Los ocho últimos nombres se recuerdan. `net_close` de
  uno que se abre lo deja (el proceso libera su trabajo al acabar); al salir, el programa espera a las consultas
  en marcha (su código está en el programa). `tls_connect_start`/`tls_connect_poll`: la negociación con el
  socket sin bloquear (`SSL_ERROR_WANT_READ/WRITE` = todavía no). Tests `test_net_async` y `test_tls_async`.
  En PiStorm el cálculo de la negociación es corto; lo que esperaba era la red.
- dashweb: `red_abrir_empezar`/`red_abrir_avanzar`/`red_fase`; la `Carga` de `http_empezar` abre así y manda la
  petición cuando la conexión está abierta; `http_fase` (buscando, conectando, negociando, recibiendo). La barra
  de estado lo dice ("Buscando x...", "Conectando con x...", "Conexión segura con x..."). De paso: `red_abrir` y
  `red_abrir_tls` no liberaban el buffer al fallar.
- Indicador de actividad: una zona de dibujo de 16x16 a la derecha de la dirección con ocho puntos que giran
  (cada 100 ms, con el tic de 50 ms de las cargas) mientras llega la página, sus hojas, scripts o imágenes. Con
  los lápices 1, 3 y 2 de la pantalla: los grises de `color_pen` salían azules o del color del fondo con 4 colores.
- Para probarlo: `tools/lento/dns_lento.c` (con `LD_PRELOAD` en FS-UAE, los nombres `.lento` tardan lo que diga
  `DNS_LENTO_MS` y dan 127.0.0.1), `tests/servers/http.py PORT tls-lento` (espera `TLS_LENTO_S` antes de la
  negociación) y `tools/medir_visor.py --host --dns-lento --tls --tls-lento --captura-en`. Sistema con MUI,
  AmiSSL y fuentes: `~/.cache/dash-emu/sys31muisslweb` (sys31muiweb + AmiSSL de sys31ssl y su Startup-Extra).
- En el emulador (68040+JIT): consulta DNS de 20 s → "Buscando servidor.lento...", el indicador gira y el botón
  Historial responde; con 8 s llega la página. Parar durante la consulta → "Parado". Negociación TLS de 20 s →
  "Conexión segura con 127.0.0.1...", la ventana responde; con 8 s llega la página por HTTPS. 10.255.255.1 →
  "Conectando con..." y a los 20 s "tiempo agotado al conectar". `test_http_carga` con `http_fase` y cancelar
  mientras se busca. dashweb 25/25, también con `--memcheck`. Dash con D36: 192/192, 34/34,
  `--emu --emu-a500 --emu-32` 499/499, `--emu --memcheck` 298/298.

### 2026-10-16 — Tarea 24 (interfaz actual; freemem.space)
- https://freemem.space no acababa de cargar: 90 KB de HTML, 330 KB de CSS (Font Awesome 100 KB) y 600 KB de JS. El
  perfil (400 s): `_tiene_clase` 56 %, probar selectores 72 %. Cada elemento probaba todos los selectores.
- Índice de selectores en `lib/estilo.dash`: por la parte de la derecha (#id, .clase, etiqueta o universal); cada
  elemento prueba solo los suyos. Fuera los que nunca se cumplen (::before, :hover...). `_tiene_clase` sin crear
  textos. El orden de las reglas era de 1000 en 1000 por hoja (una hoja de más de 1000 reglas pisaba a la
  siguiente): ahora de 100000. Con todo, el estilo de freemem.space es el 2 % del tiempo; la página de prueba en el
  A1200 pasa de 5566 a 3802 ms. Necesitó D37 de Dash (`indice[clave].push(e)`).
- `@media` se evalúa como una pantalla de 640x480 (min-/max-width y -height, orientation, prefers-color-scheme;
  print no); antes valía cualquiera con paréntesis. `css_importes` busca los @import sin leer la hoja entera
  (`lib/recursos.dash` leía cada hoja dos veces). El texto solo para lectores ("Saltar al contenido": position
  absolute con clip) no se pinta.
- Dash: D37 y D38 en 875f97d (rama dashweb, sobre main 7582230).
- La máquina "objetivo" de `medir_visor` tiene 128 MB (Zorro III), como una PiStorm: con 8 MB jQuery se quedaba
  sin memoria. `--pagina` admite una dirección entera.
- Interfaz: barra de iconos (atrás, adelante, recargar que pasa a parar mientras carga, inicio; historial a la
  derecha) con ayuda en globo; la dirección ocupa el resto; el indicador de actividad; la ventana abre al 96x90 %
  de la pantalla; título "Página - dashweb"; la barra de progreso solo mientras carga. Atrás y adelante sin uso
  llevan un icono apagado (un botón desactivado de MUI sale tapado por una trama). Iconos ILBM de 16x14 en los 4
  colores del Workbench: `tools/iconos.py` → `iconos/`, en el paquete y copiados al disco emulado. D38 de Dash.
- freemem.space carga y se ve con su título (jQuery falla: tarea 25). Capturas enviadas al usuario.

### 2026-10-16 — Tarea 25 (jQuery)
- jQuery 3.7.1 (`tests/pages/jquery-3.7.1.min.js`, MIT) funciona: `test_jquery` prueba selectores (también los
  suyos, :first, :eq, :contains), clases, attr/data, css, html, eventos y delegados, recorrido, hide/show,
  val/prop, remove/wrap/empty, utilidades, Deferred, serialize, ready y load (memcheck).
- DOM nuevo en C (`lib/jsdom.dash`): hermanos, insertBefore, replaceChild, cloneNode, contains,
  compareDocumentPosition, matches, getElementsByClassName, ownerDocument, outerHTML, nodeValue/data,
  defaultValue, offsetWidth/Height (0 si no se ve: display none, sin maqueta), attributes, createComment,
  createDocumentFragment (tipo 11: al añadirlo pasan sus hijos), head, createHTMLDocument, getComputedStyle (lo de
  lib/estilo.dash) y matchMedia (`css_media_vale`). querySelector y matches dan SyntaxError con lo que no
  entienden (así jQuery usa su buscador). lib/estilo.dash: :checked, :disabled, :enabled, :not(), :nth-child(),
  :nth-last-child(), :nth-of-type(), :first/last/only-of-type.
- El entorno de navegador en JS pasa a `lib/jsdom_preludio.js` (JS normal; `tools/preludio.py` lo convierte en
  `lib/jsdom_preludio.dash`; `tests/run.py` comprueba que esté al día): eventos con captura y subida hasta window,
  Event/CustomEvent/MouseEvent..., once, handleEvent; style (Proxy sobre el atributo), classList, dataset,
  atributos como propiedades, insertAdjacentHTML, append/prepend/before/after/remove, closest; navigator,
  location, history, localStorage/sessionStorage, document.cookie, matchMedia, performance, CSS.escape, btoa/atob,
  requestAnimationFrame, observadores vacíos, Image/Option; DOMContentLoaded y load al acabar los scripts.
- QuickJS no ejecutaba los Promise.then (`JS_ExecutePendingJob`): ahora tras cada evaluación, evento y temporizador.
- Un fallo encontrado: asignar `document.hidden`/`open`/`charset` llamaba a los setters de los elementos (atributos
  en el documento): las propiedades de document se ponen con defineProperty.
- freemem.space: ningún error de JS (jQuery, Migrate, Google Tag Manager, el tema). Captura enviada.

### 2026-10-16 — Tarea 27 (emulación RTG)
- `tools/emu_sys_rtg.sh` hace `~/.cache/dash-emu/sys32rtg`: AmigaOS 3.2 con MUI, AmiSSL y fuentes, más Picasso96 2.0
  (Libs/Picasso96*, Devs/Monitors/uaegfx), C:IPrefs y C:Copy sacados de AmigaOS-v3.2-WHD-RTG-AHI.hdf (partición
  DOS7: xdftool la lee), y ScreenMode.prefs con el modo UAE 1024x768 de 16 bits (0x50051100; un programa listó los
  125 modos que da Picasso96 con uaegfx). Arranque: el monitor uaegfx, la preferencia a ENV: e IPrefs.
- `tools/medir_visor.py --maquina rtg`: Kickstart 3.2 ($DASH_KICKSTART_32), 68040 con JIT, 128 MB y
  `graphics_card = uaegfx`.
- Capturas: `tools/amiga/shot.c` de Dash (rama dashweb) lee las pantallas de más de 8 bits con p96ReadPixel.
- dashweb se ve a 1024x768 con sus colores. Primera comparación con Chrome (tarea 28) enviada al usuario: faltan la
  barra superior, el menú con iconos de Font Awesome y la rejilla de entradas con imágenes de fondo y texto encima.

### 2026-10-16 — Tarea 28a (@media con el ancho de la página)
- Las reglas de dentro de un @media guardan sus condiciones (`Regla.medios`) y se miran al indexar con
  `css_vista(ancho, alto)`: dashweb la pone con la zona de dibujo (+16 de la barra, que en un navegador cuenta) antes
  de leer cada página; `documento_maquetar` la cambia con el ancho y, si algún corte cambia de lado
  (`estilo_cambia_con`), vuelve a calcular el estilo. Las de print ni se guardan. matchMedia mira lo mismo.
- freemem.space en RTG: aparecen la barra azul con la fecha y el título a su tamaño (la página ya no es "de móvil").

### 2026-10-16 — Tareas 28b y 28c (float, position, fondos) y 29 a medias (decodificadores), D40 y D41
- Maqueta (`lib/maqueta.dash`): flotantes en filas (left desde la izquierda, right desde la derecha; bajan de
  fila si no caben; sin width miden su contenido); lo que no flota va debajo (el texto aún no los rodea) y el
  bloque los abarca (como clearfix). inline-block con bloques dentro (o con width/height) como un flotante.
  position absolute/fixed respecto al padre (top/left/right/bottom, encima del contenido). min-height,
  max-width (con margin auto), box-sizing: border-box, visibility: hidden y opacity: 0 (ocupan sitio, no se
  pintan). Fallo encontrado: un flotante recibía su ancho resuelto y volvía a aplicarle su width en %
  (`_bloque_de`: los % del contenedor).
- Imágenes de fondo: el atajo background da image/repeat/position/size; `imagenes_pedir` las trae (con la
  dirección completa en el estilo); `D_FONDO` y el pintor (cover, contain, px, %, posición, repeat/no-repeat/
  -x/-y, recortado a la caja). rgba con alfa < 0,5 es transparente.
- Los fondos de freemem.space no salían: sus 4 descargas empezaban durante 28 s de JavaScript sin tics y la
  negociación TLS se agotaba. D41 en Dash (el tiempo sin consultar no cuenta) no bastaba: el servidor no contesta
  a una conexión TCP que lleva tanto callada. `lib/red.dash` abre otra si la conexión se pidió hace más de 5 s
  (el programa estaba ocupado) y reintenta una vez si la negociación se agota. Reproducido y comprobado con 5
  descargas, 28 s sin consultar y después 1,9 s.
- Herramientas: `tools/traza.py` (con `tools/traza_maqueta.dash`): una página de disco o de la red, con sus
  hojas y scripts, maquetada a un ancho con la caja de cada bloque y los dibujos entre dos alturas
  (`maqueta_traza`). La maqueta de freemem.space tarda 1 s; leer su CSS es lo lento.
- Tarea 29 (en marcha): D40 en Dash (`image_from_rgb`); `lib/imagen_dec.dash` con TJpgDec (third_party/tjpgd,
  JPEG reducido 1/2-1/8 al decodificar) y stb_image (third_party/stb: JPEG progresivo, PNG, GIF, BMP), en
  `build/img-lib/libimg.a` (`tools/build_img.sh`); `imagen_cargar` los usa y, si no, los datatypes (3.1). Medido
  en la máquina RTG: un JPEG de 1376x768 tarda 2,6 s (los datatypes 2,2): la ventaja es decodificar reducido.
- Tests: `test_maqueta_cajas`, `test_imagen_dec` (memcheck), `test_estilo` con la vista a 1000 px.
- freemem.space en RTG: barra con la fecha, márgenes del tema, título en dos líneas como en Chrome y la rejilla
  de entradas destacadas con sus imágenes y títulos encima. Comparación enviada al usuario. Falta: iconos de
  Font Awesome (menú, lupa), tipografía (Lato, el lema en mayúsculas espaciadas), un "contenido" que se cuela
  arriba.
- `--fpu` no arranca en el 68040 de sys32rtg: la comprobación de libnix mira AFF_68881, que pone 68040.library
  al cargarla SetPatch (explicación de la sesión de MUI). Pendiente: SetPatch y 68040.library en sys32rtg.
- Dash rebasado sobre main 45231f8 (interpolación nueva, ReAction con varias ventanas...): D40/D41 en ef0022f.
  Dash 196/196, 34/34, 514/514 en tres máquinas y 306/306 con memcheck (antes del rebase); dashweb 28/28 sobre
  el Dash rebasado. Desde ahora los cambios de Dash los hace la otra sesión por encargo (lo pidió el usuario).

### 2026-10-16 — Estilo más rápido (algoritmo) y la FPU del 68040 en sys32rtg
- Perfil de la otra sesión (8,0 s leer y aplicar el CSS de freemem.space en 68040+JIT; aplicar 6 s): cada
  _cumple_simple volvía a leer class con dom_atributo. Ahora `dom_clases`/`dom_id` guardan las clases y el id
  partidos en el Nodo (se olvidan al cambiar un atributo: jsdom, formularios) y un filtro de antecesores
  (`_antepasados`: cuántos antecesores tienen cada etiqueta, #id y .clase mientras se recorre el árbol) descarta
  los selectores cuyas partes de antes de un descendiente/hijo no están entre los antecesores. Medido con
  `tools/traza.py` sobre la copia local: 7.632 ms → 4.465 ms (leer, árbol, CSS y estilo); maqueta 1 s. dashweb
  28/28 con memcheck.
- La otra sesión acelera lo de Dash por su cuenta (rama `rendimiento`): copias de textos al devolver, la lista
  de temporales, retain/release en los for.
- sys32rtg: `C:SetPatch` con `680x0.library`, `68040.library` y `mmu.library` (la de 3.2 es de MMULib): pone
  AFF_68881 y los programas de `./dash --fpu` arrancan (libnix comprueba ese bit).

### 2026-10-16 — Decisión del usuario: el motor, en Dash
- Pregunta del usuario: ¿no hay un motor de CSS/HTML ya hecho? Sí: NetSurf (libcss, libdom y hubbub, MIT, ya
  en 68k; su maqueta es GPL) y litehtml (C++, BSD). Respuesta del usuario: "vamos a seguir haciéndolo todo en
  Dash". Se miran esos motores para ver cómo resuelven cada cosa, sin usarlos.

### 2026-10-16 — Tareas 28d (tipografía) y 28e (iconos y cajas de CSS)
- Tipografía: los tamaños sin fuente de mapa de bits salen de una vectorial (CGTriumvirate, con
  bullet.library en los sistemas de pruebas; `_tamano_de_mapa`); text-transform; letter-spacing (el pintor
  pone las letras una a una). Imágenes: el ancho y alto del `<img>` limitan lo que se decodifica.
- Estilo: propiedades `--x` heredadas y `var()` (con valor por defecto y calc sencillo); ::before y ::after
  como nodos virtuales (`Nodo.pseudo_antes/pseudo_despues`; índice aparte de sus selectores) con su texto o
  un icono de Font Awesome (códigos del área privada: nodo `::icono`).
- Maqueta y pintor: `D_ICONO` (menú, lupa, calendario, comentario, flechas, usuario, reloj, etiqueta,
  carpeta, sobre, casa, aspa y marca, dibujados con líneas y rectángulos; los demás, un cuadrado pequeño).
  inline-block en la línea como una pieza que no se corta, alineada por su último texto (así "1 COMENTARIO"
  no se parte); con width o bloques dentro sigue flotando a la izquierda salvo con el texto centrado o a la
  derecha (el menú de freemem.space, centrado como en Chrome). Un `<button>` con elementos dentro o sin texto
  se maqueta como una caja más (lo dibuja su CSS). border-radius ≥ 50 % en una caja casi cuadrada: `D_ELIPSE`
  (rellena o con borde); transform translate (px o %) y rotate de 45 grados en una barra: `D_TRAZO` (la lupa
  del tema, hecha con ::before y ::after). Un absoluto sin top ni left queda donde estaría (tras el relleno).
- Fallo de gcc encontrado: la pasada `s` de -fbbb (bebbo) da código erróneo (un absoluto con right: 0 salía
  con ancho 1; desaparece al añadir un Print). Encargado a la otra sesión quitarla de `compiler/cflags.py`
  (tarea 3); mientras, DASH_CFLAGS="-fbbb=abcfhilmnpz0".
- `tools/traza.py` con una página de tests/pages la sirve por `tests/servers/http.py` (6 s en vez de 10 min).
- Test nuevo `test_maqueta_css` (memcheck). Comparación con Chrome enviada al usuario (comparar6): menú,
  lupa, iconos y metadatos como en Chrome.
- Encargos a la otra sesión: tarea 2 (Dash comprueba el tipo de return; str_contains y str_split: hechos en la
  rama `tipos`), 1b (recorrer las claves de un diccionario sin copiarlas) y 3 (-fbbb sin s).

### 2026-10-16 — Tarea 26 (estilo y maqueta más rápidos)
- Medido con `tools/traza.py` sobre la copia local de freemem.space (`~/.cache/dashweb/bench`), máquina objetivo
  (68040 + JIT): aplicar el estilo 5,0 s → 2,0 s; maquetar 1,47 s → 1,26 s. Mismo resultado (alto 7186, 368
  dibujos).
- Estilo: las propiedades --x van aparte del estilo y un hijo comparte el diccionario de su padre mientras no
  declare otro valor (WordPress hereda unas 60 y Tailwind repite 45 en cada elemento con `*`); las --x que ningún
  var() nombra no se guardan (`Hojas.vars_usadas`), salvo en el atributo style. Los atajos (margin, border,
  background, font...) se parten una vez por regla (`Regla.expandidas`), no en cada elemento. ::before y
  ::after solo se calculan si se cumple alguna regla suya con content (`Regla.con_content`).
- Una caché de lo declarado por conjunto de reglas cumplidas (`_ganadoras_hechas`) colgaba la página:
  Dash usa memoria liberada con un diccionario de diccionarios. Caso mínimo en
  `~/.cache/dashweb/repro/dict_de_dicts.dash`; encargado (tarea 4 de la otra sesión). La caché queda
  apagada (`_ganadoras_cache`) hasta el arreglo.
- Maqueta: las fuentes se abren una vez por programa (antes cada maquetación las abría otra vez sin
  cerrarlas); se buscan primero por el font-family tal cual. `estilo_px` sin crear textos.
- Dash no tiene operadores de bits: encargado (tarea 5). Dash fusionado en `dashweb`: `rendimiento` (copias y
  temporales, -fbbb sin la pasada s) y `tipos` (return comprobado, str_contains, str_split).
- Pendiente visto: un atajo con var() (padding: var(--x)) se parte antes de sustituir la variable.
- `tools/traza.py`: cualquier página de disco se sirve por HTTP con su carpeta; TRAZA_PERFIL=1 (tabla de
  --profile), TRAZA_TIEMPO, TRAZA_CAPTURA; `traza_maqueta` mide aparte el estilo de la página ya cargada.
- Test nuevo `test_estilo_vars` (memcheck). Trabajo hecho en un worktree (`~/Projects/dashweb-w`, rama dev2)
  para no mover el árbol que usan las baterías de la otra sesión.

### 2026-10-16 — Tarea 28: atajos con var() y degradados (28f, a medias)
- Un atajo con var() (`padding: var(--x) 1px`, también en el atributo style) se guarda entero y se parte en
  `_calcular` tras sustituir la variable (antes se partía el texto "var(--x," como si fuera una medida).
- linear-gradient en background y background-image: dirección (to top/right/left, grados) y el primer y
  último color con su opacidad (`css_alfa`, `css_color_opaco` en lib/colores.dash, también `rgb(r g b / a)`
  y `#rrggbbaa`) en un `D_DEGRADADO`. El pintor pinta los tramos casi opacos; la sombra de freemem.space
  (negro de 0,5 a 0) necesita mezclar con la imagen: D42 encargada a la otra sesión (tarea 6).
- Comparación con Chrome (rtg_fm18): lo que más se nota ya es esa sombra bajo los títulos.
- Tests: test_estilo_vars y test_maqueta_css ampliados.

### 2026-10-16 — Tarea 29 (parte): srcset e imágenes al tamaño en que se ven
- `dom_img_src` (lib/dom.dash): de srcset (descriptores w o x, comas dentro de la dirección) y de los
  `<source>` de `<picture>` con un tipo que se lee, la imagen más pequeña que no se queda corta para el width
  del `<img>` (o 1024 sin width: fijo, para que no cambie con la ventana); webp/avif fuera. Lo usan la
  maqueta y lib/imagenes.dash.
- Cada imagen se decodifica al tamaño mayor al que se ve en la última maqueta (`imagenes_vista`, lo llama
  documento_maquetar): las `<img>` con width y height y los fondos con cover/contain (su tamaño en la página no
  depende de la imagen). freemem.space en la máquina RTG a los 55 s: antes faltaban 12 imágenes, ahora todo
  cargado (captura enviada al usuario).
- Pregunta del usuario: "¿estamos construyendo un renderizador de XHTML y CSS?". Sí: lib/html, css, estilo,
  maqueta y pintor, todo en Dash (su decisión).
- Test nuevo `test_srcset` (memcheck). dashweb 31/31 normal y con memcheck.
- Otra sesión: tareas 4 (diccionarios de diccionarios), 5 (operadores de bits) y 6 (gfx_blend_rect,
  gfx_gradient_rect, gfx_pixel_rgb) hechas en ramas encadenadas `dicts`, `bits`, `blend`; se fusionan cuando
  acabe su batería. Acordado: no lanzar tests de red de dashweb a la vez que los suyos (chocan los puertos).

### 2026-10-16 — Tarea 29 (WebP; cerrada, sigue en 29b y 29c)
- libwebp 1.4.0 (BSD), solo el decodificador en C (sin SSE/NEON/MIPS; las cabeceras del codificador que pide
  lossless.h) en third_party/libwebp; `tools/build_img.sh` lo mete en build/img-lib/libimg.a (230 KB) y usa ya
  -fbbb sin la pasada s. `_imgdec_webp`: con y sin pérdida y con alfa (no animado: entonces los datatypes),
  reducido al decodificar (use_scaling) a lo más pequeño que cubre maxw x maxh. srcset y `<source>` aceptan
  webp; quedan fuera avif y jxl.
- Tests: test_imagen_dec con cuatro WebP (con pérdida, sin pérdida, alfa, 640x320 reducido a 300x150).
- Partida: 29b (SVG) y 29c (decodificar sin parar la ventana).

### 2026-10-16 — Tarea 29b (SVG)
- nanosvg (memononen/nanosvg, licencia zlib; su AI_POLICY trata de contribuciones al proyecto, no de usarlo)
  en third_party/nanosvg, en libimg.a con `nanosvg_impl.c`. `_imgdec_svg`: un texto que empieza por XML y
  lleva `<svg` se dibuja a su tamaño (width/height o viewBox, sin pasar de 1280x1024) o, si se sabe a qué
  tamaño se ve (imagenes_vista), a la escala más pequeña que lo cubre; RGBA con su transparencia.
- Los SVG salían de 0x0 en el Amiga: libimg se compilaba sin FPU y nanosvg llamaba a las funciones de -lm del
  programa (con FPU: el resultado en fp0, no en d0/d1). `tools/build_img.sh` compila ahora para 68020 con FPU
  como dashweb (IMG_CPU="" para uno sin FPU). El test de decodificadores baja de 124 s a 95 s en el A1200.
- Test: test_imagen_dec con un SVG (rectángulos, un círculo, una parte transparente) a su tamaño y al doble.
- Tras pasar `dev` a esta versión hay que rehacer build/img-lib en ~/Projects/dashweb (`tools/build_img.sh`).

### 2026-10-16 — Tarea 28f (degradados y fondos semitransparentes)
- Dash fusionado: diccionarios de diccionarios, operadores de bits y D42 (gfx_blend_rect, gfx_gradient_rect,
  gfx_pixel_rgb) de la otra sesión (dashweb 54571e8).
- El pintor mezcla `D_DEGRADADO` con lo de debajo (gfx_gradient_rect, con los colores de los bordes recortados
  calculados sobre el degradado entero) y los fondos rgba con su opacidad (`D_RECT` con espaciado = alfa;
  antes, por debajo de 0,5 no se pintaban y por encima eran opacos). `-webkit-`/`-moz-`/`-o-linear-gradient`
  con su dirección vieja (top = to bottom): es el que da la sombra en freemem.space. Comparación enviada
  (comparar7): la sombra bajo los títulos y el título de la cuarta casilla, como en Chrome.
- La caché de reglas cumplidas (`_ganadoras_cache`) encendida: estilo 2,0 s → 1,5 s (era 5,0 s).
- Perfil de la otra sesión de la carga real (12 s): QuickJS 24 %, TLS 21 %, imágenes 14 %, estilo 14 %.
  Nuevas 28g (QuickJS con FPU) y 28h (keep-alive).
- Usuario: explicado otra vez lo de YouTube (en su recuadro o a pantalla completa solo con la conversión en
  otro ordenador). 30a/30b siguen igual.
- Tests: test_maqueta_cajas (fondo rgba con alfa), test_maqueta_css (-webkit-linear-gradient).

### 2026-10-16 — Vídeo: MintVID (corrección)
- El usuario pasó una conversación sobre YouTube en AmigaOS. Comprobado en su repositorio: MintVID (Darren Banfi,
  MIT; libavc Apache-2.0) reproduce H.264 y AAC en 68k acelerados y saca los vídeos de YouTube en el propio Amiga
  (página del vídeo: MP4 itag 18 de 360p o HLS); en PiStorm/Emu68 con RTG, YouTube a 360p. Lo dicho antes
  ("no viable en un 68k", "hace falta un servidor") era falso para la máquina objetivo. 30a ahora abre MintVID;
  30b, el vídeo en su recuadro con el núcleo de MintVID. Otros proyectos citados: AmiTube y BoingTube
  (conversión en un servidor, para Amigas lentos).

### 2026-10-16 — Decisión del usuario: vídeo integrado primero
- "Prefiero ir directo al vídeo dentro, integrado en el navegador y también a pantalla completa": la tarea 30 (vídeo
  en la página con el núcleo de MintVID) pasa delante de 28g y 28h; sin el paso de abrir MintVID aparte.
- Licencias explicadas al usuario: MintVID MIT y libavc Apache-2.0 valen para dashweb (MIT); libmpeg2 y a52dec (GPL)
  no; Helix AAC (RPSL) con condiciones.

### 2026-10-17 — Tarea 30a (núcleo de MintVID en el emulador)
- MintVID (main, con submódulos libavc y MintAMP; ~/Projects tiene la copia solo en el scratchpad) compila con
  nuestro gcc 6.5 de bebbo: `make -f Makefile.amiga mr_decode CPU=68040 CPUFLAGS="-m68040 -D_sfdc_vararg=ULONG"`
  (el _sfdc_vararg es de sus cabeceras de red más nuevas). Su programa de prueba `mr_decode` decodifica un MP4
  como los de YouTube (H.264 Main 640x360 25 imágenes/s + AAC 96k, hecho con ffmpeg) en la máquina objetivo:
  normal 89 + 23 ms por imagen (decodificar + pasar a RGB, ~9/s), fast 61 + 23 (~12/s), turbo (decodifica una de
  cada dos) 56 + 21. El vídeo se ve, no en tiempo real a 25/s en el emulador (la PiStorm real está por medir).
  Necesita 320 KB de pila (Stack 400000 en el sistema de prueba).
- Pasos siguientes (30b): una librería libvideo.a con lo justo del núcleo (mr_codec, mr_source, mr_demux, mr_mov,
  mr_h264 + libavc + libavc_port, mr_yuv, mr_scale; sin libmpeg2/a52/libdv, que son GPL/LGPL, ni su red), una
  interfaz en C (abrir de memoria o fichero, siguiente imagen en RGB, su tiempo) y lib/video.dash. Para pintar,
  D43 encargada a la otra sesión (tarea 9: gfx_rgb_draw y gfx_rgb_draw_scaled con WritePixelArray/p96).

### 2026-10-17 — Tarea 30b, primera parte (el núcleo de MintVID dentro de dashweb)
- third_party/mintvid: el subconjunto de MintVID (b3be6f3, MIT) sin cambios: su núcleo (contenedores MP4/MOV,
  AVI, MKV, TS/PS; códecs H.264, MPEG-1, MPEG-4/DivX, MJPEG, Cinepak, WMV1/2, H.263, MS Video 1, RLE; YUV a
  RGB en ensamblador de 68k) y libavc (Apache-2.0, sin codificador, MVC/SVC ni otras arquitecturas) con su
  adaptación libavc_port. Fuera: libmpeg2, liba52 (GPL), libdv (LGPL), su red y MintAMP. README.dashweb lo
  explica. `dashweb_video.c` (nuestro): sustitutos vacíos de lo que falta y la interfaz dwv_* (abrir, tamaño,
  imágenes por segundo, códecs, siguiente imagen en RGB24 con drain/flush para los B-frames, instante, modo
  rápido de H.264, cerrar).
- `tools/build_video.sh` → build/video-lib/libvideo.a (830 KB): la lista de ficheros del mr_decode de MintVID,
  -m68020-60 -m68881, y sus redirecciones de enlace (--wrap, las rutas en ensamblador de libavc) resueltas con
  ld -r dentro de la librería. tests/run.py la compila si falta (y ya no rehace QuickJS por cualquier fichero de
  third_party).
- `lib/video.dash`: video_abrir, video_ancho/alto, video_fps_mil, video_codecs, video_siguiente, video_rgb,
  video_paso, video_ms, video_rapido, video_cerrar. Probado en el emulador (un MP4 H.264 de 160x48 con
  B-frames): códecs, tamaño, 10 imágenes de 10 con su instante, colores bien, memcheck sin nada.
- Test nuevo `test_video` (emu-server 40863, pila de 400 KB; MintVID pide 320 KB).
- Falta (30b): pintarlo en el recuadro de `<video>` (D43 encargada: gfx_rgb_draw), al ritmo del reloj, y
  el sonido.

### 2026-10-17 — Tarea 30b, segunda parte (vídeo en la página)
- `<video>` en la maqueta (`D_VIDEO`): 300x150 si no dice más, width en px o %, alto con la proporción de sus
  atributos; su dirección, la de src o la del primer `<source>` con un tipo que se reproduce (`video_src`).
- `lib/videos.dash`: un reproductor por `<video>`. Un clic lo trae (HTTP/HTTPS a T:) y lo reproduce en modo
  rápido de H.264; otro lo pausa; al acabar, otro lo vuelve a empezar. Cada tic decodifica hasta la imagen que
  toca según el reloj (salta las que llegan tarde). Sin imagen, un recuadro negro con el botón de reproducir.
  `@stack 400000` en lib/video.dash (MintVID pide 320 KB).
- Pintor: `D_VIDEO` con gfx_rgb_draw_scaled (D43, rama `rgb` de la otra sesión, aún sin fusionar);
  `pintar_videos` solo repinta los vídeos. dashweb.dash: clic en un vídeo, tic cada 20 ms mientras suena.
- Probado en la máquina RTG (tests/pages/video.html, H.264 320x180 a 640x360): se reproduce entero (captura
  enviada al usuario). Fallos: los rellenos (círculo, polígono) colgaban en el lienzo de MUI (Dash: tarea 10,
  hecha en la rama `areas`); al repintar solo el vídeo MUI borra el lienzo y la página queda gris (Dash:
  tarea 11, mui_canvas_update). Hasta fusionar rgb, dashweb no compila con el Dash de `dashweb`: commit en
  dev2, sin pasar a dev.

### 2026-10-17 — Tarea 30b, tercera parte (vídeo fluido)
- Dash: fusionadas `bools` (true/false al escribir un Bool; 5 expect-out de dashweb cambiados) y `rgb`
  (gfx_rgb_draw, gfx_rgb_draw_scaled). Probadas sin fusionar aún `areas` (rellenos en lienzos de MUI),
  `canvasupd` (mui_canvas_update / mui_canvas_updating: repintar solo el vídeo sin que MUI borre la página) y
  `rgbfast` (escalado en el formato de la pantalla: 2x de 16 a 5,5 ms).
- Reproducción: la imagen siguiente se decodifica justo después de pintar la actual (`videos_adelantar`) y se
  enseña cuando toca, hasta 30 ms antes; si al acabar un tic la siguiente ya toca, se enseña en el mismo tic
  (hasta 4): cada vuelta por el bucle de eventos cuesta ~27 ms en la máquina RTG emulada (medido: el temporizador
  despierta tarde, pida lo que pida). Se enseña toda imagen decodificada; con más de 200 ms de retraso, H.264
  en turbo hasta alcanzar el reloj (turbo+ no: con una imagen clave cada 10 s se salta el vídeo). Barra de
  estado: "Vídeo: N s, X imágenes/s"; al acabar, el botón de volver a empezar.
- Medido en la máquina objetivo (68040+JIT, RTG): 320x180 escalado a 640x360, 300 de 300 imágenes en 12 s
  (25/s, tiempo real; antes 8/s). 640x360 a su tamaño: ~9 imágenes/s (decodificar cuesta ~87 ms), el vídeo va
  un 50 % más lento que el reloj. En una PiStorm real está por medir.

### 2026-10-17 — Tarea 30b, cuarta parte (sonido)
- El sonido de MintVID en libvideo.a: su adaptador (audio/mr_audio_decode.c: AAC, MP3, MP2, PCM), los
  decodificadores Helix de MintAMP (AAC-LC sin SBR y MP3, RPSL, con su ensamblador de 68k; aac/ y real/ tienen
  ficheros con el mismo nombre: prefijo de carpeta en los objetos) y su salida por Paula (amiga/audio_paula.c).
  AC-3 fuera (liba52, GPL): `sin_a52/` son cabeceras sustitutas propias. SIN_SONIDO=1 hace la librería sin él.
- dashweb_video.c: el sonido de cada paquete va a Paula (empieza con 150 ms en cola); dwv_reloj (lo que ya ha
  sonado: reloj maestro), dwv_servicio, dwv_pausa, dwv_con_sonido. lib/videos.dash: la imagen sigue al reloj
  del sonido; pausa también lo para; tics de 20 ms como mucho mientras suena.
- Probado en la máquina RTG con un MP4 H.264 320x180 + AAC 44,1 kHz de 8 s: el reloj del sonido llega a 8034
  ms (Paula lo consumió entero; en el emulador no se oye, va sin altavoz) y se ven las 200 imágenes.
- Fallo encontrado y no de Dash: libavc pide 5 MB al crear el decodificador; en los 8 MB del A1200 de pruebas
  ya no cabía con el sonido. test_video usa un 68030 con 64 MB (emu-config) y abre también un vídeo con AAC.
- Fallo de Dash encargado: un @native que devuelve Bool no se escribe true/false al concatenarlo.

### 2026-10-17 — Tarea 30c (YouTube)
- `lib/youtube.dash`: el recorrido de MintVID (mr_youtube.c) con la red de dashweb y sin esperar: la página
  del vídeo (User-Agent de navegador) y, si no trae el MP4, youtubei/v1/player con los clientes ANDROID,
  ANDROID_VR, WEB_EMBEDDED_PLAYER y WEB; clave y versión de la página (o la clave pública de WEB si no las
  trae, p. ej. la página de consentimiento). Los analizadores son los de MintVID en C (dwv_youtube_id,
  dwv_youtube_mp4: itag 18, H.264 + AAC), con su red sustituida. El MP4 se baja con el User-Agent del
  cliente que lo dio (http_con_agente, nuevo en lib/http.dash).
- `<iframe>` de YouTube (embed, watch, youtu.be, shorts, nocookie) maquetados como vídeo (`dom_es_video`).
  Reproductor: fase "preguntando a YouTube", y "trayéndolo, N % de M KB" en la barra de estado. El vídeo
  conserva su proporción (franjas negras), como en los navegadores.
- Prueba manual, una vez, con YouTube de verdad en la máquina RTG ("Me at the zoo", jNQXAC9IVRw): resuelto,
  bajado y reproducido entero con sonido, 284 imágenes en 19 s (14,8/s; el vídeo es de 15), reloj del sonido
  18,86 s. Captura enviada al usuario. Test sin red `test_youtube` (identificadores, el MP4 de una respuesta
  del reproductor guardada en tests/pages/youtube_player.json, la configuración de la página).
- Pendiente: pantalla completa (30d); empezar a reproducir antes de tener el fichero entero; la miniatura
  del vídeo antes del clic.

### 2026-10-17 — Tarea 30d (pantalla completa)
- Esquina de abajo a la derecha del vídeo (icono de cuatro esquinas, 24 px, cuando ya hay imagen): un clic abre
  una ventana MUI a pantalla completa (`mui_window_fullscreen`, D de la otra sesión, rama `fullscreen`) con un
  lienzo negro y el mismo reproductor con su proporción. Clic o Esc la cierran; la barra espaciadora para y
  sigue. Al cerrar se repinta la página.
- Los `<iframe>` de YouTube que el CSS de la página pone como bloque o con posición absoluta (temas de
  WordPress, p. ej. freemem.space) también son vídeo: `_contenido` no los trata como bloque y `_absoluto`
  tiene su caso. Un vídeo visto solo en parte se pinta igual (lo recorta MUI).
- Probado en la máquina RTG (1024x768) con video_sonido.html: clic para reproducir y clic en la esquina; el
  vídeo 320x180 escalado a 1024x576 a pantalla completa, 200 imágenes de 200, sonido entero (reloj 8034 ms).
  Captura enviada al usuario.
- Sin probar: la captura del artículo de freemem.space con su YouTube (el intento se paró por tiempo).
- Base con Dash de la rama `fullscreen` (d21cecc): 33/33 tras pasar a true/false las líneas esperadas de
  test_imagen_dec, test_jsdom_eventos y test_formularios_post (un Bool ya se escribe así en Dash).
- Captura pedida por el usuario: el artículo de freemem.space ("Análisis de la evolución de la popularidad...")
  en la máquina RTG, bajado con el teclado hasta su primer YouTube (bnWKfEWPAaM) y pulsado: resuelto, bajado
  (540x360) y reproducido entero dentro de la página, 289 imágenes de 289 en 48 s (el vídeo es de 6 por
  segundo), reloj del sonido 47,99 s. Enviada al usuario.

### 2026-10-17 — Tarea 30e (el cartel del vídeo)
- `dom_youtube_id` (en Dash: embed, shorts, youtu.be, ?v=) y `dom_video_poster`: el poster de `<video>` o, en un
  YouTube, https://i.ytimg.com/vi/ID/hqdefault.jpg. `imagenes.dash` lo pide con las demás imágenes y deja la
  dirección completa en el atributo poster. El pintor lo pone sobre negro mientras el vídeo no ha empezado
  (o falló), con el botón encima: la miniatura de YouTube cubre el recuadro, el poster cabe entero (contain).
  Los repintados parciales del vídeo que suena no tocan los vídeos con cartel.
- Test `test_video_cartel` (identificadores, la dirección de la miniatura, píxeles de contain y cover). Base: 34/34.
- `tools/medir_visor.py`: varias capturas en una ejecución (`--captura a.png,b.png --captura-en 100,200`), con
  D44 de Dash (rama `capturas`, ya en `dashweb`).
- Probado en la máquina RTG con el artículo de freemem.space: antes del clic se ve la miniatura del vídeo;
  después, reproducido entero (283-289 imágenes según la vuelta, reloj del sonido 48 s). Capturas del cartel y
  del vídeo sonando (segundo 17) enviadas al usuario.

### 2026-10-17 — Tarea 30f (el vídeo empieza mientras se baja)
- La red de dashweb guarda la respuesta en memoria hasta el final: `http_parcial` (dónde está ya el cuerpo de
  una respuesta 2xx con Content-Length; se mueve al crecer el búfer), `http_parcial_listos`, `http_parcial_total`.
- `dashweb_video.c`: una fuente de MintVID (mr_source_create, por el hueco de su red) que lee de esa memoria y,
  al acabar la descarga, del fichero (`dwv_abrir_bajando`, `dwv_bajado`, `dwv_bajado_fichero`). Lo que no ha
  llegado no se lee: `dwv_siguiente` da 2 (esperar). Parche en `core/mr_mov.c` (anotado en README.dashweb):
  un paquete que no se pudo leer no se da por consumido.
- `lib/videos.dash`: mientras se trae, prueba a abrirlo cada 256 KB (un MP4 con el índice al principio suena
  enseguida; con el índice al final, al llegar entero). Suena y sigue bajando; si se queda sin datos, se para
  (también el sonido) con "esperando a que llegue" y sigue solo. La barra dice "(trayéndolo, N %)".
- Servidor de pruebas: `/goteo/<fichero>` (64 KB, una pausa de GOTEO_S s, el resto). Test `test_video_bajando`
  (abre antes del final, imágenes mientras baja, espera, mismas imágenes que entero). Base: 35/35.
- Probado en la máquina RTG con `video_goteo.html` (GOTEO_S=10): suena con el 21 % traído, espera en la imagen
  40 y sigue; 200 imágenes de 200, sonido entero (8034 ms). Capturas enviadas al usuario.

### 2026-10-17 — Tarea 28g (QuickJS con FPU)
- `tools/build_qjs.sh lib` compila ahora para 68020 con FPU (`-m68020 -m68881`, como `./dash --fpu`);
  `QJS_CPU=""` lo deja sin FPU (fp-bit) para un dashweb sin `--fpu`.
- Fallo encontrado (y arreglado con esto): con libqjs.a sin FPU dentro de un programa con FPU, las
  conversiones de libgcc (enteros de 64 bits a double: `__floatdidf`...) son las de la FPU y devuelven el
  resultado en fp0, pero QuickJS lo leía de d0/d1. `Date.now()` daba 8,8e-312, `(s + i) | 0` en un bucle de
  100.000 vueltas daba 704927097 (bien: 704982704) y un generador de números aleatorios salía distinto.
  Con FPU, los mismos números que el cálculo en el PC. Test: `test_js` (Date.now, BigInt a número).
- `tools/bench_js.py` (nuevo): tests/bench/bench.js en la máquina objetivo, con AmigaOS 3.2 y su
  68040.library. Sin ella (los sistemas 3.1 de pruebas no la traen) un programa con FPU se cuelga en el 68040
  emulado: la máquina "objetivo" de medir_visor (3.1) no sirve para programas con FPU; la RTG (3.2) sí.
- Medidas con FPU (68040 + JIT; Date.now va de 20 en 20 ms): fib20 60 ms, intloop100k 100, float20k 40,
  mathsin5k 60, strcat5k 80, arrjoin 100, objects5k 140, sort5k 200, json 200, regexp 60, map5k 220,
  closures 60, parse30k 420. Sin FPU no se pudo medir: su Date.now no funcionaba. Base: 35/35.

### 2026-10-17 — Tarea 28h (conexiones que siguen abiertas)
- `lib/http.dash`: con `http_seguir = true` (dashweb lo pone al empezar; `http_cerrar_libres()` al salir), las
  cargas sin espera piden "Connection: keep-alive" y, tras una respuesta entera de HTTP/1.1 sin "Connection:
  close", la conexión queda libre (hasta 8, 10 s como mucho) para la siguiente petición al mismo servidor y
  puerto: sin conectar ni negociar TLS otra vez. Una conexión libre que el servidor ya cerró se descarta; si
  se nota al mandar o al no recibir nada, la petición se repite en una nueva. Las peticiones que esperan
  (http_get...) siguen con "Connection: close".
- Respuestas que acaban sin cerrar: chunked termina con su trozo de tamaño 0 y sus cabeceras finales
  (`_chunked_fin`); 204, 304 y 1xx no tienen cuerpo.
- Servidor de pruebas: varias peticiones por conexión si se piden con keep-alive; `/conexion` ("c1 r4": qué
  conexión y qué petición de ella) y `/cerrar_tras`. Test `test_http_seguir`.
- dashweb escribe en la salida cuánto tarda una página entera, con sus imágenes ("entera en N ms").
- Medido en la máquina RTG con https://freemem.space/ (dos veces cada uno): con conexiones abiertas 46,5 y
  44,9 s; sin ellas 50,0 y 51,7 s: un 10 % menos. Base: 36/36 (y 36/36 con memcheck en la batería de la otra sesión).

### 2026-10-17 — Tarea 29c (imágenes decodificadas en otro proceso)
- Con D47 de Dash (`task_start_with`, rama `tareas`, ya en `dashweb`): `lib/imagen_dec.dash` decodifica en otro
  proceso (`imagen_empezar`, `imagen_lista`, `imagen_acabar`), con prioridad -1 y 256 KB de pila. El C de los
  decodificadores solo usa memoria de exec y el malloc de libnix (con semáforo). La imagen de pantalla
  (image_from_rgb) se hace luego en el programa. Si no se puede crear el proceso, se decodifica como antes.
- `lib/imagenes.dash`: cada imagen pasa por bajándose → llegada → decodificándose; hasta 4 a la vez.
- Encontrado midiendo: cada imagen que llegaba volvía a maquetar la página entera (freemem.space: ~1,4 s cada
  vez en la máquina RTG). Ahora (`documento_imagenes`) solo se maqueta si la imagen le pone tamaño a su `<img>`
  (si ya lo tenía, basta con repintar) y, mientras siguen llegando, como mucho cada 2 s desde la anterior.
  También sirve sin otro proceso: 45 → 41,6 s.
- Medido en la máquina RTG con https://freemem.space/ (la página entera, con sus imágenes):
  sin otro proceso 41,6 y 41,6 s; en otro proceso, uno a la vez 51,8 y 50,2 s; cuatro a la vez 46,7 s
  (prioridad -1) y 45,3 s (prioridad 0). Se queda en cuatro a la vez con prioridad -1: algo más lento que sin
  otro proceso, pero la ventana responde mientras se decodifican.
- Fallo de Dash encontrado y arreglado por la otra sesión: una función privada pasada por su nombre a
  task_start daba "is private to module" (ac3884a).
- `image_from_rgb` necesita picture.datatype V43: en AmigaOS 3.1 devuelve 0 (y dashweb usa los datatypes);
  `test_imagen_dec` mira lo decodificado por la tarea sin pasarlo a pantalla (`imagen_acabar_probar`).
- Prueba a mano del usuario en una ventana del emulador: commodoremalacca.club (Next.js) pide TextEncoder, que
  no tenemos: tarea 28i. Base: 36/36.

### 2026-10-17 — Tarea 28i (TextEncoder, TextDecoder)
- En el preludio de jsdom: TextEncoder (encode, encodeInto) y TextDecoder (UTF-8 con BOM, stream y fatal, como
  el estándar de WHATWG; también UTF-16LE y Latin-1). Sin listas intermedias: dos pasadas sobre Uint8Array (la
  primera versión, byte a byte en una lista, se quedó sin memoria con los datos de una página de Next.js).
  Comprobados en el PC contra los de Node: casos a mano, 3000 secuencias de bytes al azar, 2000 textos al azar con
  encodeInto en destinos de 0 a 5 bytes, y trozos partidos al azar con stream: todo igual.
- commodoremalacca.club (Next.js) pedía después ReadableStream. Escrita (cola, lectores con promesas, pull, for
  await), pero con ella el JavaScript sigue y deja el Amiga sin memoria y dashweb se cierra: se queda sin poner
  (tarea 28j) y la página se sigue viendo como antes (entera en 57,7 s).
- lib/js.dash: tope de memoria de 48 MB para el JavaScript de una página (JS_SetMemoryLimit): si lo pasa, su
  script recibe "out of memory" en vez de dejar sin memoria al Amiga.
- Test `test_jsdom_texto`. Apuntado lo que se ve mal en esa portada: tarea 28k. Base: 37/37.

### 2026-10-17 — Tarea 28l (repintar menos)
- El usuario, probando dashweb en una ventana del emulador: tras cargar la página "todo se re-renderiza varias
  veces". Medido en la máquina RTG con freemem.space (avisos temporales en cada repintado): 17 repintados de la
  página entera después de abrirla, cada uno de ~0,7 s y visible (se pinta en la ventana, que se borra antes):
  uno al llegar la página, dos de los temporizadores del JavaScript que cambian el DOM, y 14 de imágenes que
  llegan (aunque la 29c ya no maquetaba por cada una, sí repintaba todo).
- `documento_imagenes`: las imágenes que llegan se pintan juntas, como mucho cada 2,5 s mientras siguen llegando
  y la última enseguida; se maqueta solo si alguna cambió el tamaño de su `<img>`. Ahora: 6 repintados por
  imágenes en lugar de 15; la página entera en 44,0 s en lugar de 51,6 (las dos con los avisos puestos).
- Encargado a Dash (D48): doble búfer en mui_canvas, para que un repintado no se vea a medias.
- `js_memoria` y `js_limite` (lib/js.dash): lo que ocupa el JavaScript de un motor y su tope. Midiéndolo salió
  un fallo: en Amiga, QuickJS contaba 0 bytes por bloque (nuestro parche de malloc_usable_size devolvía 0, libnix
  no lo tiene), así que el tope de 48 MB de la 28i nunca saltaba. Arreglado en third_party/quickjs: en Amiga cada
  bloque guarda su tamaño delante (8 bytes). Un motor recién hecho: 149.728 bytes. Test en test_js: con un tope de
  1 MB, un script que pide más recibe el error (InternalError, o null si ni ese objeto cabe) y el programa sigue.
- Base: 37/37.
- 28j (en marcha, sin resultados): con ReadableStream puesta y avisos de memoria cada 3 s, el emulador se quedó
  colgado sin escribir nada (la salida se pierde): habrá que mirarlo con el disco guardado o capturas.

### 2026-10-17 — Tareas 31a y 31b (comparar con Chrome; flexbox)
- El usuario preguntó si el motor de XHTML/CSS se estaba haciendo completo o solo para freemem.space. Revisado:
  no hay nada a medida de una web, pero se completaba con lo que pedía freemem.space y faltaban módulos enteros
  (flexbox y grid se trataban como bloques, sin calc, z-index, overflow, border-radius de verdad, @font-face...).
  Decisión del usuario: tarea 31, módulo a módulo según su especificación, con su lista de 13 webs.
- 31a: `tools/comparar_chrome.py` (y `tools/webs_prueba.txt`): Chrome sin ventana (google-chrome-stable
  --headless) a 940x614, el tamaño de la zona de la página de dashweb en la máquina RTG, y dashweb en esa máquina
  (recortado a su página), juntas en una imagen. Solo a mano.
- 31b: flexbox en `lib/maqueta.dash` (`_flex`), según CSS Flexible Box Layout 1: elementos flex (texto suelto y
  reemplazados en cajas anónimas, order), tamaño base (flex-basis, width/height, contenido) e hipotético con
  min/max y el mínimo automático, líneas (flex-wrap), espacio libre con flex-grow/flex-shrink congelando a los que
  violan sus límites (9.7, también con flex-grow que suman menos de 1), tamaño cruzado de las líneas, align-content,
  stretch (vuelve a maquetar con el alto de la línea), justify-content (con space-*) y márgenes auto, align-self,
  gap, row/column y -reverse. Cada elemento se maqueta una vez en 0,0 y sus dibujos se mueven a su sitio (solo el
  estirado lo vuelve a maquetar). Atajos en la cascada: flex, flex-flow, gap, grid-gap.
- Test `test_maqueta_flex`: 31 cajas en 13 casos, todas como dice la especificación a la primera.
- D48 (doble búfer, rama `dobleb`, ya en `dashweb`): la página de dashweb se pinta aparte y llega de una vez
  (`mui_canvas_buffered`): ya no se ve redibujarse. Probado en la máquina RTG con freemem.space.
- D49 encargado (fallo de Dash): una variable con el [String] que devuelve una función perdía el tipo de sus
  elementos en un for (en `_flex_atajo`, rodeado con `var partes: [String]`). Arreglado en la rama `tipolista`.
- Base: 38/38.

### 2026-10-17 — Primera comparación con Chrome (13 webs)
- Casi igual: freemem.space, amigastore.eu. Cerca pero sin iconos ni logo (SVG dentro de la página, 31i):
  xataka.com, meneame.net (Chrome tapa la página con el aviso de cookies). Sin el fondo y el texto grande del bloque
  principal: commodoremalacca.club, trainalong.fit. Tablas con las columnas mal: aminet.net (31g). amigang.com
  (cabecera), muylinux.com (logo, menú escondido a la vista), dpms.freemem.space (fondo enorme), ami64.com (en
  blanco): 31j. amigaworld.net: Chrome no la cargó a tiempo. amiga.abime.net: las dos se quedan en su pantalla
  antirobots (Anubis). Mosaicos enviados al usuario.

### 2026-10-17 — Tareas 31c a 31f (calc y unidades; grid; z-index y overflow; border-radius y box-shadow)
- 31c (`lib/estilo.dash`): calc(), min(), max() y clamp() (anidados, con paréntesis, + - * /, en centésimas de
  píxel) dentro de estilo_px, solo cuando el valor empieza por letra (lo normal sigue igual de rápido). rem es
  ahora el font-size de <html> (antes valía como em). vw, vh, vmin, vmax (de la zona de la página: estilo_vw lo
  pone maquetar, estilo_vh dashweb) y ch. Test `test_estilo_calc`.
- 31d (`lib/maqueta.dash`, `_grid`): CSS Grid 1: pistas (px, %, fr, auto, min-content, max-content, minmax,
  fit-content, repeat con auto-fill/auto-fit), grid-template-areas, colocación explícita (números, negativos,
  span, áreas, grid-column/row/area) y automática (row y column, sin dense), pistas implícitas, tamaño de las
  pistas (lo que piden los elementos, el libre hasta los límites, las fr sin bajar de su base, las auto
  estiradas), gap, justify/align-content y justify/align-self (stretch vuelve a maquetar). Test
  `test_maqueta_grid` (24 cajas en 8 casos; un fallo de verdad encontrado: justify-self con width fijado).
- 31e: z-index (cada elemento posicionado con z-index pone su capa a todo lo suyo; la página se ordena por
  capas al final, estable) y overflow hidden/clip/auto/scroll (lo de dentro lleva su recorte, también anidado,
  y el pintor pinta solo ahí). position: sticky sigue en su sitio (como relative). Test `test_maqueta_capas`.
- 31f: border-radius de verdad (1 a 4 radios, px/em/%; D_REDONDO: el pintor rellena fila a fila en las
  esquinas, o solo el anillo si es un borde; con transparencia y recorte) y box-shadow (la primera no inset:
  desplazada y con su extensión, más clara si es difuminada; redondeada si la caja lo es). En
  `test_maqueta_capas` (píxeles de la esquina, el medio y el borde).
- D49 (Dash, listas devueltas por funciones) fusionada; el rodeo de `_flex_atajo` ya no hace falta.

### 2026-10-17 — Tarea 31g (tablas, atributos de presentación, aspect-ratio, object-fit)
- Tablas según CSS 2.1 (17.5): rejilla con colspan y rowspan (también rowspan=0), anchos automáticos (mínimo y
  máximo de cada columna por su contenido o su width; las celdas de varias columnas reparten lo que les falta; la
  tabla reparte entre mínimo y máximo, o lo que sobra en proporción a las columnas sin ancho fijado),
  table-layout: fixed, border-spacing (0 con border-collapse), caption, alto de las filas (rowspan: lo que falta a
  la última), fondo de las filas y vertical-align de las celdas (middle por omisión, top, bottom: la celda se
  vuelve a maquetar con el alto de su área y su contenido baja; sus fondos y bordes no). Antes: anchos iguales.
- Atributos de presentación de HTML (la parte "Rendering" de HTML), como CSS de autor que pierde con cualquier
  regla: width/height, bgcolor, background, align (tabla centrada o flotante; texto), valign, border, cellspacing,
  cellpadding (de su tabla), nowrap, text de body, y color/face/size de <font>. En la hoja del navegador:
  border-spacing 2px, vertical-align middle en las celdas.
- `_ancho_flotante` (lo que mide el contenido, para flex, grid y tablas) cuenta ahora las cajas de los elementos
  con width fijado (antes solo el contenido: un <div> de ancho fijo con fondo medía 0).
- aspect-ratio (con el alto sin fijar) y object-fit (contain, cover, scale-down) en las imágenes.
- Test `test_maqueta_tabla` (16 cajas en 7 casos). test_maqueta: su tabla ahora se ajusta al contenido y lleva
  border-spacing (como Chrome): sus líneas esperadas, al día. Base: 42/42 (test_http_seguir falló una vez por
  servidores de pruebas huérfanos de una batería parada a mano; sin ellos, pasa).

### 2026-10-17 — Tarea 31i (SVG dentro de la página)
- `lib/imagenes.dash`: cada <svg> de la página se vuelve a escribir como un fichero SVG (T:dashweb_svgN.svg) que
  decodifica nanosvg: nombres de SVG con su caja (el lector de HTML los deja en minúsculas: viewBox,
  linearGradient, clipPath...), currentColor con el color del <svg>, fill/stroke/opacity que pone el CSS de la
  página a cada elemento, y <use href="#id"> (o xlink:href) sustituido por lo que nombra (de un <symbol>: sus hijos,
  y su viewBox para un <svg> sin viewBox, como en los sprites de iconos). La maqueta lo pone como una imagen, a su
  tamaño de CSS, de sus atributos o, sin nada, 300x150 (con viewBox, el alto en proporción).
- Test `test_svg_pagina` (el SVG generado, lo que decodifica nanosvg de un rectángulo y de un icono de sprite, y
  su sitio en la maqueta). Base: 43/43.

### 2026-10-17 — Tarea 31k (Selectors 4)
- `:is()` (y sus alias :matches, :-webkit-any, :-moz-any), `:where()`, `:has()` con selectores relativos (> hijo,
  + hermano siguiente, ~ hermanos siguientes, o descendiente) y `:nth-last-of-type()`; `:not()` ya aceptaba listas.
  Especificidad de Selectors 4: :where cuenta 0; :is, :not y :has, la de su argumento más específico. También en
  querySelector (lo que pedía ami64.com). Test `test_selectores4`.
- Pregunta del usuario: ¿el problema de JavaScript es QuickJS? No: el lenguaje está completo (ES2023); lo que falta
  son las APIs del navegador (bloque 32). Traducir QuickJS a Dash (69.000 líneas de C) se descarta: meses de trabajo,
  más lento y con fallos nuevos, para tener lo mismo; QuickJS sigue como librería de C y lo de alrededor, en Dash.
  Orden decidido por el usuario: primero el bloque 31, luego el 32.
- Base: 44/44.

### 2026-10-17 — Tarea 31l (Transforms)
- `_transformar` (lib/maqueta.dash) reescrita: compone las funciones de izquierda a derecha en una matriz de escala
  (milésimas) y desplazamiento (px), alrededor de `transform-origin` (palabras, % o longitudes; por omisión el
  centro). translate/translateX/Y/3d con % de la propia caja y con calc() dentro (paréntesis anidados); scale,
  scaleX/Y/3d (también con %); matrix() y matrix3d() sin giro (con giro, solo su desplazamiento); ángulos en deg,
  rad, grad y turn. Las propiedades sueltas `translate`, `rotate` y `scale` (Transforms 2) van delante de
  `transform`. scale(0) quita lo dibujado; scale(-1) da la caja vuelta (el texto se mueve, no cambia de letra).
  Las zonas de recorte de overflow que van dentro se transforman con ello.
- Lo que no: girar una caja con contenido a un ángulo cualquiera (haría falta girar texto e imágenes en el pintor);
  una barra sola se gira al múltiplo de 45 más cercano, como antes. skew y los giros 3D se ignoran.
- Test `test_maqueta_transform` (9 casos).
- Base: 45/45.

### 2026-10-17 — Tarea 31m (Animations: el estado final)
- dashweb no anima: pinta lo que la animación deja puesto. lib/css.dash guarda de cada @keyframes (y
  @-webkit-/-moz-keyframes) su último fotograma (to o 100 %) y el primero (from o 0 %); lib/estilo.dash junta los de
  todas las hojas (el último de un nombre manda) y, en un elemento con animation (o -webkit-animation, o las
  sueltas animation-name, -fill-mode, -iteration-count, -direction), si el fill-mode es forwards o both y las
  vueltas son finitas, declara las del fotograma final por encima de todo lo que no es !important (sobre una
  copia: las ganadoras se comparten entre elementos). Con reverse, alternate y vueltas pares o alternate-reverse
  e impares acaba en el primero. Es el caso de las webs que ponen opacity: 0 y una animación de aparecer.
- Transitions: sin cambios de estado no hay nada que hacer (el estilo de siempre es el final).
- Test `test_estilo_animacion` (8 casos, con cubic-bezier() con comas dentro del atajo).
- Base: 46/46.

### 2026-10-17 — Tarea 31n (Color 4 y 5)
- lib/colores.dash rehecho alrededor de un lector (`_color_leer`: el color y su opacidad en `_color_alfa`);
  css_color, css_alfa y css_color_opaco salen de él. Ahora entiende #rgba y #rrggbbaa, rgb()/rgba() con comas o
  con espacios y "/ alfa" (y decimales), hsl()/hsla(), hwb(), lab(), lch(), oklab(), oklch(), color(srgb ...)
  (también srgb-linear y xyz; display-p3 y los demás, como sRGB), color-mix() (mezcla premultiplicada en sRGB,
  diga el espacio que diga), light-dark() (el claro), none en los canales, los 148 nombres (salen de una tabla en
  un texto: antes había unos 40) y los colores del sistema (Canvas, CanvasText, ButtonFace...).
- Todo en enteros (diezmilésimas): seno por tabla de grados con interpolación, gamma de sRGB por una tabla de
  256 y búsqueda binaria. Dash no tiene sqrt/pow/sin para Float (solo fx_sqrt/fx_sin de Fixed); no hizo falta.
- Lo que no: la sintaxis relativa (rgb(from ...)) da -1; color-mix in oklab/oklch mezcla en sRGB.
- Test `test_colores4` (21 colores; lab y oklab a 1 de la fórmula en coma flotante).
- Base: 47/47.

### 2026-10-17 — Tarea 31o (Text 3)
- white-space: nowrap no se miraba: ahora las palabras de un texto nowrap van pegadas (no se corta la línea entre
  ellas). overflow-wrap/word-wrap: break-word o anywhere y word-break: break-all o break-word parten una palabra
  más ancha que la línea en trozos que caben (break-all no rellena la línea de antes: solo parte lo que no cabe).
  text-overflow: ellipsis, en una caja con overflow que no sea visible, cambia lo que no cabe por "..." (Latin-1
  no tiene el carácter de los tres puntos). text-shadow: la primera sombra, como copia del texto desplazada con su
  color (o el del texto); no se pinta si es casi transparente o difuminada más de 4 px (los halos quedarían
  peor sin difuminar). text-shadow, overflow-wrap, word-wrap y word-break se heredan.
- Lo que no: white-space: pre-wrap y pre-line siguen como pre (no parten líneas largas); hyphens.
- Test `test_maqueta_texto3`.
- Base: 48/48.

### 2026-10-17 — Tarea 31p (@supports y @layer)
- Las reglas dentro de @supports y @layer se tiraban enteras (solo se entraba en @media). Ahora @supports evalúa
  su condición ((propiedad: valor), not, and, or, paréntesis, selector()): una propiedad vale si está en la lista
  de las que dashweb pinta (CSS_CONOCIDAS en lib/css.dash; display, salvo contents/ruby/math; las --x siempre;
  las -webkit- y backdrop-filter, filter, mask... no). @layer (con nombre, anónimas, anidadas "a.b" y la
  declaración "@layer a, b;") da a cada regla el puesto de su capa por orden de aparición; fuera de capas, 1000.
  En la cascada la capa pesa más que la especificidad (especificidad + capa x 1.000.000; el atributo style pasa a
  1.500.000.000 y las animaciones a 2.000.000.000). Las capas se reinician en cada documento.
- Lo que no: con !important el orden de las capas no se invierte; @container sigue sin entrar (haría falta el
  tamaño del contenedor al aplicar el estilo); @scope.
- Test `test_estilo_capas` (9 casos). Mi primera versión del test esperaba mal: una regla p sin capa gana a una
  clase en capa, como dice la especificación.
- Base: 49/49.
- Segunda comparación con Chrome (versión 4cc45c7, la de la 31g: sin SVG ni 31k-31p; mosaicos enviados al
  usuario). Para la 31j: commodoremalacca.club sin la imagen de fondo del bloque principal (la primera línea del
  título, blanca, no se ve) y el aviso de cookies no sale; dpms.freemem.space, un texto gigante ("amiga p", "POS")
  en vez del cartel; muylinux.com, el logo tapado por círculos y sin las noticias; ami64.com en blanco (Wix);
  amigang.com sin el menú y con la imagen de cabecera enorme; amiga.abime.net, el reto anti-bots de Anubis (la
  imagen sin su tamaño); xataka.com sin logo ni iconos (SVG: la 31i ya los pone) y sin el menú. aminet.net,
  amigastore.eu, amigaworld.net (Chrome no la cargó), trainalong.fit, meneame.net y freemem.space, parecidas a Chrome.

### 2026-10-17 — Tarea 31j, primer arreglo (commodoremalacca.club)
- La portada pone sobre su cabecera una capa azul semitransparente con position: absolute; top/right/bottom/left
  a 0 y sin height (el título blanco va encima). dashweb le daba el alto de su contenido (0): sin capa, el título
  blanco quedaba sobre el fondo claro. Ahora un absoluto con top y bottom y height auto mide el hueco entre los
  dos (menos márgenes, y bordes y rellenos si no es border-box); se pone un height de un momento al maquetarlo.
  La imagen de debajo la pinta JavaScript en el navegador (BAILOUT_TO_CLIENT_SIDE_RENDERING de Next.js).
- Caso nuevo en `test_maqueta_transform`.
- Base: 49/49.

### 2026-10-17 — Tarea 31j, segundo arreglo (dpms.freemem.space)
- El texto gigante de dpms era su logo: un PNG de 3000x3000 con `height: 50px; width: auto; max-width: 200px`.
  Una <img> en la línea tomaba solo sus atributos width/height (o lo que mide la imagen cargada) y no el CSS.
  Ahora `_img_medida` aplica width (px o % de la línea) y height (px) del CSS, saca el que es auto de la
  proporción, y después max-width y max-height con la misma proporción (como ya hacían los vídeos).
- Casos nuevos en `test_maqueta_transform` (3 imágenes).
- Comparación de hoy (commodoremalacca, dpms, muylinux, xataka) con la versión de la 31p: muylinux ya tiene su logo;
  xataka sigue sin logo ni menú, y muylinux sin las noticias (lozad.js: falta NodeList en JavaScript, bloque 32).
- Base: 49/49.

### 2026-10-17 — Tarea 31j, tercer arreglo (xataka.com: el logo)
- El logo de xataka es el fondo SVG de un <a> con `display: inline-block; width: 100%; height: 100%` dentro de
  un h1 de 160x84. dashweb no resolvía ningún height en %: la caja del fondo medía 0. Ahora `_bloque_en` lleva el
  alto fijo del contenido de la caja que maqueta (`_alto_definido`: height en px, o en % de otro fijo) y un
  height en % de un hijo sale de él (CSS 2.1, 10.5), también en flex y grid (alto_fijo). El de html y body
  sigue sin fijarse (cambiaría el alto de la página entera).
- El menú de xataka (flex con overflow: hidden y 20 px de alto) sigue sin salir: queda para otra vuelta.
- Casos nuevos en `test_maqueta_transform` (uno directo y otro encadenado).
- Base: 49/49.
- Comprobado en la máquina RTG contra Chrome (versión be47543): commodoremalacca ya tiene la capa azul con el
  título blanco legible, y dpms el logo a 50 px y el cartel en su sitio. Falta en dpms: el título "Posadas Party
  2026" sale como una caja blanca (texto con degradado: background-clip: text) y el fondo de estrellas (Three.js).

### 2026-10-17 — Tarea 31j, cuarto arreglo (dpms: el título con degradado)
- `background-clip: text` (y -webkit-) con `-webkit-text-fill-color: transparent`: el fondo solo se ve en las
  letras. dashweb pintaba la caja del degradado (la caja blanca de dpms) y las letras transparentes. Ahora una caja
  con background-clip: text no pinta fondo (color, degradado ni imagen) y sus letras toman el color de en medio
  del degradado (o el background-color). -webkit-text-fill-color con un color manda sobre color, y se hereda.
- Caso nuevo en `test_maqueta_texto3`.
- Base: 49/49.

### 2026-10-17 — Tarea 31j, quinto arreglo (recortes que se quedaban atrás; position: relative)
- Flex, grid, tablas y los absolutos con bottom maquetan en (0, 0) y luego mueven lo dibujado a su sitio, pero la
  zona de recorte de overflow (rx0..ry1, en coordenadas de página) se quedaba donde estaba: lo de dentro de una
  caja con overflow: hidden que fuera hija de un flex (el menú de xataka) quedaba fuera de su propia zona y no se
  pintaba. Ahora todos mueven con `_mover`, que lleva el recorte con el dibujo.
- position: relative con left/right/top/bottom no movía nada (no había código): ahora `_relativo` desplaza lo
  dibujado de la caja (CSS 2.1, 9.4.3; top/bottom en % no, como height). Solo en cajas de bloque e inline-block,
  no en un <span> relativo.
- Casos nuevos en `test_maqueta_transform`.
- Base: 49/49.
- Tercera comparación con Chrome, las 13 webs (versión 5cf086e, 4 grupos a la vez: 12 min en vez de 35; mosaicos
  enviados al usuario). Mejor que en la segunda: muylinux ya tiene sus noticias, xataka su menú, commodoremalacca
  su capa azul, dpms su logo y su título. Pendiente: el logo de xataka sale como texto "Xataka" (falta
  text-indent negativo y su fondo SVG); amigang, el menú encima de la cabecera; ami64 en blanco (Wix, JavaScript);
  meneame y muylinux sin el aviso de cookies (lo pone JavaScript); trainalong sin la curva (SVG de fondo) ni sus
  letras (@font-face, 31h). Velocidad: la configuración de la máquina RTG ya es la más rápida (JIT a tope; la
  caché del JIT al máximo, el JIT de la FPU y sin sonido dieron lo mismo en tools/bench_js.py).
- Un emulador para el usuario (ventana, para usar dashweb a mano) hecho con `medir_visor --guardar` se cerraba solo
  a los pocos segundos: medir_visor compila con DASH_TEST_AUTOCLOSE = --segundos (el visor se cierra solo). Para
  uno interactivo hay que compilar sin esa variable (`./dash src/dashweb.dash -o p0`). No era un fallo de dashweb.

### 2026-10-17 — Tarea 31j, sexto arreglo (text-indent; el logo de xataka)
- text-indent no estaba implementado: `_lineas` desplaza la primera línea (px, em o % del ancho) y le quita ese
  ancho al partirla; negativo, la saca por la izquierda (con text-align: center se centra en lo que queda, como
  Chrome: -9999px sigue fuera). Es la forma clásica de esconder el texto de un logo que se pinta como fondo (xataka:
  "Xataka" encima de su SVG). Se hereda (también a los inline-block, como en los navegadores). Se aplica en cada
  tramo de líneas de una caja, no solo en el primero (una caja con texto, un bloque y más texto sangra los dos).
- Caso nuevo en `test_maqueta_texto3`.
- Base: 49/49.

### 2026-10-17 — Tarea 31j, séptimo arreglo (amigang: la capa oscura de la cabecera)
- El tema Mesmerize oscurece la imagen de la cabecera con un ::before en position: absolute, width/height 100 %,
  fondo negro y opacity: 0.78; el menú blanco va encima. Dos fallos: un absoluto con height en % medía 0 (en un
  absoluto el alto del contenedor ya se sabe: ahora sale de él, como top/bottom), y opacity entre 0 y 1 no se
  aplicaba. Ahora la opacidad de una caja mezcla su fondo (el rectángulo con espaciado = alfa; el pintor no
  mezcla texto ni imágenes: lo de dentro se pinta entero).
- Caso nuevo en `test_maqueta_transform`.
- Base: 49/49.
- Comprobado contra Chrome (35c6fca): xataka ya esconde el texto del logo y amigang tiene la capa oscura; el menú
  de amigang sigue desordenado (queda pendiente) y el logo SVG de xataka seguía sin verse: ver el arreglo siguiente.

### 2026-10-17 — Tarea 31j, octavo arreglo (las url() de las hojas externas)
- Las url() de una hoja se resolvían contra la página, no contra la hoja: `url(images/head-brand-logo.svg)` en
  img.weblogssl.com/css/xataka/... se pedía a www.xataka.com/images/... (404). Afecta a cualquier web con
  imágenes de fondo con rutas relativas en una hoja externa. Ahora `_estilo_agregar` reescribe las url()
  relativas de cada hoja (también las de @import, con su propia dirección) a direcciones completas; data: y #
  se quedan como están.
- Caso nuevo en `test_estilo_capas`.
- Base: 49/49.
- Comprobado contra Chrome (f589209): el logo SVG de xataka ya sale, pero sobre un cuadro negro (sin su
  transparencia). Sospecha en el runtime de Dash: `_dash_image_scale` escala la máscara con el BytesPerRow del
  bitmap de colores, que en RTG (16 bits) no es el de la máscara de 1 bit. Encargado a la otra sesión (D50).
  trainalong: igual que antes (le faltan la curva de fondo y sus letras de @font-face).

### 2026-10-17 — Tarea 31j, noveno arreglo (los @media con un rango; el menú de amigang)
- Traza de amigang (tools/traza.py): en la columna del menú quedaba el botón del menú del móvil (541 px) y el menú
  se encogía a 176 px. Ese botón se esconde con `@media (min-width:768px) and (max-width:1023px)`, pero al leer
  la hoja `_css_media_posible` tiraba los @media que no valen con ningún ancho de 320, 640, 1024 y 1920, y un rango
  de tableta no contiene ninguno: sus reglas se perdían a cualquier ancho. Afecta a cualquier web con un rango
  así (Bootstrap md, WordPress...). Ahora se prueban también los anchos que nombra la consulta (y el de al lado;
  em a 16 px).
- Caso nuevo en `test_estilo_capas`.
- Base: 49/49.

### 2026-10-17 — Tarea 31j, décimo arreglo (imágenes y SVG absolutos; position: fixed)
- trainalong pinta su curva de fondo con un <svg class="trazos"> en position: fixed (right: -8vw; bottom: -6vh;
  width: min(1100px, 120vw)). Traza: salía como un bloque de 940x0. Una <img> o un <svg> con position absolute o
  fixed se maquetaba como un bloque sin contenido (no salía nunca); ahora `_absoluto_imagen` lo pone a su tamaño
  (el del CSS, o el suyo, con la proporción) en su sitio, con su z-index. Y position: fixed va respecto a la
  ventana (0, 0, estilo_vw x estilo_vh: la de arriba del todo; al desplazar la página no se queda quieto).
- Casos nuevos en `test_maqueta_transform`.
- Base: 49/49 (con D50 en Dash, 3dff061).
- Comprobado contra Chrome (29231ab, con D50): xataka ya tiene su logo SVG con transparencia, como Chrome;
  amigang, su menú en una fila sobre la cabecera oscura (sin el título "Amiga Community", que queda tapado);
  trainalong, la curva (solo la de lima, rayada, y más arriba que en Chrome: falta la segunda y su sitio exacto).

### 2026-10-17 — Tarea 31h, primer paso (una fuente TTF hecha TextFont del Amiga)
- Plan de la 31h: (1) TTF a fuente del Amiga; (2) leer @font-face (familia, src con format, peso, estilo) y bajar
  las fuentes (ttf/otf; woff con el inflate de zlib; woff2 necesita Brotli: más adelante; a Google Fonts, con un
  User-Agent al que sirva TTF); (3) que la maqueta use la fuente de la web cuando el font-family la nombra.
- Paso 1: `lib/fuente_web.dash`. stb_truetype (third_party/stb/stb_truetype.h v1.26, dominio público; en
  build/img-lib/libimg.a con tools/build_img.sh) rasteriza los caracteres de Latin-1 (32-255 y uno para los que
  falten) al tamaño del em y se monta un `struct TextFont` en memoria (un solo AllocVec: tablas CharLoc,
  CharSpace y CharKern y un plano de 1 bit, umbral 112 de 255). Es lo que esperan font_use, font_text_width y
  Text(): el pintor no cambia. `fuente_web_liberar` (nunca font_close).
- Test `test_fuente_web` con Bitstream Vera Sans Mono (tests/pages/VeraMono.ttf, sin modificar, con su
  licencia en VeraMono.LICENSE): alto 24 a 20 px, monoespaciada de 12, un fichero que no es fuente da 0, y
  pintada pone tinta.
- Base: 50/50.

### 2026-10-17 — Tarea 31h, segundo paso (@font-face en las hojas; WOFF)
- lib/css.dash lee cada @font-face como una `CaraFuente` (familia en minúsculas y sin comillas, src, peso
  100-900 y estilo) y `css_fuente_src` elige del src el primero que se sabe leer: TrueType, OpenType o WOFF,
  por su format() o por la extensión (sin contar ?...); ni woff2 ni local(). lib/estilo.dash deja completas las
  url() de esos src (respecto a la hoja) y `estilo_caras` las junta todas.
- lib/fuente_web.dash lee también WOFF 1.0 (rehace la fuente TrueType: cada tabla descomprimida con el inflate
  de stb_image si vino con zlib).
- El servidor de pruebas sirve /woff/<nombre>.woff hecho al vuelo del .ttf de tests/pages (no se guarda una
  copia convertida de la fuente). `test_fuente_web` con WOFF y con dos @font-face.
- Falta (paso 3): bajarlas al cargar la página y que la maqueta las use cuando el font-family las nombra.
- Base: 50/50.

### 2026-10-17 — El indicador de actividad y la barra de progreso (lo pide el usuario)
- El indicador de carga (ocho puntos que giraban, diez repintados de MUI por segundo mientras cargaba) era caro
  en el Amiga: ahora es un punto quieto que solo se pinta al empezar y al acabar.
- La barra de progreso (abajo a la derecha, junto al estado) solo se veía mientras llegaba el HTML: ahora, con
  la página puesta, sigue a la vista mientras faltan imágenes y avanza con las llegadas sobre las pedidas.
- Base: 50/50.

### 2026-10-17 — Tarea 31h, tercer paso (bajar las fuentes y usarlas)
- Las fuentes van por la cola de las imágenes (lib/imagenes.dash, 4 descargas a la vez, sin parar la ventana):
  `imagenes_pedir_fuentes` pide hasta 8 de los @font-face (lo que elige css_fuente_src) y, al llegar, una
  `Pedida` con `fuente` no se decodifica: se registra (`fuente_web_registrar`, "familia|peso|estilo" -> fichero)
  y cuenta como cambio de maqueta (las letras cambian de ancho). lib/documento.dash las pide junto a las imágenes.
- `fuente_web_para(font-family, peso, estilo, tamaño)`: la primera familia de la lista que tenga fuente, con el
  peso más cercano (y del mismo estilo si hay); cada fichero y tamaño se hace TextFont una vez. La maqueta la
  mira antes que las fuentes del Amiga (lo elegido se guarda con fuentes_web_version: al llegar otra, se vuelve
  a elegir). De momento pide siempre 400 normal (la negrita y la cursiva las pone el sistema, como antes).
- Lo que no: WOFF2 (Brotli) ni TTF con contornos CFF (OTF "OTTO": stb_truetype los lee, pero sin probar); las
  fuentes hechas no se liberan al cambiar de página. trainalong solo trae WOFF2: seguirá sin sus letras.
- Caso nuevo en `test_fuente_web` (una fuente registrada cambia el ancho del texto en la maqueta).
- Base: 50/50.
- Google Fonts da a dashweb ("dashweb/0.1 (AmigaOS)") las fuentes en TTF (format('truetype')), no en WOFF2: las
  webs con Google Fonts ya pueden tener sus letras sin Brotli.
- Ojo: build/ no va a git. Tras traer el commit de la 31h (1) hay que ejecutar `tools/build_img.sh` en cada árbol
  (en dashweb-w faltaba stb_truetype.h y dashweb no compilaba: la comparación salió sin capturas de dashweb).
- Comprobado contra Chrome (d2c4778): amigang ya sale con las letras de Google Fonts (el menú en mayúsculas de
  Muli, el logo); freemem.space, parecida. Sigue en amigang la imagen de la cabecera, más grande que en Chrome.

### 2026-10-17 — Tarea 31q, primer paso (el cálculo de las animaciones)
- lib/css.dash guarda ahora todos los fotogramas de cada @keyframes (`Fotograma`: sitio por mil y
  declaraciones, en orden; "0%, 100%" da dos) y lib/estilo.dash los junta en `Hojas.cuadros`.
- lib/animacion.dash (nuevo): `animaciones_de(nodo, hojas)` lee animation (y -webkit-) y las sueltas
  animation-name, -duration, -delay, -iteration-count, -direction, -fill-mode, -timing-function (listas con
  comas, en vuelta si son cortas); `animacion_progreso(a, ms)` dice en qué punto (0-1000) va: nada antes del
  retardo sin backwards ni acabada sin forwards, direction con sus vueltas, y la función de tiempo (linear, ease,
  ease-in/out, cubic-bezier por bisección en enteros, steps y step-start/end); `animacion_valor(a, propiedad, p)`
  interpola entre los dos fotogramas que la tienen (sin fotograma en 0 o 1000, el valor del propio elemento):
  colores por canales (y su alfa) y, si no, los números de dentro con el mismo texto alrededor (opacity,
  translateX(-20px), stroke-dashoffset...).
- Test `test_animacion`. Falta: aplicarlo a lo dibujado y el reloj (paso 2).
- Base: 51/51.

### 2026-10-17 — Tarea 31q, segundo paso (a): las animaciones sobre lo dibujado
- La maqueta marca lo que dibuja un elemento con animation (`Dibujo.anim`; el más de dentro se queda el suyo) y
  `maqueta_desplazamiento` da lo que mueven los translate de un transform (% de la caja del elemento).
- lib/animacion.dash: `animaciones_pagina(página, hojas)` junta las de los elementos marcados; `animar(página,
  animaciones, ms)` es un fotograma: guarda la primera vez dónde estaba cada dibujo (bx, by), mueve lo de cada
  elemento lo que digan sus translate en ese instante (con su recorte) y lo vela si su opacity baja de 0,5 (el
  pintor no pinta lo velado: no mezcla texto); dice si queda alguna viva.
- Un elemento que la 31m deja con opacity 0 (acaba invisible) no se dibuja y no se anima: lo normal, aparecer
  (opacity 0 y una animación a 1 con forwards), sí.
- Casos nuevos en `test_animacion`. Falta (b): el reloj en dashweb y repintar solo lo que cambia.
- Base: 51/51.

### 2026-10-17 — Una imagen abierta sola (lo vio el usuario)
- Al pulsar en una foto que enlaza a su .jpg, dashweb pintaba los bytes del JPEG como texto: todo lo que llegaba
  se trataba como HTML. Ahora lib/documento.dash mira el Content-Type (o, sin él, la extensión): una imagen da una
  página que la muestra centrada sobre fondo oscuro (como Chrome), con su nombre de título; un vídeo, un
  <video controls>; text/plain, un <pre>. El servidor de pruebas da image/jpeg, text/plain y font/ttf.
- Test `test_documento_tipo`.
- Comparado el artículo https://freemem.space/s4a-robotica-para-ninos/ con Chrome a 940 px: la foto del texto sale
  a su tamaño (500x375), pero faltaba la foto destacada de arriba. Una <img> (o <svg>) con display: block no se
  dibujaba nunca (se maquetaba como una caja sin contenido): ahora `_imagen_en_bloque` la pone como una línea con
  ella (con el enlace del <a> de fuera). Caso nuevo en `test_maqueta_transform`. En la ventana más ancha del
  usuario la foto del texto salía a 904x578: sin reproducir aún (a 940 px va bien).
- Base: 52/52.

### 2026-10-17 — Tarea 33, primera medida (perfil de freemem.space)
- `medir_visor --perfil` con freemem.space en la máquina RTG (128 s): sin contar la espera, lo que más pesa es
  pintar: `_mezcla_recortada` (gfx_blend_rect: cajas con fondo semitransparente) 29,9 % con solo 46 llamadas y
  `_degradado_pintar` (gfx_gradient_rect) 6,9 %; la cascada de CSS (`_estilo_nodo`) un 8 %; JavaScript un 3 %;
  red y TLS un 5 %. Causa: en pantallas de color directo el runtime de Dash mezcla píxel a píxel (una lectura y
  una escritura de la librería por píxel). Encargado a la otra sesión (D51): mezcla por bloques con
  p96ReadPixelArray/p96WritePixelArray. Siguiente: medir cuántas veces se maqueta y se pinta la página entera.

### 2026-10-17 — El paquete y la versión alfa
- tools/paquete.sh mete ya todas las licencias de lo que va dentro (libwebp, nanosvg, MintVID, TJpgDec y la
  nota de stb, además de dashweb, QuickJS y fdlibm). El LEEME dice lo que de verdad hace falta: AmigaOS 3.2 (o
  3.5/3.9: las imágenes usan picture.datatype V43), un 68020 con FPU o un 040/060, memoria Fast (decenas de MB
  para las webs de hoy), MUI, una pila TCP/IP y AmiSSL; y el indicador nuevo y la barra de progreso.
- El usuario quiere publicar una alfa en GitHub: v0.1.0-alfa (pre-release sobre dev, con dashweb.lha), después
  del arreglo de velocidad de la mezcla (D51), medido.

### 2026-10-17 — Tarea 33, primer arreglo (los selectores de dentro de :not(), :is(), :has())
- El perfil daba 118.000 llamadas a css_selector al aplicar el estilo de freemem.space: las listas de :not(),
  :is()/:where() y :has() se volvían a leer cada vez que se miraba un elemento. Ahora `_selectores_de` las lee una
  vez por texto y las guarda. Del reparto de la carga (128 s): pintar ~70 % (la mezcla lenta, D51), estilo ~19 s
  (3 veces: la de JavaScript lo repite), imágenes ~15 s, red ~12 s, JavaScript ~7 s; maquetar, poco (5 veces).
- Base: 52/52.

### 2026-10-17 — Tarea 33, segundo arreglo (no repintar por imágenes que no se ven)
- Mientras llegaban imágenes, la página entera se repintaba (22 veces en freemem.space, con sus mezclas). Ahora
  lib/imagenes.dash apunta los src llegados (`Imagenes.recien`) y `documento_imagenes_visibles(d, desde, alto)`
  solo pide repintar si alguna de ellas se dibuja en lo que se ve, si se volvió a maquetar
  (`Documento.remaquetada`) o si ya no falta ninguna; las de más abajo se ven al desplazar. Caso nuevo en
  `test_documento_tipo`.

### 2026-10-17 — Tarea 34 (instalador e iconos)
- tools/iconos_wb.py hace los iconos de Workbench (.info clásicos, DiskObject con dos planos: los 4 colores del
  Workbench, de 3.0 a 3.2) del cajón, dashweb y el visor (herramientas, pila 64 KB), el LEEME (proyecto, se abre
  con SYS:Utilities/MultiView) e Instalar (proyecto del Installer, APPNAME=dashweb).
- paquete/Instalar: guion del Installer del sistema (3.1 a 3.2): avisa (y deja seguir) si falta FPU, MUI,
  AmiSSL, bsdsocket.library o picture.datatype V43, pregunta dónde y copia el cajón con sus iconos.
- tools/paquete.sh: los iconos, el instalador y el LEEME en Latin-1 (el Installer y MultiView no leen UTF-8);
  tools/lha_lh0.py acepta varias rutas (el cajón y su dashweb.info al lado). build/dashweb.lha: 5,7 MB.
- Para que el usuario lo pruebe en su CoffinOS (Amiberry): el paquete en ~/Amiberry/LHA, montado en
  Configurations/coffin.uae como Traspaso: (copia de la configuración en coffin.uae.antes-traspaso).
- Sin probar aún en un Amiga: los iconos y el guion.

### 2026-10-17 — Tarea 33, medida con D51
- Con D51 (mezcla por bloques en el runtime de Dash, e7c81d0 de la rama dashweb) y el arreglo de los selectores,
  sin el de las imágenes que no se ven: freemem.space entera en 47 s (antes 128 s). `_mezcla_recortada` baja de
  29,9 % a 0,4 % y `_degradado_pintar` de 6,9 % a 0,2 %. Ahora casi todo es espera (Main propio 80 %: red y
  temporizadores); de lo demás, red y TLS 5,7 %, JavaScript 3,3 %, decodificar imágenes 2,6 %, la cascada 3,1 %.

### 2026-10-17 — Direcciones file:// como las de NetSurf
- El usuario abrió en CoffinOS `file:///Programs/Network/NetSurf/Resources/en/welcome.html` y salió «Inserte
  volumen file»: el documento leía la dirección tal cual, y las hojas, scripts e imágenes solo quitaban la "/"
  (`Programs/Network/...`, relativa). Ahora `url_fichero` (lib/url.dash) da la ruta del Amiga: el primer trozo es
  el volumen (`Programs:Network/...`, como NetSurf), sigue valiendo `file:///DH0:a.html`, admite
  `file://localhost/` y `file://Volumen/`, y deshace los %XX (los de UTF-8 a Latin-1). La usan documento,
  estilo, recursos, jsdom e imágenes (eran cuatro copias del mismo código). Casos nuevos en `test_url`.
- Arreglado también `test_documento_tipo` (dos variables con el mismo nombre: la batería anterior dio 51/52).
- Base (con el repintado de solo lo visible): 52/52.

### 2026-10-17 — Tarea 33b (gzip)
- lib/http.dash pide `Accept-Encoding: gzip, deflate` para los textos (lo que va a un fichero, identity: imágenes,
  vídeo y fuentes ya vienen comprimidos y http_parcial necesita los bytes tal cual). El cuerpo comprimido se junta
  en bytes (`Bytes`, `red_juntar` en lib/red.dash: un texto cambiaría sus bytes 0) y se descomprime con el inflate
  de stb_image (`_http_inflar`: gzip con su cabecera, deflate con zlib o sin cabecera). Test nuevo
  `test_http_gzip` (servidor: /comprimido/<modo> y /acepta), con y sin esperar, también en trozos.
- Medida: freemem.space entera en 47,0 s (antes 47,1 s). `red_recibir_ya` baja de 3,4 % a 2,9 % del perfil, pero
  el total no cambia: los bytes no eran el freno. Ojo al leer los perfiles: cubren los 200 s de la medida, así
  que el 80 % de Main es sobre todo la espera después de cargar. En los 47 s de carga lo que pesa es: JavaScript
  ~8 s, recibir (TLS) ~7 s, decodificar imágenes ~6 s, abrir conexiones (TLS) ~5 s, la cascada ~7 s. Que el
  total no se mueva ni un poco apunta a algo que espera un tiempo fijo: siguiente, una línea de tiempo de la carga.

### 2026-10-17 — Tarea 33, la línea de tiempo de la carga
- lib/traza.dash: con el argumento TRAZA (`tools/medir_visor.py --traza`) dashweb saca cada paso con sus ms:
  pedir, enviar (y si la conexión se reusó), llegar (estado, bytes, ms) de cada descarga; scripts, estilo,
  maqueta, pintado, temporizadores del JavaScript y lo que rehacen, y cada imagen decodificada.
- freemem.space (45 s en la máquina RTG): HTML y recursos hasta 4 s; scripts 7 s (hasta 11 s); estilo 3,7 s;
  maqueta 1 s; primera pintada a los 16 s. Luego los temporizadores del JavaScript cambian la página dos veces y
  cada una rehace el estilo entero y la maqueta: 2,7 s y 4 s. Las fuentes: 4 pesos de Inter de Google Fonts
  (325 KB cada uno: el TTF entero, con todos los alfabetos) y 4 de Font Awesome (700 KB), 1,3 MB en total.
- Las imágenes esperaban en la misma cola detrás de las 8 fuentes: empezaban a bajarse a los 28 s. Ahora las
  fuentes tienen sus propias descargas (`FUENTES_A_LA_VEZ = 2`) y las imágenes llegan desde los 22 s. El total
  no cambia (44,8 s): la máquina va al 100 % todo el rato y todo compite por el procesador (TLS de las descargas,
  estilo, maqueta, decodificar). Probado también decodificar con prioridad 0 en vez de -1: se decodifican antes
  pero las descargas van más lentas; el total igual (45,5 s), así que se queda en -1 (la ventana responde mejor).
- Conclusión: para bajar el total hay que quitar trabajo. Por orden de lo que se ahorraría: (1) volver a calcular
  el estilo solo de lo que cambió el JavaScript (~6 s); (2) WOFF2 (31h): Google Fonts lo da en trozos por
  alfabeto, ~25 KB por peso en vez de 325 KB; (3) el primer estilo (3,7 s); (4) image_from_rgb en el proceso
  principal (~6 s en total); (5) JavaScript (7 s).

### 2026-10-17 — Tarea 33, el estilo solo de lo que cambia el JavaScript
- Antes, cualquier cambio del JavaScript rehacía la cascada entera. Ahora lib/jsdom.dash apunta cada cambio en el
  documento (`Toque` en lib/dom.dash: un atributo con su valor de antes y de después, un elemento que entra, sale,
  sus vecinos, o los hijos cambiados de golpe) y `estilo_aplicar_partes` rehace solo lo que puede haber cambiado,
  como las "invalidation sets" de los navegadores: al indexar las hojas se apunta qué clases, ids y atributos
  nombra algún selector y, por cada uno que sale antes de la última parte, las claves de esa última parte
  (".menu a" -> "a"). Una clase que nadie nombra no cambia nada; si la nombran, el elemento solo, y si su estilo
  cambió, todo lo suyo; si no, solo los de debajo con alguna de esas claves. Con + o ~, todo el padre; con :has(),
  todo. `_estilo_nodo` se parte en `_estilo_propio` (el elemento) y sus hijos; Nodo.vars guarda las --x de cada uno.
- freemem.space: el JavaScript mete el sticky-header (6 cambios) y luego pone la clase sld-plus en <body>. La
  cascada de esos cambios pasa de ~1,8 s y ~3 s a 0,15 s y 0,05 s; la página entera, de 44,7 s a 41,7 s. Lo que
  queda de cada vuelta es maquetar otra vez y volver a buscar las imágenes (0,9 s y 2,5 s).
- Dash: `x = d[k]` con d un diccionario de diccionarios pierde el tipo del valor (un `for k in x.keys()` da
  claves Int y "Dictionary keys are Strings"): se declara `var x: {String: Int} = d[k]`.
- Test nuevo `test_estilo_partes`: tras cambios de clases, un elemento nuevo delante de otro, una variable de CSS
  y una clase en <body> que nombran ".z li" y ".z", lo hecho por partes es igual que rehacerlo todo.
- Lo que entra directamente en <html> (el <div> con que se mide la barra de desplazamiento) ya no obliga a
  rehacerlo todo aunque haya :nth-child en las hojas. La traza dice también cuánto tarda buscar las imágenes tras
  cada cambio: en la segunda vuelta de freemem.space, 1,5 s (siguiente cosa a mirar).
- Base: 54/54.

### 2026-10-17 — Tarea 33, los vecinos de lo que entra en <html>
- A veces (según cuándo llega el temporizador) el <div> con que jQuery mide la barra de desplazamiento sigue en
  <html> cuando se rehace el estilo: <body> salía como su vecino y, con selectores de hermanos en las hojas, se
  rehacía entero (1,9 s). Lo que entra directamente en <html> ya no toca a sus vecinos (head y body).
- La traza separa buscar las imágenes (15-20 ms) de avanzar las que llegan (lo de 1,5 s era eso: fuentes e
  imágenes que llegaban justo entonces, trabajo que hay que hacer igual).
- freemem.space: 41,2 s y 42,2 s en dos medidas (el estilo de cada vuelta del JavaScript, 0,16 s y 0,05 s).
  Tests de estilo y jsdom: 10/10.
