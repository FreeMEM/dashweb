#!/bin/sh
# Los decodificadores de imágenes de dashweb (third_party/tjpgd y third_party/stb) en
# build/img-lib/libimg.a, con sus cabeceras, para el "@link" de lib/imagen_dec.dash.
#
#   tools/build_img.sh
#
# Mismas opciones de gcc que Dash (compiler/cflags.py): el optimizador de bebbo sin sus pasadas "e"
# y "r".
set -e
R=$(cd "$(dirname "$0")/.." && pwd)
GCC=${GCC:-/opt/amiga/bin/m68k-amigaos-gcc}
B=$R/build/img-lib
mkdir -p "$B"
CF="-noixemul -O2 -fomit-frame-pointer -fbbb=abcfhilmnpsz0 -fno-delete-null-pointer-checks"
$GCC $CF -I"$R/third_party/tjpgd" -c "$R/third_party/tjpgd/tjpgd.c" -o "$B/tjpgd.o"
$GCC $CF -I"$R/third_party/stb" -c "$R/third_party/stb/stb_image_impl.c" -o "$B/stb_image.o"
rm -f "$B/libimg.a"
${AR:-/opt/amiga/bin/m68k-amigaos-ar} rcs "$B/libimg.a" "$B/tjpgd.o" "$B/stb_image.o"
cp "$R/third_party/tjpgd/tjpgd.h" "$R/third_party/tjpgd/tjpgdcnf.h" "$R/third_party/stb/stb_image.h" "$B/"
ls -l "$B/libimg.a"
