/* stb_truetype para dashweb (tools/build_img.sh): las fuentes de @font-face (TTF) a un TextFont del Amiga
   (lib/fuente_web.dash). Sin assert; la memoria con malloc de libnix. */
#define STB_TRUETYPE_IMPLEMENTATION
#define STBTT_assert(x)
#include "stb_truetype.h"
