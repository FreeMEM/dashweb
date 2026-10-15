# Arquitectura de dashweb

Tarea 2 de `docs/DASHWEB_LOOP.md` (2026-10-15). Se irá corrigiendo según se construya.

## Principios

- **Todo en Dash.** dashweb es el banco de pruebas de Dash: lo que le falte a Dash se le añade (tareas
  `D<n>`). C solo en `third_party/` (QuickJS) y en su pegamento.
- **Objetivo: PiStorm y emulación con JIT**, 68020 + FPU. Se diseña para que sea correcto y sencillo
  antes que rápido en un 68k real, sin derrochar: nada cuadrático en el tamaño de la página.
- **Una página = un `Documento`** que es dueño de todo lo suyo (bytes, DOM, hojas de estilo, cajas, lista
  de dibujo, contexto JS). Al cambiar de página se libera entero.
- **Cada fase es un módulo con su test**, que se prueba solo, sin las demás (texto de entrada → salida
  impresa con `# expect-out:`).

## Flujo de una página

```
URL ──► carga (file:, http:, https:) ──► bytes + tipo y juego de caracteres
     ──► texto (UTF-8/Latin-1 → Latin-1 del Amiga)
     ──► tokenizador HTML ──► constructor del árbol ──► DOM
     ──► hojas de estilo (navegador + <style> + <link>) ──► reglas
     ──► estilo calculado por elemento
     ──► maquetación (cajas de bloque y líneas) ──► lista de dibujo
     ──► pintor (gfx_ sobre un RastPort): ventana normal (fase A) o zona MUI (fase B)
JS: <script> ──► QuickJS (contexto por página) ──► cambios en el DOM ──► estilo/maquetación de nuevo
```

## Módulos (`lib/` salvo que se diga)

| Módulo | Qué hace | Necesita de Dash |
|---|---|---|
| `texto.dash` | UTF-8 → Latin-1, entidades HTML, utilidades de texto | D2, D3 |
| `url.dash` | Analizar y resolver URLs | D1, D2 |
| `red.dash` | Conexión TCP, DNS, sin bloqueo | D8 |
| `http.dash` | HTTP/1.1: petición, cabeceras, `chunked`, redirecciones | D3, D4, D5 |
| `tls.dash` | HTTPS con AmiSSL | D11 |
| `html.dash` | Tokenizador y constructor del árbol | D2, D3, D4 |
| `dom.dash` | Nodos, atributos, recorridos, búsquedas | D4, D6 |
| `css.dash` | Tokenizador y analizador de CSS | D2, D4 |
| `estilo.dash` | Selectores, cascada, herencia, estilo calculado | D4, D5 |
| `maqueta.dash` | Cajas, líneas, medidas de texto | D9 |
| `pintor.dash` | Lista de dibujo → `gfx_` | D9 |
| `imagen.dash` | Cargar imágenes (datatypes) y pintarlas | D12 |
| `js.dash` | Puente con QuickJS y el DOM para JavaScript | D10 |
| `src/visor.dash` | Fase A: abre un HTML y lo pinta en una ventana normal | — |
| `src/dashweb.dash` | Fase B: el navegador con MUI | MUI de Dash |

## Datos principales (borrador)

```ruby
struct Nodo                    # DOM: árbol con hijos enlazados (no listas: más barato y sin copias)
    tipo: Int                  # ELEMENTO, TEXTO, COMENTARIO, DOCUMENTO
    nombre: String             # etiqueta en minúsculas, o "" en texto
    texto: String              # contenido de un nodo de texto
    atributos: Atributo        # lista enlazada (pocos por elemento)
    primer_hijo: Nodo
    ultimo_hijo: Nodo
    siguiente: Nodo
    padre: Nodo                # referencia débil (D6): sin ella, cada página quedaría viva hasta salir
    estilo: Estilo             # calculado (nil hasta la cascada)
end

struct Caja                    # maquetación
    x, y, ancho, alto: Int
    nodo: Nodo
    estilo: Estilo
    primer_hijo, siguiente: Caja
end

struct Dibujo                  # lista de dibujo: lo que el pintor sabe hacer
    tipo: Int                  # RECT, TEXTO, BORDE, IMAGEN
    x, y, ancho, alto: Int
    color: Int                 # RGB 24 bits; el pintor lo convierte en lápiz (D9)
    texto: String
    fuente: Int
    siguiente: Dibujo
end
```

El pintor es una función `pintar(lista, desde_y, x, y, ancho, alto)` que solo usa `gfx_`. En la fase B la
llama `mui_canvas_on_draw` (ver `docs/MUI_DISEÑO.md` de Dash) sin cambios.

## Memoria

- El `Documento` es dueño de todo. Los enlaces hacia arriba (`padre`) son débiles para no formar ciclos
  (el contador de referencias de Dash no libera ciclos hasta salir).
- Los textos grandes (el HTML, el CSS, el JS) se leen una vez. Los tokenizadores recorren el texto por
  posición, sin crear un texto por carácter (D2), y construyen trozos con el constructor de textos (D3).
- QuickJS tiene su propio gestor de memoria. Los objetos JS que representan nodos sujetan su `Nodo`
  (`retain`) y lo sueltan en el finalizador (D10).
- `--memcheck` en los tests de cada módulo: nada vivo al salir.

## Juego de caracteres y fuentes

- Las fuentes del Amiga son Latin-1. Todo se pasa a Latin-1; lo que no exista se sustituye (comillas
  tipográficas → comillas rectas, guiones → `-`, resto → `?`).
- `font-family`: `serif` → times, `sans-serif` → helvetica, `monospace` → courier (fuentes del Workbench),
  en los tamaños que existan. Negrita y cursiva con el estilo por software si no hay variante (D9).
- Colores: en pantallas de paleta, `ObtainBestPen` con caché por color; en RTG, color directo (D9).

## Red

- `red.dash` usa `bsdsocket.library` (D8). En la fase B, el bucle de eventos espera también las señales
  de los sockets (`mui_wait_event_signals`, tarea 8 de MUI) para no congelar la interfaz.
- Pruebas: FS-UAE con `bsdsocket_library = 1` da al Amiga la red del PC; los servidores de prueba son
  Python en el PC (`127.0.0.1`).

## JavaScript

- QuickJS (`third_party/quickjs`), compilado como objetos que se enlazan con el programa Dash (D10).
- Un contexto por página. `console`, `document`, elementos, eventos y temporizadores se implementan en
  Dash llamado desde C (callbacks, D10).
- `fdlibm` para que `Math.*` dé lo mismo que en un navegador de PC.

## Lo que no entra (por ahora)

`float`, `position`, tablas complejas, flexbox, grid, fuentes web, SVG, vídeo, WebSockets, cookies de
terceros, `localStorage`. Se añadirán como tareas si hace falta.
