/* dashweb (tarea 48d): the shortest decimal of a double with Ryu (ryu/d2s.c; its one change, marked "dashweb", in LEEME), for QuickJS's js_dtoa
   in radix 10 and free format (Number.prototype.toString, String(x), x + ""), instead of its big number tries,
   which were most of the time of a page that writes many colours like "rgba(255,255,255,0.37)". */
#if defined(__mc68000__) && !defined(RYU_32_BIT_PLATFORM)
#define RYU_32_BIT_PLATFORM
#endif
#include "ryu/d2s.c"

/* d (finite and not zero; the sign is ignored) = *mant * 10^*exp, with the fewest digits in *mant and, of those,
   the nearest to d (ties to even), as ECMAScript's Number::toString asks */
void ryu_d2d(double d, uint64_t *mant, int32_t *exp)
{
    const uint64_t bits = double_to_bits(d);
    const uint64_t ieeeMantissa = bits & ((1ull << DOUBLE_MANTISSA_BITS) - 1);
    const uint32_t ieeeExponent = (uint32_t) ((bits >> DOUBLE_MANTISSA_BITS) & ((1u << DOUBLE_EXPONENT_BITS) - 1));
    floating_decimal_64 v;
    if (d2d_small_int(ieeeMantissa, ieeeExponent, &v)) {
        for (;;) {
            const uint64_t q = div10(v.mantissa);
            const uint32_t r = ((uint32_t) v.mantissa) - 10 * ((uint32_t) q);
            if (r != 0)
                break;
            v.mantissa = q;
            ++v.exponent;
        }
    } else {
        v = d2d(ieeeMantissa, ieeeExponent);
    }
    *mant = v.mantissa;
    *exp = v.exponent;
}
