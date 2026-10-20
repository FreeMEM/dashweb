# 01. Requisitos

Especificación de requisitos de dashweb. Está escrita a partir del sistema ya construido (commit `cdfe376`): describe lo
que debe hacer y cómo se comprueba, y marca lo que todavía no hace.

**Cómo leer cada requisito**

- **Prioridad:** E (esencial: sin esto no hay navegador), I (importante), D (deseable).
- **Estado:** Hecho, Parcial (con la parte que falta) o Pendiente.
- **Módulos:** dónde está (ver [07](07_MODULOS_E_INTERFACES.md)). **Prueba:** el test de `tests/` que lo comprueba, o
  "manual" (ver [08](08_PLAN_DE_PRUEBAS.md)).

## 1. Alcance

dashweb es un navegador web para AmigaOS 3.x con interfaz MUI. Abre páginas por HTTP y HTTPS, las analiza (HTML5, CSS,
JavaScript), las maqueta y las pinta en una ventana, y permite navegar, rellenar formularios, descargar ficheros y ver
vídeos.

Fuera de alcance (por ahora): pestañas, impresión, guardar la página, extensiones, WebSockets, `fetch`/XHR, WebGL,
Canvas 2D, accesibilidad, varios idiomas de interfaz (es en español), Unicode completo (todo es Latin-1).

## 2. Usuarios y entorno

- **Usuario:** una persona con un Amiga ampliado (PiStorm, tarjeta aceleradora) o un emulador, que quiere ver webs
  actuales.
- **Entorno de uso:** Workbench con MUI, una pila TCP/IP y AmiSSL. Ver RNF-01 a RNF-04.

## 3. Requisitos funcionales

### Navegación

| ID | Requisito | Criterio de aceptación | P | Estado | Módulos | Prueba |
|---|---|---|---|---|---|---|
| RF-01 | Abrir una dirección escrita en el campo de dirección al pulsar Return. | `http://` y `https://` se cargan; sin esquema ni `:` se antepone `http://`; vacío abre la página de inicio. | E | Hecho | `src/dashweb.dash` (`ID_IR`, `navegar`, `abrir`) | manual |
| RF-02 | Abrir ficheros locales con `file:///Volumen/ruta` y rutas del Amiga. | `file:///RAM/a.html` abre `RAM:a.html`. | I | Hecho | `url.dash` (`url_fichero`), `documento.dash` | `test_url` |
| RF-03 | Páginas internas `dashweb:inicio`, `dashweb:marcadores`, `dashweb:cookies`. | Cada una muestra su contenido; `dashweb:cookies?borrar[=dominio]` borra y guarda. | I | Hecho | `src/dashweb.dash` (`abrir`), `marcadores.dash`, `cookies.dash` | `test_marcadores`, `test_cookies` |
| RF-04 | Historial por ventana: atrás, adelante y lista desplegable. | Atrás/adelante cambian de entrada y su icono se apaga si no llevan a ningún sitio; doble clic en la lista abre esa entrada; navegar desde una entrada intermedia descarta las de delante. | E | Hecho | `src/dashweb.dash` (`apuntar`, `botones`) | manual |
| RF-05 | Recargar la página actual. | Vuelve a pedir la entrada del historial que se ve. | E | Hecho | `src/dashweb.dash` (`ID_RECARGAR`) | manual |
| RF-06 | Parar la carga en curso. | Se corta la descarga y la preparación; la página anterior sigue; estado "Parado". | E | Hecho | `src/dashweb.dash` (`parar_carga`) | manual |
| RF-07 | Página de inicio configurable. | "Página de inicio" abre la guardada (o `dashweb:inicio`); "Usar como página de inicio" guarda la actual en `PROGDIR:dashweb.prefs`. | I | Hecho | `marcadores.dash` (`preferencia`, `preferencia_poner`) | `test_marcadores` |
| RF-08 | Marcadores. | "Añadir marcador" guarda dirección y título sin repetir; "Marcadores" abre la lista con enlaces. | I | Hecho | `marcadores.dash` | `test_marcadores` |
| RF-09 | Varias ventanas. | Hasta 4; "Nueva ventana" abre la de inicio desplazada; "Cerrar ventana" cierra la activa; el programa acaba al cerrar la última. | I | Hecho | `src/dashweb.dash` (`nueva_ventana`, `cerrar_ventana`) | manual |
| RF-10 | Seguir enlaces con un clic. | Un clic en un enlace abre su destino resuelto contra la página; un enlace a `#ancla` de la misma página solo desplaza. | E | Hecho | `documento.dash` (`documento_enlace`, `documento_y_de`), `maqueta.dash` (`maqueta_nodo_en`) | `test_navegacion` |
| RF-11 | Desplazar la página. | Barra de desplazamiento, rueda (30 px), flechas (20 px), espacio y retroceso (una pantalla). | E | Hecho | `src/dashweb.dash` (`ID_SCROLL`, `ID_PAGINA`) | manual |
| RF-12 | Abrir direcciones desde el Shell. | Cada argumento abre una ventana (hasta 4); `TRAZA` escribe la línea de tiempo; `GCSIEMPRE` fuerza el GC de JS. | D | Hecho | `src/dashweb.dash` (`Main`) | manual |
| RF-13 | El título de la ventana es el de la página. | "Título - dashweb", o "dashweb" sin título. | I | Hecho | `src/dashweb.dash` (`mostrar`) | manual |

### Información al usuario

| ID | Requisito | Criterio de aceptación | P | Estado | Módulos | Prueba |
|---|---|---|---|---|---|---|
| RF-20 | Barra de estado con lo que está pasando. | "Buscando…", "Conectando con…", "Conexión segura con…", "Recibiendo… N KB", "Trayendo hojas de estilo y scripts: faltan N", "Imágenes: faltan N", "Listo: N bytes en M ms", errores. Como mucho 48 caracteres. | I | Hecho | `src/dashweb.dash` (`dw_estado`, `avanzar_carga`, `tic`) | manual |
| RF-21 | Progreso de la carga. | Barra de progreso visible solo mientras carga; botón "Parar" en lugar de "Recargar". | I | Hecho | `src/dashweb.dash` (`modo_carga`) | manual |
| RF-22 | Indicador de actividad. | Un punto en la barra de herramientas mientras algo llega. | D | Hecho | `src/dashweb.dash` (`actualizar_giro`) | manual |
| RF-23 | Ventana "Acerca de". | Se abre y se cierra desde el menú o su botón. | D | Hecho | `navegador.dashui` (`Acerca`) | manual |
| RF-24 | Globos de ayuda en la barra de herramientas. | Cada botón tiene su texto de ayuda. | D | Hecho | `navegador.dashui` (`help`) | manual |

### Red

| ID | Requisito | Criterio de aceptación | P | Estado | Módulos | Prueba |
|---|---|---|---|---|---|---|
| RF-30 | HTTP/1.1: GET y POST. | Longitud, `chunked`, hasta el cierre; 5 redirecciones (301, 302, 303, 307, 308; tras POST, GET salvo 307/308). | E | Hecho | `http.dash` | `test_http`, `test_http_carga` |
| RF-31 | HTTPS con AmiSSL 5, verificando el certificado. | Una web con certificado válido carga; uno no válido falla con error. | E | Hecho | `red.dash`, runtime de Dash (`tls_*`) | `test_https` |
| RF-32 | Cargas sin bloquear la interfaz. | Nombre, conexión, TLS y recepción avanzan por trozos; la ventana responde y se puede parar. | E | Hecho | `http.dash` (`http_empezar`, `http_avanzar`) | `test_http_carga` |
| RF-33 | Respuestas comprimidas. | `gzip` y `deflate` en textos; lo que va a fichero se pide sin comprimir. | I | Hecho | `http.dash` | `test_http_gzip` |
| RF-34 | Conexiones que se reutilizan. | Hasta 8 libres durante 10 s por servidor, en las cargas sin espera. | I | Hecho | `http.dash` (`http_seguir`) | `test_http_seguir` |
| RF-35 | Cookies (RFC 6265). | Se reciben con `Set-Cookie` y se mandan según dominio, ruta, Secure y caducidad; HttpOnly no las ve el JS; las persistentes se guardan en `PROGDIR:dashweb.cookies`; hasta 300. | I | Hecho | `cookies.dash` | `test_cookies` |
| RF-36 | Descargas a disco. | Si la respuesta es un adjunto o un tipo no visualizable (o una extensión de fichero conocida), se pide la ruta con el selector de ficheros y se baja allí con progreso; la página anterior se queda. | I | Hecho | `documento.dash` (`documento_es_descarga`), `src/dashweb.dash` (`empezar_descarga`) | `test_documento_tipo` (detección); manual |
| RF-37 | No bajar scripts de rastreo. | Los `<script src>` de 20 dominios conocidos no se piden. | D | Hecho | `url.dash` (`url_rastreador`) | `test_url` |
| RF-38 | Direcciones `data:`. | Una imagen `data:` se muestra. | D | Pendiente | — | — |

### Contenido

| ID | Requisito | Criterio de aceptación | P | Estado | Módulos | Prueba |
|---|---|---|---|---|---|---|
| RF-40 | HTML5 como los navegadores. | El árbol de Hubbub: etiquetas mal anidadas, tablas, modos de inserción, entidades. | E | Hecho | `html5.dash` | `test_html5` |
| RF-41 | Juegos de caracteres. | UTF-8, ISO-8859-1 (como cp1252) y Windows-1252 a Latin-1, con sustitutos para lo que no existe. | E | Parcial: `<meta charset>` no se usa; sin cabecera se supone UTF-8 | `texto.dash`, `http.dash` | `test_texto` |
| RF-42 | CSS: cascada completa. | Hojas del navegador, `<style>`, `<link>`, `@import` (4 niveles), `style=`, atributos de presentación; `!important`, especificidad, orden, `@layer`, `@media`, `@supports`, herencia, variables, `calc()`. | E | Hecho | `css.dash`, `estilo.dash` | `test_css`, `test_estilo*` |
| RF-43 | Selectores hasta Selectors 4. | Tipo, clase, id, atributos, combinadores, `:is`, `:where`, `:has`, `:not` con lista, `:nth-*`. | E | Parcial: `:hover`, `:focus`, `:active` nunca se cumplen | `estilo.dash` | `test_selectores4` |
| RF-44 | Maquetación de bloques y líneas. | Márgenes, bordes, relleno, tamaños, alineación (sin `justify`), espacios en blanco, cortes, puntos suspensivos. | E | Parcial: `line-height` no se aplica; `justify` no | `maqueta.dash` | `test_maqueta`, `test_maqueta_texto3` |
| RF-45 | Flexbox, Grid y tablas. | Según sus especificaciones, comparado con Chrome. | E | Hecho | `maqueta.dash` | `test_maqueta_flex`, `test_maqueta_grid`, `test_maqueta_tabla` |
| RF-46 | Posicionado, capas y recorte. | `relative`, `absolute`, `fixed`, `z-index`, `overflow` (recorta). | I | Parcial: `sticky` como `relative`; `overflow` no desplaza | `maqueta.dash` | `test_maqueta_capas` |
| RF-47 | Flotantes. | Se colocan a izquierda y derecha. | I | Parcial: el texto no los rodea | `maqueta.dash` | `test_maqueta_cajas` |
| RF-48 | Transformaciones. | `translate`, `scale`, `matrix`. | D | Parcial: `rotate` solo en barras a 45°; `skew` y 3D no | `maqueta.dash` | `test_maqueta_transform` |
| RF-49 | Colores CSS 4 y 5. | Nombres, hex, `rgb`, `hsl`, `hwb`, `lab`, `lch`, `oklab`, `oklch`, `color()`, `color-mix()`, `light-dark()`. | I | Hecho | `colores.dash` | `test_colores4` |
| RF-50 | Animaciones CSS. | Las animaciones corren en la página. | D | Parcial: solo se ve el estado final; el módulo existe pero no se usa | `animacion.dash` | `test_animacion`, `test_estilo_animacion` |
| RF-51 | Imágenes. | JPEG, PNG, GIF, BMP, WebP, SVG (también dentro de la página) con transparencia; ILBM y otros por datatypes; `srcset`, `<picture>`, `loading=lazy`, fondos con tamaño, posición y repetición, `object-fit`. | E | Hecho | `imagenes.dash`, `imagen_dec.dash`, `pintor.dash` | `test_imagen_dec`, `test_imagenes*`, `test_srcset`, `test_svg_pagina` |
| RF-52 | Fuentes de la web. | `@font-face` con TTF, OTF y WOFF1; Google Fonts. | I | Parcial: sin WOFF2; siempre peso 400 normal | `fuente_web.dash` | `test_fuente_web` |
| RF-53 | Documentos que no son HTML. | Una imagen, un vídeo o un `text/plain` abiertos solos se muestran en una página propia. | I | Hecho | `documento.dash` (`_documento_de_tipo`) | `test_documento_tipo` |

### Interacción con la página

| ID | Requisito | Criterio de aceptación | P | Estado | Módulos | Prueba |
|---|---|---|---|---|---|---|
| RF-60 | Formularios. | Campos de texto (con foco, teclas, retroceso, `maxlength`), casillas, radios por nombre, desplegables, `textarea`, botones; Return envía; GET y POST `x-www-form-urlencoded`. | E | Parcial: sin `multipart` | `formularios.dash` | `test_formularios`, `test_formularios_post` |
| RF-61 | JavaScript ES2023. | QuickJS con FPU y `Math` exacto (fdlibm). | E | Hecho | `js.dash` | `test_js` |
| RF-62 | DOM para JavaScript. | `document`, nodos y elementos, selectores, `innerHTML`, crear y mover nodos, `classList`, `dataset`, `style`, `URL`, `TextEncoder`, `document.cookie`; cada interfaz con su `instanceof` (`HTMLElement`, `SVGElement`, `Text`...), `Window`, `EventTarget`, `attachShadow` (mínimo). jQuery funciona. | E | Hecho | `jsdom.dash`, `jsdom_preludio.js` | `test_jsdom*`, `test_jquery`, `test_js_url`, `test_jsdom_interfaces` |
| RF-63 | Eventos y temporizadores. | `click` (con `preventDefault`), `submit`, `DOMContentLoaded`, `load`, `setTimeout`, `setInterval`, promesas. | E | Parcial: sin teclado, `input`, `change`, `focus`, `scroll`, `resize` | `jsdom.dash`, `jsdom_preludio.js` | `test_jsdom_eventos` |
| RF-64 | Los cambios del JS se ven. | Tras un clic o un temporizador, el estilo se rehace en lo afectado y la página se vuelve a maquetar y pintar. | E | Hecho | `documento.dash` (`documento_al_dia`), `estilo.dash` | `test_estilo_partes` |
| RF-65 | APIs de red para JS. | `fetch`, `XMLHttpRequest`. | I | Pendiente (tarea 32) | — | — |
| RF-66 | Geometría para JS. | `getBoundingClientRect`, `offsetTop`, `scrollY`, `innerWidth` reales. | I | Pendiente (tarea 37b) | — | — |
| RF-67 | Navegar desde JS. | `location.assign`, `location.href = ...`. | I | Pendiente | — | — |

### Vídeo

| ID | Requisito | Criterio de aceptación | P | Estado | Módulos | Prueba |
|---|---|---|---|---|---|---|
| RF-70 | `<video>` en la página. | Un clic reproduce o para; se ve con su proporción; sonido AAC o MP3 por Paula. | I | Hecho | `videos.dash`, `video.dash` | `test_video`, `test_video_cartel` |
| RF-71 | Empezar mientras se baja. | Un MP4 con el índice al principio empieza antes de bajarse entero. | I | Hecho | `videos.dash` | `test_video_bajando` |
| RF-72 | Pantalla completa. | Clic en la esquina del vídeo; espacio para o sigue; Esc o clic sale. | D | Hecho | `src/dashweb.dash` (`pantalla_completa`) | manual |
| RF-73 | Vídeos de YouTube. | El enlace o el `iframe` de YouTube se reproduce (MP4 360p). | D | Hecho | `youtube.dash` | `test_youtube` (sin red) |

## 4. Requisitos no funcionales

| ID | Categoría | Requisito | Cómo se comprueba | Estado |
|---|---|---|---|---|
| RNF-01 | Plataforma | AmigaOS 3.2 (o 3.5/3.9; con 3.0/3.1 sin imágenes fuera de RTG), MUI 3.8 o 5. | Tests en FS-UAE con 3.1 y 3.2; prueba manual en CoffinOS (MUI 3.8). | Hecho |
| RNF-02 | CPU | 68020 o mejor con FPU. Debe seguir compilando sin FPU. | `tools/build_qjs.sh 000`; `./dash` sin `--fpu`. | Hecho (ver riesgo R-01) |
| RNF-03 | Red | Cualquier pila con `bsdsocket.library`; AmiSSL 5 para HTTPS. | Tests con la `bsdsocket` de FS-UAE. | Hecho; sin probar con una pila real |
| RNF-04 | Memoria | Decenas de MB de Fast. El JS de una página, como mucho 48 MB. | `JS_MEMORIA`; medidas de la bitácora. | Hecho |
| RNF-05 | Fluidez | La ventana responde mientras llega una página: se puede desplazar, parar y usar el menú. | Manual; `test_http_carga`. | Hecho |
| RNF-06 | Rendimiento | En la máquina objetivo (68040 + JIT) una página sencilla en menos de 0,5 s; freemem.space entera en menos de 25 s. | `tools/medir_visor.py`. | Hecho (21-23 s) |
| RNF-07 | Memoria limpia | Al cambiar de página se libera todo lo suyo; al salir no queda nada vivo. | `--memcheck` en los tests (0 vivos). | Hecho |
| RNF-08 | Robustez | Un script que falla no para la página ni el navegador; un error de red se muestra. | `test_jsdom*`; manual. | Parcial: un bucle infinito en JS bloquea (R-03) |
| RNF-09 | Robustez | Una descarga grande no agota la memoria. | — | Pendiente: la respuesta entera va a memoria (R-02) |
| RNF-10 | Seguridad | TLS verifica el certificado; cookies por dominio y HttpOnly; el JS de una página no ve otra. | `test_https`, `test_cookies`; un motor JS por página. | Hecho |
| RNF-11 | Compatibilidad | CSS según la especificación, comparado con Chrome; nada a medida de una web. | `tools/comparar_chrome.py` sobre 13 webs. | Hecho (a mano) |
| RNF-12 | Texto | Todo en Latin-1, con sustitutos legibles. | `test_texto`. | Hecho |
| RNF-13 | Instalación | Un `.lha` con instalador (Installer), iconos de Workbench, `LEEME` en Latin-1 y las licencias. Sin consola al abrir desde el icono. | `tools/paquete.sh`; prueba manual. | Hecho |
| RNF-14 | Licencias | Solo código redistribuible con MIT; lo demás se baja aparte. | Revisión de `third_party/`. | Hecho |
| RNF-15 | Mantenibilidad | Escrito en Dash; C solo en `third_party/` y su pegamento; un test por módulo. | Revisión. | Hecho |
| RNF-16 | Usabilidad | Atajos de menú (Amiga+N, K, H, B, D, ?, Q), globos de ayuda, ventanas que recuerdan su sitio. | Manual. | Hecho |

## 5. Restricciones de diseño

- Lenguaje: Dash. Lo que le falte se añade a Dash, no se rodea con C.
- Interfaz: MUI, con la ventana en un `.dashui`.
- Sin hilos de Dash: un proceso principal; el trabajo de C pesado puede ir a otros procesos (`task_start`).
- Pruebas automáticas solo contra servidores locales.
- Máquina objetivo de medida: emulación con JIT, no un 68k real.

## 6. Trazabilidad resumida

| Área | Requisitos | Módulos principales | Tests |
|---|---|---|---|
| Navegación e interfaz | RF-01 a RF-24 | `src/dashweb.dash`, `navegador.dashui`, `documento.dash`, `marcadores.dash` | `test_navegacion`, `test_marcadores`, manual |
| Red | RF-30 a RF-38 | `url`, `red`, `http`, `cookies` | `test_url`, `test_red`, `test_http*`, `test_https`, `test_cookies` |
| HTML y CSS | RF-40 a RF-53 | `html5`, `dom`, `css`, `estilo`, `maqueta`, `pintor`, `imagenes`, `fuente_web` | `test_html5`, `test_css*`, `test_estilo*`, `test_maqueta*`, `test_imagen*` |
| JavaScript | RF-60 a RF-67 | `js`, `jsdom`, `formularios` | `test_js*`, `test_jsdom*`, `test_jquery`, `test_formularios*` |
| Vídeo | RF-70 a RF-73 | `videos`, `video`, `youtube` | `test_video*`, `test_youtube` |
