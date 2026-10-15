#!/usr/bin/env python3
"""Writes lib/entidades.dash: HTML named entities that dashweb knows (those of Latin-1 and
the usual typographic ones), sorted for a binary search, with their Unicode code points."""
from html.entities import name2codepoint as n2c
from pathlib import Path

EXTRA = ["ndash", "mdash", "lsquo", "rsquo", "sbquo", "ldquo", "rdquo", "bdquo", "hellip", "bull", "euro",
         "trade", "dagger", "Dagger", "permil", "lsaquo", "rsaquo", "prime", "Prime", "oline", "frasl", "minus",
         "thinsp", "ensp", "emsp", "zwnj", "zwj", "lrm", "rlm", "OElig", "oelig", "Scaron", "scaron", "Yuml",
         "fnof", "circ", "tilde", "larr", "rarr", "uarr", "darr", "harr", "le", "ge", "ne", "infin", "asymp",
         "equiv", "hearts", "spades", "clubs", "diams", "alpha", "beta", "pi", "mu", "Omega", "sigma"]
table = {k: v for k, v in n2c.items() if v <= 255}
table.update({k: n2c[k] for k in EXTRA})
table["apos"] = 39
names = sorted(table)      # byte order, the same as Dash's < on Strings (strcmp)


def rows(items, per):
    return ",\n".join("    " + ", ".join(items[i:i + per]) for i in range(0, len(items), per))


out = ["# Generado por tools/gen_entidades.py: no editar a mano.",
       "# Entidades HTML con nombre que conoce dashweb, ordenadas (búsqueda binaria), y su código Unicode.",
       "", "var ENTIDAD_NOMBRES: [String] = [", rows([f'"{n}"' for n in names], 8), "]",
       "", "var ENTIDAD_CODIGOS: [Int] = [", rows([str(table[n]) for n in names], 12), "]", ""]
Path(__file__).resolve().parent.parent.joinpath("lib", "entidades.dash").write_text("\n".join(out))
print(len(names), "entidades")
