#!/bin/sh
# El paquete de dashweb para el Amiga: build/dashweb.lha con el navegador (MUI) y sus iconos, el visor,
# paquete/LEEME y las licencias de dashweb y de lo que lleva dentro (LHA sin comprimir: tools/lha_lh0.py). Necesita el toolchain y Dash (DASH, por
# defecto ~/Projects/FreeMEMLang-dashweb) y el SDK de MUI de Dash; `lha` (Lhasa) para comprobarlo.
#
#   tools/paquete.sh
set -e
R=$(cd "$(dirname "$0")/.." && pwd)
DASH=${DASH:-$HOME/Projects/FreeMEMLang-dashweb}
B=$R/build/paquete
rm -rf "$B"
mkdir -p "$B/dashweb/Licencias"
[ -f "$R/build/qjs-lib/libqjs.a" ] || DASH=$DASH "$R/tools/build_qjs.sh" lib
[ -f "$R/build/img-lib/libimg.a" ] || "$R/tools/build_img.sh"
cd "$DASH"
PYTHONPATH=$DASH ./dash "$R/src/dashweb.dash" -o "$B/dashweb/dashweb"
PYTHONPATH=$DASH ./dash "$R/src/visor.dash" -o "$B/dashweb/visor"
python3 "$R/tools/iconos.py" >/dev/null
cp -r "$R/iconos" "$B/dashweb/iconos"   # la barra de herramientas (PROGDIR:iconos/)
cp "$R/paquete/LEEME" "$B/dashweb/LEEME"
cp "$R/LICENSE" "$B/dashweb/Licencias/dashweb"
cp "$R/third_party/quickjs/LICENSE" "$B/dashweb/Licencias/QuickJS"
cp "$R/third_party/fdlibm/README.md" "$B/dashweb/Licencias/fdlibm"
cp "$R/third_party/libwebp/COPYING" "$B/dashweb/Licencias/libwebp"
cp "$R/third_party/nanosvg/LICENSE.txt" "$B/dashweb/Licencias/nanosvg"
cp "$R/third_party/mintvid/LICENSE" "$B/dashweb/Licencias/MintVID"
head -25 "$R/third_party/tjpgd/tjpgd.c" > "$B/dashweb/Licencias/TJpgDec"
printf '%s\n' "stb_image y stb_truetype (https://github.com/nothings/stb), de Sean Barrett: dominio público" \
    "(o MIT, a elegir; ver la cabecera de third_party/stb/*.h en el código de dashweb)." > "$B/dashweb/Licencias/stb"
cd "$B"
rm -f "$R/build/dashweb.lha"
python3 "$R/tools/lha_lh0.py" "$R/build/dashweb.lha" dashweb   # Lhasa only extracts
ls -l "$R/build/dashweb.lha"
lha -l "$R/build/dashweb.lha" | tail -12
