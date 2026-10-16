#!/bin/sh
# Un sistema emulado con tarjeta gráfica (RTG) para medir y ver dashweb como en una PiStorm:
# AmigaOS 3.2 con MUI, AmiSSL y fuentes, más Picasso96 (uaegfx de FS-UAE) y la pantalla del
# Workbench a 1024x768 en 16 bits. tools/medir_visor.py --maquina rtg lo usa.
#
#   tools/emu_sys_rtg.sh ~/Amiberry/HardDrives/AmigaOS-v3.2-WHD-RTG-AHI.hdf
#
# Parte de ~/.cache/dash-emu/sys32mui (MUI), sys32ssl (AmiSSL) y sys31muiweb (las fuentes, de
# tools/emu_sys_fuentes.sh); del disco duro (con Picasso96 instalado; solo se lee) saca
# Libs/Picasso96*, Devs/Monitors/uaegfx, C:IPrefs, C:Copy, C:SetPatch, Libs/680x0.library, mmu.library y
# 68040.library (la FPU del 68040 completa: sin ella un programa de ./dash --fpu no arranca) y
# ScreenMode.prefs. Destino:
# ~/.cache/dash-emu/sys32rtg (fuera de git: son ficheros del sistema y de Picasso96).
set -e
[ $# -eq 1 ] || { echo "uso: $0 disco-con-picasso96.hdf" >&2; exit 2; }
XDF=${XDFTOOL:-$HOME/.cache/dashweb/venv/bin/xdftool}
RDB=${RDBTOOL:-$(dirname "$XDF")/rdbtool}
C=$HOME/.cache/dash-emu
D=$C/sys32rtg
for s in sys32mui sys32ssl sys31muiweb; do
    [ -d "$C/$s" ] || { echo "falta $C/$s" >&2; exit 2; }
done
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
info=$("$RDB" -r "$1" info)
cyl_blks=$(echo "$info" | sed -n 's/.*cyl_blks=\([0-9]*\).*/\1/p' | head -1)
set -- "$1" $(echo "$info" | awk '/^Partition: #0/ {print $4, $6; exit}')
dd if="$1" of="$tmp/p0.hdf" bs=512 skip=$(($2 * cyl_blks)) count="$3" status=none
rm -rf "$D"
cp -r "$C/sys32mui" "$D"
cp -r "$C/sys32ssl/AmiSSL" "$D/"
cp -r "$C/sys31muiweb/Fonts" "$D/"
mkdir -p "$D/Libs/Picasso96" "$D/Devs/Monitors" "$D/Prefs/Env-Archive/Sys"
for f in Libs/Picasso96API.library Libs/Picasso96/emulation.library Libs/Picasso96/fastlayers.library \
         Libs/Picasso96/rtg.library Libs/Picasso96/uaegfx.card Devs/Monitors/uaegfx Devs/Monitors/uaegfx.info \
         C/IPrefs C/Copy C/SetPatch Libs/680x0.library Libs/68040.library Libs/mmu.library \
         Prefs/Env-Archive/Sys/ScreenMode.prefs; do
    "$XDF" "$tmp/p0.hdf" read "$f" "$D/$f" >/dev/null
done
# el modo de la pantalla: UAE 1024x768 de 16 bits (0x50051100), como lo numera Picasso96 con uaegfx
python3 - "$D/Prefs/Env-Archive/Sys/ScreenMode.prefs" <<'EOF'
import sys
p = sys.argv[1]
b = bytearray(open(p, "rb").read())
i = b.index(b"SCRM") + 8 + 16
b[i:i + 4] = bytes.fromhex("50051100")
open(p, "wb").write(b)
EOF
cat "$C/sys32ssl/S/Startup-Extra" >> "$D/S/Startup-Extra"
cat >> "$D/S/Startup-Extra" <<'EOF'
C:SetPatch QUIET
SYS:Devs/Monitors/uaegfx
C:Copy SYS:Prefs/Env-Archive/Sys/ScreenMode.prefs ENV:Sys/ScreenMode.prefs QUIET
C:IPrefs
EOF
echo "$D listo"
