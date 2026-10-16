/* dashweb: sustituto de la cabecera de liba52 (ver config-a52.h): sin AC-3 */
#ifndef DASHWEB_SIN_A52_H
#define DASHWEB_SIN_A52_H
#include <stdint.h>
typedef struct a52_state_s a52_state_t;
typedef int32_t sample_t;
typedef int32_t level_t;
#define A52_CHANNEL_MASK 15
#define A52_MONO 1
#define A52_STEREO 2
#define A52_ADJUST_LEVEL 32
static inline a52_state_t *a52_init(uint32_t mm_accel) { (void)mm_accel; return 0; }
static inline int a52_syncinfo(uint8_t *buf, int *flags, int *rate, int *bitrate)
{ (void)buf; (void)flags; (void)rate; (void)bitrate; return 0; }
static inline int a52_frame(a52_state_t *s, uint8_t *buf, int *flags, level_t *level, sample_t bias)
{ (void)s; (void)buf; (void)flags; (void)level; (void)bias; return -1; }
static inline void a52_dynrng(a52_state_t *s, level_t (*f)(level_t, void *), void *data)
{ (void)s; (void)f; (void)data; }
static inline int a52_block(a52_state_t *s) { (void)s; return -1; }
static inline sample_t *a52_samples(a52_state_t *s) { (void)s; return 0; }
static inline void a52_free(a52_state_t *s) { (void)s; }
#endif
