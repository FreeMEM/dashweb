/* dashweb: interfaz de vídeo sobre el núcleo de MintVID (third_party/mintvid/dashweb_video.c) */
#ifndef DASHWEB_VIDEO_H
#define DASHWEB_VIDEO_H
long dwv_abrir(const char *fichero);           /* un vídeo (MP4/MOV, AVI, MKV, MPEG-TS...); 0 si no se puede */
long dwv_ancho(long v);
long dwv_alto(long v);
long dwv_fps_mil(long v);                      /* imágenes por segundo x 1000 (0 si no se sabe) */
const char *dwv_codecs(long v);                /* "video=..., audio=..." */
long dwv_siguiente(long v);                    /* 1 una imagen nueva, 0 fin, -1 error */
const unsigned char *dwv_rgb(long v);          /* la imagen: RGB24, dwv_paso() bytes por fila */
long dwv_paso(long v);
long dwv_ms(long v);                           /* su instante en ms desde el principio (-1 si no se sabe) */
long dwv_rapido(long v, long modo);            /* H.264: 0 calidad ... 4 turbo; 1 si se aceptó */
long dwv_reloj(long v);                        /* ms ya sonados (reloj maestro), -1 sin sonido */
void dwv_servicio(long v);                     /* atender la salida de sonido (a menudo) */
void dwv_pausa(long v, long pausa);
long dwv_con_sonido(long v);
void dwv_cerrar(long v);
#endif
