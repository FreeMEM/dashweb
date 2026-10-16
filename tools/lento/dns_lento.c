/* Para probar en FS-UAE una consulta DNS lenta: con LD_PRELOAD, los nombres que acaban en ".lento"
 * tardan DNS_LENTO_MS milisegundos (4000 si no se dice) y dan 127.0.0.1; los demás van al sistema.
 *
 *   gcc -shared -fPIC -O2 -o dns_lento.so dns_lento.c -ldl
 *   LD_PRELOAD=$PWD/dns_lento.so fs-uae ...      (tools/medir_visor.py --dns-lento lo hace)
 */
#define _GNU_SOURCE
#include <dlfcn.h>
#include <netdb.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

static int lento(const char *nombre)
{
    size_t n = nombre ? strlen(nombre) : 0;
    if (n < 6 || strcmp(nombre + n - 6, ".lento") != 0)
        return 0;
    const char *e = getenv("DNS_LENTO_MS");
    long ms = e ? atol(e) : 4000;
    struct timespec t = { ms / 1000, (ms % 1000) * 1000000L };
    nanosleep(&t, NULL);
    return 1;
}

struct hostent *gethostbyname(const char *nombre)
{
    static struct hostent *(*real)(const char *);
    if (!real)
        real = (struct hostent *(*)(const char *))dlsym(RTLD_NEXT, "gethostbyname");
    return real(lento(nombre) ? "127.0.0.1" : nombre);
}

int getaddrinfo(const char *nombre, const char *servicio, const struct addrinfo *pista, struct addrinfo **res)
{
    static int (*real)(const char *, const char *, const struct addrinfo *, struct addrinfo **);
    if (!real)
        real = (int (*)(const char *, const char *, const struct addrinfo *, struct addrinfo **))dlsym(RTLD_NEXT, "getaddrinfo");
    return real(lento(nombre) ? "127.0.0.1" : nombre, servicio, pista, res);
}
