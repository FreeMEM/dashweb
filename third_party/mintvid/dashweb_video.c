/* dashweb: interfaz de vídeo sobre el núcleo de MintVID (MIT, como dashweb). Abre un fichero, saca
   imagen a imagen en RGB24 y su instante. Sin sonido todavía. Pone sustitutos vacíos de las piezas de
   MintVID que no van en dashweb (MPEG-2 y DV, por licencia; su red: dashweb trae los vídeos con la suya). */
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include "mr_codec.h"
#include "mr_demux.h"
#include "mr_source.h"
#include "mr_http.h"
#include "mr_hls.h"
#include "mr_youtube.h"
#include "mr_h264.h"
#ifndef DWV_SIN_SONIDO
#include "mr_audio_decode.h"
#include "mr_audio.h"
#else
typedef struct mr_audio_decoder mr_audio_decoder;
typedef struct mr_audio mr_audio;
#endif
#include "dashweb_video.h"

/* --- lo que no va en dashweb --- */
const mr_codec mr_codec_mpeg2 = {0};
const mr_codec mr_codec_dv = {0};
int mr_http_options_init(mr_http_options *o, const char *ua, const char *ref)
{ if (o) memset(o, 0, sizeof *o); (void)ua; (void)ref; return 1; }
mr_source *mr_http_source_open(const char *url) { (void)url; return NULL; }
mr_source *mr_http_source_open_ex(const char *url, const mr_http_options *o) { (void)url; (void)o; return NULL; }
int mr_source_is_hls(const char *url) { (void)url; return 0; }
mr_source *mr_hls_source_open(const char *url) { (void)url; return NULL; }
mr_source *mr_hls_source_open_ex(const char *url, const mr_http_options *o) { (void)url; (void)o; return NULL; }
/* La red de MintVID tampoco: core/mr_youtube.c (sus analizadores) la nombra, pero dashweb pide las páginas
   de YouTube con la suya (lib/youtube.dash) y solo le pasa los textos. */
int mr_http_fetch_text(const char *url, const mr_http_options *o, char **out, size_t *len, size_t max)
{ (void)url; (void)o; (void)max; if (out) *out = NULL; if (len) *len = 0; return 0; }
int mr_http_post_json(const char *url, const mr_http_options *o, const char *json, char **out, size_t *len,
                      size_t max)
{ (void)url; (void)o; (void)json; (void)max; if (out) *out = NULL; if (len) *len = 0; return 0; }

/* Para lib/youtube.dash: el identificador de una dirección de YouTube ("" si no lo es) y el MP4 de 360p (H.264
   + AAC, itag 18) de una página o una respuesta del reproductor ("" si no lo trae) */
const char *dwv_youtube_id(const char *url)
{
    static char id[12];
    if (!mr_youtube_extract_video_id(url, id)) id[0] = 0;
    return id;
}

const char *dwv_youtube_mp4(const char *texto)
{
    static char url[4096];
    mr_youtube_media_kind kind = MR_YOUTUBE_MEDIA_NONE;
    if (!texto || !mr_youtube_extract_progressive(texto, 0, url, sizeof url, &kind)) url[0] = 0;
    return url;
}

/* --- la interfaz --- */

typedef struct {
    mr_demux *dx;
    mr_decoder dec;
    int abierto;
    int vaciando;        /* el fichero se acabó: quedan imágenes dentro del decodificador (B-frames) */
    int tras_paquete;    /* el último paquete pudo dejar más imágenes listas (mr_decoder_drain) */
    long n;              /* imágenes dadas */
    long paquetes;       /* paquetes de vídeo leídos (también los que el modo turbo no decodifica) */
    long retraso;        /* paquetes leídos antes de la primera imagen (lo que el decodificador reordena) */
    mr_audio_decoder *ad;  /* el sonido (NULL si no tiene o no se sabe decodificar) */
    mr_audio *au;          /* su salida por Paula */
    int sonando;           /* la salida ya empezó (tras llenar un poco el búfer) */
    int pausa;
    long ms;
    char codecs[200];
} dwv;

#ifndef DWV_SIN_SONIDO
/* Lo que sale del decodificador de sonido va a la cola de Paula */
static void dwv_pcm(void *user, const int16_t *pcm, unsigned frames, unsigned channels)
{
    audio_write_s16((mr_audio *)user, (const short *)pcm, frames, (int)channels);
}

/* El sonido de un paquete; la salida empieza cuando hay 150 ms en cola */
static void dwv_sonido(dwv *v, const mr_packet *pkt)
{
    if (!v->ad || !v->au) return;
    mr_audio_decoder_feed(v->ad, pkt->data, pkt->len, dwv_pcm, v->au);
    audio_service(v->au);
    if (!v->sonando && !v->pausa && audio_buffered_ms(v->au) >= 150) {
        audio_set_running(v->au, 1);
        v->sonando = 1;
    }
}
#else
static void dwv_sonido(dwv *v, const mr_packet *pkt) { (void)v; (void)pkt; }
#endif

long dwv_abrir(const char *fichero)
{
    dwv *v = (dwv *)calloc(1, sizeof *v);
    const mr_video_info *vi;
    const mr_codec *c;
    char vc[96], ac[96];
    if (!v) return 0;
    v->dx = mr_demux_open_file_ex(fichero, NULL);
    if (!v->dx) { free(v); return 0; }
    vi = mr_demux_video(v->dx);
    c = vi ? mr_codec_find(vi->fourcc) : NULL;
    if (!c || mr_decoder_open_config(&v->dec, c, vi->width, vi->height, vi->config, vi->config_len) != MR_OK) {
        mr_demux_close(v->dx);
        free(v);
        return 0;
    }
    v->abierto = 1;
    v->ms = -1;
#ifndef DWV_SIN_SONIDO
    {
        const mr_audio_info *ai = mr_demux_audio(v->dx);
        if (ai && ai->valid) {
            v->ad = mr_audio_decoder_open(ai, 0, 0);
            if (v->ad) v->au = audio_open(mr_audio_decoder_rate(v->ad), (int)mr_audio_decoder_channels(v->ad), 16);
            if (!v->au && v->ad) { mr_audio_decoder_close(v->ad); v->ad = NULL; }
        }
    }
#endif
    mr_demux_describe_video_codec(v->dx, vc, sizeof vc);
    mr_demux_describe_audio_codec(v->dx, ac, sizeof ac);
    snprintf(v->codecs, sizeof v->codecs, "video=%s, audio=%s", vc, ac);
    return (long)v;
}

long dwv_ancho(long h) { return ((dwv *)h)->dec.frame.width ? ((dwv *)h)->dec.frame.width : mr_demux_video(((dwv *)h)->dx)->width; }
long dwv_alto(long h) { return ((dwv *)h)->dec.frame.height ? ((dwv *)h)->dec.frame.height : mr_demux_video(((dwv *)h)->dx)->height; }
long dwv_fps_mil(long h)
{
    const mr_video_info *vi = mr_demux_video(((dwv *)h)->dx);
    return vi->scale ? (long)((unsigned long long)vi->rate * 1000u / vi->scale) : 0;
}
const char *dwv_codecs(long h) { return ((dwv *)h)->codecs; }

/* Sin marca de tiempo en el contenedor, el instante sale de la cuenta de paquetes de vídeo leídos (no de
   imágenes: el modo turbo se salta algunas), menos los que el decodificador guarda para reordenar */
static long dwv_ms_de(dwv *v, long indice)
{
    const mr_video_info *vi = mr_demux_video(v->dx);
    return vi->rate ? (long)((unsigned long long)indice * 1000u * vi->scale / vi->rate) : -1;
}

static long dwv_imagen(dwv *v, int del_paquete)
{
    if (v->n == 0) v->retraso = v->paquetes - 1;
    if (del_paquete) v->ms = dwv_ms_de(v, v->paquetes - 1 - v->retraso);
    else v->ms = v->ms >= 0 ? v->ms + dwv_ms_de(v, 1) : dwv_ms_de(v, v->n);   /* las que quedaban dentro */
    v->n++;
    return 1;
}

long dwv_siguiente(long h)
{
    dwv *v = (dwv *)h;
    mr_packet pkt;
    /* otra imagen que dejó lista el último paquete */
    if (v->tras_paquete) {
        if (mr_decoder_drain(&v->dec) == MR_OK) return dwv_imagen(v, 0);
        v->tras_paquete = 0;
    }
    while (!v->vaciando && mr_demux_next_packet(v->dx, &pkt) == MR_OK) {
        mr_status s;
        if (!pkt.is_video) { if (pkt.len) dwv_sonido(v, &pkt); continue; }
        if (pkt.len == 0) continue;
        v->paquetes++;
        mr_h264_set_input_annexb(&v->dec, pkt.is_annexb);
        s = mr_decoder_decode(&v->dec, pkt.data, pkt.len);
        if (s == MR_EAGAIN || s == MR_SKIPPED) continue;
        if (s != MR_OK) return -1;
        v->tras_paquete = 1;
        return dwv_imagen(v, 1);
    }
    /* fin del fichero: las que el decodificador aún guarda para reordenarlas */
    v->vaciando = 1;
    if (mr_decoder_flush(&v->dec) == MR_OK) return dwv_imagen(v, 0);
    return 0;
}

const unsigned char *dwv_rgb(long h) { return ((dwv *)h)->dec.frame.data; }
long dwv_paso(long h) { return ((dwv *)h)->dec.frame.stride; }
long dwv_ms(long h) { return ((dwv *)h)->ms; }
long dwv_rapido(long h, long modo)
{
    dwv *v = (dwv *)h;
    if (v->dec.codec != &mr_codec_h264) return 0;
    return mr_h264_set_speed_mode(&v->dec, (mr_h264_speed_mode)modo) ? 1 : 0;
}
#ifdef DWV_SIN_SONIDO
long dwv_reloj(long h) { (void)h; return -1; }
void dwv_servicio(long h) { (void)h; }
void dwv_pausa(long h, long pausa) { (void)h; (void)pausa; }
#else
/* El reloj del sonido en ms (lo que ya ha sonado), o -1 si no hay sonido o aún no empezó */
long dwv_reloj(long h)
{
    dwv *v = (dwv *)h;
    if (!v->au || !v->sonando) return -1;
    audio_service(v->au);
    return (long)audio_elapsed_ms(v->au);
}

/* Lo que pide Paula entre imagen e imagen (llenar sus búferes): llamarlo a menudo */
void dwv_servicio(long h)
{
    dwv *v = (dwv *)h;
    if (v->au) audio_service(v->au);
}

void dwv_pausa(long h, long pausa)
{
    dwv *v = (dwv *)h;
    v->pausa = pausa != 0;
    if (v->au && v->sonando) audio_set_running(v->au, !v->pausa);
}

#endif
long dwv_con_sonido(long h) { return ((dwv *)h)->au != NULL; }

void dwv_cerrar(long h)
{
    dwv *v = (dwv *)h;
    if (!v) return;
#ifndef DWV_SIN_SONIDO
    if (v->au) { audio_set_running(v->au, 0); audio_close(v->au); }
    if (v->ad) mr_audio_decoder_close(v->ad);
#endif
    if (v->abierto) mr_decoder_close(&v->dec);
    if (v->dx) mr_demux_close(v->dx);
    free(v);
}
