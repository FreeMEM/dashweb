#!/bin/sh
# Builds the QuickJS test runner for AmigaOS 3.x into build/qjs-<variant>/qjs.
#   tools/build_qjs.sh 000                         # 68000, soft float (fp-bit)
#   tools/build_qjs.sh 020fpu -m68020 -m68881      # 68020+ with FPU
# Same gcc options as Dash (compiler/cflags.py in FreeMEM/dash): bebbo's optimizer
# without its "e" and "r" passes, which gave wrong code, and address 0 treated as
# readable memory. -fwrapv: QuickJS relies on wrapping signed arithmetic.
#
# Without an FPU, doubles come from GCC's fp-bit (runtime/softfloat of Dash, in $DASH,
# default ../FreeMEMLang), linked before -lm: libnix's -lm uses the ROM's
# mathieeedoubbas, which gives wrong results (0.1 + 0.2 printed 0.3).
set -e
R=$(cd "$(dirname "$0")/.." && pwd)
DASH=${DASH:-$R/../FreeMEMLang}
V=${1:?variant}; shift
GCC=${GCC:-/opt/amiga/bin/m68k-amigaos-gcc}
Q=$R/third_party/quickjs
B=$R/build/qjs-$V; mkdir -p "$B"
CF="-noixemul -O2 -fomit-frame-pointer -fbbb=abcfhilmnpsz0 -fno-isolate-erroneous-paths-dereference
    -fno-delete-null-pointer-checks -fwrapv -D_GNU_SOURCE -DCONFIG_VERSION=\"2026-06-04\" -I$Q/amiga -I$Q $*"
for f in quickjs libregexp libunicode cutils dtoa; do
  $GCC $CF -c "$Q/$f.c" -o "$B/$f.o"
done
$GCC $CF -c "$Q/amiga/qjsamiga.c" -o "$B/qjsamiga.o"
SOFT=
case " $* " in
  *-m68881*|*-m68882*) ;;
  *) SF=$DASH/runtime/softfloat
     [ -f "$SF/fp-bit.c" ] || { echo "Dash's runtime/softfloat not found: set DASH=<path to FreeMEM/dash>" >&2; exit 2; }
     $GCC -O2 -fomit-frame-pointer -I$SF/stub -I$SF -c "$SF/fp-bit.c" -o "$B/softdouble.o"
     $GCC -O2 -fomit-frame-pointer -DFLOAT -I$SF/stub -I$SF -c "$SF/fp-bit.c" -o "$B/softsingle.o"
     SOFT="$B/softdouble.o $B/softsingle.o" ;;
esac
$GCC -noixemul $* -o "$B/qjs" "$B/qjsamiga.o" "$B/quickjs.o" "$B/libregexp.o" "$B/libunicode.o" \
    "$B/cutils.o" "$B/dtoa.o" $SOFT -lm
ls -l "$B/qjs"
