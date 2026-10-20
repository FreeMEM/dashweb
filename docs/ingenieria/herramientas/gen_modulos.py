"""Genera docs/ingenieria/07_MODULOS_E_INTERFACES.md a partir del código (src/ y lib/)."""
import re, sys
from pathlib import Path

raiz = Path(sys.argv[1]); salida = Path(sys.argv[2]); commit = sys.argv[3]

def comentario_previo(L, i):
    c = []; j = i - 1
    while j >= 0 and L[j].lstrip().startswith("#"):
        c.insert(0, L[j].strip().lstrip("#").strip()); j -= 1
    return " ".join(c)

def texto(t):
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def celda(t):
    return texto(t).replace("|", "\\|").replace("\n", " ")

GRUPOS = [
    ("Programa", ["src/dashweb.dash", "src/visor.dash"]),
    ("Página", ["lib/documento.dash", "lib/recursos.dash", "lib/traza.dash"]),
    ("Red", ["lib/url.dash", "lib/red.dash", "lib/http.dash", "lib/cookies.dash"]),
    ("HTML y DOM", ["lib/texto.dash", "lib/entidades.dash", "lib/html.dash", "lib/html5.dash", "lib/dom.dash"]),
    ("CSS y estilo", ["lib/css.dash", "lib/colores.dash", "lib/estilo.dash", "lib/animacion.dash"]),
    ("Maqueta y pintado", ["lib/maqueta.dash", "lib/pintor.dash", "lib/fuente_web.dash", "lib/formularios.dash"]),
    ("JavaScript", ["lib/js.dash", "lib/jsdom.dash", "lib/jsdom_preludio.dash"]),
    ("Imágenes y vídeo", ["lib/imagenes.dash", "lib/imagen_dec.dash", "lib/video.dash", "lib/videos.dash", "lib/youtube.dash"]),
    ("Datos del usuario", ["lib/marcadores.dash"]),
]
todos = [f for _, fs in GRUPOS for f in fs]
faltan = sorted(set(str(p.relative_to(raiz)) for p in list((raiz/"lib").glob("*.dash")) + list((raiz/"src").glob("*.dash"))) - set(todos))
assert not faltan, faltan

info = {}
for f in todos:
    L = (raiz / f).read_text(encoding="utf-8").splitlines()
    cab = []
    for l in L:
        if l.startswith("#"): cab.append(l[2:] if l.startswith("# ") else l[1:])
        else: break
    imps = [re.match(r'\s*import\s+"([^"]+)"', l).group(1) for l in L if re.match(r'\s*import\s+"([^"]+)"', l)]
    dirs = [l.strip() for l in L if re.match(r'\s*@(link|stack|workbench_output)\b', l)]
    structs, consts, funcs = [], [], []
    i = 0
    while i < len(L):
        l = L[i]
        m = re.match(r'^struct\s+(\w+)', l)
        if m:
            nombre = m.group(1); doc = comentario_previo(L, i); campos = []
            i += 1
            while i < len(L) and not re.match(r'^end\b', L[i]):
                fl = L[i].rstrip()
                if re.match(r'\s+(weak\s+)?\w+\s*:', fl) and not fl.strip().startswith("func"):
                    campos.append(fl.strip())
                i += 1
            structs.append((nombre, doc, campos)); i += 1; continue
        m = re.match(r'^const\s+([A-Z][A-Z_0-9]*)\s*=\s*(.+)$', l)
        if m: consts.append((m.group(1), m.group(2).strip()))
        m = re.match(r'^(@native(?:\(\w+\))?\s+)?func\s+([a-zA-Z]\w*)\s*(\(.*)$', l)
        if m: funcs.append((m.group(2), m.group(3).strip(), comentario_previo(L, i), bool(m.group(1))))
        i += 1
    info[f] = dict(cab=" ".join(x.strip() for x in cab if x.strip() and not x.startswith("  ")), cab_lineas=cab, imps=imps, dirs=dirs, structs=structs, consts=consts, funcs=funcs, lineas=len(L))

def nodo(f): return Path(f).stem
out = []
w = out.append
w("# 07. Módulos e interfaces\n")
w(f"Generado del código en el commit `{commit}` con `docs/ingenieria/herramientas/gen_modulos.py`. Para ponerlo al día:\n")
w("```bash\npython3 docs/ingenieria/herramientas/gen_modulos.py . docs/ingenieria/07_MODULOS_E_INTERFACES.md $(git rev-parse --short HEAD)\n```\n")
w("Cada módulo: su responsabilidad (la cabecera del fichero), de qué depende, sus directivas de compilación, "
  "constantes, estructuras y **funciones públicas** (las que no empiezan por `_`) con su descripción (el comentario "
  "que las precede). Las funciones `@native` están escritas en C dentro del módulo. Los tipos son los de Dash: `Int`, "
  "`String`, `Bool`, `[T]` (lista), `{String: T}` (diccionario) y los structs.\n")
nf = sum(len(v["funcs"]) for v in info.values()); ns = sum(len(v["structs"]) for v in info.values())
nl = sum(v["lineas"] for v in info.values())
w(f"En total: {len(todos)} ficheros, {nl} líneas, {ns} structs y {nf} funciones públicas.\n")

w("## Resumen\n")
w("| Grupo | Módulo | Líneas | Funciones públicas | Responsabilidad |\n|---|---|---|---|---|")
for g, fs in GRUPOS:
    for f in fs:
        v = info[f]; r = v["cab"].split(". ")[0][:140]
        w(f"| {g} | [`{f}`](#{nodo(f)}) | {v['lineas']} | {len(v['funcs'])} | {celda(r)} |")
w("")

w("## Dependencias\n")
w("Quién importa a quién (`A --> B`: A importa B). Las flechas a `navegador.dashui` son la ventana del editor visual.\n")
w("```mermaid\nflowchart LR")
for g, fs in GRUPOS:
    w(f"  subgraph {g.replace(' ', '_')}[\"{g}\"]")
    for f in fs: w(f"    {nodo(f)}[\"{Path(f).name}\"]")
    w("  end")
for f in todos:
    for imp in info[f]["imps"]:
        destino = Path(imp).stem
        if destino == "navegador": destino = "navegador_dashui"
        w(f"  {nodo(f)} --> {destino}")
w("  navegador_dashui[\"navegador.dashui\"]")
w("```\n")

for g, fs in GRUPOS:
    w(f"## {g}\n")
    for f in fs:
        v = info[f]
        w(f"### `{f}` <a id=\"{nodo(f)}\"></a>\n")
        bloques = []   # (es_codigo, [lineas])
        for x in v["cab_lineas"]:
            cod = x.startswith("  ")
            if not x.strip():
                bloques.append((None, []))
                continue
            if bloques and bloques[-1][0] == cod:
                bloques[-1][1].append(x[2:] if cod else x.strip())
            else:
                bloques.append((cod, [x[2:] if cod else x.strip()]))
        if not v["cab_lineas"]:
            w("(Sin cabecera.)\n")
        for cod, ls in bloques:
            if cod is None or not ls: continue
            if cod:
                w("```ruby"); w("\n".join(ls)); w("```\n")
            else:
                w(texto(" ".join(ls)) + "\n")
        if v["imps"]: w("**Importa:** " + ", ".join(f"`{i}`" for i in v["imps"]) + "\n")
        if v["dirs"]: w("**Directivas:** " + ", ".join(f"`{d}`" for d in v["dirs"]) + "\n")
        if v["consts"]:
            w("**Constantes**\n\n| Nombre | Valor |\n|---|---|")
            for n, val in v["consts"]: w(f"| `{n}` | `{val.replace('|', chr(92) + '|')}` |")
            w("")
        for n, doc, campos in v["structs"]:
            w(f"**struct `{n}`**" + (f": {texto(doc)}" if doc else "") + "\n")
            w("```ruby"); w("\n".join(campos) if campos else "(sin campos)"); w("```\n")
        if v["funcs"]:
            w("**Funciones**\n\n| Función | Descripción |\n|---|---|")
            for n, sig, doc, nat in v["funcs"]:
                w(f"| `{(n + sig).replace('|', chr(92) + '|')}`{' (C)' if nat else ''} | {celda(doc) if doc else '—'} |")
            w("")
salida.write_text("\n".join(out) + "\n", encoding="utf-8")
print("ok", nf, ns, nl)
