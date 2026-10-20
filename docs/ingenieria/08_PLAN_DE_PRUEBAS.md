# 08. Plan de pruebas

Cómo se comprueba que dashweb cumple los requisitos de [01](01_REQUISITOS.md): niveles de prueba, entornos, el
catálogo de tests automáticos, las pruebas manuales de aceptación, las de rendimiento y los criterios para publicar
una versión.

## 1. Estrategia

| Nivel | Qué | Cómo | Dónde |
|---|---|---|---|
| Unidad / módulo | Cada módulo de `lib/` por separado, sin ventana: texto de entrada, salida esperada | `tests/test_*.dash` con `# expect-out:` | FS-UAE, A1200 + 68882, Workbench 3.1 |
| Integración | Varios módulos con red local: HTTP, HTTPS, recursos, imágenes, JS con DOM, jQuery | Los mismos tests con `# emu-server:` (servidores Python en el PC) | FS-UAE con `bsdsocket_library = 1` |
| Memoria | Nada vivo al salir; sin dobles liberaciones ni usos tras liberar | `# memcheck` en cada test, o `run.py --memcheck` | FS-UAE |
| Sistema | El navegador entero con páginas de prueba y webs reales | `tools/medir_visor.py --programa src/dashweb.dash --captura` | FS-UAE "rtg" (68040 + JIT, 3.2, RTG) |
| Compatibilidad | La maqueta frente a Chrome | `tools/comparar_chrome.py` sobre `tools/webs_prueba.txt` (13 webs) | PC + FS-UAE |
| Rendimiento | Tiempos por fase y carga entera | `tools/medir_visor.py --traza --perfil` | FS-UAE "objetivo" y "rtg" |
| Aceptación | Lo que ve y hace el usuario | Lista manual (apartado 5) | FS-UAE y un sistema real (CoffinOS con MUI 3.8) |

**Reglas:**

- Las pruebas automáticas nunca usan webs de terceros: solo servidores locales (`tests/servers/`).
- Sin `DASH_KICKSTART` FS-UAE arranca con AROS y los resultados no valen.
- Nada que funcionaba puede romperse: la batería entera antes y después de cada cambio.
- Un fallo intermitente se da por arreglado con N cargas limpias seguidas (por ejemplo, 20 de 20).

## 2. Entornos

| Nombre | Máquina emulada | Sistema | Para qué |
|---|---|---|---|
| a1200 | 68020 + 68882, 14 MHz | Workbench 3.1 (`sys31`, `sys31ssl`, `sys31mui`) | La batería de tests |
| objetivo | 68040 + JIT a toda velocidad | 3.1 con fuentes y AmiSSL (`sys31muisslweb`) | Medir "como un PiStorm" |
| rtg | 68040 + JIT, 128 MB, RTG 1024x768x16 | AmigaOS 3.2 con MUI 5 (`sys32rtg`) | Pruebas de sistema, medidas, capturas |
| rtg38 | Igual | 3.2 con MUI 3.8 (`sys32rtg38`) | Compatibilidad con MUI 3.8 |
| CoffinOS | Amiberry | CoffinOS, MUI 3.8 | Prueba manual del usuario |

Variables: `DASH_KICKSTART`, `DASH_KICKSTART_32`, `DASH_EMU_SYS`, `DASH_EMU_SYS_MUI`, `DASH_EMU_SYS_SSL`,
`DASH_EMU_SYS_32_SSL` (ver [09](09_ENTORNO_CONSTRUCCION_Y_ENTREGA.md)).

## 3. Batería automática

```bash
python3 tests/run.py              # todos: compila con --fpu y ejecuta en FS-UAE
python3 tests/run.py url -v       # solo los que contienen "url", con la salida de los que fallan
python3 tests/run.py --memcheck   # todos con la comprobación de memoria
python3 tests/run.py --no-emu     # solo compilar
```

`run.py` además compila `src/`, construye `libqjs`/`libvideo` si faltan y comprueba que `lib/jsdom_preludio.dash` está
al día con `lib/jsdom_preludio.js`.

Directivas de un test (en sus primeras líneas):

| Directiva | Qué hace |
|---|---|
| `# expect-out: línea` | Una línea esperada de la salida, en orden |
| `# memcheck` | Se compila siempre con `--memcheck`; su resumen va en las líneas esperadas |
| `# dash-flags: ...` | Opciones de `./dash` (p. ej. `--stack 65536`) |
| `# cflags: ...` | Opciones u objetos de gcc |
| `# emu-config: clave = valor` | Opción de FS-UAE; los tests con las mismas comparten arranque |
| `# emu-needs: x.library` | Se salta si el sistema emulado no la tiene |
| `# emu-server: script.py PUERTO` | Arranca `tests/servers/script.py` en el PC y da red al Amiga |

## 4. Catálogo de tests automáticos

Generado de las cabeceras con `docs/ingenieria/herramientas/gen_tests.py` (commit `cdfe376`).

| Test | Qué comprueba | Red local | Otras condiciones | Requisitos |
|---|---|---|---|---|
| `test_animacion` | lib/animacion.dash (tarea 31q, paso 1): una animación con el atajo (1s linear, 0.5s de retardo, 2 vueltas, alternate, forwards) y sus fotogramas: en qué punto va (nada antes del retardo, a la ida, a la vuelta, y acabada donde termina: alternate con 2 vueltas acaba al principio), los valores entre fotogramas (opacity con un fotograma en medio, translateX, un color), ease y steps. | — | memcheck | RF-50 |
| `test_colores4` | CSS Color 4 y 5 (tarea 31n): hsl, hwb, oklab, oklch, lab, lch, color(), color-mix(), light-dark(), #rgba, los nombres (rebeccapurple) y los del sistema, y la opacidad de cada uno (css_alfa). | — | memcheck | RF-49 |
| `test_cookies` | lib/cookies.dash y las cookies de lib/http.dash (tarea 35a). | http.py | memcheck | RF-35 |
| `test_css` | lib/css.dash: reglas, listas de selectores, especificidad, combinadores, atributos, pseudo, !important, comentarios, @media, @import, @font-face saltado, atributo style. | — | memcheck | RF-42 |
| `test_css_escapes` | escapes de CSS en los selectores (tarea 37a1, CSS Syntax 3): "\" y un carácter (".md\:grid-cols-12", ".h-\[1\.35em\]", ".w-1\/2") y "\" con cifras hex (".\31 0" es la clase "10"), como los pone Tailwind; dentro de @layer y @media, con la especificidad de una clase, y desde querySelector. | — | memcheck | RF-43 |
| `test_documento_tipo` | lib/documento.dash con algo que no es HTML. | http.py | memcheck | RF-53, RF-36 |
| `test_dom` | lib/dom.dash: html/head/body implícitos, cierres implícitos, vacíos, tablas, listas, cierres sueltos, texto seguido, búsquedas; el árbol se libera entero (padres weak). | — | memcheck | RF-40 |
| `test_estilo` | lib/estilo.dash: hoja del navegador, &lt;style&gt;, atributo style, especificidad, orden, !important, herencia, inherit, atajos (margin, border, font, background), font-size en px, selectores con combinadores y pseudo-clases, estilo_px; el índice de selectores (clase, id, etiqueta, universal; ::before y :hover fuera), @media por ancho, el texto solo para lectores y css_importes. | — | memcheck | RF-42 |
| `test_estilo_animacion` | Animations (tarea 31m): sin animar, se pinta el estado en que se queda la animación. | — | memcheck | RF-50 |
| `test_estilo_calc` | calc(), min(), max(), clamp() y las unidades vw, vh, vmin, vmax, ch y rem (tarea 31c), con estilo_px: 100 % = 600 px, 1em = 16 px, la página de 600x400 y 1rem = el font-size de &lt;html&gt; (20px en la página de abajo). | — | memcheck | RF-42 |
| `test_estilo_capas` | @layer y @supports (tarea 31p). | — | memcheck | RF-42 |
| `test_estilo_enlaces` | estilo_hojas carga &lt;link rel=stylesheet&gt; por HTTP con su @import (URL relativa a la página) | http.py | — | RF-42 |
| `test_estilo_partes` | estilo_aplicar_partes (tarea 33): tras los cambios del JavaScript (clases, un nodo nuevo delante de otro, una variable de CSS que cambia en un antecesor) se rehace solo lo que cuelga de los nodos cambiados, y el resultado es el mismo que rehaciendo todo. | — | memcheck | RF-64 |
| `test_estilo_vars` | lib/estilo.dash más rápido (tarea 26): las propiedades --x van aparte y un hijo comparte las de su padre mientras no cambien (un *{--x} que repite el mismo valor no copia nada); una --x que ningún var() nombra no se guarda, salvo en el atributo style; var() con respaldo, anidado y en otra --x; los atajos partidos una vez por regla (margin, border) con el orden de las declaraciones, y con var() después de sustituirla (también en el atributo style); un ::before solo si su regla con content se cumple; estilo_px con unidades en mayúsculas y blancos. | — | memcheck | RF-42, RNF-06 |
| `test_formularios` | lib/formularios.dash y los controles en la maqueta. | — | memcheck | RF-60 |
| `test_formularios_post` | formularios por POST (http_empezar_post, formulario_envio), textarea y el formulario visto desde JavaScript (.value, .checked, onsubmit con preventDefault, form.submit()). | http.py | memcheck | RF-60, RF-63 |
| `test_fuente_web` | lib/fuente_web.dash (tarea 31h): Bitstream Vera Sans Mono (tests/pages/VeraMono.ttf, su licencia al lado) hecha TextFont del Amiga a 20 px de em: alto 24 (ascendente 19 + descendente 5), todas las letras del mismo ancho (12), "abc" tres veces una, y un fichero que no es una fuente da 0; en WOFF, igual. | http.py | memcheck | RF-52 |
| `test_hola` | the runner compiles and runs in the emulator. | — | — | — |
| `test_html5` | lib/html5.dash (tarea 36): el árbol de Hubbub. | — | memcheck | RF-40 |
| `test_html_tokens` | lib/html.dash (tokenizador): etiquetas, atributos con y sin comillas, autocierre, comentarios, DOCTYPE, entidades, script/style crudos, CDATA, &lt;?xml?&gt;, HTML roto. | — | memcheck | RF-40 |
| `test_http` | lib/http.dash contra tests/servers/http.py | http.py | — | RF-30 |
| `test_http_carga` | HTTP sin esperar (http_empezar, http_avanzar, http_cancelar de lib/http.dash). | http.py | memcheck | RF-32 |
| `test_http_gzip` | gzip y deflate en lib/http.dash (tarea 33b). | http.py | memcheck | RF-33 |
| `test_http_seguir` | conexiones que siguen abiertas (keep-alive, tarea 28h). | http.py | memcheck | RF-34 |
| `test_https` | HTTPS con lib/http.dash contra tests/servers/http.py en modo TLS (certificado para 127.0.0.1 firmado por la CA de prueba del sistema con AmiSSL) | http.py | emu-needs amisslmaster.library | RF-31 |
| `test_imagen_dec` | lib/imagen_dec.dash, los decodificadores propios (sin pantalla): JPEG normal con TJpgDec, JPEG progresivo, PNG con alfa, GIF (siempre con alfa: puede tener transparencia) y BMP con stb_image; uno grande reducido al decodificar (2048x1024 a lo que cabe en 600x300: TJpgDec a 1/2, 1024x512) y un fichero que no es imagen. | http.py | memcheck | RF-51 |
| `test_imagenes` | lib/imagenes.dash y el pintor con imágenes. | http.py | memcheck | RF-51 |
| `test_imagenes_carga` | imágenes sin esperar (imagenes_pedir, imagenes_avanzar de lib/imagenes.dash): las descargas empiezan y el programa sigue (con el servidor en el PC suelen llegar ya en la primera vuelta); al llegar, los &lt;img&gt; sin tamaño toman el real (dos con el mismo src, uno con width) y la que no existe queda en 0. | http.py | memcheck | RF-51, RNF-05 |
| `test_jquery` | jQuery 3.7.1 (tests/pages/jquery-3.7.1.min.js, licencia MIT) sobre lib/jsdom.dash. | http.py | memcheck | RF-62 |
| `test_js` | lib/js.dash (QuickJS enlazado con @link). | — | — | RF-61 |
| `test_js_url` | URL y URLSearchParams en el JavaScript de las páginas (tarea 37a2; el runtime de Turbopack de Next.js los usa al empezar). | — | memcheck | RF-62 |
| `test_jsdom` | lib/jsdom.dash. | http.py | memcheck | RF-62 |
| `test_jsdom_eventos` | eventos y temporizadores de lib/jsdom.dash, y maqueta_nodo_en. | — | memcheck | RF-63, RF-10 |
| `test_jsdom_interfaces` | lo que pidió el JavaScript de Next.js en pre.opentimetrack.com (tarea 37a3): cada interfaz con su instanceof (HTMLIFrameElement no es todo elemento; SVGElement, Text, Window, EventTarget), classList como lista (Array.from, for...of, [0]), attachShadow, PromiseRejectionEvent (sin él core-js cambia el Promise de QuickJS por el suyo) y selectores largos desde querySelector uno tras otro (la caché de longitudes de Dash y los textos de C). | — | memcheck | RF-62 |
| `test_jsdom_texto` | TextEncoder y TextDecoder del preludio de jsdom (tarea 28i; los pide el webpack de Next.js). | — | memcheck | RF-62 |
| `test_maqueta` | lib/maqueta.dash con la topaz 8 de la ROM (el sistema de pruebas no tiene más fuentes: todas las letras miden 8x8): bloques, márgenes que se funden, cortes de línea, alineación, negrita/enlace en la misma línea, br, listas, tabla, fondo, borde, pre, imagen, sin corte entre piezas pegadas. | — | memcheck | RF-44 |
| `test_maqueta_cajas` | lib/maqueta.dash, la colocación de cajas que pidió freemem.space (tarea 28) con la topaz 8 (letras de 8x8): float left/right en filas (con anchos en % del contenedor, no de la caja), lo que no flota debajo; inline-block con bloques dentro como un flotante; position absolute (bottom y right) respecto al padre; min-height; max-width con margin auto; visibility: hidden (ocupa sitio, no se pinta); una imagen de fondo (D_FONDO); un fondo rgba con su opacidad (se mezcla al pintar). | — | — | RF-47 |
| `test_maqueta_capas` | z-index y overflow (tarea 31e). | — | memcheck | RF-46 |
| `test_maqueta_css` | lib/estilo.dash y lib/maqueta.dash con lo que pidió freemem.space (tareas 28d y 28e), con la topaz 8 (letras de 8x8): ::before y ::after con texto, var() de una propiedad --x heredada, un icono de Font Awesome (content "\f002": D_ICONO), un inline-block en una línea centrada (una pieza: no flota), un inline-block que no se corta entre líneas, un absoluto sin top ni left en su sitio (tras el relleno), border-radius 50 % (D_ELIPSE, rellena o con borde), una barra girada 45 grados (D_TRAZO) y translate en px y en %; linear-gradient (D_DEGRADADO: dirección y el primer y último color con su alfa; también -webkit-linear-gradient, el de freemem.space). | — | memcheck | RF-42, RF-44 |
| `test_maqueta_flex` | flexbox (tarea 31b). | — | memcheck | RF-45 |
| `test_maqueta_grid` | grid (tarea 31d). | — | memcheck | RF-45 |
| `test_maqueta_tabla` | tablas (tarea 31g) y atributos de presentación de HTML. | — | memcheck | RF-45 |
| `test_maqueta_texto3` | CSS Text 3 (tarea 31o) con la fuente de 8 px: white-space: nowrap deja las cuatro palabras en una línea (sin él, cuatro líneas); overflow-wrap: break-word parte una palabra de 26 letras en líneas de 40 px (5 letras); text-overflow: ellipsis en una caja de 60 px que recorta deja "aaaa..."; text-shadow: 1px 2px 0 red pone una copia roja del texto un px a la derecha y dos más abajo. | — | memcheck | RF-44 |
| `test_maqueta_transform` | transform completo (tarea 31l). | — | memcheck | RF-48 |
| `test_marcadores` | lib/marcadores.dash. | — | memcheck | RF-07, RF-08 |
| `test_navegacion` | lo que usa la navegación del navegador (lib/documento.dash): el enlace que contiene a un nodo (resuelto contra la dirección de la página; javascript: no cuenta), dónde empieza un id o un &lt;a name&gt; en la página maquetada, y quitar o sacar el fragmento de una dirección. | — | memcheck | RF-10 |
| `test_recursos` | lib/recursos.dash. | http.py | memcheck | RF-42, RNF-05 |
| `test_red` | lib/red.dash contra tests/servers/lineas.py (líneas, trozos, hasta el cierre, eco) | lineas.py | — | RF-30 |
| `test_selectores4` | Selectors 4 (tarea 31k): :is(), :where(), :has() (&gt; + ~ y descendiente), :not() con lista, :nth-last-of-type(); su especificidad (:where cuenta 0, :is la de su argumento más específico) y querySelectorAll con :is() desde JavaScript (ami64.com lo usa). | — | memcheck | RF-43 |
| `test_srcset` | dom_img_src (lib/dom.dash): la imagen de un srcset con descriptores w para el ancho del &lt;img&gt; (o DOM_IMG_ANCHO), la mayor si todas se quedan cortas, la de 1x con descriptores x, sin las de formatos que no se leen (avif, jxl), una dirección con comas, un &lt;source&gt; de &lt;picture&gt; con un tipo que se lee y sin srcset el src; imagenes_vista (lib/imagenes.dash), el tamaño al que se ve cada imagen para decodificarla a ese tamaño. | — | memcheck | RF-51 |
| `test_svg_pagina` | SVG dentro de la página (tarea 31i). | — | memcheck | RF-51 |
| `test_texto` | lib/texto.dash: UTF-8 y Windows-1252 a Latin-1, sustitutos, entidades HTML. | — | — | RF-41, RNF-12 |
| `test_url` | lib/url.dash. | — | — | RF-01, RF-02, RF-37 |
| `test_video` | lib/video.dash, el núcleo de MintVID (tarea 30): un MP4 con H.264 (160x48, 10 imágenes a 10 por segundo, rojo a la izquierda y azul a la derecha, hecho con ffmpeg) traído por HTTP: sus códecs, tamaño, imágenes por segundo, cada imagen con su instante y el color de dos píxeles; un fichero que no es vídeo; uno con sonido AAC (su decodificador y la salida por Paula se abren). | http.py | emu-config cpu = 68030; emu-config zorro_iii_memory = 65536; memcheck | RF-70 |
| `test_video_bajando` | un vídeo que empieza mientras se baja (tarea 30f). | http.py | emu-config cpu = 68030; emu-config zorro_iii_memory = 65536; memcheck | RF-71 |
| `test_video_cartel` | el cartel de un vídeo antes de reproducirlo. | http.py | memcheck | RF-70 |
| `test_youtube` | lib/youtube.dash sin red (las partes que no preguntan a YouTube): el identificador de las direcciones de YouTube (watch, embed, youtu.be, shorts, nocookie; otra web no), dom_es_youtube, el MP4 de 360p (itag 18, con los & de JSON) de una respuesta del reproductor guardada en tests/pages, sin MP4 y la configuración de una página ("INNERTUBE_API_KEY"). | http.py | memcheck | RF-73 |

**Cobertura que falta** (no hay test automático): el programa `src/dashweb.dash` en sí (bucle, historial, botones,
varias ventanas, descargas, pantalla completa), las páginas `dashweb:`, el envío por Return desde la interfaz, el
bloqueo de rastreadores dentro de una carga real y el paquete. Se prueban a mano (apartado 5) o con
`medir_visor.py --acciones` (clics, teclas y menús programados con `tools/amiga/clicar.dash`).

## 5. Pruebas manuales de aceptación

Antes de publicar una versión, en la máquina rtg y en rtg38 (MUI 3.8):

| ID | Prueba | Resultado esperado | Requisitos |
|---|---|---|---|
| PA-01 | Abrir dashweb desde su icono | Sin ventana de consola; se ve la página de inicio | RNF-13, RF-03 |
| PA-02 | Escribir `aminet.net` y Return | Se completa con `http://`; mensajes de fase en la barra; "Listo" | RF-01, RF-20 |
| PA-03 | Abrir una web HTTPS | Carga; mensaje "Conexión segura con" | RF-31 |
| PA-04 | Pulsar Parar durante una carga | Se para; la página anterior sigue; "Parado" | RF-06 |
| PA-05 | Seguir tres enlaces, Atrás dos veces, Adelante una | Cada página correcta; iconos encendidos o apagados según toque | RF-04, RF-10 |
| PA-06 | Mostrar el historial y hacer doble clic en una entrada | Abre esa entrada | RF-04 |
| PA-07 | Rellenar un formulario de búsqueda y pulsar Return | Llegan los resultados (GET) | RF-60 |
| PA-08 | Enviar un formulario POST | Respuesta correcta | RF-60 |
| PA-09 | Bajar un `.lha` | Pide la ruta; progreso; "Guardado en"; el fichero está entero | RF-36 |
| PA-10 | Añadir un marcador y abrir Marcadores | Aparece con su título | RF-08 |
| PA-11 | Usar como página de inicio, salir y volver a entrar | Abre esa página | RF-07 |
| PA-12 | Una web con cookies; salir; volver; `dashweb:cookies`; borrar | Las cookies persisten y se borran | RF-35 |
| PA-13 | Nueva ventana hasta 5 veces | La quinta da "Como mucho 4 ventanas" | RF-09 |
| PA-14 | Un vídeo MP4 y uno de YouTube; pausa; pantalla completa | Imagen y sonido; pausa y sigue; Esc vuelve | RF-70 a RF-73 |
| PA-15 | Desplazar con rueda, flechas, espacio y retroceso | Se mueve lo esperado | RF-11 |
| PA-16 | Cambiar el tamaño de la ventana | Se vuelve a maquetar al ancho nuevo | RF-44 |
| PA-17 | Salir con Amiga+Q durante una carga | Cierra sin colgarse | — |

## 6. Rendimiento y memoria

| ID | Medida | Cómo | Objetivo | Último resultado |
|---|---|---|---|---|
| PR-01 | `prueba.html` (8,8 KB), carga a pintada | `medir_visor.py --pagina prueba.html --maquina objetivo` | < 0,5 s | ~0,4 s (2026-10-16) |
| PR-02 | freemem.space entera, con imágenes y fuentes | `medir_visor.py --maquina rtg --programa src/dashweb.dash --pagina https://freemem.space/` | < 25 s | 21-23 s (2026-10-20) |
| PR-03 | Estabilidad | 20 cargas seguidas de PR-02 | 20 de 20 limpias | 20 de 20 (2026-10-20) |
| PR-04 | Memoria de una página sencilla | Salida de `medir_visor.py` | < 1 MB | ~350 KB |
| PR-05 | Memoria limpia | `run.py --memcheck` | 0 vivos | 0 |
| PR-07 | JavaScript de pre.opentimetrack.com | `medir_visor.py --maquina rtg --traza` | Bajar | 6,7 s (2026-10-20; eran 31 s) |
| PR-06 | Vídeo 640x360 | `medir_visor.py` con `video.html` | Sonido sin cortes | ~9 imágenes/s |

Para saber dónde se va el tiempo: `--traza` (línea de tiempo de la carga) y `--perfil` (`./dash --profile`: llamadas y
tiempo por función).

## 7. Compatibilidad con Chrome

`tools/comparar_chrome.py` maqueta cada web de `tools/webs_prueba.txt` en Chrome sin ventana a 940x614 (el tamaño de
la zona de página en la máquina rtg) y en dashweb, y junta las dos capturas. La comparación es visual y a mano. Regla:
CSS según su especificación, nada a medida de una web.

## 8. Criterios para publicar una versión

1. `python3 tests/run.py` pasa entero, también con `--memcheck`.
2. Las pruebas PA-01 a PA-17 pasan en rtg y en rtg38.
3. PR-02 dentro del objetivo y PR-03 con 20 de 20.
4. `tools/paquete.sh` hace el `.lha`; se instala con su instalador en un sistema limpio.
5. El README y el `LEEME` dicen lo que hace y lo que necesita.
