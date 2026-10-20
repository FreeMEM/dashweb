# Documentación de ingeniería de dashweb

Especificación completa de dashweb, un navegador web para AmigaOS 3.x con interfaz MUI, escrito en Dash. Está pensada
para entregar a un equipo de desarrollo: con ella se puede entender, mantener o volver a construir el software.

- **Versión del documento:** 1.0, 2026-10-20.
- **Sistema descrito:** commit `cdfe376` de la rama `dev` (v0.2.0-alfa más el encargo 37 en curso).
- **Cómo se hizo:** a partir del código y de la bitácora del proyecto. Lo que no coincide entre ellos está en
  [10](10_RIESGOS_Y_PENDIENTES.md).

## Documentos

| Nº | Documento | Qué contiene | Para quién |
|---|---|---|---|
| 01 | [Requisitos](01_REQUISITOS.md) | Alcance, requisitos funcionales (RF) y no funcionales (RNF) con criterio de aceptación, prioridad, estado y trazabilidad | Producto, todo el equipo |
| 02 | [Casos de uso](02_CASOS_DE_USO.md) | Actores y casos de uso (CU) con flujo principal, alternativas y errores | Producto, QA |
| — | [Arquitectura](../ARQUITECTURA.md) | Piezas, procesos, datos, decisiones con su porqué, medidas, límites | Arquitectura, desarrollo |
| 03 | [Flujos](03_FLUJOS.md) | Diagramas de flujo y de secuencia (F): bucle, temporizador, carga, montaje, pintado, clic, JS, formularios, descargas, imágenes, HTTP, vídeo | Desarrollo |
| 04 | [Estados](04_ESTADOS.md) | Diagramas de estado (E): ventana, carga, conexión, página, imagen, vídeo, YouTube, barra, foco, pantalla completa | Desarrollo, QA |
| 05 | [Modelo de datos](05_MODELO_DE_DATOS.md) | Diagrama de clases, dueños y vida de cada cosa, ficheros y sus formatos, juego de caracteres | Desarrollo |
| 06 | [Interfaz de usuario](06_INTERFAZ_DE_USUARIO.md) | Ventana, objetos, menús y atajos, eventos, teclado, mensajes, páginas internas | Diseño, desarrollo, QA |
| 07 | [Módulos e interfaces](07_MODULOS_E_INTERFACES.md) | Cada módulo: responsabilidad, dependencias, constantes, structs y las 347 funciones públicas (generado del código) | Desarrollo |
| 08 | [Plan de pruebas](08_PLAN_DE_PRUEBAS.md) | Estrategia, entornos, catálogo de los 57 tests, pruebas de aceptación (PA), de rendimiento (PR), criterios de publicación | QA |
| 09 | [Entorno, construcción y entrega](09_ENTORNO_CONSTRUCCION_Y_ENTREGA.md) | Herramientas, sistemas del emulador, cadena de construcción, librerías de C, paquete, publicación | Desarrollo, entrega |
| 10 | [Riesgos y pendientes](10_RIESGOS_Y_PENDIENTES.md) | Registro de riesgos (R), lo que falta, documentación desfasada, deuda técnica | Dirección, todo el equipo |
| 11 | [Plan de construcción](11_PLAN_DE_CONSTRUCCION.md) | Hitos (H0-H12) en orden de dependencia, con entregables y aceptación | Dirección, desarrollo |

Otros documentos del repositorio: `docs/COMO_SE_CONSTRUYE.md` (cómo hacer aplicaciones con Dash y MUI, y el plugin de
VS Code), `docs/TUTORIAL.md` (un programa paso a paso), `docs/quickjs_amiga.md` (cambios a QuickJS),
`docs/DASHWEB_LOOP.md` (plan y bitácora).

## Por dónde empezar

- **Para entender qué es:** 01, 02 y la arquitectura.
- **Para programar:** arquitectura, 03, 04, 05 y 07.
- **Para montar el entorno y compilar:** 09.
- **Para probar:** 08.
- **Para planificar una reconstrucción:** 11 y 10.

## Convenciones

| Prefijo | Qué es | Dónde |
|---|---|---|
| RF-nn / RNF-nn | Requisito funcional / no funcional | 01 |
| CU-nn | Caso de uso | 02 |
| F-nn | Flujo | 03 |
| E-nn | Diagrama de estado | 04 |
| PA-nn / PR-nn | Prueba de aceptación / de rendimiento | 08 |
| H-nn | Hito de construcción | 11 |
| R-nn | Riesgo | 10 |
| Dnn | Tarea de Dash (el lenguaje) | `docs/DASHWEB_LOOP.md` |

Los diagramas están en [Mermaid](https://mermaid.js.org/): GitHub y VS Code (con su extensión) los dibujan. Los nombres de
funciones y ficheros son los del código. Los textos de la interfaz están en español, como el programa.

## Glosario

| Término | Significado |
|---|---|
| AmigaOS 3.x | El sistema operativo del Amiga clásico (3.1, 3.2, 3.5, 3.9). |
| Dash | Lenguaje que compila a C para el Amiga (repositorio `FreeMEM/dash`). dashweb está escrito en él. |
| MUI | Magic User Interface: la librería de interfaces gráficas del Amiga (versiones 3.8 y 5). |
| `.dashui` | Fichero JSON con ventanas MUI hecho con el editor visual; el compilador de Dash lo importa como módulo. |
| PiStorm / Emu68 | Placa con una Raspberry Pi que hace de CPU 68k muy rápida; Emu68 es su emulador de 68k. Máquina objetivo. |
| FS-UAE, Amiberry | Emuladores de Amiga. FS-UAE se usa para las pruebas automáticas. |
| RTG | Tarjeta gráfica (Picasso96, CyberGraphX): pantallas de color directo. |
| `bsdsocket.library` | La API de red estándar de AmigaOS; la dan las pilas TCP/IP (Roadshow, AmiTCP...). |
| AmiSSL | TLS (OpenSSL) para AmigaOS. |
| Paula | El chip de sonido del Amiga. |
| ILBM / IFF | El formato de imagen nativo del Amiga. |
| datatypes | Sistema de AmigaOS para leer formatos de fichero con librerías externas. |
| Hunk | El formato de ejecutable de AmigaOS. |
| `PROGDIR:`, `T:`, `FONTS:` | La carpeta del programa, los temporales y las fuentes. |
| Latin-1 | ISO-8859-1, el juego de caracteres del Amiga y de dashweb. |
| Tic | Cada vez que vence el temporizador único y el navegador hace avanzar lo que está en marcha. |
| Toque | Un cambio del DOM hecho por el JS, apuntado para rehacer el estilo solo de lo afectado. |
| Documento | Una página abierta, dueña de su árbol, hojas, imágenes, JS y maqueta. |
| Lista de dibujo | La salida de la maqueta: dibujos en coordenadas de página que el pintor convierte en `gfx_`. |
| Hubbub | El analizador HTML5 de NetSurf. |
| QuickJS | El motor de JavaScript de Fabrice Bellard. |
| MintVID / MintAMP | Las librerías de vídeo y audio usadas. |
