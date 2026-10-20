# 07. Módulos e interfaces

Generado del código en el commit `cdfe376` con `docs/ingenieria/herramientas/gen_modulos.py`. Para ponerlo al día:

```bash
python3 docs/ingenieria/herramientas/gen_modulos.py . docs/ingenieria/07_MODULOS_E_INTERFACES.md $(git rev-parse --short HEAD)
```

Cada módulo: su responsabilidad (la cabecera del fichero), de qué depende, sus directivas de compilación, constantes, estructuras y **funciones públicas** (las que no empiezan por `_`) con su descripción (el comentario que las precede). Las funciones `@native` están escritas en C dentro del módulo. Los tipos son los de Dash: `Int`, `String`, `Bool`, `[T]` (lista), `{String: T}` (diccionario) y los structs.

En total: 31 ficheros, 21688 líneas, 48 structs y 347 funciones públicas.

## Resumen

| Grupo | Módulo | Líneas | Funciones públicas | Responsabilidad |
|---|---|---|---|---|
| Programa | [`src/dashweb.dash`](#dashweb) | 1059 | 44 | dashweb: el navegador con MUI (fase B) |
| Programa | [`src/visor.dash`](#visor) | 183 | 3 | Visor de páginas sin MUI (fase A): abre un fichero HTML o una URL, la pinta en una ventana normal y la desplaza con las teclas |
| Página | [`lib/documento.dash`](#documento) | 530 | 21 | Una página abierta: su texto, el árbol, las hojas de estilo, las imágenes, el JavaScript y la maqueta |
| Página | [`lib/recursos.dash`](#recursos) | 137 | 6 | Los recursos de texto de una página (hojas CSS, con sus @import, y &lt;script src&gt;) traídos a la vez y sin esperar, para montar la página cuand |
| Página | [`lib/traza.dash`](#traza) | 12 | 1 | La línea de tiempo de una carga (tarea 33): con traza_activa, cada paso sale por la salida con los ms desde traza_t0 ("[1234] llega https:// |
| Red | [`lib/url.dash`](#url) | 420 | 10 | URLs: analizar, resolver relativas y escribir (subconjunto de RFC 3986) |
| Red | [`lib/red.dash`](#red) | 415 | 16 | Conexiones TCP con lectura por líneas y por trozos, sobre los builtins net_ de Dash |
| Red | [`lib/http.dash`](#http) | 910 | 17 | Cliente HTTP/1.1 y HTTPS (AmiSSL): GET con redirecciones, Content-Length, chunked y hasta el cierre |
| Red | [`lib/cookies.dash`](#cookies) | 408 | 11 | Cookies HTTP (RFC 6265, lo que usan las webs): lib/http.dash guarda las de cada Set-Cookie y manda las que tocan en la cabecera Cookie de ca |
| HTML y DOM | [`lib/texto.dash`](#texto) | 297 | 6 | Texto de las páginas al juego de caracteres del Amiga (Latin-1) |
| HTML y DOM | [`lib/entidades.dash`](#entidades) | 42 | 0 | Generado por tools/gen_entidades.py: no editar a mano |
| HTML y DOM | [`lib/html.dash`](#html) | 257 | 3 | Tokenizador de HTML (y XHTML), tolerante con el HTML mal escrito |
| HTML y DOM | [`lib/html5.dash`](#html5) | 442 | 1 | HTML5 de verdad con Hubbub (el analizador de NetSurf, third_party/hubbub; tarea 36): el árbol del documento como lo construyen los navegador |
| HTML y DOM | [`lib/dom.dash`](#dom) | 674 | 21 | Árbol DOM a partir del HTML (lib/html.dash), con las reglas tolerantes de los navegadores: html, head y body implícitos, cierres implícitos  |
| CSS y estilo | [`lib/css.dash`](#css) | 1084 | 17 | Lectura de CSS: reglas, selectores (con su especificidad) y declaraciones |
| CSS y estilo | [`lib/colores.dash`](#colores) | 518 | 3 | Colores CSS (CSS Color 4 y 5) a RGB (0xRRGGBB): los 148 nombres y los del sistema, #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba() (con comas  |
| CSS y estilo | [`lib/estilo.dash`](#estilo) | 2667 | 16 | Estilo calculado: qué reglas CSS se aplican a cada elemento (selectores), cuál gana (cascada: importancia, origen, especificidad, orden), he |
| CSS y estilo | [`lib/animacion.dash`](#animacion) | 579 | 7 | CSS Animations de verdad (tarea 31q) |
| Maqueta y pintado | [`lib/maqueta.dash`](#maqueta) | 4494 | 6 | Maquetación: del árbol con estilo (lib/estilo.dash) a una lista de dibujo con posiciones |
| Maqueta y pintado | [`lib/pintor.dash`](#pintor) | 936 | 2 | Pinta una página maquetada (lib/maqueta.dash) con los gfx_ de Dash en el RastPort actual: una ventana normal o la zona de dibujo de MUI |
| Maqueta y pintado | [`lib/fuente_web.dash`](#fuente_web) | 252 | 4 | Fuentes de la web (@font-face, tarea 31h): un TTF (o OTF con contornos TrueType, o un WOFF 1.0 de ellos) hecho TextFont del Amiga en memoria |
| Maqueta y pintado | [`lib/formularios.dash`](#formularios) | 337 | 9 | Formularios: lo que hace un clic en un control (marcar, elegir, dar el foco, enviar), una tecla en un campo de texto, y los datos de un form |
| JavaScript | [`lib/js.dash`](#js) | 438 | 8 | JavaScript con QuickJS (third_party/quickjs, como librería: tools/build_qjs.sh lib) |
| JavaScript | [`lib/jsdom.dash`](#jsdom) | 1382 | 47 | El DOM para el JavaScript de una página (QuickJS, lib/js.dash): document, getElementById, querySelector(All) con los selectores de lib/css.d |
| JavaScript | [`lib/jsdom_preludio.dash`](#jsdom_preludio) | 1066 | 1 | Generado por tools/preludio.py desde lib/jsdom_preludio.js: no editar a mano. |
| Imágenes y vídeo | [`lib/imagenes.dash`](#imagenes) | 770 | 17 | Imágenes de una página: las &lt;img&gt; y las imágenes de fondo se traen (HTTP/HTTPS a un fichero de T:, o de disco), se decodifican (lib/imagen_d |
| Imágenes y vídeo | [`lib/imagen_dec.dash`](#imagen_dec) | 435 | 6 | Imágenes decodificadas por dashweb (tarea 29), sin los datatypes: JPEG con TJpgDec (third_party/tjpgd), que decodifica ya reducido a 1/2, 1/ |
| Imágenes y vídeo | [`lib/video.dash`](#video) | 134 | 18 | Vídeo (tarea 30): el núcleo de MintVID (third_party/mintvid: H.264 con libavc, MPEG-1, MPEG-4, MJPEG, Cinepak...; MP4/MOV, AVI, MKV, MPEG-TS |
| Imágenes y vídeo | [`lib/videos.dash`](#videos) | 534 | 14 | Los vídeos de una página (tarea 30): cada &lt;video&gt; tiene un reproductor |
| Imágenes y vídeo | [`lib/youtube.dash`](#youtube) | 150 | 6 | YouTube (tarea 30c): de la dirección de un vídeo al MP4 de 360p (H.264 + AAC, itag 18) que se puede reproducir, como hace MintVID (third_par |
| Datos del usuario | [`lib/marcadores.dash`](#marcadores) | 126 | 6 | Marcadores y preferencias del navegador en ficheros de texto (Latin-1, una entrada por línea): |

## Dependencias

Quién importa a quién (`A --> B`: A importa B). Las flechas a `navegador.dashui` son la ventana del editor visual.

```mermaid
flowchart LR
  subgraph Programa["Programa"]
    dashweb["dashweb.dash"]
    visor["visor.dash"]
  end
  subgraph Página["Página"]
    documento["documento.dash"]
    recursos["recursos.dash"]
    traza["traza.dash"]
  end
  subgraph Red["Red"]
    url["url.dash"]
    red["red.dash"]
    http["http.dash"]
    cookies["cookies.dash"]
  end
  subgraph HTML_y_DOM["HTML y DOM"]
    texto["texto.dash"]
    entidades["entidades.dash"]
    html["html.dash"]
    html5["html5.dash"]
    dom["dom.dash"]
  end
  subgraph CSS_y_estilo["CSS y estilo"]
    css["css.dash"]
    colores["colores.dash"]
    estilo["estilo.dash"]
    animacion["animacion.dash"]
  end
  subgraph Maqueta_y_pintado["Maqueta y pintado"]
    maqueta["maqueta.dash"]
    pintor["pintor.dash"]
    fuente_web["fuente_web.dash"]
    formularios["formularios.dash"]
  end
  subgraph JavaScript["JavaScript"]
    js["js.dash"]
    jsdom["jsdom.dash"]
    jsdom_preludio["jsdom_preludio.dash"]
  end
  subgraph Imágenes_y_vídeo["Imágenes y vídeo"]
    imagenes["imagenes.dash"]
    imagen_dec["imagen_dec.dash"]
    video["video.dash"]
    videos["videos.dash"]
    youtube["youtube.dash"]
  end
  subgraph Datos_del_usuario["Datos del usuario"]
    marcadores["marcadores.dash"]
  end
  dashweb --> navegador_dashui
  dashweb --> documento
  dashweb --> formularios
  dashweb --> marcadores
  visor --> pintor
  visor --> jsdom
  documento --> pintor
  documento --> jsdom
  documento --> recursos
  documento --> html5
  recursos --> estilo
  http --> url
  http --> red
  http --> texto
  http --> traza
  http --> cookies
  cookies --> url
  texto --> entidades
  html --> texto
  html5 --> dom
  dom --> html
  colores --> css
  estilo --> dom
  estilo --> css
  estilo --> http
  animacion --> maqueta
  animacion --> colores
  maqueta --> estilo
  maqueta --> colores
  maqueta --> fuente_web
  pintor --> maqueta
  pintor --> imagenes
  pintor --> videos
  fuente_web --> css
  formularios --> maqueta
  jsdom --> js
  jsdom --> estilo
  jsdom --> formularios
  jsdom --> jsdom_preludio
  imagenes --> http
  imagenes --> dom
  imagenes --> css
  imagenes --> imagen_dec
  imagenes --> estilo
  imagenes --> colores
  imagenes --> fuente_web
  videos --> video
  videos --> youtube
  videos --> http
  videos --> url
  videos --> dom
  youtube --> video
  youtube --> http
  marcadores --> texto
  navegador_dashui["navegador.dashui"]
```

## Programa

### `src/dashweb.dash` <a id="dashweb"></a>

dashweb: el navegador con MUI (fase B). La ventana está en navegador.dashui (editor visual de Dash); la página la abre lib/documento.dash y la pinta lib/pintor.dash en la zona de dibujo.

```ruby
dashweb                       # página de inicio
dashweb http://ejemplo.org/   # esa página (con varias direcciones, una ventana para cada una)
```

Barra de URL (Return para ir), atrás, adelante, recargar, historial (oculto hasta que se despliega con su botón), barra de estado y de progreso. La rueda, la barra y las teclas (arriba, abajo, espacio, retroceso) desplazan; un clic llega al JavaScript de la página y, si no lo para, sigue el enlace (#ancla: dentro de la página). Hasta 4 ventanas (menú Proyecto: Nueva ventana, Cerrar ventana), cada una con su página. Necesita MUI 3.8 o 5 y un 68020.

**Importa:** `navegador.dashui`, `../lib/documento.dash`, `../lib/formularios.dash`, `../lib/marcadores.dash`

**Directivas:** `@workbench_output "NIL:"`

**Constantes**

| Nombre | Valor |
|---|---|
| `ID_ATRAS` | `1` |
| `ID_ADELANTE` | `2` |
| `ID_RECARGAR` | `3` |
| `ID_IR` | `4` |
| `ID_SCROLL` | `5` |
| `ID_HISTORIAL` | `6` |
| `ID_ACERCA` | `8` |
| `ID_SALIR` | `9` |
| `ID_PAGINA` | `10` |
| `ID_PARAR` | `13` |
| `ID_MARCADORES` | `14` |
| `ID_ANADIR` | `15` |
| `ID_USAR_INICIO` | `16` |
| `ID_INICIO` | `17` |
| `ID_NUEVA` | `18` |
| `ID_CERRAR` | `19` |
| `ID_VER_HISTORIAL` | `20` |
| `ID_TIC` | `11         # el temporizador: las cargas en curso y los setTimeout/setInterval de las páginas` |
| `ID_RANGO` | `12       # la barra, después de maquetar en el dibujo (el ancho cambió)` |
| `ID_CERRADA` | `100    # + número de ventana: su botón de cerrar` |
| `ID_COMPLETA` | `90    # la ventana del vídeo a pantalla completa: un clic o una tecla` |
| `ID_COMPLETA_CERRADA` | `91` |
| `MAX_VENTANAS` | `4` |
| `FICHERO_MARCADORES` | `"PROGDIR:dashweb.marcadores"` |
| `FICHERO_PREFERENCIAS` | `"PROGDIR:dashweb.prefs"` |
| `FICHERO_COOKIES` | `"PROGDIR:dashweb.cookies"` |

**struct `Ventana`**: Una ventana del navegador y lo que tiene

```ruby
v: Navegador
numero: Int
abierta: Bool = true
actual: Documento = nil
desde: Int = 0
visto: Int = -1          # la línea del historial que se ve
carga: Carga = nil       # la página que está llegando (sin congelar la ventana)
carga_dir: String = ""
preparando: Documento = nil   # la página ya llegó; sus hojas y scripts están llegando
js_cuando: Int = -1      # time_ms del siguiente temporizador del JavaScript, -1 si no hay
estado_video: Int = 0    # time_ms de la última vez que la barra de estado dijo cómo va el vídeo
foco: Nodo = nil         # el campo de formulario donde se escribe
con_historial: Bool = false   # la lista del historial desplegada (empieza oculta)
giro: Int = -1           # el indicador de actividad: 0 mientras algo llega, -1 parado
cargando: Bool = false   # la barra en modo carga: "parar" en vez de "recargar" y el progreso a la vista
barra_imagenes: Bool = false   # la barra de progreso a la vista por las imágenes que faltan (la página ya está)
valor_barra: Int = -1
con_atras: Bool = false     # los iconos de atrás y adelante, encendidos o apagados
con_adelante: Bool = false
empezada: Int = 0        # time_ms de cuando se pidió la página (para medir la carga entera)
descarga: Carga = nil    # algo que se está guardando en un fichero (un .lha, un .zip...)
descarga_ruta: String = ""
```

**Funciones**

| Función | Descripción |
|---|---|
| `dw_inicio() -> String` | — |
| `modo_carga(w: Ventana, cargando: Bool)` | Mientras la página llega, el botón de recargar se cambia por el de parar y se ve el progreso |
| `dw_estado(w: Ventana, texto: String)` | La barra de estado: un texto largo ensancharía la ventana entera (MUI le da el ancho de su texto) |
| `pantalla_completa(w: Ventana, r: Reproductor)` | — |
| `salir_completa()` | — |
| `pinta_completa(x: Int, y: Int, ancho: Int, alto: Int)` | — |
| `pinta0(x: Int, y: Int, ancho: Int, alto: Int)` | La zona de dibujo de cada ventana (MUI llama a una función sin decir de qué zona: una por ventana) |
| `pinta1(x: Int, y: Int, ancho: Int, alto: Int)` | — |
| `pinta2(x: Int, y: Int, ancho: Int, alto: Int)` | — |
| `pinta3(x: Int, y: Int, ancho: Int, alto: Int)` | — |
| `giro0(x: Int, y: Int, ancho: Int, alto: Int)` | El indicador de actividad de cada ventana (como la página: una función por ventana) |
| `giro1(x: Int, y: Int, ancho: Int, alto: Int)` | — |
| `giro2(x: Int, y: Int, ancho: Int, alto: Int)` | — |
| `giro3(x: Int, y: Int, ancho: Int, alto: Int)` | — |
| `giro_en(k: Int, x: Int, y: Int, ancho: Int, alto: Int)` | Mientras algo llega, un punto quieto (el lápiz 3 de la pantalla); parado, nada. Antes eran ocho puntos que giraban: diez repintados por segundo de MUI mientras cargaba, caros en un Amiga (lo vio el usuario) |
| `actualizar_giro(w: Ventana)` | Mueve el indicador si algo está llegando (página, hojas, scripts, imágenes); si no, lo para |
| `pinta_en(k: Int, x: Int, y: Int, ancho: Int, alto: Int)` | La página desde "desde"; si el ancho cambió, se maqueta otra vez |
| `ajustar_barra(w: Ventana)` | Barra de desplazamiento: total de la página y lo que se ve |
| `vista(w: Ventana)` | Los @media de CSS y matchMedia miran el tamaño de la zona de dibujo de la ventana (con la barra) |
| `abrir(w: Ventana, direccion: String)` | Abre la dirección en la ventana (direccion "" = la página de inicio). Por http(s) empieza la carga y vuelve: la página llega en los tics (la ventana sigue respondiendo y se puede parar). |
| `abrir_post(w: Ventana, direccion: String, cuerpo: String)` | POST: como abrir, pero la carga manda el cuerpo |
| `avanzar_carga(w: Ventana)` | La carga en curso: lo que haya llegado; al acabar, sus hojas y scripts; después la página |
| `empezar_descarga(w: Ventana, r: Respuesta)` | Lo que no es una página se guarda: el selector de ficheros y luego se baja tal cual a ese fichero (la primera respuesta llegó como texto, que cambia los bytes 0: se pide otra vez); la página de antes se queda |
| `avanzar_descarga(w: Ventana)` | — |
| `parar_carga(w: Ventana)` | Para lo que esté llegando (la página o sus recursos) |
| `mostrar(w: Ventana, d: Documento, direccion: String)` | Pone el documento nuevo en la ventana |
| `programar()` | El único mui_timer, para todas las ventanas: cada 50 ms mientras algo llega, si no al siguiente temporizador del JavaScript |
| `temporizadores(w: Ventana)` | Los setTimeout/setInterval que tocan en esa ventana |
| `tic(w: Ventana)` | Un tic: cargas, imágenes y temporizadores de una ventana |
| `clic(w: Ventana)` | — |
| `enviar(w: Ventana, desde: Nodo)` | Envía el formulario de desde (un botón, el campo donde se pulsó Return o el form de form.submit()): antes el evento submit (onsubmit puede pararlo), después GET o POST según su method |
| `enviar_formulario(w: Ventana, desde: Nodo)` | — |
| `envio_del_js(w: Ventana)` | Si el JavaScript llamó a form.submit(), se envía |
| `navegar(w: Ventana, destino: String)` | Ir a una dirección nueva: lo que había delante en el historial se descarta. Un enlace a otra parte de la misma página solo desplaza. |
| `apuntar(w: Ventana, destino: String)` | Una entrada nueva en el historial (lo que había delante se descarta) |
| `botones(w: Ventana)` | Atrás y adelante: con su flecha azul si llevan a algún sitio y solo el contorno si no (un botón desactivado de MUI sale tapado por una trama); pulsar uno apagado no hace nada |
| `icono(nombre: String, encendido: Bool) -> String` | — |
| `desplazar(w: Ventana, n: Int)` | Desplaza la página n píxeles (la barra avisa con ID_SCROLL y se repinta) |
| `mover_ventana(win: Int, dx: Int, dy: Int)` (C) | Corre la ventana (las del mismo .dashui salen en el mismo sitio) |
| `nueva_ventana(direccion: String) -> Ventana` | Una ventana nueva con esa dirección ("" = la página de inicio); nil si ya hay MAX_VENTANAS |
| `cerrar_ventana(w: Ventana)` | — |
| `abiertas() -> Int` | — |
| `activa() -> Ventana` | La ventana que está usando el usuario (la activa); si no hay, la primera abierta |
| `pagina_inicio() -> String` | — |

### `src/visor.dash` <a id="visor"></a>

Visor de páginas sin MUI (fase A): abre un fichero HTML o una URL, la pinta en una ventana normal y la desplaza con las teclas. Sin argumentos muestra una página de demostración.

```ruby
visor pagina.html
visor http://ejemplo.org/
```

Teclas: abajo/arriba (una línea), espacio/retroceso (una pantalla), Esc o el botón de cerrar. Un clic llega al JavaScript de la página (onclick, addEventListener); setTimeout/setInterval corren mientras el visor espera. Si el JS cambia el documento, se vuelve a maquetar y pintar. Al acabar escribe cuánto tardó cada fase.

**Importa:** `../lib/pintor.dash`, `../lib/jsdom.dash`

**Funciones**

| Función | Descripción |
|---|---|
| `demostracion() -> String` | — |
| `cargar(direccion: String) -> String` | El texto de la página (en Latin-1) y su URL base |
| `rehacer(doc: Nodo, hojas: Hojas, im: Imagenes, direccion: String, ancho: Int) -> Pagina` | Estilo, imágenes nuevas y maqueta otra vez (tras cambios del JavaScript) |

## Página

### `lib/documento.dash` <a id="documento"></a>

Una página abierta: su texto, el árbol, las hojas de estilo, las imágenes, el JavaScript y la maqueta. Lo que comparten el visor y el navegador.

```ruby
d = documento_abrir("http://ejemplo.org/")   # carga, árbol, <script>, estilo e imágenes
documento_maquetar(d, ancho)                  # d.pagina: la lista de dibujos (lib/maqueta.dash)
pintar(d.pagina, d.im, desde, x, y, ancho, alto)
if documento_al_dia(d) ...                    # tras un clic o un temporizador: si el JS lo cambió,
                                              # vuelve a dar estilo y a maquetar (true si lo hizo)
if documento_imagenes(d) ...                  # las imágenes llegan sin esperar: true si llegó alguna
                                              # (y se volvió a maquetar); imagenes_pendientes(d.im)
documento_liberar(d)
```

Con imágenes, abrir después de que la ventana esté en su pantalla (colores).

**Importa:** `pintor.dash`, `jsdom.dash`, `recursos.dash`, `html5.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `DOCUMENTO_REPINTAR` | `2500` |
| `DOC_BARRA` | `16` |

**struct `Documento`**

```ruby
direccion: String
titulo: String
bytes: Int
doc: Nodo
hojas: Hojas
im: Imagenes
js: Int              # el motor de JavaScript, 0 si la página no tiene <script>
cambios: Int         # jsdom_cambios la última vez que se maquetó
pagina: Pagina       # nil hasta documento_maquetar
ancho: Int
error: String
ms: Int              # lo que tardó en abrirse y maquetarse
recursos: Recursos = nil   # documento_empezar: las hojas y scripts que están llegando
videos: Videos = nil       # los reproductores de sus <video> (lib/videos.dash)
sin_maquetar: Int = 0      # imágenes llegadas que cambian la maqueta (su <img> no tenía tamaño)
sin_pintar: Int = 0        # imágenes llegadas que aún no se han pintado
pintada: Int = 0           # time_ms del último repintado por imágenes
remaquetada: Bool = false  # documento_imagenes volvió a maquetar (hay que repintar sí o sí)
```

**Funciones**

| Función | Descripción |
|---|---|
| `documento_texto(direccion: String, d: Documento) -> String` | El texto de la página (Latin-1): http(s) o un fichero; si falla, una página que lo dice |
| `documento_abrir(direccion: String) -> Documento` | — |
| `documento_desde_respuesta(direccion: String, r: Respuesta) -> Documento` | Con la respuesta ya recibida (lib/http.dash, sin esperar: http_empezar/http_avanzar) |
| `documento_empezar(direccion: String, r: Respuesta) -> Documento` | Sin esperar: el árbol de la respuesta y los recursos (CSS, &lt;script src&gt;) pedidos; documento_avanzar en cada vuelta hasta que dé true (entonces scripts, estilo e imágenes, y listo para maquetar) |
| `documento_es_descarga(r: Respuesta) -> Bool` | ¿Es algo para guardar y no para ver? Lo que no es texto, imagen ni vídeo (un .lha, un .zip, un PDF...), o lo que el servidor manda como adjunto (Content-Disposition: attachment) |
| `documento_nombre_descarga(r: Respuesta) -> String` | El nombre con que guardarlo: el filename de Content-Disposition, o lo último de la dirección (sin ?...) |
| `documento_avanzar(d: Documento) -> Bool` | — |
| `documento_html(direccion: String, html: String) -> Documento` | Lo mismo con el HTML ya en la mano (una página de inicio, una de error) |
| `documento_desde_html(d: Documento, texto: String, t0: Int) -> Documento` | — |
| `documento_maquetar(d: Documento, ancho: Int)` | — |
| `documento_al_dia(d: Documento) -> Bool` | Si el JavaScript cambió el documento desde la última maqueta: estilo, imágenes y maqueta otra vez |
| `documento_imagenes(d: Documento) -> Bool` | Las imágenes que siguen llegando (sin esperar); true si llegó alguna y se volvió a maquetar |
| `documento_imagenes_visibles(d: Documento, desde: Int, alto: Int) -> Bool` | Tras documento_imagenes: ¿hay que repintar lo que se ve (la página desde "desde", alto px)? Sí si se volvió a maquetar, si ya no falta ninguna o si alguna de las llegadas se dibuja ahí; las de más abajo se verán al desplazar (en freemem.space la página entera se repintaba 22 veces mientras llegaban) |
| `documento_liberar(d: Documento)` | — |
| `documento_enlace(d: Documento, n: Nodo) -> String` | La dirección (absoluta) del enlace &lt;a href&gt; que contiene a n, o "" |
| `documento_y_de(d: Documento, id: String) -> Int` | Dónde empieza en la página maquetada el elemento con ese id (o &lt;a name&gt;): lo más alto que pintó él o algo de dentro; -1 si no está o no se ve |
| `documento_sin_fragmento(direccion: String) -> String` | "http://x/a.html#b" -&gt; "http://x/a.html" y "b" |
| `documento_fragmento(direccion: String) -> String` | — |
| `documento_videos(d: Documento) -> Videos` | Los vídeos de la página (se crean al primer clic en uno) |
| `documento_video_de(n: Nodo) -> Nodo` | El &lt;video&gt; que contiene a n (o n mismo); nil si no está en uno |
| `documento_video_dibujo(d: Documento, n: Nodo) -> Dibujo` | El dibujo del vídeo de ese nodo en la página (para saber dónde cayó un clic); nil si no está |

### `lib/recursos.dash` <a id="recursos"></a>

Los recursos de texto de una página (hojas CSS, con sus @import, y &lt;script src&gt;) traídos a la vez y sin esperar, para montar la página cuando estén todos (en el orden del documento, con los textos ya en la mano: estilo_hojas_con, jsdom_ejecutar_scripts_con).

```ruby
r = recursos_nuevos()
recursos_del_documento(r, doc, base)       # pide los <link rel=stylesheet> y <script src>
while recursos_pendientes(r) > 0
    recursos_avanzar(r)                    # sin esperar; los @import de las hojas que llegan se piden
    ... la interfaz
end
r.traidos["http://.../a.css"]              # el texto (Latin-1); "" si no se pudo traer
recursos_cancelar(r)
```

**Importa:** `estilo.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `RECURSOS_A_LA_VEZ` | `4` |

**struct `Pedido`**

```ruby
direccion: String
es_css: Bool
nivel: Int                 # profundidad de @import (como mucho 4)
carga: Carga               # nil hasta que le toca
```

**struct `Recursos`**

```ruby
traidos: {String: String}
cola: [Pedido]
```

**Funciones**

| Función | Descripción |
|---|---|
| `recursos_nuevos() -> Recursos` | — |
| `recursos_pendientes(r: Recursos) -> Int` | — |
| `recursos_pedir(r: Recursos, direccion: String, es_css: Bool, nivel: Int)` | Pide una dirección (si no está ya traída o pedida); las de disco se leen ya |
| `recursos_del_documento(r: Recursos, doc: Nodo, base: String)` | — |
| `recursos_avanzar(r: Recursos) -> Int` | Avanza las descargas sin esperar; cuántas acabaron ahora |
| `recursos_cancelar(r: Recursos)` | — |

### `lib/traza.dash` <a id="traza"></a>

La línea de tiempo de una carga (tarea 33): con traza_activa, cada paso sale por la salida con los ms desde traza_t0 ("[1234] llega https://...: 200, 5120 bytes en 830 ms"). dashweb la enciende con el argumento TRAZA (tools/medir_visor.py --traza). Apagada no cuesta nada: quien la llama mira antes traza_activa.

**Funciones**

| Función | Descripción |
|---|---|
| `traza(texto: String)` | — |

## Red

### `lib/url.dash` <a id="url"></a>

URLs: analizar, resolver relativas y escribir (subconjunto de RFC 3986).

```ruby
u = url_parse("http://Ejemplo.org:8080/a/b?x=1#arriba")
v = url_resolve(u, "../c.html")       # http://ejemplo.org:8080/c.html
Print url_text(v)
```

El esquema y el host se guardan en minúsculas. "puerto" es -1 si la URL no lo da (url_port() devuelve el de siempre: 80 para http, 443 para https). Los "tiene_" distinguen una parte vacía ("http://a/?") de una que no está ("http://a/").

**Constantes**

| Nombre | Valor |
|---|---|
| `URL_RASTREO_BLOQUEAR` | `true` |
| `URL_RASTREO_SUSTITUTO` | `""` |

**struct `Url`**

```ruby
esquema: String
tiene_autoridad: Bool
usuario: String
host: String
puerto: Int
ruta: String
tiene_consulta: Bool
consulta: String
tiene_fragmento: Bool
fragmento: String
```

**Funciones**

| Función | Descripción |
|---|---|
| `url_parse(texto: String) -> Url` | Analiza una URL (absoluta o relativa: entonces el esquema queda vacío) |
| `url_port(u: Url) -> Int` | Puerto que se usa: el de la URL o el del esquema (-1 si no se sabe) |
| `url_text(u: Url) -> String` | La URL como texto |
| `url_resolve(base: Url, ref: String) -> Url` | Resuelve ref (absoluta o relativa) contra base: RFC 3986, apartado 5.2.2 |
| `url_remove_dots(ruta: String) -> String` | Quita los segmentos "." y ".." de una ruta (RFC 3986, apartado 5.2.4) |
| `url_codificar(t: String) -> String` | Un texto (Latin-1) para una URL o un formulario: UTF-8 con %XX salvo letras, cifras y - _ . ~; el espacio como "+" (application/x-www-form-urlencoded) |
| `url_fichero(direccion: String) -> String` | La ruta del Amiga de una dirección file: (otra cosa queda igual). Como NetSurf, el primer trozo es el volumen: file:///Programs/Web/a.html = Programs:Web/a.html; también file:///DH0:a.html, file://Work/a.html y file://localhost/Work/a.html. Sin "/" (file:///a.html) es relativa al directorio actual. Los %XX se deshacen (y los de UTF-8 pasan a Latin-1). |
| `url_fuentes_latin1(direccion: String) -> String` | Google Fonts (fonts.googleapis.com/css y /css2) da el TTF entero, con todos los alfabetos (Inter: 325 KB por peso). Con text= da solo esos caracteres: se le piden los que dashweb sabe pintar (Latin-1), unos 50 KB. |
| `url_rastreador(direccion: String) -> Bool` | Scripts de estadísticas, publicidad y rastreo: no se bajan ni se ejecutan (Google Tag Manager son 465 KB de JavaScript; en un 68040 son segundos y no cambian la página) |
| `url_fichero_nombre(n: String) -> String` | Un nombre de fichero que valga en el Amiga: los %XX deshechos y sin ":" ni "/" (como mucho 100 caracteres) |

### `lib/red.dash` <a id="red"></a>

Conexiones TCP con lectura por líneas y por trozos, sobre los builtins net_ de Dash.

```ruby
c = red_abrir("ejemplo.org", 80, 10000)     # tiempo límite en ms para cada espera
c = red_abrir_tls("ejemplo.org", 443, 10000) # lo mismo con TLS (AmiSSL), certificado comprobado
if c.error != ""
    Print c.error
end
red_enviar(c, "GET / HTTP/1.0\r\n\r\n")
linea = red_leer_linea(c)                   # sin el salto de línea; nil al cerrarse
cuerpo = red_leer_todo(c)
red_copiar(c, fichero, n)                   # n bytes tal cual a un fichero abierto (-1: hasta el cierre)
n = red_recibir_ya(c)                       # lo que haya llegado, sin esperar (-1: cerrada)
red_cerrar(c)
```

Abrir sin esperar (la consulta DNS, la conexión y la negociación TLS no paran el programa):

```ruby
c = red_abrir_empezar("ejemplo.org", 443, true, 10000)
while red_abrir_avanzar(c) == 0     # 1 abierta, -1 error (c.error)
    ... la interfaz; red_fase(c) dice en qué está: "buscando", "conectando", "negociando"
end
```

Lo recibido se guarda en bytes (un buffer): las líneas y los textos se sacan de ahí (los bytes 0 pasan a espacios) y red_copiar lleva los bytes sin tocar a un fichero (imágenes).

**Constantes**

| Nombre | Valor |
|---|---|
| `RED_TROZO` | `4096` |
| `RED_CALLADA_MS` | `5000` |

**struct `Conexion`**

```ruby
sock: Int
tls: Int
espera: Int
buf: Int          # lo recibido sin leer son los bytes [ini, fin) de buf (de cap bytes)
cap: Int
ini: Int
fin: Int
cerrada: Bool
error: String
fase: Int = 0     # abriéndose sin esperar: 1 nombre y conexión, 2 negociación TLS; 0 abierta
host: String = ""
con_tls: Bool = false
puerto: Int = 0
empezada: Int = 0      # time_ms de cuando se pidió la conexión
reintentos: Int = 0
```

**struct `Bytes`**: Bytes sueltos que crecen (un cuerpo comprimido, que no puede pasar por un texto: tiene bytes 0)

```ruby
buf: Int = 0
n: Int = 0
cap: Int = 0
```

**Funciones**

| Función | Descripción |
|---|---|
| `red_abrir(host: String, puerto: Int, espera_ms: Int) -> Conexion` | — |
| `red_abrir_tls(host: String, puerto: Int, espera_ms: Int) -> Conexion` | — |
| `red_abrir_empezar(host: String, puerto: Int, con_tls: Bool, espera_ms: Int) -> Conexion` | Empieza a abrir la conexión y vuelve en seguida (red_abrir_avanzar la sigue) |
| `red_abrir_avanzar(c: Conexion) -> Int` | Sigue abriendo sin esperar: 1 abierta, 0 todavía no, -1 error (c.error, y la conexión queda cerrada) |
| `red_fase(c: Conexion) -> String` | En qué está una conexión que se abre: "buscando" (el nombre), "conectando", "negociando" (TLS); "" abierta |
| `red_enviar(c: Conexion, texto: String) -> Bool` | — |
| `red_recibir_ya(c: Conexion) -> Int` | Lo que haya llegado, sin esperar: los bytes nuevos (0 si no hay), -1 si la conexión se cerró |
| `red_pendientes(c: Conexion) -> Int` | Bytes recibidos y sin leer |
| `red_leer_linea(c: Conexion) -> String` | Una línea sin "\r\n" ni "\n"; nil si la conexión se cerró sin dar más |
| `red_leer(c: Conexion, n: Int) -> String` | n bytes como texto (menos si la conexión se cierra antes); n &lt; 0: hasta el cierre |
| `red_leer_todo(c: Conexion) -> String` | Todo lo que llegue hasta que la conexión se cierre |
| `red_copiar(c: Conexion, f: Int, n: Int) -> Int` | n bytes tal cual al fichero abierto f (n &lt; 0: hasta el cierre); cuántos se escribieron |
| `bytes_meter(b: Bytes, origen: Int, n: Int) -> Bool` | — |
| `bytes_liberar(b: Bytes)` | — |
| `red_juntar(c: Conexion, b: Bytes, n: Int) -> Int` | Como red_copiar, pero al final de b |
| `red_cerrar(c: Conexion)` | — |

### `lib/http.dash` <a id="http"></a>

Cliente HTTP/1.1 y HTTPS (AmiSSL): GET con redirecciones, Content-Length, chunked y hasta el cierre.

```ruby
r = http_get("http://ejemplo.org/", 15000)
if r.error != ""
    Print r.error
end
Print r.estado                  # 200
Print r.cabeceras["content-type"]
html = http_texto(r)            # el cuerpo en Latin-1, según su juego de caracteres
r = http_a_fichero("http://ejemplo.org/logo.png", "T:logo.png", 15000)
Print r.bytes                   # el cuerpo va tal cual al fichero (con estado 2xx; si no, a r.cuerpo)
```

Sin esperar (para una interfaz que no se congela): ni la consulta DNS, ni la conexión, ni la negociación TLS, ni recibir.

```ruby
c = http_empezar("http://ejemplo.org/", 15000)
while not http_avanzar(c)                  # sigue la carga; true al acabar
    ... la interfaz; http_fase(c), http_recibidos(c), http_total(c) para el progreso; http_cancelar(c)
end
r = c.respuesta
```

Las cabeceras se guardan con el nombre en minúsculas. En http_get el cuerpo es texto: los bytes 0 pasan a espacios.

**Importa:** `url.dash`, `red.dash`, `texto.dash`, `traza.dash`, `cookies.dash`

**Directivas:** `@link "../build/img-lib/libimg.a"`

**Constantes**

| Nombre | Valor |
|---|---|
| `HTTP_MAX_REDIRECCIONES` | `5` |
| `HTTP_AGENTE` | `"dashweb/0.1 (AmigaOS)"` |
| `HTTP_LIBRES_MAX` | `8` |
| `HTTP_LIBRE_MS` | `10000     # una conexión libre más vieja se cierra (el servidor ya la habrá cerrado)` |

**struct `Respuesta`**

```ruby
estado: Int
razon: String
cabeceras: {String: String}
cuerpo: String
url: String
tipo: String
juego: String
error: String
bytes: Int        # bytes escritos en el fichero (http_a_fichero)
version_11: Bool = false   # HTTP/1.1 (la conexión puede seguir abierta tras la respuesta)
set_cookies: [String] = nil  # cada Set-Cookie (no se pueden juntar con comas: Expires lleva una)
```

**struct `Carga`**

```ruby
actual: Url
conexion: Conexion
espera: Int            # ms sin recibir nada antes de darla por perdida
redirecciones: Int
hecha: Bool
respuesta: Respuesta
total: Int             # bytes de la respuesta entera si se sabe (Content-Length), -1 si aún no, -2 si no
ultimo: Int            # time_ms del último dato
fichero: String = ""   # el cuerpo de una respuesta 2xx va a este fichero (http_empezar_a_fichero)
metodo: String = "GET"
cuerpo: String = ""    # lo que se manda con POST
tipo: String = ""      # su Content-Type
agente: String = ""    # el User-Agent, si no es el de dashweb (http_con_agente)
cabecera: Int = -1     # bytes de la línea de estado y las cabeceras, cuando ya llegaron (http_parcial)
enviada: Bool = false  # la petición ya salió por la conexión
reusada: Bool = false  # la conexión venía de otra respuesta (si resulta cerrada, se abre otra)
t0: Int = 0            # time_ms de cuando se pidió (traza)
```

**Funciones**

| Función | Descripción |
|---|---|
| `http_get(direccion: String, espera_ms: Int) -> Respuesta` | GET de una URL, siguiendo hasta 5 redirecciones |
| `http_a_fichero(direccion: String, fichero: String, espera_ms: Int) -> Respuesta` | Lo mismo, con el cuerpo de una respuesta 2xx escrito tal cual en el fichero (imágenes) |
| `http_texto(r: Respuesta) -> String` | El cuerpo en Latin-1, según su juego de caracteres (sin él: UTF-8) |
| `http_empezar(direccion: String, espera_ms: Int) -> Carga` | — |
| `http_empezar_a_fichero(direccion: String, fichero: String, espera_ms: Int) -> Carga` | Lo mismo que http_a_fichero, sin esperar |
| `http_empezar_post(direccion: String, cuerpo: String, tipo: String, espera_ms: Int) -> Carga` | POST sin esperar: el cuerpo (application/x-www-form-urlencoded si tipo es "") |
| `http_con_agente(c: Carga, agente: String) -> Carga` | La misma carga con otro User-Agent (antes de su primer http_avanzar: la petición aún no se ha mandado) |
| `http_fase(c: Carga) -> String` | Lo que hace la carga ahora: "buscando" (el nombre del servidor), "conectando", "negociando" (TLS), "recibiendo"; "" si acabó |
| `http_avanzar(c: Carga) -> Bool` | Lee lo que haya llegado sin esperar; true cuando la respuesta está entera (o hubo error) en c.respuesta |
| `http_cabeceras_ya(c: Carga) -> Respuesta` | Las cabeceras de la respuesta en cuanto han llegado, sin esperar al cuerpo (una Respuesta con estado, cabeceras, tipo y la dirección; sin cuerpo), o nil si aún no. Para saber pronto qué viene (una descarga). |
| `http_recibidos(c: Carga) -> Int` | Bytes de la respuesta ya recibidos y lo que medirá entera (-1 si no se sabe), para el progreso |
| `http_total(c: Carga) -> Int` | — |
| `http_cancelar(c: Carga)` | — |
| `http_parcial(c: Carga) -> Int` | Lo que ya ha llegado del cuerpo de una respuesta 2xx con Content-Length, para usarlo antes de que acabe (un vídeo que empieza mientras se baja): su dirección en el búfer de la conexión, o 0 si aún no se sabe o no vale (redirección, chunked). El búfer se mueve al crecer: pedirla otra vez tras cada http_avanzar. Al acabar la carga el búfer se libera (el cuerpo ya está en su fichero). |
| `http_parcial_listos(c: Carga) -> Int` | Bytes del cuerpo que ya han llegado (con http_parcial) y los que tendrá entero |
| `http_parcial_total(c: Carga) -> Int` | — |
| `http_cerrar_libres()` | Cierra las conexiones libres (al acabar el programa) |

### `lib/cookies.dash` <a id="cookies"></a>

Cookies HTTP (RFC 6265, lo que usan las webs): lib/http.dash guarda las de cada Set-Cookie y manda las que tocan en la cabecera Cookie de cada petición. Por dominio (con Domain= también los subdominios; sin él, solo ese host), ruta, Secure (solo por https), caducidad (Expires y Max-Age; sin ellas, de sesión: se olvidan al salir) y HttpOnly (el JavaScript no las ve).

```ruby
cookies_recibir(url_parse("https://a.org/x/"), "id=7; Path=/; Max-Age=3600; HttpOnly")
Print cookies_para(url_parse("https://a.org/y"))      # "id=7"
cookies_guardar("PROGDIR:cookies")                     # las que no son de sesión
cookies_cargar("PROGDIR:cookies")
```

**Importa:** `url.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `COOKIES_MAX` | `300` |
| `COOKIES_SIEMPRE` | `2147483000     # "no caduca" (enero de 2038: un Int no llega más allá)` |

**struct `Cookie`**

```ruby
nombre: String
valor: String
dominio: String        # en minúsculas, sin el punto del principio
solo_host: Bool        # sin Domain=: solo ese host, no sus subdominios
ruta: String
caduca: Int            # segundos desde 1970 (hora del Amiga); -1: de sesión
segura: Bool
solo_http: Bool
```

**Funciones**

| Función | Descripción |
|---|---|
| `cookies_ahora() -> Int` (C) | Segundos desde el 1 de enero de 1970 según el reloj del Amiga (DateStamp cuenta desde 1978) |
| `cookies_fecha(t: String) -> Int` | "Wed, 21 Oct 2026 07:28:00 GMT" (y las variantes viejas con guiones) -&gt; segundos desde 1970; -1 si no se entiende |
| `cookies_recibir(u: Url, cabecera: String)` | Una cabecera Set-Cookie recibida de esa dirección |
| `cookies_poner(u: Url, cabecera: String, desde_http: Bool)` | desde_http false: document.cookie (no puede poner ni pisar una HttpOnly) |
| `cookies_para(u: Url) -> String` | "a=1; b=2": las que se mandan a esa dirección (las de ruta más larga primero); "" si ninguna |
| `cookies_js(u: Url) -> String` | Lo que ve document.cookie en esa página (sin las HttpOnly) |
| `cookies_guardar(fichero: String) -> Bool` | Las que no son de sesión ni han caducado, una por línea (separadas por tabuladores) |
| `cookies_cargar(fichero: String)` | — |
| `cookies_borrar(dominio: String)` | Borra las de ese dominio ("" todas) |
| `cookies_dia(s: Int) -> String` | "2026-10-21" de unos segundos desde 1970 |
| `cookies_html() -> String` | La página dashweb:cookies: las guardadas por dominio, con enlaces para borrarlas |

## HTML y DOM

### `lib/texto.dash` <a id="texto"></a>

Texto de las páginas al juego de caracteres del Amiga (Latin-1).

```ruby
t = texto_decodificar(bytes, "utf-8")   # también "iso-8859-1", "windows-1252", "us-ascii"
t = html_entidades("caf&eacute; &amp; t&#233; &#x263A;")   # "café & té ?"
```

Lo que no existe en Latin-1 se sustituye por algo parecido (comillas tipográficas por rectas, guiones largos por "-", "…" por "...", "€" por "EUR") o por "?".

**Importa:** `entidades.dash`

**Funciones**

| Función | Descripción |
|---|---|
| `latin1_de(cp: Int) -> String` | Latin-1 para un código Unicode |
| `utf8_a_latin1(s: String) -> String` | UTF-8 a Latin-1. Un byte que no forma una secuencia válida se toma como Latin-1 (páginas que dicen UTF-8 y no lo son). |
| `cp1252_a_latin1(s: String) -> String` | Windows-1252 a Latin-1 |
| `texto_decodificar(s: String, juego: String) -> String` | Según el juego de caracteres que declara la página (sin él, UTF-8) |
| `entidad_codigo(nombre: String) -> Int` | Código de una entidad con nombre ("amp" -&gt; 38), o -1 si no se conoce |
| `html_entidades(s: String) -> String` | Cambia las entidades (&amp;amp; &amp;eacute; &amp;#233; &amp;#xE9;) por su carácter. Las que no conoce se quedan como están. Sin ";" solo se aceptan amp, lt, gt y quot (como hacen los navegadores). |

### `lib/entidades.dash` <a id="entidades"></a>

Generado por tools/gen_entidades.py: no editar a mano. Entidades HTML con nombre que conoce dashweb, ordenadas (búsqueda binaria), y su código Unicode.

### `lib/html.dash` <a id="html"></a>

Tokenizador de HTML (y XHTML), tolerante con el HTML mal escrito.

```ruby
t = html_tokenizador(texto)          # el texto ya en Latin-1 (lib/texto.dash)
tok = html_siguiente(t)
while tok != nil
    if tok.tipo == HT_INICIO
        Print tok.nombre             # en minúsculas; tok.atributos, tok.autocierre
    end
    tok = html_siguiente(t)
end
```

El texto y los valores de los atributos llegan con las entidades ya cambiadas. Dentro de script, style, textarea y title (y xmp, plaintext...) todo es texto hasta su etiqueta de cierre.

**Importa:** `texto.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `HT_TEXTO` | `1` |
| `HT_INICIO` | `2` |
| `HT_FIN` | `3` |
| `HT_COMENTARIO` | `4` |
| `HT_DOCTYPE` | `5` |

**struct `Atributo`**

```ruby
nombre: String
valor: String
```

**struct `HtmlToken`**

```ruby
tipo: Int
nombre: String
texto: String
atributos: [Atributo]
autocierre: Bool
```

**struct `Tokenizador`**

```ruby
texto: String
pos: Int
crudo: String
```

**Funciones**

| Función | Descripción |
|---|---|
| `html_tokenizador(texto: String) -> Tokenizador` | — |
| `html_siguiente(t: Tokenizador) -> HtmlToken` | El siguiente token, o nil al final del texto |
| `html_atributo(tok: HtmlToken, nombre: String) -> String` | Valor de un atributo, o "" si no está |

### `lib/html5.dash` <a id="html5"></a>

HTML5 de verdad con Hubbub (el analizador de NetSurf, third_party/hubbub; tarea 36): el árbol del documento como lo construyen los navegadores, con las reglas de HTML5 (etiquetas mal anidadas, lo que sobra dentro de una tabla, los modos de inserción) y las 2231 entidades.

```ruby
doc = dom_desde_html5(texto)      # el texto en Latin-1, como dom_desde_html; el mismo tipo de árbol
```

Hubbub construye el árbol llamando a funciones nuestras (crear un elemento, añadir un hijo, mover los hijos...). Aquí el lado de C guarda ese árbol con números de nodo (y nada de punteros de C llega al DOM) y al acabar Dash lo copia a Nodos de lib/dom.dash. Si Hubbub no puede (sin memoria), se usa dom_desde_html.

**Importa:** `dom.dash`

**Directivas:** `@link "../build/img-lib/libimg.a"`

**Funciones**

| Función | Descripción |
|---|---|
| `dom_desde_html5(texto: String) -> Nodo` | El árbol del documento con las reglas de HTML5 (o el de dom_desde_html si Hubbub no puede) |

### `lib/dom.dash` <a id="dom"></a>

Árbol DOM a partir del HTML (lib/html.dash), con las reglas tolerantes de los navegadores: html, head y body implícitos, cierres implícitos (p, li, dt/dd, option, filas y celdas de tablas), elementos vacíos (br, img, input...) y etiquetas de cierre sueltas que se ignoran.

```ruby
doc = dom_desde_html(texto)        # el nodo documento; doc.hijos[0] es <html>
cuerpo = dom_buscar(doc, "body")
Print dom_texto(cuerpo)
```

Los hijos van en una lista; el padre es un campo weak (el árbol se libera entero cuando nadie retiene el documento). estilo: las propiedades CSS calculadas (lib/estilo.dash).

**Importa:** `html.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `DOM_ELEMENTO` | `1` |
| `DOM_TEXTO` | `3` |
| `DOM_COMENTARIO` | `8` |
| `DOM_DOCUMENTO` | `9` |
| `DOM_FRAGMENTO` | `11       # document.createDocumentFragment(): al añadirlo pasan sus hijos` |
| `TOQUE_TODO` | `0           # demasiados: todo` |
| `TOQUE_ATRIBUTO` | `1       # nodo: el elemento; nombre, antes y despues: el atributo y sus valores` |
| `TOQUE_CONTENIDO` | `2      # nodo: el elemento al que le han cambiado todos los hijos (textContent, innerHTML)` |
| `TOQUE_ENTRA` | `3          # nodo: el que acaba de entrar en el árbol` |
| `TOQUE_SALE` | `4           # nodo: el padre del que ha salido` |
| `TOQUE_VECINO` | `5         # nodo: un hermano del que ha entrado o salido` |
| `DOM_TOQUES_MAX` | `200` |
| `DOM_IMG_ANCHO` | `1024` |

**struct `Nodo`**

```ruby
tipo: Int
nombre: String
texto: String
atributos: [Atributo]
hijos: [Nodo]
weak padre: Nodo
estilo: {String: String}
pseudo_antes: Nodo = nil
pseudo_despues: Nodo = nil
clases_cache: [String] = nil   # dom_clases y dom_id: el atributo class partido y el id, la primera vez que
id_cache: String = nil         # se piden (dom_olvidar_atributos al cambiar un atributo)
vars: {String: String} = nil   # las propiedades --x que le llegan a sus hijos (lib/estilo.dash)
toques: [Toque] = nil          # en el documento: lo que ha cambiado el JavaScript (lib/jsdom.dash)
```

**struct `Toque`**

```ruby
tipo: Int
nodo: Nodo
nombre: String
antes: String
despues: String
```

**struct `Constructor`**

```ruby
doc: Nodo
html: Nodo
head: Nodo
body: Nodo
abiertos: [Nodo]
```

**Funciones**

| Función | Descripción |
|---|---|
| `dom_apuntar(n: Nodo, tipo: Int, nombre: String, antes: String, despues: String)` | Apunta un cambio en el documento de n (si n está en uno) |
| `dom_hermano_elemento(n: Nodo, despues: Bool) -> Nodo` | El elemento hermano de al lado (antes o después); nil si no hay |
| `dom_clases(n: Nodo) -> [String]` | Las clases del elemento (class="a  b\tc" -&gt; a, b, c), partidas una vez |
| `dom_id(n: Nodo) -> String` | — |
| `dom_olvidar_atributos(n: Nodo)` | Tras cambiar un atributo: class e id se vuelven a leer |
| `dom_nodo(tipo: Int, nombre: String, texto: String) -> Nodo` | — |
| `dom_agregar(padre: Nodo, hijo: Nodo)` | — |
| `dom_atributo(n: Nodo, nombre: String) -> String` | Valor de un atributo, o "" si no lo tiene |
| `dom_tiene_atributo(n: Nodo, nombre: String) -> Bool` | — |
| `dom_es_vacio(nombre: String) -> Bool` | Elementos sin contenido ni cierre |
| `dom_desde_html(texto: String) -> Nodo` | El árbol de un texto HTML (ya en Latin-1) |
| `dom_buscar(n: Nodo, nombre: String) -> Nodo` | El primer elemento con ese nombre (en orden de documento), o nil |
| `dom_por_id(n: Nodo, id: String) -> Nodo` | El elemento con ese id, o nil |
| `dom_texto(n: Nodo) -> String` | Todo el texto de dentro, seguido |
| `dom_esquema(n: Nodo) -> String` | Esquema del árbol en una línea, para pruebas: html(head(title("x")),body(p("a"),br)) |
| `dom_img_src(n: Nodo) -> String` | La dirección que se usa de un &lt;img&gt;: de su srcset (o del de un &lt;source&gt; de su &lt;picture&gt; con un tipo que se sabe leer), la más pequeña que no se quede corta para el ancho al que se va a ver (su width o DOM_IMG_ANCHO); con descriptores x, la de 1x. Si no hay srcset, su src. |
| `dom_es_youtube(d: String) -> Bool` | ¿Es la dirección de un vídeo de YouTube? (watch, embed, shorts, youtu.be, youtube-nocookie) |
| `dom_youtube_id(d: String) -> String` | El identificador de un vídeo de YouTube en su dirección (embed, watch?v=, youtu.be, shorts); "" si no |
| `dom_video_poster(n: Nodo) -> String` | La imagen que se ve antes de reproducir: el poster de un &lt;video&gt; o la miniatura de un YouTube (hqdefault: 480x360, la que se ve sin JavaScript); "" si no tiene |
| `dom_es_video(n: Nodo) -> Bool` | ¿Se maqueta n como un vídeo? (&lt;video&gt;, o un &lt;iframe&gt; de YouTube) |
| `video_src(n: Nodo) -> String` | La dirección de un &lt;video&gt;: su src o la del primer &lt;source&gt; con un tipo que se sabe reproducir (MP4, MOV, AVI, MKV, MPEG-TS, MPEG-1) o sin tipo |

## CSS y estilo

### `lib/css.dash` <a id="css"></a>

Lectura de CSS: reglas, selectores (con su especificidad) y declaraciones.

```ruby
hoja = css_leer(texto, 0)              # 0: número de orden de la primera regla
for r in hoja.reglas
    for s in r.selectores
        Print css_selector_texto(s)    # para pruebas
    end
end
decl = css_declaraciones("color: red; margin: 0 !important")   # atributo style
```

Selectores: tipo, *, #id, .clase, [atr], [atr=v] (y ~= |= ^= $= *=), :pseudo, ::pseudo y los combinadores descendiente, &gt;, + y ~. @media se mira al aplicar el estilo, con el ancho de la página (css_vista); @import se guarda en hoja.importes; el resto de reglas @ se salta.

**Constantes**

| Nombre | Valor |
|---|---|
| `CSS_DESCENDIENTE` | `1` |
| `CSS_HIJO` | `2` |
| `CSS_ADYACENTE` | `3` |
| `CSS_HERMANO` | `4` |
| `CSS_CONOCIDAS` | `"color background background-color background-image background-size background-position background-repeat border border-top border-right border-bottom border-left border-width border-style border-color border-radius border-collapse border-spacing box-shadow box-sizing margin margin-top margin-right margin-bottom margin-left padding padding-top padding-right padding-bottom padding-left width height min-width min-height max-width max-height position top right bottom left inset z-index overflow overflow-x overflow-y float clear visibility opacity flex flex-direction flex-wrap flex-flow flex-grow flex-shrink flex-basis order justify-content align-items align-self align-content place-items place-content gap row-gap column-gap grid grid-template grid-template-columns grid-template-rows grid-template-areas grid-area grid-column grid-row grid-auto-flow grid-auto-rows grid-auto-columns aspect-ratio object-fit transform transform-origin translate rotate scale animation animation-name transition font font-family font-size font-weight font-style line-height letter-spacing word-spacing text-align text-decoration text-transform text-indent text-shadow text-overflow white-space overflow-wrap word-wrap word-break vertical-align list-style list-style-type content table-layout caption-side"` |

**struct `SelAtributo`**

```ruby
nombre: String
op: String
valor: String
```

**struct `SelSimple`**: Un selector simple compuesto: div#a.b[c]:hover

```ruby
etiqueta: String
id: String
clases: [String]
atributos: [SelAtributo]
pseudo: [String]
pseudo_elemento: String
```

**struct `SelParte`**: Una parte de un selector y cómo se une a la anterior (0 en la primera)

```ruby
simple: SelSimple
combinador: Int
```

**struct `Selector`**

```ruby
partes: [SelParte]
especificidad: Int
```

**struct `Declaracion`**

```ruby
propiedad: String
valor: String
importante: Bool
```

**struct `Regla`**

```ruby
selectores: [Selector]
declaraciones: [Declaracion]
orden: Int
medios: [String] = nil      # las condiciones de los @media que la rodean (nil: vale siempre)
expandidas: [Declaracion] = nil   # las declaraciones con los atajos (margin, border...) ya partidos (lib/estilo.dash)
con_content: Int = -1       # 1 si declara content (lib/estilo.dash: los ::before/::after sin él no se miran)
capa: Int = 1000            # @layer: el puesto de su capa (1000: fuera de capas, gana a todas)
```

**struct `CaraFuente`**: Un @font-face: la familia (en minúsculas, sin comillas), su src entero, font-weight (100-900) y font-style

```ruby
familia: String
src: String
peso: Int
estilo: String
```

**struct `Fotograma`**: Un fotograma de un @keyframes: su sitio (0-1000, por mil) y sus declaraciones

```ruby
pos: Int
decl: [Declaracion]
```

**struct `HojaCSS`**

```ruby
reglas: [Regla]
importes: [String]
caras: [CaraFuente] = nil
fotogramas: {String: [Declaracion]} = nil
cuadros: {String: [Fotograma]} = nil
```

**Funciones**

| Función | Descripción |
|---|---|
| `css_sin_comentarios(s: String) -> String` | Sin comentarios /* ... */ |
| `css_partir(s: String, c: Int) -> [String]` | Trozos de s separados por el carácter c fuera de comillas y paréntesis |
| `css_declaraciones(texto: String) -> [Declaracion]` | Las declaraciones de un bloque (o del atributo style) |
| `css_desescapar(t: String) -> String` | El nombre sin sus escapes: "md\:grid" -&gt; "md:grid", "\31 0" -&gt; "10" (lo que no cabe en Latin-1, "?") |
| `css_selector(texto: String) -> Selector` | Un selector completo (sin comas); nil si no se entiende |
| `css_capas_reiniciar()` | — |
| `css_leer(texto: String, orden: Int) -> HojaCSS` | Hoja de estilo de un texto CSS; orden: número de la primera regla (para la cascada) |
| `css_fuente_src(src: String) -> String` | De la lista de un src de @font-face, la dirección del primero que dashweb sabe leer (TrueType, OpenType o WOFF; no WOFF2 ni local()): por su format() o, sin él, por la extensión; "" si ninguno |
| `css_vista(ancho: Int, alto: Int)` | — |
| `css_vista_ancho() -> Int` | — |
| `css_alto_vista() -> Int` | — |
| `css_regla_vale(r: Regla) -> Bool` | ¿Vale la regla con el ancho de ahora? (todos sus @media) |
| `css_regla_vale_con(r: Regla, ancho: Int) -> Bool` | Lo mismo con otro ancho (para saber si cambiar el ancho cambia el estilo) |
| `css_media_vale(medios: String) -> Bool` | Lo mismo para quien lo use desde fuera (matchMedia de lib/jsdom.dash) |
| `css_importes(texto: String) -> [String]` | Los @import de una hoja sin leerla entera: solo valen al principio (tras @charset y comentarios) |
| `css_url(valor: String) -> String` | La dirección de un valor con url(...) ("" si no lleva) |
| `css_selector_texto(sel: Selector) -> String` | El selector como texto, para pruebas: "div#a.b &gt; p:hover" |

### `lib/colores.dash` <a id="colores"></a>

Colores CSS (CSS Color 4 y 5) a RGB (0xRRGGBB): los 148 nombres y los del sistema, #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba() (con comas o con espacios y /), hsl()/hsla(), hwb(), lab(), lch(), oklab(), oklch(), color(srgb ...), color-mix() y light-dark() (el claro). -1: transparente o desconocido. Las cuentas van en enteros, en diezmilésimas (COLOR_UNO = 1).

**Importa:** `css.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `COLOR_UNO` | `10000` |

**Funciones**

| Función | Descripción |
|---|---|
| `css_color(valor: String) -> Int` | El color (casi transparente, alfa &lt; 0,5, es -1; si no, el color sin mezclar) |
| `css_alfa(valor: String) -> Int` | La opacidad de un color CSS, 0-255 (0 para transparent; 255 si no se entiende) |
| `css_color_opaco(valor: String) -> Int` | El color sin su opacidad (0xRRGGBB): transparent negro; -1 si no se entiende |

### `lib/estilo.dash` <a id="estilo"></a>

Estilo calculado: qué reglas CSS se aplican a cada elemento (selectores), cuál gana (cascada: importancia, origen, especificidad, orden), herencia y atajos desplegados.

```ruby
hojas = estilo_hojas(doc, "http://ejemplo.org/")   # la del navegador + <style>, <link>, @import
estilo_aplicar(doc, hojas)                          # cada elemento: nodo.estilo["color"]...
```

Los valores quedan como texto, salvo font-size, que se guarda en píxeles ("16px"). El tamaño normal (medium) es 13 píxeles: lo que cabe bien en una pantalla de Amiga con sus fuentes.

**Importa:** `dom.dash`, `css.dash`, `http.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `ESTILO_MEDIUM` | `13` |
| `ESTILO_ORDEN_HOJA` | `100000     # orden de la primera regla de cada hoja (una hoja puede tener miles)` |

**struct `Entrada`**: Un selector de una regla, en el índice de las hojas

```ruby
sel: Selector
regla: Regla
autor: Bool
antes: [String] = nil
num: Int = 0         # su número en el índice (la clave de _ganadoras_hechas)
```

**struct `Hojas`**

```ruby
lista: [HojaCSS]
autor: [Bool]
traidas: {String: String} = nil    # textos de hojas ya traídos (lib/recursos.dash): no se piden otra vez
indice: {String: [Entrada]} = nil
universales: [Entrada] = nil
indice_ancho: Int = -1             # el ancho de la página con que se hizo (por los @media)
indice_pe: {String: [Entrada]} = nil
vars_usadas: {String: Int} = nil
fotogramas: {String: [Declaracion]} = nil   # los @keyframes de todas las hojas (el último de un nombre manda)
cuadros: {String: [Fotograma]} = nil        # y todos sus fotogramas (lib/animacion.dash)
con_has: Bool = false              # algún selector usa :has() (un cambio puede tocar el estilo de los de arriba)
clases_usadas: {String: Int} = nil
ids_usados: {String: Int} = nil
atributos_usados: {String: Int} = nil
hermanos: Int = 0                  # 1: + o :first-child/:last-child; 2: ~, :nth-*, *-of-type, :only-child, :empty
hermanos_arriba: Bool = false      # algo de hermanos en una parte que no es la última ("li:first-child a", "h1 + p")
invalida: {String: {String: Int}} = nil
invalida_hermanos: {String: Int} = nil     # los que salen en un selector con + o ~
```

**struct `Candidata`**: Quién gana para una propiedad: el peso más alto

```ruby
valor: String
importante: Bool
autor: Bool
especificidad: Int
orden: Int
```

**struct `Calc`**

```ruby
expr: String
i: Int
em: Int
cien: Int
```

**struct `CalcValor`**

```ruby
v: Int              # px x 100, o el número x 100 si no tiene unidad
unidad: Bool
```

**Funciones**

| Función | Descripción |
|---|---|
| `estilo_hoja_navegador() -> HojaCSS` | Hoja por defecto del navegador (orden negativo: va antes que todo lo del autor) |
| `estilo_hojas(doc: Nodo, base: String) -> Hojas` | Las hojas del documento, en orden: la del navegador, luego &lt;style&gt; y &lt;link rel=stylesheet&gt; como aparecen (con sus @import delante). base: URL de la página, para las relativas. |
| `estilo_hojas_con(doc: Nodo, base: String, traidas: {String: String}) -> Hojas` | Lo mismo con las hojas externas ya traídas (dirección -&gt; texto en Latin-1); las que falten se piden |
| `estilo_caras(h: Hojas) -> [CaraFuente]` | Los @font-face de todas las hojas, en orden |
| `css_pseudo_conocida(p: String) -> Bool` | Las pseudo-clases que se saben sin interacción (las demás, :hover, :focus..., nunca se cumplen; querySelector da un error con ellas, como los navegadores con las que no conocen) |
| `estilo_cumple(n: Nodo, sel: Selector) -> Bool` | — |
| `estilo_puede_cumplirse(sel: Selector) -> Bool` | ¿Puede cumplirse alguna vez? (no si lleva ::before o una pseudo-clase de interacción) |
| `estilo_cambia_con(h: Hojas, ancho: Int) -> Bool` | ¿Cambia el estilo si la página pasa a medir ancho? (algún @media cambia de lado) |
| `estilo_se_hereda(p: String) -> Bool` | (para la maqueta: el estilo de una caja anónima, lo que hereda de su padre) |
| `estilo_aplicar(doc: Nodo, hojas: Hojas)` | Calcula el estilo de todo el árbol |
| `estilo_aplicar_partes(doc: Nodo, hojas: Hojas, toques: [Toque]) -> Bool` | Tras los cambios del JavaScript (Toque, apuntados en el documento por lib/jsdom.dash), el estilo solo de lo que pueden haber cambiado (como las "invalidation sets" de los navegadores): - una clase, id o atributo que ningún selector nombra: nada (salvo los de presentación: el elemento); - si lo nombra: el elemento solo; si su estilo cambia, todo lo suyo; si no, solo los de debajo que tengan alguna de las claves de los selectores que lo nombran antes de su última parte (".menu a" -&gt; los &lt;a&gt;); con + o ~, todos los hijos de su padre; - el atributo style: el elemento solo, y todo lo suyo si cambia; - un elemento que entra: él con todo lo suyo; sus vecinos (si hay + o :first-child), ellos solos; con ~ o :nth-child, todo el padre. false si no se puede (:has() en las hojas, demasiados cambios, o hay que rehacer &lt;html&gt; entero): estilo_aplicar. |
| `estilo_tamano(v: String, padre: Int) -> Int` | font-size en píxeles, según el del padre |
| `estilo_px(v: String, em_px: Int, cien: Int) -> Int` | — |
| `svg_ancho(n: Nodo) -> Int` | El tamaño con que se ve un &lt;svg&gt;: CSS (px), sus atributos o, si no, el de los navegadores (300x150; con viewBox, el alto en proporción) |
| `svg_alto(n: Nodo) -> Int` | — |
| `svg_viewbox(n: Nodo) -> String` | — |

### `lib/animacion.dash` <a id="animacion"></a>

CSS Animations de verdad (tarea 31q). Las animaciones de un elemento (sus propiedades animation-* con los @keyframes de las hojas), en qué punto van en un instante (retardo, duración, vueltas, direction, fill-mode y la función de tiempo: linear, ease..., cubic-bezier(), steps()) y el valor de una propiedad en ese punto, interpolado entre sus fotogramas (números con sus unidades, dentro de transform también, y colores).

```ruby
for a in animaciones_de(n, hojas)
    p = animacion_progreso(a, ms)            # -1 si en ese instante no hace nada
    v = animacion_valor(a, "opacity", p)     # "" si la animación no la toca
```

**Importa:** `maqueta.dash`, `colores.dash`

**struct `Animacion`**

```ruby
nodo: Nodo
nombre: String
cuadros: [Fotograma]
duracion: Int = 0        # ms
retardo: Int = 0         # ms
vueltas: Int = 1000      # en milésimas; -1: infinitas
sentido: String = "normal"
relleno: String = "none"
curva: String = "ease"
dx: Int = 0
dy: Int = 0
velado: Bool = false
```

**Funciones**

| Función | Descripción |
|---|---|
| `animaciones_de(n: Nodo, hojas: Hojas) -> [Animacion]` | Las animaciones de n que tienen @keyframes (vacía si ninguna) |
| `animacion_progreso(a: Animacion, ms: Int) -> Int` | En qué punto de sus fotogramas (0-1000) va a los ms dados; -1 si entonces no hace nada (antes de empezar sin backwards, o acabada sin forwards) |
| `animacion_curva(curva: String, x: Int) -> Int` | La función de tiempo en x (0-1000) |
| `animacion_valor(a: Animacion, propiedad: String, p: Int) -> String` | El valor de una propiedad en el punto p (0-1000): entre los dos fotogramas que la tienen alrededor (sin fotograma en 0 o en 1000, el valor del propio elemento); "" si la animación no la toca |
| `animacion_mezcla(a: String, b: String, q: Int) -> String` | Entre dos valores, a q (0-1000) del primero al segundo: colores por sus canales; si no, los números que lleven (con el mismo texto alrededor: "translateX(-20px)" y "translateX(0px)"); si no casan, el primero hasta la mitad y el segundo después |
| `animaciones_pagina(p: Pagina, hojas: Hojas) -> [Animacion]` | Las animaciones de los elementos animados de la página (los que marcó la maqueta en Dibujo.anim) |
| `animar(p: Pagina, anims: [Animacion], ms: Int) -> Bool` | Un fotograma: a los ms dados (desde que empezó la página) mueve lo dibujado de cada elemento animado (sus translate) y lo esconde si su opacity baja de 0,5 (el pintor no mezcla texto); true si alguna sigue viva (hace falta otro fotograma) |

## Maqueta y pintado

### `lib/maqueta.dash` <a id="maqueta"></a>

Maquetación: del árbol con estilo (lib/estilo.dash) a una lista de dibujo con posiciones.

```ruby
p = maquetar(doc, 600)          # ancho disponible en píxeles
for d in p.dibujos              # D_RECT, D_TEXTO, D_LINEA, D_IMAGEN
    ...
end
Print p.alto                    # alto total de la página
```

Mide el texto con las fuentes del Amiga (font_ de Dash), así que necesita un RastPort (una ventana abierta, o la zona de dibujo de MUI). Flujo normal: cajas de bloque (márgenes que se funden entre hermanos, bordes, relleno, width/height, fondos) y líneas de texto (cortes, espacios colapsados o pre, text-align); listas con su marca; tablas sencillas (celdas del mismo ancho); imágenes como un hueco de su tamaño; float en filas (el texto aún no los rodea). position, más adelante.

**Importa:** `estilo.dash`, `colores.dash`, `fuente_web.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `D_RECT` | `1` |
| `D_TEXTO` | `2` |
| `D_LINEA` | `3` |
| `D_IMAGEN` | `4` |
| `D_CONTROL` | `5      # un control de formulario (input, select, button): lo pinta el pintor según su nodo` |
| `D_ICONO` | `7        # un icono de una fuente de iconos (Font Awesome): texto, su código en hexadecimal` |
| `D_FONDO` | `6        # la imagen de fondo de una caja (texto: su dirección); background-size, -position y` |
| `D_ELIPSE` | `8       # una caja redonda (border-radius: 50 %): estilo, el grosor del borde (0: rellena)` |
| `D_DEGRADADO` | `10   # un linear-gradient de fondo: color/estilo, el primer color y su alfa (0-255);` |
| `D_REDONDO` | `12     # una caja con las esquinas redondeadas (border-radius): radio, los cuatro radios (1 byte` |
| `D_VIDEO` | `11       # un vídeo (<video>): texto, su dirección; nodo, el elemento (lib/videos.dash lo pinta)` |
| `D_TRAZO` | `9        # una barra girada 45 grados (transform: rotate): estilo 0 de arriba a la izquierda` |
| `EST_SUBRAYADO` | `1` |
| `EST_NEGRITA` | `2` |
| `EST_CURSIVA` | `4` |
| `FLEX_GRANDE` | `4000` |
| `PISTA_FIJA` | `0` |
| `PISTA_AUTO` | `1` |
| `PISTA_MIN` | `2      # min-content` |
| `PISTA_MAX` | `3      # max-content` |
| `PISTA_FR` | `4` |

**struct `Dibujo`**

```ruby
tipo: Int
x: Int
y: Int
ancho: Int
alto: Int
color: Int
texto: String
fuente: Int
estilo: Int
enlace: String
nodo: Nodo = nil     # el elemento que lo puso (para saber qué hay bajo un clic)
espaciado: Int = 0   # letter-spacing: px de más detrás de cada letra (el pintor las pone una a una)
radio: Int = 0       # D_REDONDO: los cuatro radios
capa: Int = 0        # z-index del contexto de apilado donde está (se pintan de menor a mayor)
recorte: Bool = false   # overflow: solo se pinta lo que cae en rx0..rx1, ry0..ry1 (coordenadas de página)
rx0: Int = 0
ry0: Int = 0
rx1: Int = 0
ry1: Int = 0
anim: Nodo = nil
base: Bool = false
bx: Int = 0
by: Int = 0
velado: Bool = false
```

**struct `Pagina`**

```ruby
dibujos: [Dibujo]
ancho: Int
alto: Int
fondo: Int
```

**struct `Pieza`**: Un trozo de una línea: una palabra (o una imagen, o un salto de línea forzado)

```ruby
texto: String
ancho: Int
alto: Int
base: Int
fuente: Int
estilo: Int
color: Int
tachado: Bool
enlace: String
espacio: Int
salto: Bool
imagen: Bool
pegada: Bool = false     # sin blanco con la anterior: no se puede cortar la línea entre las dos
nodo: Nodo = nil         # el elemento de la palabra o la imagen
control: Bool = false    # un control de formulario (nodo: el input, select o button)
espaciado: Int = 0       # letter-spacing en px
icono: Bool = false      # un icono (texto: su código en hexadecimal)
caja: Nodo = nil         # un inline-block maquetado como bloque en su sitio de la línea (ancho: con márgenes)
video: Bool = false      # un <video> (texto: su dirección)
```

**struct `Maquetador`**

```ruby
pagina: Pagina
fuentes: {String: Int}
topaz: Int
blanco: Int = 0      # un blanco detrás de una imagen: el ancho del espacio que toma la pieza siguiente
ancho_linea: Int = 0 # el ancho de las líneas del bloque que se está maquetando
```

**struct `Flotante`**: Un flotante ya colocado

```ruby
x: Int
y: Int
ancho: Int
alto: Int
izquierda: Bool
```

**struct `Celda`**: Tabla sencilla: filas una debajo de otra, celdas del mismo ancho Una tabla (CSS 2.1, 17.5): la rejilla con colspan y rowspan, el ancho de las columnas (automático: el mínimo y el máximo de su contenido o su width; table-layout: fixed con la primera fila), border-spacing (0 con border-collapse), el alto de las filas, el fondo de las filas y vertical-align en cada celda (middle por omisión). Cada celda se maqueta en 0,0 y sus dibujos se mueven a su sitio.

```ruby
nodo: Nodo
fila: Int
col: Int
filas: Int = 1
cols: Int = 1
alto: Int = 0
ancho: Int = 0
dibujos: [Dibujo] = nil
```

**struct `FlexHijo`**

```ruby
nodo: Nodo
base: Int = 0
hip: Int = 0
minimo: Int = 0          # -2: el mínimo automático, aún sin medir
maximo: Int = -1         # -1: sin máximo
bp: Int = 0              # bordes y rellenos en el eje principal
mi: Int = 0              # márgenes en el eje principal (0 si son auto)
mf: Int = 0
auto_i: Bool = false
auto_f: Bool = false
crecer: Int = 0          # flex-grow x 1000
encoger: Int = 1000      # flex-shrink x 1000
meta: Int = 0            # el tamaño principal que le toca (del contenido)
congelado: Bool = false
cruz: Int = 0            # su tamaño exterior en el eje cruzado (márgenes incluidos)
dibujos: [Dibujo] = nil  # lo suyo, maquetado en 0,0
medido: Int = -1         # el tamaño principal con el que se maquetó (-1: aún no)
ancho_usado: Int = 0     # columnas: el ancho exterior con el que se maquetó
linea: Int = 0
pos: Int = 0             # dónde empieza su caja de márgenes en el eje principal
pos_cruz: Int = 0
```

**struct `FlexLinea`**

```ruby
ini: Int
fin: Int                 # (sin incluir)
cruz: Int = 0
pos: Int = 0
```

**struct `Pista`**

```ruby
tmin: Int = 1
vmin: Int = 0
tmax: Int = 1
vmax: Int = 0        # px, o fr x 1000
base: Int = 0
limite: Int = -1     # -1: infinito
pos: Int = 0
```

**struct `GridHijo`**

```ruby
nodo: Nodo
f0: Int = -1         # filas [f0, f1) y columnas [c0, c1); -1: aún sin sitio
f1: Int = -1
c0: Int = -1
c1: Int = -1
span_f: Int = 1
span_c: Int = 1
dibujos: [Dibujo] = nil
alto: Int = 0        # exterior (márgenes incluidos), maquetado al ancho de su área
ancho_ext: Int = 0
minimo: Int = -1     # contribuciones de ancho (exteriores), cuando hacen falta
maximo: Int = -1
```

**Funciones**

| Función | Descripción |
|---|---|
| `maquetar(doc: Nodo, ancho: Int) -> Pagina` | — |
| `maqueta_desplazamiento(t: String, ancho: Int, alto: Int, em: Int) -> [Int]` | Lo que desplaza un transform (sus translate, translateX/Y y translate3d; % de una caja de ancho x alto); los demás (scale, rotate...) no cuentan aquí: para las animaciones (lib/animacion.dash) |
| `maqueta_mover(d: Dibujo, dx: Int, dy: Int)` | Lo mismo para quien anima la página (lib/animacion.dash) |
| `formulario_etiqueta(n: Nodo) -> String` | El texto de un botón: el del &lt;button&gt; o el value; si no, el de siempre |
| `formulario_opcion(n: Nodo) -> Nodo` | La opción elegida de un &lt;select&gt; (la que tiene selected, si no la primera); nil si no tiene |
| `maqueta_nodo_en(p: Pagina, x: Int, y: Int) -> Nodo` | El elemento que hay en el punto x, y de la página (lo último que se pintó allí: un texto, una imagen o un fondo de caja), o nil |

### `lib/pintor.dash` <a id="pintor"></a>

Pinta una página maquetada (lib/maqueta.dash) con los gfx_ de Dash en el RastPort actual: una ventana normal o la zona de dibujo de MUI.

```ruby
pintar(p, im, desde_y, x, y, ancho, alto)   # la franja [desde_y, desde_y + alto) de la página
                                            # en el rectángulo (x, y, ancho, alto)
```

im: las imágenes de la página (lib/imagenes.dash), o nil: entonces cada una es un marco gris. Los colores RGB se piden como lápices (color_pen, con caché). Las líneas de texto que no caben enteras en el rectángulo no se pintan (se verán al desplazar).

**Importa:** `maqueta.dash`, `imagenes.dash`, `videos.dash`

**Funciones**

| Función | Descripción |
|---|---|
| `pintar(p: Pagina, im: Imagenes, desde: Int, x0: Int, y0: Int, ancho: Int, alto: Int)` | — |
| `pintar_videos(p: Pagina, desde: Int, x0: Int, y0: Int, ancho: Int, alto: Int)` | Solo los vídeos de la franja [desde, desde + alto) (una imagen nueva: no hace falta pintar la página entera) |

### `lib/fuente_web.dash` <a id="fuente_web"></a>

Fuentes de la web (@font-face, tarea 31h): un TTF (o OTF con contornos TrueType, o un WOFF 1.0 de ellos) hecho TextFont del Amiga en memoria, con stb_truetype (third_party/stb, en build/img-lib/libimg.a: tools/build_img.sh). Los caracteres de Latin-1 (32-255, los mismos puntos de Unicode) a un tamaño dado (el font-size: el em), en un plano de 1 bit (sin suavizado: el pintor del Amiga pinta así). Lo devuelto vale para font_use, font_text_width... de Dash.

```ruby
f = fuente_web("T:fuente.ttf", 16)     # 0 si no se puede
font_use(f)
fuente_web_liberar(f)                  # (nunca con font_close)
```

**Importa:** `css.dash`

**Directivas:** `@link "../build/img-lib/libimg.a"`

**Funciones**

| Función | Descripción |
|---|---|
| `fuente_web(fichero: String, tam: Int) -> Int` (C) | El TextFont de la fuente del fichero a tam px (el em); 0 si no se puede leer o no es una fuente TrueType |
| `fuente_web_liberar(f: Int)` (C) | — |
| `fuente_web_registrar(clave: String, fichero: String)` | — |
| `fuente_web_para(familias: String, peso: Int, estilo: String, tam: Int) -> Int` | La fuente de la web para un font-family (la primera familia de la lista que tenga alguna, con el peso más cercano a peso y, si hay, del mismo estilo) a tam px; 0 si ninguna |

### `lib/formularios.dash` <a id="formularios"></a>

Formularios: lo que hace un clic en un control (marcar, elegir, dar el foco, enviar), una tecla en un campo de texto, y los datos de un formulario para enviarlo por GET. Los valores viven en los atributos del nodo (value, checked, selected), como los ve el JavaScript con getAttribute.

```ruby
r = formulario_clic(n)                     # FORM_NADA, FORM_CAMBIO (repintar), FORM_FOCO, FORM_ENVIAR
r = formulario_tecla(campo, caracter, raw) # FORM_CAMBIO o FORM_ENVIAR (Return)
destino = formulario_destino(n, base)      # la dirección del envío por GET ("" si no hay <form>)
e = formulario_envio(n, base)              # GET o POST según el <form>: e.metodo, e.direccion, e.cuerpo
```

**Importa:** `maqueta.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `FORM_NADA` | `0` |
| `FORM_CAMBIO` | `1` |
| `FORM_FOCO` | `2` |
| `FORM_ENVIAR` | `3` |

**struct `Envio`**

```ruby
metodo: String       # "GET" o "POST"
direccion: String    # con GET, ya con los datos como consulta
cuerpo: String       # con POST, los datos (application/x-www-form-urlencoded)
```

**Funciones**

| Función | Descripción |
|---|---|
| `formulario_de(n: Nodo) -> Nodo` | — |
| `formulario_es_texto(n: Nodo) -> Bool` | Un campo donde se escribe (input de texto, password, email..., textarea) |
| `formulario_clic(n: Nodo) -> Int` | — |
| `formulario_valor(n: Nodo) -> String` | El valor de un campo: el value de un input, el texto de un textarea, el de la opción elegida |
| `formulario_poner_valor(n: Nodo, v: String)` | — |
| `formulario_tecla(campo: Nodo, caracter: String, raw: Int) -> Int` | Una tecla en un campo de texto: caracter (mui_canvas_char) y su código raw. Return envía (en un textarea, salta de línea). |
| `formulario_datos(form: Nodo, enviado_por: Nodo) -> String` | Los datos del formulario (nombre=valor&amp;...) como application/x-www-form-urlencoded; el botón que lo envía cuenta si tiene nombre |
| `formulario_destino(desde: Nodo, base: String) -> String` | La dirección a la que se envía por GET el formulario de desde (un botón o un campo): su action (o la página) con los datos como consulta; "" si desde no está en un &lt;form&gt; |
| `formulario_envio(desde: Nodo, base: String) -> Envio` | El envío del formulario de desde según su method; direccion "" si desde no está en un &lt;form&gt; |

## JavaScript

### `lib/js.dash` <a id="js"></a>

JavaScript con QuickJS (third_party/quickjs, como librería: tools/build_qjs.sh lib).

```ruby
js = js_nuevo()                              # 0 si no hay memoria
r = js_evaluar(js, "1 + 2", "prueba.js")     # el resultado como texto ("3")
if js_error(js) != ""                        # la excepción de la última evaluación, o ""
    Print js_error(js)
end
js_liberar(js)
```

console.log (y error, warn, info) escribe en la salida del programa. Los textos de Dash son Latin-1 y los de QuickJS UTF-8: se convierten al entrar y al salir ("?" lo que no cabe). QuickJS pide mucha pila: el programa que importa este módulo arranca con 256 KB.

**Directivas:** `@link "../build/qjs-lib/libqjs.a"`, `@stack 262144`

**Funciones**

| Función | Descripción |
|---|---|
| `js_perfil_volcar(js: Int, cuantas: Int)` (C) | El perfil por muestras del JavaScript (solo con QuickJS y dashweb compilados con -DJS_PERFIL: tools/build_qjs.sh lib -DJS_PERFIL y DASH_CFLAGS=-DJS_PERFIL): las funciones que más pesan, por la salida |
| `js_nuevo() -> Int` (C) | Un motor nuevo con su contexto y console; 0 si no hay memoria |
| `js_evaluar(js: Int, codigo: String, nombre: String) -> String` (C) | Ejecuta el código (Latin-1) como un script; el resultado como texto ("undefined" si no da nada). Si salta una excepción, da "" y js_error la cuenta. |
| `js_gc_siempre(si: Bool)` (C) | Para buscar fallos de referencias: el recolector de ciclos tras cada script, llamada y trabajo (lento) |
| `js_memoria(js: Int) -> Int` (C) | Bytes que usa ahora el JavaScript de este motor (lo que ha pedido a malloc) |
| `js_limite(js: Int, bytes: Int)` (C) | Otro tope de memoria para el JavaScript de este motor (por omisión JS_MEMORIA, 48 MB): pasado, sus scripts reciben "out of memory" |
| `js_error(js: Int) -> String` (C) | La excepción de la última evaluación (mensaje y pila), o "" |
| `js_liberar(js: Int)` (C) | — |

### `lib/jsdom.dash` <a id="jsdom"></a>

El DOM para el JavaScript de una página (QuickJS, lib/js.dash): document, getElementById, querySelector(All) con los selectores de lib/css.dash, textContent, innerHTML, atributos, createElement, appendChild, removeChild... sobre el árbol de lib/dom.dash.

```ruby
js = js_nuevo()
jsdom_preparar(js, doc)                     # document = doc, eventos y temporizadores
jsdom_ejecutar_scripts(js, doc, base)       # los <script> en orden (en línea y src)
if jsdom_cambios(js) > 0 ...                # cuántas veces lo cambió el JS (para volver a maquetar)
seguir = jsdom_clic(js, nodo)               # evento click (sube hasta document); false: preventDefault
espera = jsdom_temporizadores(js)           # los setTimeout/setInterval que tocan; ms al siguiente, -1 si no hay
js_liberar(js)                              # suelta también los nodos que tenía el JS
```

Cada nodo tiene un solo objeto JS (a === b funciona); el objeto sujeta su Nodo hasta js_liberar. Los textos van en Latin-1 hacia Dash y en UTF-8 hacia el JS, como en lib/js.dash.

**Importa:** `js.dash`, `estilo.dash`, `formularios.dash`, `jsdom_preludio.dash`

**Funciones**

| Función | Descripción |
|---|---|
| `jsdom_por_id(doc: Nodo, id: String) -> Nodo` | — |
| `jsdom_selector(raiz: Nodo, texto: String, todos: Bool) -> [Nodo]` | Los elementos de dentro de raiz (sin ella) que cumplen el selector (con comas); el primero solo si no son todos. Un selector que no se entiende no da ninguno. |
| `jsdom_texto(n: Nodo) -> String` | — |
| `jsdom_poner_texto(n: Nodo, t: String)` | textContent = t: los hijos se cambian por un texto |
| `jsdom_atributo(n: Nodo, nombre: String) -> String` | — |
| `jsdom_tiene_atributo(n: Nodo, nombre: String) -> Bool` | — |
| `jsdom_poner_atributo(n: Nodo, nombre: String, valor: String)` | — |
| `jsdom_quitar_atributo(n: Nodo, nombre: String)` | — |
| `jsdom_valor(n: Nodo) -> String` | — |
| `jsdom_poner_valor(n: Nodo, v: String)` | — |
| `jsdom_crear(nombre: String) -> Nodo` | — |
| `jsdom_crear_texto(t: String) -> Nodo` | — |
| `jsdom_agregar(padre: Nodo, hijo: Nodo) -> Bool` | hijo pasa al final de padre (si estaba en otro sitio, sale de allí); false si hijo contiene a padre (un fragmento mete sus hijos) |
| `jsdom_quitar(padre: Nodo, hijo: Nodo) -> Bool` | — |
| `jsdom_padre(n: Nodo) -> Nodo` | — |
| `jsdom_hijos(n: Nodo, solo_elementos: Bool) -> [Nodo]` | Los hijos (solo los elementos, o todos) |
| `jsdom_html(n: Nodo) -> String` | innerHTML: el HTML de los hijos |
| `jsdom_poner_html(n: Nodo, html: String)` | innerHTML = html: los hijos se cambian por lo que da ese HTML (leído como el cuerpo de una página) |
| `jsdom_hermano(n: Nodo, despues: Bool, solo_elementos: Bool) -> Nodo` | El hermano de al lado (después o antes; solo elementos o cualquier nodo); nil si no hay |
| `jsdom_insertar_antes(padre: Nodo, nuevo: Nodo, ref: Nodo) -> Bool` | nuevo entra en padre antes de ref (al final si ref es nil); un fragmento mete sus hijos. false si ref no es hijo de padre o nuevo contiene a padre. |
| `jsdom_clonar(n: Nodo, profundo: Bool) -> Nodo` | Una copia de n (con sus hijos si profundo), sin padre |
| `jsdom_contiene(a: Nodo, b: Nodo) -> Bool` | ¿b está dentro de a (o es a)? |
| `jsdom_posicion(a: Nodo, b: Nodo) -> Int` | compareDocumentPosition: 1 sin relación, 2 b va antes, 4 b va después, 8 b contiene a a, 16 a contiene a b |
| `jsdom_selector_valido(texto: String) -> Bool` | ¿Se entiende el selector? (si no, querySelector y matches dan un SyntaxError, como en los navegadores, y jQuery usa su propio buscador) |
| `jsdom_cumple(n: Nodo, texto: String) -> Bool` | matches(): ¿n cumple alguno de los selectores? |
| `jsdom_crear_comentario(t: String) -> Nodo` | — |
| `jsdom_crear_fragmento() -> Nodo` | — |
| `jsdom_documento_nuevo(titulo: String) -> Nodo` | document.implementation.createHTMLDocument(): un documento aparte, vacío |
| `jsdom_html_fuera(n: Nodo) -> String` | outerHTML |
| `jsdom_cabeza(doc: Nodo) -> Nodo` | — |
| `jsdom_estilo_calculado(n: Nodo, propiedad: String) -> String` | getComputedStyle: lo calculado por lib/estilo.dash; si el elemento es nuevo (sin estilo aún), display según la etiqueta |
| `jsdom_visible(n: Nodo) -> Bool` | ¿Se ve? (offsetWidth/offsetHeight: sin posiciones de la maqueta, 0 si él o un antepasado tiene display: none, en su estilo o en el atributo style; 1 si no; 0 fuera del documento) |
| `jsdom_cuerpo(doc: Nodo) -> Nodo` | — |
| `jsdom_raiz(doc: Nodo) -> Nodo` | — |
| `jsdom_titulo(doc: Nodo) -> String` | — |
| `jsdom_script_en_curso() -> Nodo` | — |
| `jsdom_ejecutar_scripts(js: Int, doc: Nodo, base: String) -> Int` | Ejecuta los &lt;script&gt; del documento en orden: los de dentro y los de src (http(s) o fichero, relativo a base). Solo JavaScript (sin type, o type text/javascript, module no). Un error se escribe en la salida y se sigue con el siguiente. Cuántos se ejecutaron. |
| `jsdom_ejecutar_scripts_con(js: Int, doc: Nodo, base: String, traidos: {String: String}) -> Int` | Lo mismo con los src ya traídos (dirección -&gt; texto; lib/recursos.dash); los que falten se piden |
| `jsdom_motor_dom(js: Int, doc: Nodo)` (C) | document = doc en el motor js (una sola vez por motor); jsdom_preparar pone además el preludio |
| `jsdom_cambios(js: Int) -> Int` (C) | Cuántas veces cambió el JS el documento desde jsdom_preparar |
| `jsdom_preparar(js: Int, doc: Nodo)` | document = doc en el motor js, con eventos y temporizadores (una sola vez por motor) |
| `jsdom_galletas(direccion: String) -> String` | document.cookie (lib/cookies.dash, sin las HttpOnly) |
| `jsdom_galleta(direccion: String, v: String)` | — |
| `jsdom_clic(js: Int, n: Nodo) -> Bool` (C) | Un clic en n: el evento click sube de n hasta document. false si alguien llamó a preventDefault (o devolvió false en onclick): entonces no se sigue el enlace. |
| `jsdom_temporizadores(js: Int) -> Int` (C) | Ejecuta los setTimeout/setInterval que ya tocan; los ms que faltan para el siguiente, o -1 |
| `jsdom_evento(js: Int, n: Nodo, tipo: String) -> Bool` (C) | Un evento de ese tipo en n (sube hasta document); false si se paró (preventDefault, "return false") |
| `jsdom_envio(js: Int) -> Nodo` (C) | El formulario que el JavaScript mandó enviar con form.submit() (y lo olvida), o nil |

### `lib/jsdom_preludio.dash` <a id="jsdom_preludio"></a>

Generado por tools/preludio.py desde lib/jsdom_preludio.js: no editar a mano.

**Funciones**

| Función | Descripción |
|---|---|
| `jsdom_preludio_js() -> String` | — |

## Imágenes y vídeo

### `lib/imagenes.dash` <a id="imagenes"></a>

Imágenes de una página: las &lt;img&gt; y las imágenes de fondo se traen (HTTP/HTTPS a un fichero de T:, o de disco), se decodifican (lib/imagen_dec.dash; si no, los datatypes del sistema) y se pintan.

```ruby
im = imagenes_nuevas()
imagenes_cargar(im, doc, "http://ejemplo.org/")   # con la ventana ya abierta (colores)
pagina = maquetar(doc, ancho)                     # width/height que faltaban ya están puestos
pintar(pagina, im, desde, x, y, ancho, alto)      # lib/pintor.dash
imagenes_liberar(im)
```

Sin esperar (navegador): imagenes_pedir(im, doc, base) empieza las descargas (4 a la vez) y vuelve; imagenes_avanzar(im, doc) en cada vuelta del bucle dice cuántas llegaron (ya con su tamaño puesto: hay que volver a maquetar); imagenes_pendientes(im) cuántas faltan.

Sin width ni height en el HTML, la imagen toma su tamaño real; con uno solo, el otro guarda la proporción. Una imagen que no se puede traer o leer se queda como hueco (16x16 si no dice más).

**Importa:** `http.dash`, `dom.dash`, `css.dash`, `imagen_dec.dash`, `estilo.dash`, `colores.dash`, `fuente_web.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `IMAGEN_MAX_ANCHO` | `1280` |
| `IMAGEN_MAX_ALTO` | `1024` |
| `IMAGENES_A_LA_VEZ` | `4` |
| `IMAGENES_DECODIFICANDO` | `4` |
| `FUENTES_A_LA_VEZ` | `4` |

**struct `Imagenes`**

```ruby
por_src: {String: Int}      # src del HTML -> imagen cargada (0: no se pudo, o aún no ha llegado)
escaladas: {String: Int}    # "src ancho alto" -> copia a ese tamaño
ficheros: [String]          # los de T: que se descargaron
cola: [Pedida]              # las que esperan su turno o están llegando (imagenes_pedir)
vistas: {String: Int} = nil
cambiados: Int = 0          # <img> a los que una imagen llegada les ha puesto tamaño (cambia la maqueta)
recien: {String: Int} = nil # los src llegados desde el último repintado (para no repintar si no se ven)
posiciones: {String: Int} = nil
hasta: Int = -1
```

**struct `Pedida`**

```ruby
src: String
direccion: String
fichero: String
carga: Carga                # nil hasta que le toca
maxw: Int = 1280            # se decodifica reducida hasta lo que quepa en maxw x maxh (sin bajar de ahí)
maxh: Int = 1024
con_medidas: Bool = false   # una <img> con width y height (su tamaño en la página no depende de la imagen)
llegada: Bool = false       # ya está en su fichero: espera su turno para decodificarse
dec: Decodificando = nil    # decodificándose en otro proceso (lib/imagen_dec.dash)
fuente: String = ""         # una fuente de @font-face ("familia|peso|estilo"), no una imagen
perezosa: Bool = false      # <img loading=lazy>: espera a estar cerca de lo que se ve
de_fondo: Bool = false      # un background-image: espera a que algo lo pinte
```

**Funciones**

| Función | Descripción |
|---|---|
| `imagen_cargar(fichero: String) -> Int` | Una imagen de un fichero: decodificada aquí (lib/imagen_dec.dash, reducida a lo que cabe en una pantalla grande) y, si no se puede (otro formato, AmigaOS 3.1), con los datatypes |
| `imagen_cargar_a(fichero: String, maxw: Int, maxh: Int) -> Int` | Lo mismo sin decodificar más de lo que cabe en maxw x maxh |
| `imagenes_nuevas() -> Imagenes` | — |
| `imagenes_pedir(im: Imagenes, doc: Nodo, base: String)` | Empieza a traer las imágenes que falten (las de disco se cargan ya) y vuelve |
| `imagenes_fondo(n: Nodo, base: Url) -> String` | La imagen de fondo de un elemento (background-image: url(...)), como dirección completa; "" si no |
| `imagenes_cartel(n: Nodo, base: Url) -> String` | El cartel de un vídeo (dom_video_poster), como dirección completa en su atributo poster (el pintor lo busca ahí); "" si no tiene |
| `imagenes_avanzar(im: Imagenes, doc: Nodo) -> Int` | Avanza las descargas y las decodificaciones sin esperar; cuántas imágenes llegaron ahora (su tamaño ya está en los &lt;img&gt;). Cada imagen: se baja a su fichero (hasta IMAGENES_A_LA_VEZ a la vez) y se decodifica en otro proceso (hasta IMAGENES_DECODIFICANDO a la vez): la ventana no se para mientras. |
| `imagenes_vista(im: Imagenes, src: String, ancho: Int, alto: Int)` | El tamaño al que se ve una imagen en la página (el mayor, si sale varias veces) |
| `imagenes_pedir_fuentes(im: Imagenes, caras: [CaraFuente])` | Las fuentes de los @font-face (las que se saben leer: TTF, OTF y WOFF), a la cola como las imágenes; hasta 8 |
| `imagenes_fuente_de_iconos(familia: String) -> Bool` | Las fuentes de iconos no se bajan: sus letras están fuera de Latin-1 (lib/fuente_web.dash solo lee de la 32 a la 255) y dashweb dibuja él los iconos más comunes (lib/pintor.dash, D_ICONO). Font Awesome son 700 KB. |
| `imagenes_pendientes(im: Imagenes) -> Int` | Las que faltan (sin contar las aparcadas: lejos de lo que se ve, o fondos que nada pinta) |
| `imagenes_hasta(im: Imagenes, desde: Int, alto: Int)` | Hasta dónde de la página se bajan las imágenes perezosas (lo que se ve y dos pantallas más, como Chrome) |
| `imagenes_posicion(im: Imagenes, src: String, y: Int, empezar: Bool)` | Dónde se dibuja cada imagen en la maqueta nueva (empezar: antes de la primera) |
| `imagenes_cargar(im: Imagenes, doc: Nodo, base: String)` | — |
| `imagenes_a_tamano(im: Imagenes, src: String, ancho: Int, alto: Int) -> Int` | La imagen de src a ancho x alto (la cargada o una copia escalada, que se guarda); 0 si no hay |
| `imagenes_liberar(im: Imagenes)` | — |
| `imagenes_cargada(im: Imagenes, src: String) -> Int` | La imagen ya cargada de src a su tamaño natural (0 si no está); para los fondos |

### `lib/imagen_dec.dash` <a id="imagen_dec"></a>

Imágenes decodificadas por dashweb (tarea 29), sin los datatypes: JPEG con TJpgDec (third_party/tjpgd), que decodifica ya reducido a 1/2, 1/4 o 1/8; WebP (con y sin pérdida, con alfa; no animado) con el decodificador de libwebp (third_party/libwebp), que también reduce al decodificar; JPEG progresivo, PNG, GIF y BMP con stb_image (third_party/stb), reducidos después; SVG con nanosvg (third_party/nanosvg), dibujado al tamaño en que se ve (sin él, a su tamaño). El resultado pasa a la pantalla con image_from_rgb de Dash (picture.datatype V43: AmigaOS 3.5+).

```ruby
img = imagen_decodificar("T:foto.jpg", 1280, 1024)   # 0 si no se puede: entonces image_load
```

Una imagen más grande que ancho x alto se reduce hasta caber (para no gastar memoria ni tiempo en píxeles que no se van a ver); la proporción se guarda. tools/build_img.sh hace la librería.

**Directivas:** `@link "../build/img-lib/libimg.a"`

**Constantes**

| Nombre | Valor |
|---|---|
| `IMAGEN_PILA` | `262144` |

**struct `Decodificando`**

```ruby
tarea: Int
pedido: Int
```

**Funciones**

| Función | Descripción |
|---|---|
| `imagen_decodificar(fichero: String, maxw: Int, maxh: Int) -> Int` | La imagen del fichero decodificada aquí (cabe en maxw x maxh, reducida si es más grande); 0 si el formato no es de estos o picture.datatype es anterior a V43 |
| `imagen_empezar(fichero: String, maxw: Int, maxh: Int) -> Decodificando` | Empieza a decodificar el fichero en otro proceso, con prioridad -1 (avanza cuando el programa espera); nil si no se pudo empezar (entonces, imagen_decodificar) |
| `imagen_lista(d: Decodificando) -> Bool` | ¿Ya ha terminado? (no espera) |
| `imagen_acabar(d: Decodificando) -> Int` | La imagen (como imagen_decodificar: 0 si el formato no es de estos, o si picture.datatype es anterior a V43); espera si aún no ha terminado |
| `imagen_acabar_probar(d: Decodificando, x: Int, y: Int) -> String` | Para las pruebas, como imagen_probar con lo que decodificó la tarea |
| `imagen_probar(fichero: String, maxw: Int, maxh: Int, x: Int, y: Int) -> String` | Para las pruebas: "ancho x alto alfa=0/1 r,g,b" del píxel (x, y) de lo decodificado (sin pasarlo a la pantalla); "no" si no se puede |

### `lib/video.dash` <a id="video"></a>

Vídeo (tarea 30): el núcleo de MintVID (third_party/mintvid: H.264 con libavc, MPEG-1, MPEG-4, MJPEG, Cinepak...; MP4/MOV, AVI, MKV, MPEG-TS) por la interfaz de third_party/mintvid/dashweb_video.c, en build/video-lib/libvideo.a (tools/build_video.sh). Imagen a imagen, en RGB24; sin sonido todavía.

```ruby
v = video_abrir("T:clip.mp4")         # 0 si no se puede
while video_siguiente(v) == 1
    pixeles = video_rgb(v)            # video_ancho(v) x video_alto(v), video_paso(v) bytes por fila
    ... video_ms(v): su instante
end
video_cerrar(v)
```

**Directivas:** `@link "../build/video-lib/libvideo.a"`, `@stack 400000`

**Funciones**

| Función | Descripción |
|---|---|
| `video_abrir(fichero: String) -> Int` (C) | — |
| `video_abrir_bajando(datos: Int, listos: Int, total: Int) -> Int` (C) | Un vídeo que aún se baja (lib/http.dash, http_parcial): los listos primeros bytes de total están en datos. 0 si aún no se puede abrir (el índice del MP4 no ha llegado): probar luego con más |
| `video_bajado(v: Int, datos: Int, listos: Int)` (C) | Lo que ya ha llegado y dónde está (el búfer de la carga se mueve al crecer: después de cada http_avanzar) |
| `video_bajado_fichero(v: Int, fichero: String)` (C) | Ya ha llegado entero y está en fichero (la memoria de la carga se ha liberado) |
| `video_ancho(v: Int) -> Int` (C) | — |
| `video_alto(v: Int) -> Int` (C) | — |
| `video_fps_mil(v: Int) -> Int` (C) | Imágenes por segundo x 1000 (0 si el fichero no lo dice) |
| `video_codecs(v: Int) -> String` (C) | — |
| `video_siguiente(v: Int) -> Int` (C) | 1: hay una imagen nueva; 0: se acabó; -1: error; 2: la siguiente aún no ha llegado (se baja): esperar |
| `video_rgb(v: Int) -> Int` (C) | La imagen: RGB24, video_paso(v) bytes por fila (vale hasta el siguiente video_siguiente) |
| `video_paso(v: Int) -> Int` (C) | — |
| `video_ms(v: Int) -> Int` (C) | Su instante en ms (-1 si no se sabe) |
| `video_rapido(v: Int, modo: Int) -> Bool` (C) | H.264: 0 calidad, 1 equilibrado, 2 rápido, 3 turbo (una de cada dos), 4 turbo+ (solo las clave) |
| `video_cerrar(v: Int)` (C) | — |
| `video_reloj(v: Int) -> Int` (C) | Lo que ya ha sonado, en ms: el reloj que manda cuando el vídeo tiene sonido; -1 si no tiene o aún no empezó |
| `video_servicio(v: Int)` (C) | Atender la salida de sonido (llenar los búferes de Paula): a menudo mientras suena |
| `video_pausa(v: Int, pausa: Bool)` (C) | — |
| `video_con_sonido(v: Int) -> Bool` (C) | — |

### `lib/videos.dash` <a id="videos"></a>

Los vídeos de una página (tarea 30): cada &lt;video&gt; tiene un reproductor. Un clic lo trae (por HTTP/HTTPS, a un fichero de T:) y lo reproduce; otro lo para. Cada vuelta del bucle, videos_avanzar decodifica hasta la imagen que toca según el reloj (si va con retraso, salta imágenes) y dice si hay que repintar; el pintor llama a videos_pintar con el recuadro del vídeo. Sin sonido todavía.

```ruby
vs = videos_nuevos()
videos_alternar(vs, nodo_video, "https://ejemplo.org/")   # al hacer clic
if videos_avanzar(vs)                                   # en cada tic
    ... repintar
videos_liberar(vs)
```

**Importa:** `video.dash`, `youtube.dash`, `http.dash`, `url.dash`, `dom.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `V_PARADO` | `0       # aún no se ha pulsado` |
| `V_TRAYENDO` | `1` |
| `V_SONANDO` | `2` |
| `V_PAUSA` | `3` |
| `V_FIN` | `4` |
| `V_ERROR` | `5` |
| `V_RESOLVIENDO` | `6  # YouTube: buscando el MP4 del vídeo (lib/youtube.dash)` |
| `VIDEO_ADELANTO` | `30` |
| `VIDEO_PROBAR` | `262144` |
| `VIDEO_ESQUINA` | `24` |

**struct `Reproductor`**

```ruby
nodo: Nodo
direccion: String
fichero: String
estado: Int = 0
carga: Carga = nil
yt: YouTube = nil
v: Int = 0
inicio: Int = 0          # time_ms() del instante 0 del vídeo (mientras suena)
pos: Int = 0             # ms del vídeo donde se paró
hay_imagen: Bool = false
error: String = ""
decodificadas: Int = 0   # desde que empezó a sonar
mostradas: Int = 0       # las que llegaron a pintarse (las demás se saltaron por ir tarde)
t_decodificar: Int = 0   # ms decodificando
modo: Int = 2            # el modo de H.264 (video_rapido): 2 rápido, 3 turbo, 4 turbo+
tics: Int = 0            # vueltas de videos_avanzar mientras suena (medida)
fuera: Int = 0           # ms entre el final de una vuelta y el principio de la siguiente (medida)
fin_vuelta: Int = 0
lista: Bool = false      # una imagen decodificada que aún no ha llegado su hora
probar_en: Int = 0       # bytes bajados con los que probar a abrirlo antes de tenerlo entero
esperando: Bool = false  # suena mientras se baja y la imagen siguiente aún no ha llegado
t_espera: Int = 0        # time_ms() de cuando empezó a esperar
bajada_rota: Bool = false  # la descarga falló a medias: lo que falte ya no llegará
```

**struct `Videos`**

```ruby
lista: [Reproductor]
n: Int = 0               # para los nombres de los ficheros
```

**Funciones**

| Función | Descripción |
|---|---|
| `videos_nuevos() -> Videos` | — |
| `videos_de(vs: Videos, n: Nodo) -> Reproductor` | El reproductor de ese &lt;video&gt; (nil si aún no tiene) |
| `videos_alternar(vs: Videos, n: Nodo, base: String)` | Un clic en el vídeo: traerlo y reproducirlo, pararlo o seguir |
| `videos_avanzar(vs: Videos) -> Bool` | Avanza descargas y reproducción; true si algún vídeo cambió de imagen o de estado (hay que repintar). La imagen siguiente se decodifica por adelantado (videos_adelantar, después de pintar) y aquí solo se muestra cuando llega su hora; si no hay ninguna lista, se decodifica ya. |
| `videos_adelantar(vs: Videos) -> Bool` | Después de pintar: la imagen siguiente de cada vídeo que suena, decodificada mientras se espera su hora; true si alguno se acabó (hay que repintarlo: el botón de volver a empezar) |
| `videos_estado(vs: Videos) -> String` | Una línea para la barra de estado: el vídeo que suena, su segundo y las imágenes por segundo que se ven |
| `videos_espera(vs: Videos) -> Int` | Milisegundos hasta que toca la siguiente imagen de algún vídeo que suena (1 si ya toca); -1 si no suena ninguno (50 mientras alguno llega) |
| `videos_activos(vs: Videos) -> Bool` | ¿Algún vídeo suena o llega? (el bucle tiene que seguir dando tics) |
| `videos_pintar(vs: Videos, n: Nodo, x: Int, y: Int, ancho: Int, alto: Int)` | Pinta el vídeo de ese nodo en el recuadro x, y, ancho x alto: su imagen escalada o, si aún no tiene, un recuadro negro con el triángulo de reproducir (y "..." mientras llega) |
| `videos_pintar_r(r: Reproductor, x: Int, y: Int, ancho: Int, alto: Int)` | Lo mismo para un reproductor (la pantalla completa); r nil: el recuadro negro con el botón de reproducir |
| `videos_sin_empezar(vs: Videos, n: Nodo) -> Bool` | ¿Se ve aún el cartel del vídeo? (no se ha pulsado, o falló) |
| `videos_boton(vs: Videos, n: Nodo, x: Int, y: Int, ancho: Int, alto: Int)` | El botón de reproducir (y el error, si lo hubo) encima del cartel |
| `videos_en_completa(vs: Videos, n: Nodo, dx: Int, dy: Int, ancho: Int, alto: Int) -> Bool` | ¿Cae el punto (dx, dy), relativo al recuadro del vídeo, en su botón de pantalla completa? |
| `videos_liberar(vs: Videos)` | — |

### `lib/youtube.dash` <a id="youtube"></a>

YouTube (tarea 30c): de la dirección de un vídeo al MP4 de 360p (H.264 + AAC, itag 18) que se puede reproducir, como hace MintVID (third_party/mintvid/core/mr_youtube.c: sus analizadores, en libvideo.a) pero con la red de dashweb y sin esperar. Primero la página del vídeo; si no trae el MP4, el reproductor de YouTube (youtubei/v1/player) con varios clientes, en el orden de MintVID: ANDROID, ANDROID_VR, WEB_EMBEDDED_PLAYER y WEB. El MP4 se baja con el User-Agent del cliente que lo dio.

```ruby
y = youtube_empezar("https://www.youtube.com/watch?v=...")   # nil si no es de YouTube
while not youtube_avanzar(y)
    ... la interfaz
end
y.media, y.agente      # la dirección del MP4 y el User-Agent para bajarlo ("" y y.error si no hay)
```

**Importa:** `video.dash`, `http.dash`

**Constantes**

| Nombre | Valor |
|---|---|
| `YT_NAVEGADOR` | `"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"` |
| `YT_ANDROID_VERSION` | `"21.08.266"` |
| `YT_ANDROID` | `"com.google.android.youtube/21.08.266 (Linux; U; Android 11) gzip"` |
| `YT_VR_VERSION` | `"1.65.10"` |
| `YT_VR` | `"com.google.android.apps.youtube.vr.oculus/1.65.10 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip"` |
| `YT_CLAVE` | `"AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8"` |
| `YT_VERSION_WEB` | `"2.20260708.00.00"` |

**struct `YouTube`**

```ruby
id: String
paso: Int = 0            # 0 la página, 1-4 los clientes, 5 hecho
carga: Carga = nil
clave: String = ""
version: String = ""
media: String = ""
agente: String = ""
error: String = ""
```

**Funciones**

| Función | Descripción |
|---|---|
| `youtube_id(direccion: String) -> String` (C) | — |
| `youtube_mp4_de(texto: String) -> String` (C) | — |
| `youtube_es(direccion: String) -> Bool` | — |
| `youtube_empezar(direccion: String) -> YouTube` | — |
| `youtube_avanzar(y: YouTube) -> Bool` | true cuando acaba: con y.media o con y.error |
| `youtube_config(texto: String, nombre: String) -> String` | "NOMBRE":"valor" de la configuración de una página de YouTube ("" si no está) |

## Datos del usuario

### `lib/marcadores.dash` <a id="marcadores"></a>

Marcadores y preferencias del navegador en ficheros de texto (Latin-1, una entrada por línea):

```ruby
marcadores:   direccion<TAB>título
preferencias: clave=valor
```

```ruby
marcadores_agregar("PROGDIR:dashweb.marcadores", url, titulo)
html = marcadores_html("PROGDIR:dashweb.marcadores")   # una página con un enlace por marcador
preferencia_poner("PROGDIR:dashweb.prefs", "inicio", url)
inicio = preferencia("PROGDIR:dashweb.prefs", "inicio")   # "" si no está
```

**Importa:** `texto.dash`

**Funciones**

| Función | Descripción |
|---|---|
| `marcadores_direcciones(fichero: String) -> [String]` | Las direcciones y títulos guardados (dos listas del mismo largo) |
| `marcadores_titulos(fichero: String) -> [String]` | — |
| `marcadores_agregar(fichero: String, direccion: String, titulo: String) -> Bool` | Añade la dirección si no estaba; false si no se pudo escribir |
| `marcadores_html(fichero: String) -> String` | Una página con los marcadores como enlaces |
| `preferencia(fichero: String, clave: String) -> String` | — |
| `preferencia_poner(fichero: String, clave: String, valor: String) -> Bool` | — |

