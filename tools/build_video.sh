#!/bin/sh
# El vídeo de dashweb: el subconjunto de MintVID de third_party/mintvid (H.264 con libavc y los demás
# códecs y contenedores propios de MintVID) y su interfaz dashweb_video.c, en build/video-lib/libvideo.a con
# dashweb_video.h, para el "@link" de lib/video.dash.
#
#   tools/build_video.sh
#
# Las opciones de MintVID (player/Makefile.amiga) para 68020-68060 con FPU, como dashweb. Las redirecciones
# de enlace de MintVID (--wrap: las rutas en ensamblador de 68k de libavc) se resuelven aquí, en un objeto
# enlazado con ld -r, para que el programa que lo usa no tenga que pasarlas.
set -e
R=$(cd "$(dirname "$0")/.." && pwd)
GCC=${GCC:-/opt/amiga/bin/m68k-amigaos-gcc}
LD=${LD:-/opt/amiga/bin/m68k-amigaos-ld}
M=$R/third_party/mintvid
B=$R/build/video-lib
rm -rf "$B"
mkdir -p "$B/o"
CF="-noixemul -O2 -std=c99 -m68020-60 -m68881 -fomit-frame-pointer -fno-strict-aliasing -fwrapv
    -DAMIGA_M68K -DMR_HAVE_H264 -DMR_M68K_ASM=1 -DMR_PL_MPEG_SKIP_AUDIO_TIME=1
    -I$M/libavc_port -I$M/libavc/common -I$M/libavc/decoder -include $M/libavc_port/compat.h -I$M/core
    -w"
# los ficheros del núcleo que MintVID enlaza en su mr_decode (player/Makefile.amiga), sin MPEG-2, DV ni su red
NUCLEO="mr_codec.c mr_source.c mr_demux.c mr_latm.c mr_mkv.c mr_avi.c mr_mov.c mr_ts.c mr_ps.c mr_raw_mjpeg.c
    mr_raw_mpeg4.c mr_cinepak.c mr_dither.c mr_dither_m68k.S mr_ham.c mr_ham_m68k.S mr_scale.c mr_c2p.c
    mr_c2p_m68k.S mr_mjpeg.c picojpeg.c mr_mpeg1.c mr_mpeg1_blockset_m68k.S mr_mpeg1_idct_m68k.S mr_mpeg4.c
    mr_msmpeg4v2.c mr_wmv.c mr_wmv2.c mr_h263.c mr_msvideo1.c mr_rle.c mr_rawvideo.c mr_yuv.c mr_yuv_m68k.S
    mr_yuv_dither.c mr_yuv_dither_planar_m68k.S mr_yuv_dither_planar_direct_m68k.S mr_yuv_planar_queue.c
    mr_yuv_ham.c mr_h264.c plm_audio_synth_window_m68k.S plm_audio_idct36_m68k.S plm_audio_scale_clamp_m68k.S
    plm_audio_synth_window_m68k_060.S plm_audio_idct36_m68k_060.S"
for f in $NUCLEO; do
    $GCC $CF -c "$M/core/$f" -o "$B/o/n_$(echo "$f" | tr . _).o"
done
for f in "$M"/libavc/decoder/*.c "$M"/libavc_port/*.c "$M"/libavc_port/*.S "$M"/dashweb_video.c; do
    $GCC $CF -c "$f" -o "$B/o/$(basename "$f" | tr . _).o"
done
for f in "$M"/libavc/common/*.c; do
    case $(basename "$f") in ithread.c|ih264_resi_trans_quant.c|ih264_trans_data.c) continue ;; esac
    $GCC $CF -c "$f" -o "$B/o/c_$(basename "$f" .c).o"
done
$LD -r -o "$B/video.o" "$B"/o/*.o \
    --wrap=ih264d_decode_bin --wrap=ih264d_mvpred_nonmbaff --wrap=ih264d_mvpred_nonmbaffB \
    --wrap=ih264d_parse_residual4x4_cabac --wrap=ih264d_read_coeff4x4_cabac --wrap=ih264d_update_qp
rm -f "$B/libvideo.a"
${AR:-/opt/amiga/bin/m68k-amigaos-ar} rcs "$B/libvideo.a" "$B/video.o"
cp "$M/dashweb_video.h" "$B/"
ls -l "$B/libvideo.a"
