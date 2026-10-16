#!/bin/sh
# Copia un sistema emulado de Dash ($DASH_EMU_SYS...) y le añade las fuentes (Fonts/, y bullet.library
# para las vectoriales) de un
# disco duro de Workbench, para ver páginas con helvetica, times y courier en el emulador.
#
#   tools/emu_sys_fuentes.sh ~/.cache/dash-emu/sys31ssl ~/Amiberry/HardDrives/system3.1.hdf ~/.cache/dash-emu/sys31web
#   tools/medir_visor.py --sistema ~/.cache/dash-emu/sys31web
#
# El disco solo se lee (primera partición, como tools/emu_sys_from_hdf.sh de Dash). Usa xdftool y
# rdbtool de amitools (XDFTOOL, por defecto el venv ~/.cache/dashweb/venv). Las fuentes son del
# Workbench: fuera de git.
set -e
[ $# -eq 3 ] || { echo "uso: $0 sistema disco.hdf destino" >&2; exit 2; }
XDF=${XDFTOOL:-$HOME/.cache/dashweb/venv/bin/xdftool}
RDB=${RDBTOOL:-$(dirname "$XDF")/rdbtool}
[ -x "$XDF" ] || { echo "falta xdftool (python3 -m venv ~/.cache/dashweb/venv && ~/.cache/dashweb/venv/bin/pip install amitools)" >&2; exit 2; }
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
if [ "$(head -c 4 "$2")" = "RDSK" ]; then
    info=$("$RDB" -r "$2" info)
    cyl_blks=$(echo "$info" | sed -n 's/.*cyl_blks=\([0-9]*\).*/\1/p' | head -1)
    set -- "$1" "$2" "$3" $(echo "$info" | awk '/^Partition: #0/ {print $4, $6; exit}')
    [ -n "$cyl_blks" ] && [ -n "$5" ] || { echo "$2: sin partición #0" >&2; exit 2; }
    dd if="$2" of="$tmp/disco.hdf" bs=512 skip=$(($4 * cyl_blks)) count="$5" status=none
else
    cp "$2" "$tmp/disco.hdf"
fi
rm -rf "$3"
cp -r "$1" "$3"
rm -rf "$3/Fonts"
"$XDF" "$tmp/disco.hdf" read Fonts "$3/Fonts" >/dev/null
# bullet.library dibuja las fuentes vectoriales (CGTriumvirate, CGTimes...) a cualquier tamaño
"$XDF" "$tmp/disco.hdf" read Libs/bullet.library "$3/Libs/bullet.library" >/dev/null
ls "$3/Fonts"
