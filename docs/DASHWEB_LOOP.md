# dashweb: plan de trabajo (para `/loop`)

Arranque (desde cualquier directorio):

```
/loop Sigue las instrucciones de ~/Projects/dashweb/docs/DASHWEB_LOOP.md: haz UNA tarea y actualiza la bitácora. No hagas pausas entre vuelta y vuelta
```

## Objetivo

Un navegador ligero para AmigaOS 3.x escrito en Dash, con interfaz MUI 5: XHTML, CSS, JavaScript
(QuickJS, ya portado en `third_party/quickjs`) y HTTPS (AmiSSL).

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
   - Si las tareas 1-11 están todas `[x]` y la fase B aún no está "abierta" en la bitácora: actualiza el clon
     de Dash (regla 3), apunta en la bitácora "Fase B abierta" y avisa con PushNotification. Desde ahí
     las tareas de la fase B ya se pueden coger.
   - Si no quedan tareas `[ ]` de la fase A y MUI no ha terminado: no hagas nada más. Programa la siguiente
     vuelta con ScheduleWakeup a 1800 s (`noop: true`) y termina.
2. **Rama.** Trabaja en `~/Projects/dashweb`, rama local `dev` (sale de `main`). Sin push.
3. **Dash.** **No toques `~/Projects/FreeMEMLang`**: otra sesión trabaja ahí, en la misma copia. Compila
   con un clon propio: `~/.cache/dashweb/dash` (`git clone -b mui ~/Projects/FreeMEMLang ~/.cache/dashweb/dash`).
   Para actualizarlo: `git -C ~/.cache/dashweb/dash pull`. Solo trae commits ya hechos, nunca cambios a medio
   hacer. Variable `DASH=~/.cache/dashweb/dash`. Si a Dash le falta algo, no lo cambies: apúntalo en
   `docs/DASH_NECESIDADES.md` (qué, para qué, rodeo usado) y sigue con un rodeo (`@native`, `@extern`).
   Para enlazar objetos de C (QuickJS) con un programa Dash: `DASH_CFLAGS="... ficheros.o"`.
4. **Base.** `python3 tests/run.py` (cuando exista) antes de empezar. Anota si cambia respecto a la última entrada.
5. **Tarea.** Coge la primera tarea `[ ]` de la fase abierta. Márcala `[~]` mientras trabajas. Una por
   iteración. Si es grande, divídela en la lista y haz solo la primera parte.
6. **Hacer.** Código del navegador en Dash (`src/`), módulos reutilizables en `lib/`, C solo donde haga
   falta (`@native`, `third_party/`). Cada cosa con su test en `tests/`, ejecutado en el emulador.
   Entorno (no va al repo):
   `export DASH_KICKSTART="/home/freemem/Descargas/Telegram Desktop/ks31a1200.rom"`,
   `DASH_EMU_SYS=~/.cache/dash-emu/sys31`, para MUI `DASH_EMU_SYS_MUI=~/.cache/dash-emu/sys31mui`.
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

## Tareas

### Fase A: sin MUI

- [ ] 1. **Base del repo.** Clon de Dash (regla 3). `tests/run.py`: compila `tests/test_*.dash` con
      `$DASH/dash --fpu` y los ejecuta en FS-UAE con `$DASH/tools/emu_run.py`, comparando con sus
      `# expect-out:` (como el runner de Dash). Un test trivial. `CLAUDE.md` de dashweb (corto: qué es,
      comandos, reglas de este fichero). `.gitignore` de `build/`.
- [ ] 2. **Arquitectura.** `docs/ARQUITECTURA.md`: módulos (red, URL, HTTP, TLS, texto, HTML, DOM, CSS,
      estilo, maquetación, dibujo, imágenes, JS, interfaz), qué va en Dash y qué en C, quién es dueño de la
      memoria de cada cosa, cómo se pasa de una fase a otra (bytes → tokens → DOM → estilo → cajas → dibujo).
      Repasa qué tiene Dash hoy (structs, listas, textos, `@native`, contador de referencias) y apunta lo
      que falte en `docs/DASH_NECESIDADES.md` (por ejemplo diccionarios, búferes de bytes, recursión profunda).
- [ ] 3. **URL.** Analizar y resolver URLs relativas (subconjunto de RFC 3986: esquema, host, puerto,
      ruta, consulta, fragmento; `..` y `.`). Tests con casos raros.
- [ ] 4. **Texto.** UTF-8 a Latin-1 (el juego de caracteres del Amiga), con sustituto para lo que no
      exista; entidades HTML (`&amp;`, `&#233;`, `&eacute;`...). Tests.
- [ ] 5. **TCP.** Módulo de sockets sobre `bsdsocket.library` (abrir, conectar con DNS, enviar, recibir,
      cerrar, tiempo límite) y modo sin bloqueo con `WaitSelect` y señales, para el bucle de eventos de la
      fase B. Test en FS-UAE con `bsdsocket_library = 1` contra un servidor Python local.
- [ ] 6. **HTTP/1.1.** GET con cabeceras, `Content-Length`, `chunked`, redirecciones (máx. 5),
      `Content-Type` y juego de caracteres, errores. Tests contra un servidor local que cubra cada caso.
- [ ] 7. **HTTPS.** AmiSSL 5 para OS3: script que lo descarga a `~/.cache` y lo mete en el sistema
      emulado; conexión TLS con verificación de certificado. Test contra un servidor HTTPS local con una CA
      propia. Si hace falta decidir algo de licencias o versiones, `[?]`.
- [ ] 8. **Tokenizador HTML.** Etiquetas, atributos (con y sin comillas), texto, comentarios, `DOCTYPE`,
      entidades, `<script>`/`<style>` como texto crudo. Tolerante con HTML mal formado; XHTML también.
- [ ] 9. **Árbol DOM.** Nodos (elemento, texto, comentario), etiquetas implícitas (`html`, `head`, `body`),
      cierres implícitos (`p`, `li`, `td`...), elementos vacíos (`br`, `img`...). Tests con páginas reales
      pequeñas guardadas en `tests/pages/`.
- [ ] 10. **CSS: lectura.** Tokenizador y analizador: reglas, selectores (tipo, clase, id, descendiente,
      hijo, atributo, `:hover` ignorado), declaraciones, `!important`, `@media` (solo `screen`/`all`),
      hojas `<style>` y `<link rel=stylesheet>` (vía HTTP).
- [ ] 11. **CSS: estilo.** Selección de elementos, cascada (origen, especificidad, orden), herencia,
      hoja por defecto del navegador, atributo `style`. Estilo calculado por nodo para las propiedades que
      se vayan a usar (display, colores, fuente, márgenes, relleno, bordes, ancho/alto, alineación, listas).
- [ ] 12. **Maquetación.** Cajas de bloque y en línea, cortes de línea con las medidas de la fuente
      (`TextLength`), márgenes/relleno/bordes, anchos y altos, listas. Sale una lista de cosas que dibujar.
      Tablas y `float`, más adelante (añadir tareas si hace falta).
- [ ] 13. **Dibujo y visor sin MUI.** Dibujar esa lista en una ventana normal de Intuition con los
      builtins `gfx_` de Dash (texto, rectángulos, bordes, colores). Programa `src/visor.dash`: abre un
      fichero HTML local, lo pinta y hace scroll con teclas. Captura de pantalla en el emulador. Medir el tiempo
      de cada fase en la configuración "objetivo" (regla 6).
- [ ] 14. **Imágenes.** Datatypes (PNG, GIF, JPEG) a bitmap y dibujarlas en la página; `width`/`height`
      del HTML; imágenes que llegan por HTTP.
- [ ] 15. **QuickJS enlazable.** Compilar QuickJS como objetos que se enlazan con un programa Dash
      (`tools/build_qjs.sh` con modo librería), fdlibm para que `Math.*` sea exacto (ver
      `docs/quickjs_amiga.md`), y un módulo `lib/js.dash` con `@native`: crear el motor, evaluar, errores,
      `console.log`. Test.
- [ ] 16. **DOM en JavaScript.** `document`, `getElementById`, `querySelector(All)` (con el selector
      de CSS de la tarea 11), `textContent`, `innerHTML`, `createElement`, `appendChild`, `setAttribute`,
      `addEventListener` (clic), `setTimeout`/`setInterval` (cola de temporizadores). Volver a maquetar
      tras los cambios. Tests en JS dentro de páginas de `tests/pages/`.
- [ ] 17. **Repaso de la fase A.** Tamaño del ejecutable, memoria (`--memcheck`), tiempos por fase en la
      configuración objetivo y en el A1200, páginas de prueba. Resumen en la bitácora y en el README.

### Fase B: con MUI (cuando la regla 1 la abra)

- [ ] 18. **Ventana del navegador.** Con la API de MUI de Dash (`docs/MUI_DISEÑO.md` del clon): barra
      de URL, atrás/adelante/recargar, barra de estado y de progreso. La zona de página es la clase de dibujo
      propia de MUI (su tarea 7) pintando con el código de la tarea 13.
- [ ] 19. **Navegación.** Clic en enlaces, historial, recargar, scroll con ratón y teclado, título de la
      ventana, errores de red mostrados en la página.
- [ ] 20. **Bucle de eventos.** Red y temporizadores de JS con `mui_wait_event_signals`: las páginas se
      cargan sin congelar la interfaz y se pueden cancelar.
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
