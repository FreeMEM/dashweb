#!/bin/sh
# Los decodificadores de imágenes de dashweb (third_party/tjpgd, third_party/stb y el decodificador de
# third_party/libwebp) en
# build/img-lib/libimg.a, con sus cabeceras, para el "@link" de lib/imagen_dec.dash.
#
#   tools/build_img.sh
#
# Mismas opciones de gcc que Dash (compiler/cflags.py): el optimizador de bebbo sin sus pasadas "e",
# "r" y "s".
set -e
R=$(cd "$(dirname "$0")/.." && pwd)
GCC=${GCC:-/opt/amiga/bin/m68k-amigaos-gcc}
B=$R/build/img-lib
mkdir -p "$B"
CF="-noixemul -O2 -fomit-frame-pointer -fbbb=abcfhilmnpz0 -fno-delete-null-pointer-checks"
$GCC $CF -I"$R/third_party/tjpgd" -c "$R/third_party/tjpgd/tjpgd.c" -o "$B/tjpgd.o"
$GCC $CF -I"$R/third_party/stb" -c "$R/third_party/stb/stb_image_impl.c" -o "$B/stb_image.o"
# libwebp: solo el decodificador (las partes en C de makefile.unix, sin las de SSE/NEON/MIPS)
W=$R/third_party/libwebp
mkdir -p "$B/webp"
for f in "$W"/src/dec/*.c "$W"/src/dsp/*.c "$W"/src/utils/*.c; do
    $GCC $CF -I"$W" -c "$f" -o "$B/webp/$(basename "$f" .c).o"
done
rm -f "$B/libimg.a"
${AR:-/opt/amiga/bin/m68k-amigaos-ar} rcs "$B/libimg.a" "$B/tjpgd.o" "$B/stb_image.o" "$B"/webp/*.o
mkdir -p "$B/webp_inc/webp"
cp "$W"/src/webp/decode.h "$W"/src/webp/types.h "$B/webp_inc/webp/"
cp "$R/third_party/tjpgd/tjpgd.h" "$R/third_party/tjpgd/tjpgdcnf.h" "$R/third_party/stb/stb_image.h" "$B/"
ls -l "$B/libimg.a"
