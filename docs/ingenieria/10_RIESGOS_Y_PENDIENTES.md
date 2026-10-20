# 10. Riesgos y pendientes

Lo que puede fallar, lo que falta y la documentación que no coincide con el código. Revisado contra el commit
`cdfe376` (2026-10-20). El plan vivo es `docs/DASHWEB_LOOP.md`; aquí está la foto para un equipo que empieza.

## 1. Riesgos

Probabilidad e impacto: A (alto), M (medio), B (bajo).

| ID | Riesgo | Prob. | Impacto | Situación y mitigación |
|---|---|---|---|---|
| R-01 | El paquete compila la parte de Dash **sin `--fpu`** (coma flotante por software) y la enlaza con librerías compiladas con FPU. La bitácora (28g, 29b) dice que mezclar las dos formas rompía los números devueltos entre funciones. | M | A | Sin comprobar si algún número con decimales cruza entre las dos partes en el paquete publicado. Mitigación: compilar el paquete con `--fpu`, como los tests. Tarea 40 del plan, antes de la próxima versión. |
| R-02 | Las respuestas HTTP van **enteras a memoria**, también las descargas a disco, las imágenes y el vídeo. Sin tope de tamaño. | M | A | Una descarga grande puede agotar la memoria. Mitigación: escribir a fichero según llega, o un tope con error claro. Tarea 40 del plan. |
| R-03 | El JavaScript **no tiene límite de tiempo** (no hay `JS_SetInterruptHandler`). | M | A | Un bucle infinito en una página cuelga el navegador. Mitigación: cortar el script tras N segundos y decirlo. Tarea 40 del plan. |
| R-04 | El JS retiene cada nodo que toca hasta que se libera la página. | M | M | Páginas que crean y tiran muchos nodos crecen en memoria. Tope de 48 MB por página. |
| R-05 | Webs con frameworks grandes (Next.js) agotan los 48 MB o tardan mucho. | A | M | Los scripts de pre.opentimetrack.com bajaron de 31 s a 6,7 s (37a3). Queda la maqueta: 6,2-7 s cada una, y el JS la rehace entera con cada cambio (37a5). Next.js en commodoremalacca.club agota la memoria (28j). |
| R-06 | Fuera de RTG, las imágenes pasan por picture.datatype (más lento; en 3.0/3.1 no hay V43). | M | M | En RTG hay camino directo (D54). Documentado en el `LEEME`. |
| R-07 | La red se pregunta cada 50 ms: cada paso de red (DNS, conexión, cada ida y vuelta de TLS) espera hasta 50 ms de más. | A | M | D60 da la señal de la red; tarea 39 la usa. En FS-UAE no hay señal y hay que seguir con el tic. |
| R-08 | Nunca probado con una pila TCP/IP real ni en un PiStorm real. | M | M | Debería funcionar (misma `bsdsocket.library`). Prueba manual pendiente. |
| R-09 | diskfont y bullet de 3.2 escriben fuera de su memoria con tamaños de 0 o 1 px. | B | A | Resuelto: Dash pide como mínimo 2 px (D57). Vigilar en otras versiones del sistema. |
| R-10 | Dependencia de Dash, que crece a la vez (otra sesión, otra rama). | M | M | Las tareas D se piden con su porqué y su test; dashweb compila con la rama `dashweb` de Dash. |
| R-11 | YouTube cambia su API a menudo. | A | B | Cuatro clientes de reserva; clave y versión sacadas de la página. |
| R-12 | Todo en Latin-1: los textos de otros alfabetos salen como `?`. | A | M | Decisión de diseño. Tarea 37a4 para el JS. |

## 2. Funcionalidad que falta

| Qué | Requisito | Tarea del plan |
|---|---|---|
| `fetch`, `XMLHttpRequest`, módulos, `customElements`, `MutationObserver` real, `Intl`, Canvas | RF-65 | 32 |
| Geometría real para el JS (`getBoundingClientRect`, `offsetTop`, `scrollY`, `innerWidth`) | RF-66 | 37b |
| Maqueta más rápida, y que un cambio de `style` que no mueve nada (opacity, transform, color) no la rehaga | RNF-06 | 37a5 |
| Eventos `scroll`, `requestAnimationFrame` y repintar sin maquetar | RF-63 | 37c, 37d |
| `IntersectionObserver` que avise | RF-63 | 37e |
| Transformaciones sueltas, `clip-path`, `filter` | RF-48 | 37f |
| WOFF2 y fuentes variables; pesos de las fuentes web | RF-52 | 37g |
| Navegar desde JS (`location.assign`, `location.href`) | RF-67 | — |
| Eventos de teclado, `input`, `change`, `focus` para el JS | RF-63 | — |
| `line-height`, `text-align: justify` | RF-44 | — |
| El texto rodeando los flotantes | RF-47 | 28b |
| Animaciones CSS corriendo (`animacion.dash` existe y no se usa) | RF-50 | 31q |
| `:hover`, `:focus` | RF-43 | — |
| `overflow` con desplazamiento interno, `position: sticky` | RF-46 | — |
| Direcciones `data:` | RF-38 | — |
| `multipart/form-data` | RF-60 | — |
| `<meta charset>` | RF-41 | — |
| Imprimir, guardar la página, estabilidad general | — | 35b, 35d |
| youtube.com entero | RF-73 | 38 |

## 3. Documentación que no coincide con el código

| Dónde | Qué dice | Qué hay |
|---|---|---|
| `docs/quickjs_amiga.md` | El cambio de `malloc` usa "la rama de Emscripten" | Una cabecera de 8 bytes con el tamaño, para que funcione el límite de memoria |
| Cabecera de `lib/maqueta.dash` | `position` "más adelante" | `relative`, `absolute` y `fixed` existen |
| Cabeceras de `lib/video.dash` y `lib/videos.dash` | "Sin sonido todavía" | Hay sonido AAC y MP3 por Paula |
| README | "Reanuda la sesión TLS de cada servidor" | Es cierto, pero el ahorro casi no se nota (D55: 9,0 → 7,9 s por conexión) |
| README | Tabla de medidas | Es del 2026-10-16 (A1200); la actual está en la bitácora |

Todo esto es la tarea 40 del plan (después de la 37).

## 4. Deuda técnica

- `src/dashweb.dash` (1.059 líneas) mezcla interfaz, bucle y lógica de navegación: el historial, los botones y la
  navegación no tienen test automático.
- `lib/maqueta.dash` (4.494 líneas) y `lib/estilo.dash` (2.667) son grandes; la maqueta se rehace entera tras cada cambio
  del JS.
- Una función de dibujo por ventana (`pinta0`..`pinta3`) porque el dibujo de MUI no lleva contexto.
- Cachés globales que no se vacían (fuentes web, fuentes abiertas, selectores leídos).
- `animacion.dash` escrito y probado pero sin conectar.
