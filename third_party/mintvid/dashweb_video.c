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
int mr_youtube_is_url(const char *url) { (void)url; return 0; }
int mr_youtube_http_options_init(struct mr_http_options *out, const struct mr_http_options *base)
{ (void)out; (void)base; return 0; }
int mr_youtube_media_http_options_init(struct mr_http_options *out, const struct mr_http_options *base)
{ (void)out; (void)base; return 0; }
int mr_youtube_resolve_media(const char *url, const struct mr_http_options *options, char *out, size_t out_size,
                             mr_youtube_media_kind *kind)
{ (void)url; (void)options; (void)out; (void)out_size; (void)kind; return 0; }

/* --- la interfaz --- */
typedef struct {
    mr_demux *dx;
    mr_decoder dec;
    int abierto;
    int vaciando;        /* el fichero se acabó: quedan imágenes dentro del decodificador (B-frames) */
    int tras_paquete;    /* el último paquete pudo dejar más imágenes listas (mr_decoder_drain) */
    long n;              /* imágenes dadas */
    long ms;
    char codecs[200];
} dwv;

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

/* Sin marca de tiempo en el contenedor, el instante sale de la cuenta de imágenes */
static long dwv_ms_de(dwv *v)
{
    const mr_video_info *vi = mr_demux_video(v->dx);
    return vi->rate ? (long)((unsigned long long)v->n * 1000u * vi->scale / vi->rate) : -1;
}

static long dwv_imagen(dwv *v)
{
    v->ms = dwv_ms_de(v);
    v->n++;
    return 1;
}

long dwv_siguiente(long h)
{
    dwv *v = (dwv *)h;
    mr_packet pkt;
    /* otra imagen que dejó lista el último paquete */
    if (v->tras_paquete) {
        if (mr_decoder_drain(&v->dec) == MR_OK) return dwv_imagen(v);
        v->tras_paquete = 0;
    }
    while (!v->vaciando && mr_demux_next_packet(v->dx, &pkt) == MR_OK) {
        mr_status s;
        if (!pkt.is_video || pkt.len == 0) continue;
        mr_h264_set_input_annexb(&v->dec, pkt.is_annexb);
        s = mr_decoder_decode(&v->dec, pkt.data, pkt.len);
        if (s == MR_EAGAIN || s == MR_SKIPPED) continue;
        if (s != MR_OK) return -1;
        v->tras_paquete = 1;
        return dwv_imagen(v);
    }
    /* fin del fichero: las que el decodificador aún guarda para reordenarlas */
    v->vaciando = 1;
    if (mr_decoder_flush(&v->dec) == MR_OK) return dwv_imagen(v);
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
void dwv_cerrar(long h)
{
    dwv *v = (dwv *)h;
    if (!v) return;
    if (v->abierto) mr_decoder_close(&v->dec);
    if (v->dx) mr_demux_close(v->dx);
    free(v);
}
