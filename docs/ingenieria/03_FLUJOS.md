# 03. Flujos

Cómo trabaja dashweb por dentro: diagramas de flujo y de secuencia de los procesos principales. Los nombres son
funciones reales del código (ver [07](07_MODULOS_E_INTERFACES.md)). Los estados de cada objeto están en
[04](04_ESTADOS.md).

Índice:

| ID | Flujo | Tipo |
|---|---|---|
| F-01 | Arranque y salida | Flujo |
| F-02 | Bucle de eventos | Flujo |
| F-03 | El temporizador único (`programar`) | Flujo |
| F-04 | El tic de una ventana (`tic`) | Flujo |
| F-05 | Cargar una página | Secuencia |
| F-06 | Avanzar la carga (`avanzar_carga`) | Flujo |
| F-07 | Montar la página (`documento_avanzar`, `mostrar`) | Flujo |
| F-08 | Pintar (`pinta_en`, `pintar`) | Flujo |
| F-09 | Un clic en la página (`clic`) | Flujo |
| F-10 | El JS cambia el DOM (`documento_al_dia`) | Flujo |
| F-11 | Enviar un formulario | Secuencia |
| F-12 | Descargar a disco | Secuencia |
| F-13 | Una imagen, de la red a la pantalla | Secuencia |
| F-14 | Una petición HTTP por dentro (`http_avanzar`) | Flujo |
| F-15 | Un vídeo | Secuencia |

## F-01 Arranque y salida

```mermaid
flowchart TD
    A([dashweb arranca]) --> B["http_seguir = true; cookies_cargar(PROGDIR:dashweb.cookies)"]
    B --> C{"mui_app_begin == 0?"}
    C -- sí --> C1["Print: necesita MUI y un 68020"] --> Z([fin])
    C -- no --> D["Acerca_create()"]
    D --> E["Leer argumentos: TRAZA, GCSIEMPRE, direcciones"]
    E --> F{"¿alguna dirección?"}
    F -- no --> G["nueva_ventana(preferencia inicio)"]
    F -- sí --> H["nueva_ventana(dirección) por cada una, hasta 4"]
    G --> L[[F-02 Bucle de eventos]]
    H --> L
    L --> M["Salir: parar_carga y documento_liberar en cada ventana"]
    M --> N["http_cerrar_libres; cookies_guardar; mui_app_end"]
    N --> Z
```

`nueva_ventana` crea la ventana con `Navegador_create()`, registra el dibujo (`pintaK`, `giroK`), la entrada del lienzo,
el doble búfer y el cierre (`ID_CERRADA + k`), la abre, la desplaza si no es la primera y abre su dirección.

## F-02 Bucle de eventos

```mermaid
flowchart TD
    A{"abiertas() > 0"} -- no --> Z([salir])
    A -- sí --> B["ev = mui_wait_event()"]
    B --> C{"ev == -1 o ID_SALIR"}
    C -- sí --> Z
    C -- no --> D{"ID_TIC o ID_RANGO"}
    D -- sí --> D1["para cada ventana abierta: tic(w) o ajustar_barra(w)"] --> D2["programar()"] --> A
    D -- no --> E{"pantalla completa: ID_COMPLETA o ID_COMPLETA_CERRADA"}
    E -- sí --> E1["espacio: para o sigue; Esc o clic: salir_completa"] --> A
    E -- no --> F{"ID_CERRADA + k"}
    F -- sí --> F1["cerrar_ventana(k)"] --> A
    F -- no --> G["w = activa()"]
    G --> H{"w == nil"}
    H -- sí --> Z
    H -- no --> I["Atender ev en w: IR, RECARGAR, ATRAS, ADELANTE, HISTORIAL, VER_HISTORIAL, SCROLL, PARAR, PAGINA, MARCADORES, ANADIR, USAR_INICIO, INICIO, NUEVA, CERRAR, ACERCA"]
    I --> A
```

Los números de evento y lo que hace cada uno están en [06](06_INTERFAZ_DE_USUARIO.md).

## F-03 El temporizador único (`programar`)

Un solo `mui_timer` sirve a todas las ventanas. Se vuelve a calcular tras cada tic y cada vez que empieza algo.

```mermaid
flowchart TD
    A([programar]) --> B["espera = -1"]
    B --> C{"¿quedan ventanas abiertas por mirar?"}
    C -- no --> H{"espera > 0"}
    C -- sí --> D{"w.js_cuando >= 0"}
    D -- sí --> D1["espera = mín(espera, js_cuando - ahora, al menos 1)"] --> E
    D -- no --> E{"¿algo llegando? carga, preparando, descarga o imágenes pendientes"}
    E -- sí --> E1["espera = mín(espera, 50)"] --> F
    E -- no --> F{"¿vídeos con espera > 0?"}
    F -- sí --> F1["espera = mín(espera, videos_espera)"] --> C
    F -- no --> C
    H -- sí --> I["mui_timer(espera, ID_TIC)"] --> Z([fin])
    H -- no --> Z
```

Sin nada pendiente no se arma el temporizador y el programa duerme en `mui_wait_event`. La red todavía no despierta
al programa por señal (tarea 39; ver [10](10_RIESGOS_Y_PENDIENTES.md)).

## F-04 El tic de una ventana (`tic`)

```mermaid
flowchart TD
    A([tic w]) --> B["avanzar_carga(w): F-06"]
    B --> C["avanzar_descarga(w)"]
    C --> D{"documento_imagenes: ¿llegó algo que se ve?"}
    D -- sí --> D1["ajustar_barra; mui_canvas_redraw"] --> E
    D -- no --> E{"¿faltan imágenes?"}
    E -- sí --> E1["estado: Imágenes: faltan N"] --> G
    E -- no --> E2{"¿el estado decía Imágenes?"}
    E2 -- sí --> E3["estado: Listo; Print ... entera en N ms"] --> G
    E2 -- no --> G{"js_cuando vencido"}
    G -- sí --> G1["temporizadores(w): F-10"] --> H
    G -- no --> H{"¿vídeos?"}
    H -- sí --> H1["hasta 4 veces: videos_avanzar / videos_adelantar; mui_canvas_update"] --> I
    H -- no --> I["actualizar_giro(w)"]
    I --> Z([fin])
```

## F-05 Cargar una página

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant V as dashweb.dash
    participant H as http.dash
    participant R as red.dash y runtime
    participant N as Proceso DNS
    participant S as Servidor
    participant D as documento.dash
    participant RC as recursos.dash
    participant J as js y jsdom
    participant E as estilo.dash
    participant M as maqueta.dash
    participant P as pintor.dash

    U->>V: Return en el campo de dirección
    V->>V: navegar: apuntar en el historial, modo_carga(true)
    V->>H: http_empezar(dirección, 20000)
    H->>R: red_empezar: net_connect_start
    R->>N: buscar el nombre
    V->>V: programar: tic cada 50 ms
    loop cada tic
        V->>H: http_avanzar
        H->>R: net_connect_poll / tls_connect_poll / red_recibir_ya
        H-->>V: false, y http_fase para la barra de estado
    end
    N-->>R: dirección IP
    R->>S: conectar, TLS, GET
    S-->>R: respuesta, por trozos
    H-->>V: true: Respuesta entera
    V->>D: documento_empezar(dirección, respuesta)
    D->>D: texto a Latin-1, dom_desde_html5
    D->>RC: recursos_del_documento: hojas, scripts, @import
    loop cada tic
        V->>D: documento_avanzar
        D->>RC: recursos_avanzar, 4 a la vez
        RC->>S: GET de cada recurso
    end
    D->>J: js_nuevo, jsdom_preparar, jsdom_ejecutar_scripts_con
    D->>E: estilo_hojas_con, estilo_aplicar
    D->>D: imagenes_pedir_fuentes, imagenes_pedir
    D-->>V: true: preparada
    V->>V: mostrar: libera la anterior, título, estado Listo
    V->>D: documento_maquetar(ancho)
    D->>M: maquetar: Pagina con la lista de Dibujo
    V->>V: mui_canvas_redraw
    V->>P: pinta_en, pintar(pagina, franja visible)
    V->>J: temporizadores: load y setTimeout vencidos
```

## F-06 Avanzar la carga (`avanzar_carga`)

```mermaid
flowchart TD
    A([avanzar_carga w]) --> B{"w.carga"}
    B -- nil --> P
    B -- hay --> C{"http_avanzar(carga)"}
    C -- false --> D{"http_fase"}
    D -- buscando --> D1["estado: Buscando host"] --> Z([fin])
    D -- conectando --> D2["estado: Conectando con host"] --> Z
    D -- negociando --> D3["estado: Conexión segura con host"] --> Z
    D -- recibiendo --> E{"¿cabeceras de descarga?"}
    E -- sí --> E1["http_cancelar; empezar_descarga: F-12"] --> Z
    E -- no --> E2["progreso y estado: Recibiendo N KB"] --> Z
    C -- true --> F{"documento_es_descarga(respuesta)"}
    F -- sí --> E1
    F -- no --> G["w.preparando = documento_empezar(dir, respuesta)"]
    G --> P{"w.preparando"}
    P -- nil --> Z
    P -- hay --> Q{"documento_avanzar"}
    Q -- false --> Q1["estado: Trayendo hojas y scripts: faltan N"] --> Z
    Q -- true --> R["modo_carga(false); mostrar(w, documento): F-07"] --> Z
```

## F-07 Montar la página

```mermaid
flowchart TD
    A([documento_avanzar d]) --> B{"recursos_avanzar: ¿faltan?"}
    B -- sí --> B1[/false/]
    B -- no --> C{"¿hay script?"}
    C -- sí --> C1["js_nuevo; jsdom_preparar; jsdom_ejecutar_scripts_con: en orden de documento"] --> C2["olvidar los toques: el estilo aún no está hecho"] --> D
    C -- no --> D["estilo_hojas_con; estilo_aplicar"]
    D --> E["imagenes_pedir_fuentes; imagenes_pedir"]
    E --> F[/true/]
    F --> G([mostrar w, d])
    G --> H["documento_liberar(anterior)"]
    H --> I["documento_maquetar(ancho)"]
    I --> I1{"¿un @media cambia con este ancho?"}
    I1 -- sí --> I2["css_vista; estilo_aplicar"] --> I3
    I1 -- no --> I3["maquetar(doc, ancho): Pagina"]
    I3 --> J["desplazar al fragmento si lo hay; título; ajustar_barra; estado Listo"]
    J --> K["mui_canvas_redraw; temporizadores(w)"]
```

## F-08 Pintar

```mermaid
flowchart TD
    A([MUI pide pintar: pintaK x,y,ancho,alto]) --> B["pinta_en(k, ...)"]
    B --> C{"¿cambió el ancho?"}
    C -- sí --> C1["estilo_vh; documento_maquetar; mui_timer(1, ID_RANGO) para la barra"] --> D
    C -- no --> D["imagenes_hasta: pedir las perezosas cercanas"]
    D --> E{"mui_canvas_updating: solo vídeo"}
    E -- sí --> E1["pintar_videos"] --> Z([fin])
    E -- no --> F["pintar(pagina, im, desde, x, y, ancho, alto)"]
    F --> G["fondo; para cada Dibujo en la franja visible: recortar y pintar con gfx_"]
    G --> Z
```

## F-09 Un clic en la página (`clic`)

```mermaid
flowchart TD
    A([ID_PAGINA con botón 1]) --> B["n = maqueta_nodo_en(pagina, x, y + desde)"]
    B --> C{"n"}
    C -- nil --> Z([fin])
    C -- hay --> D{"¿la página tiene JS?"}
    D -- sí --> D1["seguir = jsdom_clic(js, n)"] --> D2["documento_al_dia: F-10; temporizadores; envio_del_js"] --> E
    D -- no --> E{"seguir"}
    E -- no --> Z
    E -- sí --> F{"¿es un video?"}
    F -- sí --> F1{"¿en su esquina?"}
    F1 -- sí --> F2["pantalla_completa"] --> Z
    F1 -- no --> F3["videos_alternar; redraw; programar"] --> Z
    F -- no --> G["r = formulario_clic(n)"]
    G --> H{"r"}
    H -- FORM_FOCO --> H1["w.foco = n; redraw"] --> Z
    H -- FORM_CAMBIO --> H2["redraw"] --> Z
    H -- FORM_ENVIAR --> H3["enviar(w, n): F-11"] --> Z
    H -- FORM_NADA --> I{"documento_enlace(n)"}
    I -- vacío --> Z
    I -- destino --> I1["navegar(w, destino): F-05"] --> Z
```

## F-10 El JS cambia el DOM (`documento_al_dia`)

```mermaid
flowchart TD
    A([tras un clic o temporizadores]) --> B{"jsdom_cambios == d.cambios"}
    B -- sí --> Z([sin cambios])
    B -- no --> C["d.cambios = jsdom_cambios; título nuevo"]
    C --> D{"estilo_aplicar_partes(doc, hojas, toques)"}
    D -- "true: solo lo afectado" --> F
    D -- "false: :has, ancho distinto, más de 200 toques o TOQUE_TODO" --> E["estilo_aplicar: todo"]
    E --> F["imagenes_pedir: nuevas imágenes"]
    F --> G["maquetar entera"]
    G --> H([true: ajustar_barra y redraw])
```

Qué recalcula `estilo_aplicar_partes` según el toque:

```mermaid
flowchart TD
    T([un Toque]) --> A{"tipo"}
    A -- "ATRIBUTO no nombrado por ningún selector, salvo style y de presentación" --> N[nada]
    A -- "ATRIBUTO nombrado: clase, id, atributo" --> B["recalcular el elemento"]
    B --> B1{"¿cambió su estilo?"}
    B1 -- sí --> S[su subárbol]
    B1 -- no --> I["solo los descendientes que nombran esa clave"]
    B --> B2{"¿hay selectores con + o ~?"}
    B2 -- sí --> PA[el subárbol del padre]
    A -- "ENTRA, CONTENIDO" --> S2[su subárbol]
    S2 --> B3{"¿hay ~ o :nth-*?"}
    B3 -- sí --> PA
```

## F-11 Enviar un formulario

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant V as dashweb.dash
    participant F as formularios.dash
    participant J as jsdom
    participant H as http.dash
    U->>V: Return en un campo o clic en enviar
    V->>F: formulario_tecla o formulario_clic: FORM_ENVIAR
    V->>F: formulario_de(control)
    alt la página tiene JS
        V->>J: jsdom_evento(form, submit)
        J-->>V: false si un manejador lo paró
    end
    V->>F: formulario_envio(control, dirección)
    F-->>V: Envio: método, dirección, cuerpo
    alt POST
        V->>H: http_empezar_post(dirección, cuerpo, x-www-form-urlencoded)
        V->>V: apuntar en el historial
    else GET
        V->>V: navegar(dirección con la consulta)
    end
    Note over V,H: sigue como F-05
```

## F-12 Descargar a disco

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant V as dashweb.dash
    participant H as http.dash
    participant A as AmigaOS: ASL
    participant S as Servidor
    V->>H: http_cabeceras_ya(carga)
    H-->>V: Respuesta con attachment o tipo de fichero
    V->>H: http_cancelar(carga)
    V->>A: dialog_file(Guardar nombre, guardar)
    A-->>U: selector de ficheros
    U-->>A: ruta, o cancelar
    alt cancelado
        V->>V: estado: Descarga cancelada
    else ruta elegida
        V->>H: http_empezar_a_fichero(dirección, ruta, 30000)
        loop cada tic
            V->>H: http_avanzar(descarga)
            H->>S: recibir, sin comprimir
            V->>V: estado: Bajando a ruta: N KB
        end
        H-->>V: Respuesta 2xx: Guardado en ruta, si no: No se pudo guardar
    end
```

Nota: hoy la respuesta entera se guarda en memoria antes de escribirse al fichero (riesgo R-02 en
[10](10_RIESGOS_Y_PENDIENTES.md)).

## F-13 Una imagen, de la red a la pantalla

```mermaid
sequenceDiagram
    autonumber
    participant D as documento.dash
    participant I as imagenes.dash
    participant H as http.dash
    participant T as Proceso decodificador
    participant RT as runtime de Dash
    participant P as pintor.dash
    D->>I: imagenes_pedir(doc, dirección): cola de Pedida
    Note over I: perezosa: espera a estar a menos de 2 pantallas. Fondo: espera a que la maqueta lo pinte
    loop cada tic, hasta 4 descargas
        I->>H: http_empezar_a_fichero(src, T:dashweb_imgN)
        H-->>I: llegada
    end
    I->>T: imagen_empezar: task_start_with, prioridad -1, hasta 4 a la vez
    T->>T: leer el fichero, TJpgDec, libwebp, nanosvg o stb_image, al tamaño en que se ve
    loop cada tic
        I->>T: task_done
    end
    T-->>I: píxeles RGB o RGBA
    I->>RT: image_from_rgb: BitMap directo en RTG, si no picture.datatype
    I-->>D: cambiados > 0 si la img no tenía tamaño
    D->>D: documento_imagenes: maquetar otra vez si hace falta, repintar como mucho cada 2,5 s y solo si se ve
    D->>P: pintar: imagenes_a_tamano, copia escalada en caché
```

Si no se puede crear el proceso, se decodifica en el principal. Si los decodificadores propios no pueden, se usa
`image_load` (datatypes).

## F-14 Una petición HTTP por dentro (`http_avanzar`)

```mermaid
flowchart TD
    A([http_avanzar c]) --> B{"c.hecha"}
    B -- sí --> T([true])
    B -- no --> C{"conexion.fase != 0: abriéndose"}
    C -- sí --> C1["red_abrir_avanzar: nombre, conectar, TLS; otra conexión si lleva más de 5 s callada"] --> C2{"resultado"}
    C2 -- 0 --> F([false])
    C2 -- "menor que 0" --> ERR["respuesta.error; red_cerrar; hecha"] --> T
    C2 -- 1 --> D
    C -- no --> D{"¿petición enviada?"}
    D -- no --> D1["red_enviar(_http_peticion): método, Host, User-Agent, Accept-Encoding, Cookie, Connection"]
    D1 --> D2{"¿enviada?"}
    D2 -- "no y la conexión era reusada" --> R1["_carga_otra_conexion"] --> F
    D2 -- no --> ERR
    D2 -- sí --> E
    D -- sí --> E["red_recibir_ya en bucle: todo lo que haya, al búfer"]
    E --> E1{"¿cerrada sin datos y la conexión era reusada?"}
    E1 -- sí --> R1
    E1 -- no --> G{"¿entera? cierre, Content-Length o último trozo chunked"}
    G -- no --> G1{"¿más de espera ms sin datos?"}
    G1 -- sí --> ERR2["error: tiempo agotado"] --> T
    G1 -- no --> F
    G -- sí --> H["_http_leer_respuesta: estado, cabeceras, cuerpo, gzip; _http_cookies"]
    H --> J["_http_soltar: la conexión queda libre si sigue viva, HTTP/1.1 y sin close"]
    J --> I{"¿301, 302, 303, 307 o 308 con Location?"}
    I -- no --> T
    I -- sí --> I0{"¿ya 5 redirecciones?"}
    I0 -- sí --> I2["error: demasiadas redirecciones"] --> T
    I0 -- no --> I1["resolver Location; GET salvo 307 y 308; nueva conexión o una libre"] --> F
```

## F-15 Un vídeo

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant V as dashweb.dash
    participant VS as videos.dash
    participant Y as youtube.dash
    participant H as http.dash
    participant M as video.dash: MintVID
    U->>V: clic sobre el video
    V->>VS: videos_alternar(nodo)
    alt YouTube
        VS->>Y: youtube_empezar
        loop cada tic
            VS->>Y: youtube_avanzar: página, luego youtubei con varios clientes
        end
        Y-->>VS: dirección del MP4 de 360p y su User-Agent
    end
    VS->>H: http_empezar_a_fichero(MP4, T:dashweb_videoN, 60000)
    loop cada 256 KB bajados
        VS->>M: probar a abrir con lo que hay
    end
    M-->>VS: abierto: empieza a sonar
    loop cada tic: videos_espera da el ritmo
        VS->>M: siguiente imagen si ya toca según el reloj del sonido
        VS->>V: mui_canvas_update: solo el vídeo
    end
    U->>V: otro clic: pausa o sigue
```
