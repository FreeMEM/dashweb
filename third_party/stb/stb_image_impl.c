/* stb_image para dashweb (tools/build_img.sh): JPEG, PNG, GIF y BMP desde memoria, sin stdio ni
   SIMD ni HDR. Los errores no abortan: stbi_load_from_memory devuelve NULL. */
#define STB_IMAGE_IMPLEMENTATION
#define STBI_NO_STDIO
#define STBI_NO_SIMD
#define STBI_NO_HDR
#define STBI_NO_LINEAR
#define STBI_ONLY_JPEG
#define STBI_ONLY_PNG
#define STBI_ONLY_GIF
#define STBI_ONLY_BMP
#define STBI_ASSERT(x)
#include "stb_image.h"
