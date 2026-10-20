import re, sys
from pathlib import Path
raiz = Path(sys.argv[1])
REQ = {"animacion":"RF-50","colores4":"RF-49","cookies":"RF-35","css":"RF-42","css_escapes":"RF-43","documento_tipo":"RF-53, RF-36",
"dom":"RF-40","estilo_animacion":"RF-50","estilo_calc":"RF-42","estilo_capas":"RF-42","estilo":"RF-42","estilo_enlaces":"RF-42",
"estilo_partes":"RF-64","estilo_vars":"RF-42, RNF-06","formularios":"RF-60","formularios_post":"RF-60, RF-63","fuente_web":"RF-52",
"hola":"—","html5":"RF-40","html_tokens":"RF-40","http_carga":"RF-32","http":"RF-30","http_gzip":"RF-33","https":"RF-31",
"http_seguir":"RF-34","imagen_dec":"RF-51","imagenes_carga":"RF-51, RNF-05","imagenes":"RF-51","jquery":"RF-62","js":"RF-61",
"jsdom":"RF-62","jsdom_eventos":"RF-63, RF-10","jsdom_texto":"RF-62","js_url":"RF-62","jsdom_interfaces":"RF-62","maqueta_cajas":"RF-47","maqueta_capas":"RF-46",
"maqueta_css":"RF-42, RF-44","maqueta":"RF-44","maqueta_flex":"RF-45","maqueta_grid":"RF-45","maqueta_tabla":"RF-45",
"maqueta_texto3":"RF-44","maqueta_transform":"RF-48","marcadores":"RF-07, RF-08","navegacion":"RF-10","recursos":"RF-42, RNF-05",
"red":"RF-30","selectores4":"RF-43","srcset":"RF-51","svg_pagina":"RF-51","texto":"RF-41, RNF-12","url":"RF-01, RF-02, RF-37",
"video_bajando":"RF-71","video_cartel":"RF-70","video":"RF-70","youtube":"RF-73"}
print("| Test | Qué comprueba | Red local | Otras condiciones | Requisitos |\n|---|---|---|---|---|")
for t in sorted((raiz/"tests").glob("test_*.dash")):
    L = t.read_text(encoding="utf-8").splitlines()
    cab = []; serv = []; otras = []
    for l in L:
        if not l.startswith("#"): break
        x = l[1:].strip()
        m = re.match(r"(emu-server|emu-config|emu-needs|dash-flags|cflags|memcheck|expect-out)\b:?\s*(.*)", x)
        if m:
            if m.group(1) == "emu-server": serv.append(m.group(2).split()[0])
            elif m.group(1) != "expect-out": otras.append((m.group(1) + " " + m.group(2)).strip())
            continue
        cab.append(x)
    texto = " ".join(cab)
    texto = re.sub(r"^(Test|Trivial test):\s*", "", texto)
    frase = re.split(r"(?<=[.])\s", texto)[0]
    frase = frase.replace("|", "\\|").replace("<", "&lt;").replace(">", "&gt;")
    nombre = t.stem[5:]
    print(f"| `{t.stem}` | {frase} | {', '.join(sorted(set(serv))) or '—'} | {'; '.join(sorted(set(otras))).replace('|','/') or '—'} | {REQ.get(nombre,'?')} |")
