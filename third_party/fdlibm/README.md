# fdlibm

Las funciones matemáticas de Sun (fdlibm 5.3), tal como las trae GNU Classpath
(`libjava/classpath/native/fdlibm` en las fuentes de GCC 6 del toolchain de bebbo). Licencia: la de
Sun que va en cada fichero ("Permission to use, copy, modify, and distribute this software is freely
granted, provided that this notice is preserved").

Cambios para dashweb: sin `mprec.h` (es de `strtod`/`dtoa`, que QuickJS no usa); `fdlibm.h` incluye
`<stdint.h>` en su lugar y `config.h` está vacío. Big-endian (68k) sin definir nada.

`tools/build_qjs.sh lib` la mete en `libqjs.a`: `sin`, `pow`, `exp`... de QuickJS dan los mismos dígitos
que fdlibm en un PC, en vez de los de `-lm` de libnix (bibliotecas matemáticas de la ROM, que fallaban
en el último dígito).
