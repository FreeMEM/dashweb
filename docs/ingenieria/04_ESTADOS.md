# 04. Diagramas de estado

Los objetos de dashweb que cambian de estado con el tiempo, y qué los hace cambiar. Los flujos que los mueven están en
[03](03_FLUJOS.md); sus campos, en [05](05_MODELO_DE_DATOS.md).

| ID | Objeto | Dónde vive el estado |
|---|---|---|
| E-01 | La ventana del navegador | `struct Ventana` (`carga`, `preparando`, `actual`, `descarga`) |
| E-02 | Una carga HTTP | `struct Carga` + `Conexion.fase` |
| E-03 | Una conexión | `struct Conexion` y la lista de libres de `http.dash` |
| E-04 | Una página (`Documento`) | `struct Documento` |
| E-05 | Una imagen pedida | `struct Pedida` |
| E-06 | Un reproductor de vídeo | `Reproductor.estado` (`V_*`) |
| E-07 | La búsqueda de un vídeo de YouTube | `YouTube.paso` |
| E-08 | La barra de herramientas | `Ventana.cargando`, `con_atras`, `con_adelante`, `con_historial` |
| E-09 | El foco de los formularios | `Ventana.foco` |
| E-10 | La pantalla completa | `dw_completa` |

## E-01 La ventana del navegador

Una ventana puede tener a la vez una página a la vista (`actual`), otra llegando (`carga`, luego `preparando`) y una
descarga a disco (`descarga`). El diagrama sigue la página; la descarga va en paralelo.

```mermaid
stateDiagram-v2
    [*] --> Mostrando: nueva_ventana abre la de inicio
    Mostrando --> Cargando: abrir(http o https)
    Mostrando --> Mostrando: abrir(dashweb o file), síncrono
    Cargando --> Preparando: http_avanzar true y no es descarga
    Cargando --> Mostrando: Parar (la anterior sigue)
    Cargando --> Mostrando: es descarga (la anterior sigue, empieza la descarga)
    Cargando --> Cargando: abrir otra dirección
    Preparando --> Mostrando: documento_avanzar true, mostrar
    Preparando --> Mostrando: Parar
    Mostrando --> Mostrando: el JS o una imagen cambian la página
    Mostrando --> [*]: cerrar_ventana
    Cargando --> [*]: cerrar_ventana
    Preparando --> [*]: cerrar_ventana

    state Cargando {
        [*] --> Buscando
        Buscando --> Conectando
        Conectando --> Negociando: https
        Conectando --> Recibiendo: http
        Negociando --> Recibiendo
    }
```

La descarga a disco:

```mermaid
stateDiagram-v2
    [*] --> SinDescarga
    SinDescarga --> EligiendoRuta: cabeceras de descarga
    EligiendoRuta --> SinDescarga: cancelar el selector
    EligiendoRuta --> Bajando: ruta elegida, http_empezar_a_fichero
    Bajando --> SinDescarga: acaba (Guardado o No se pudo guardar)
    Bajando --> Bajando: otra descarga la sustituye
```

## E-02 Una carga HTTP (`Carga`)

```mermaid
stateDiagram-v2
    [*] --> Abriendo: http_empezar
    state Abriendo {
        [*] --> Buscando: proceso DNS
        Buscando --> Conectando
        Conectando --> NegociandoTLS: https
        NegociandoTLS --> [*]
        Conectando --> [*]: http
        Conectando --> Buscando: más de 5 s callada, otra conexión (hasta 2)
        NegociandoTLS --> Buscando: TLS agotado, otra conexión
    }
    [*] --> Enviando: había una conexión libre del mismo servidor
    Abriendo --> Enviando: abierta
    Abriendo --> Hecha: error al abrir
    Enviando --> Recibiendo: petición enviada
    Enviando --> Abriendo: la conexión reusada estaba cerrada
    Recibiendo --> Recibiendo: llegan datos
    Recibiendo --> Abriendo: la conexión reusada se cerró sin datos
    Recibiendo --> Hecha: entera y no es redirección
    Recibiendo --> Abriendo: redirección (hasta 5)
    Recibiendo --> Hecha: espera ms sin datos (tiempo agotado)
    Abriendo --> Cancelada: http_cancelar
    Enviando --> Cancelada: http_cancelar
    Recibiendo --> Cancelada: http_cancelar
    Hecha --> [*]
    Cancelada --> [*]
```

`http_fase` traduce el estado a lo que ve el usuario: `buscando`, `conectando`, `negociando`, `recibiendo` o `""` (hecha).

## E-03 Una conexión (`Conexion`)

```mermaid
stateDiagram-v2
    [*] --> NombreYConexion: red_abrir_empezar (fase 1)
    NombreYConexion --> TLS: conectada y con TLS (fase 2)
    NombreYConexion --> Abierta: conectada sin TLS (fase 0)
    TLS --> Abierta: negociada
    NombreYConexion --> Cerrada: error
    TLS --> Cerrada: error
    Abierta --> Libre: respuesta entera, HTTP/1.1, sin close (http_seguir)
    Abierta --> Cerrada: el servidor cierra o hay error
    Libre --> Abierta: otra carga al mismo host, puerto y TLS
    Libre --> Cerrada: más de 10 s libre, más de 8 libres, el servidor la cerró, o http_cerrar_libres
    Cerrada --> [*]
```

## E-04 Una página (`Documento`)

```mermaid
stateDiagram-v2
    [*] --> TrayendoRecursos: documento_empezar (árbol hecho, hojas y scripts pedidos)
    [*] --> Preparada: documento_abrir o documento_html (síncrono)
    TrayendoRecursos --> Preparada: documento_avanzar true (scripts ejecutados, estilo calculado)
    TrayendoRecursos --> Liberada: Parar o abrir otra
    Preparada --> Maquetada: documento_maquetar
    Maquetada --> Maquetada: cambia el ancho o un @media (otra vez)
    Maquetada --> Sucia: el JS toca el DOM (jsdom_cambios crece)
    Sucia --> Maquetada: documento_al_dia (estilo parcial o entero, maqueta entera)
    Maquetada --> Maquetada: llegan imágenes o fuentes que cambian tamaños
    Maquetada --> Liberada: otra página, cerrar ventana o salir
    Liberada --> [*]
```

`documento_liberar` suelta recursos, imágenes (y sus ficheros de `T:`), vídeos y el motor JS. El árbol y la maqueta se
liberan al soltar la última referencia (el contador de Dash; `padre` es `weak`).

## E-05 Una imagen pedida (`Pedida`)

```mermaid
stateDiagram-v2
    [*] --> Aplazada: loading=lazy o fondo
    [*] --> EnCola: img normal o fuente
    Aplazada --> EnCola: queda a menos de 2 pantallas, o la maqueta pinta el fondo
    EnCola --> Bajando: hay hueco (4 a la vez, las fuentes, en su propia cola)
    Bajando --> Llegada: fichero en T
    Bajando --> Fallida: error o estado no 2xx
    Llegada --> Decodificando: hay hueco (4 a la vez), task_start_with
    Llegada --> Lista: sin proceso posible, decodificada en el principal
    Decodificando --> Lista: task_done, image_from_rgb
    Decodificando --> Lista: el decodificador no pudo, image_load (datatypes)
    Decodificando --> Fallida: tampoco con datatypes
    Lista --> [*]
    Fallida --> [*]: se pinta un marco gris
```

Una fuente web llega igual y en vez de decodificarse se registra (`fuente_web_registrar`), lo que obliga a maquetar
otra vez.

## E-06 Un reproductor de vídeo (`Reproductor.estado`)

```mermaid
stateDiagram-v2
    [*] --> V_PARADO: el video está en la página (se ve su cartel)
    V_PARADO --> V_RESOLVIENDO: clic, es de YouTube
    V_PARADO --> V_TRAYENDO: clic, es http o https
    V_PARADO --> V_SONANDO: clic, es un fichero local
    V_RESOLVIENDO --> V_TRAYENDO: MP4 encontrado
    V_RESOLVIENDO --> V_ERROR: ningún cliente lo dio
    V_TRAYENDO --> V_SONANDO: se puede abrir con lo bajado (cada 256 KB) o acabó la descarga
    V_TRAYENDO --> V_ERROR: descarga o formato
    V_SONANDO --> V_PAUSA: clic
    V_PAUSA --> V_SONANDO: clic
    V_SONANDO --> V_FIN: última imagen
    V_SONANDO --> V_ERROR: error al decodificar
    V_FIN --> V_SONANDO: clic, empieza otra vez
    V_ERROR --> V_RESOLVIENDO: clic, otra vez
    V_ERROR --> V_TRAYENDO: clic, otra vez

    state V_SONANDO {
        [*] --> AlDia
        AlDia --> Esperando: la imagen siguiente aún no ha bajado
        Esperando --> AlDia: ha llegado
        AlDia --> Turbo: más de 200 ms de retraso
        Turbo --> AlDia: al día otra vez
    }
```

## E-07 La búsqueda de un vídeo de YouTube (`YouTube.paso`)

```mermaid
stateDiagram-v2
    [*] --> Pagina: paso 0, watch?v=id con UA de Chrome
    Pagina --> Android: paso 1, saca clave y versión (o usa las de reserva)
    Android --> AndroidVR: paso 2, sin MP4
    AndroidVR --> Embebido: paso 3, sin MP4
    Embebido --> Web: paso 4, sin MP4
    Android --> Hecho: MP4 itag 18
    AndroidVR --> Hecho: MP4 itag 18
    Embebido --> Hecho: MP4 itag 18
    Web --> Hecho: MP4 itag 18
    Web --> Error: ningún cliente
    Hecho --> [*]: paso 5, dirección y User-Agent
    Error --> [*]
```

## E-08 La barra de herramientas

```mermaid
stateDiagram-v2
    direction LR
    state "Recargar y Parar" as RP {
        [*] --> RecargarVisible
        RecargarVisible --> PararVisible: modo_carga(true), con la barra de progreso
        PararVisible --> RecargarVisible: modo_carga(false), al mostrar, parar o descargar
    }
    state "Atrás y Adelante" as AA {
        [*] --> Apagados
        Apagados --> AtrasEncendido: visto > 0
        AtrasEncendido --> AmbosEncendidos: visto < último
        AmbosEncendidos --> AtrasEncendido: navegar desde el final
        AtrasEncendido --> Apagados: visto = 0 y nada delante
    }
    state "Historial" as HI {
        [*] --> Oculto
        Oculto --> Visible: botón historial
        Visible --> Oculto: botón historial
    }
```

Los botones apagados no se desactivan en MUI (saldrían con una trama): cambian de icono (`*_apagado.iff`) y, pulsados,
no hacen nada.

## E-09 El foco de los formularios

```mermaid
stateDiagram-v2
    [*] --> SinFoco
    SinFoco --> EnCampo: clic en un campo de texto (FORM_FOCO)
    EnCampo --> EnCampo: tecla, cambia el valor (FORM_CAMBIO)
    EnCampo --> SinFoco: clic fuera del campo
    EnCampo --> Enviando: Return (FORM_ENVIAR)
    Enviando --> SinFoco: se abre la respuesta (la página nueva no tiene foco)
    SinFoco --> SinFoco: con foco nulo las teclas desplazan la página
```

## E-10 La pantalla completa

```mermaid
stateDiagram-v2
    [*] --> EnLaPagina
    EnLaPagina --> PantallaCompleta: clic en la esquina del vídeo (24 px)
    PantallaCompleta --> PantallaCompleta: espacio, para o sigue
    PantallaCompleta --> EnLaPagina: Esc, clic o cerrar la ventana
```
