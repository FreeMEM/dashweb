#!/bin/sh
# El paquete de dashweb para el Amiga: build/dashweb.lha con el navegador (MUI) y sus iconos, el visor, los
# iconos de Workbench (tools/iconos_wb.py), el guion del Installer (paquete/Instalar),
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
# con --fpu, como libqjs, libimg y libvideo (-m68881): mezclar las dos formas rompe los números con decimales que
# cruzan entre ellas (sin él, las fuentes web no salían: la escala de stb_truetype llegaba en fp0; tarea 40a)
PYTHONPATH=$DASH ./dash --fpu "$R/src/dashweb.dash" -o "$B/dashweb/dashweb"
PYTHONPATH=$DASH ./dash --fpu "$R/src/visor.dash" -o "$B/dashweb/visor"
python3 "$R/tools/iconos.py" >/dev/null
cp -r "$R/iconos" "$B/dashweb/iconos"   # la barra de herramientas (PROGDIR:iconos/)
# el LEEME y el guion del Installer en Latin-1 (MultiView y el Installer no leen UTF-8)
iconv -f UTF-8 -t LATIN1 "$R/paquete/LEEME" > "$B/dashweb/LEEME"
iconv -f UTF-8 -t LATIN1 "$R/paquete/Instalar" > "$B/dashweb/Instalar"
# los iconos de Workbench: el del cajón (junto a él) y los de dentro
python3 "$R/tools/iconos_wb.py" "$B"
cp "$R/LICENSE" "$B/dashweb/Licencias/dashweb"
cp "$R/third_party/quickjs/LICENSE" "$B/dashweb/Licencias/QuickJS"
cp "$R/third_party/fdlibm/README.md" "$B/dashweb/Licencias/fdlibm"
cp "$R/third_party/hubbub/libhubbub/COPYING" "$B/dashweb/Licencias/Hubbub"
cp "$R/third_party/hubbub/libparserutils/COPYING" "$B/dashweb/Licencias/LibParserUtils"
cp "$R/third_party/libwebp/COPYING" "$B/dashweb/Licencias/libwebp"
cp "$R/third_party/nanosvg/LICENSE.txt" "$B/dashweb/Licencias/nanosvg"
cp "$R/third_party/mintvid/LICENSE" "$B/dashweb/Licencias/MintVID"
head -25 "$R/third_party/tjpgd/tjpgd.c" > "$B/dashweb/Licencias/TJpgDec"
printf '%s\n' "stb_image y stb_truetype (https://github.com/nothings/stb), de Sean Barrett: dominio público" \
    "(o MIT, a elegir; ver la cabecera de third_party/stb/*.h en el código de dashweb)." > "$B/dashweb/Licencias/stb"
cd "$B"
rm -f "$R/build/dashweb.lha"
python3 "$R/tools/lha_lh0.py" "$R/build/dashweb.lha" dashweb dashweb.info   # Lhasa only extracts
ls -l "$R/build/dashweb.lha"
lha -l "$R/build/dashweb.lha" | tail -12
