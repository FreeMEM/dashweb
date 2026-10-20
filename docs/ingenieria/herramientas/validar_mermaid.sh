#!/bin/sh
# Dibuja con Mermaid 11 (Chromium sin ventana, Mermaid desde jsdelivr) todos los diagramas de los .md de una
# carpeta y dice cuáles fallan.   docs/ingenieria/herramientas/validar_mermaid.sh docs/ingenieria
# Ojo: un ";" dentro de una etiqueta de un diagrama de estado no da error pero parte la línea (cajas sueltas).
S=$(mktemp -d)
trap 'rm -rf "$S"' EXIT
python3 - "$1" "$S/mermaid.html" <<'PY'
import re, json, glob, sys
diags=[]
for f in sorted(glob.glob(sys.argv[1] + '/*.md')):
    t=open(f).read()
    for m in re.finditer(r'```mermaid\n(.*?)```', t, re.S):
        diags.append({'f':f.split('/')[-1],'l':t[:m.start()].count('\n')+1,'src':m.group(1)})
pagina = """<!doctype html><html><body><div id="r">PENDIENTE</div>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>
<script>
const D = %s;
mermaid.initialize({startOnLoad:false});
(async () => { const out = [];
  for (let i = 0; i < D.length; i++) {
    try { await mermaid.render('d' + i, D[i].src); out.push('OK ' + D[i].f + ':' + D[i].l); }
    catch (e) { out.push('FALLO ' + D[i].f + ':' + D[i].l + ' ' + String(e.message || e).slice(0, 300)); } }
  document.getElementById('r').textContent = out.join('\\n'); })();
</script></body></html>""" % json.dumps(diags)
open(sys.argv[2],'w').write(pagina)
PY
timeout 120 chromium --headless=new --disable-gpu --no-sandbox --virtual-time-budget=60000 --dump-dom "file://$S/mermaid.html" 2>/dev/null \
  | python3 -c "import sys,re,html; t=sys.stdin.read(); m=re.search(r'<div id=\"r\">(.*?)</div>', t, re.S); print(html.unescape(m.group(1)) if m else t[:500])"
