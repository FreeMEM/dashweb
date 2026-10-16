#!/bin/sh
# El paquete de dashweb para el Amiga: build/dashweb.lha con el navegador (MUI) y sus iconos, el visor,
# paquete/LEEME y las licencias (LHA sin comprimir: tools/lha_lh0.py). Necesita el toolchain y Dash (DASH, por
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
cd "$DASH"
PYTHONPATH=$DASH ./dash "$R/src/dashweb.dash" -o "$B/dashweb/dashweb"
PYTHONPATH=$DASH ./dash "$R/src/visor.dash" -o "$B/dashweb/visor"
python3 "$R/tools/iconos.py" >/dev/null
cp -r "$R/iconos" "$B/dashweb/iconos"   # la barra de herramientas (PROGDIR:iconos/)
cp "$R/paquete/LEEME" "$B/dashweb/LEEME"
cp "$R/LICENSE" "$B/dashweb/Licencias/dashweb"
cp "$R/third_party/quickjs/LICENSE" "$B/dashweb/Licencias/QuickJS"
cp "$R/third_party/fdlibm/README.md" "$B/dashweb/Licencias/fdlibm"
cd "$B"
rm -f "$R/build/dashweb.lha"
python3 "$R/tools/lha_lh0.py" "$R/build/dashweb.lha" dashweb   # Lhasa only extracts
ls -l "$R/build/dashweb.lha"
lha -l "$R/build/dashweb.lha" | tail -12
