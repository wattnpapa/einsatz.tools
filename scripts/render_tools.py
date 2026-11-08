#!/usr/bin/env python3
"""Bettet die Tool-Liste aus tools.json statisch in index.html ein.

Damit ist die Liste auch ohne JavaScript sichtbar. tools.js erzeugt im
Browser dasselbe Markup aus tools.json; beide Stellen bei Änderungen am
Kartenaufbau gemeinsam anpassen.

Aufruf im Repo-Root:  python3 scripts/render_tools.py
Mit --check wird nur geprüft, ob index.html aktuell ist (Exit-Code 1, wenn nicht).
"""
import html
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
START = "<!-- TOOLS:START"
END = "<!-- TOOLS:END -->"
PFLICHT = ("name", "url", "rubrik", "beschreibung")


def e(text):
    return html.escape(text, quote=True)


def host(url):
    return urlparse(url).netloc or url


def karte(t):
    zeilen = ['<li class="karte">', "<article>"]
    status = f' <span class="status">{e(t["status"])}</span>' if t.get("status") else ""
    zeilen.append('<div class="feld kopfzeile">')
    zeilen.append(f'<h3><a class="karte-link" href="{e(t["url"])}">{e(t["name"])}</a>{status}</h3>')
    zeilen.append(f'<span class="adresse" aria-hidden="true">{e(host(t["url"]))}</span>')
    zeilen.append("</div>")
    zeilen.append(f'<p class="feld beschreibung">{e(t["beschreibung"])}</p>')
    angaben = [("Bildet ab", t.get("abbildung")), ("Für", t.get("zielgruppe"))]
    angaben = [(k, v) for k, v in angaben if v]
    if angaben:
        zeilen.append("<dl>")
        for k, v in angaben:
            zeilen.append(f'<div class="feld"><dt>{e(k)}</dt><dd>{e(v)}</dd></div>')
        zeilen.append("</dl>")
    if t.get("repo"):
        zeilen.append('<p class="feld karte-fuss">')
        zeilen.append(f'<a class="repo" href="{e(t["repo"])}">Quellcode<span class="sr-only"> von {e(t["name"])}</span></a>')
        zeilen.append("</p>")
    zeilen.append("</article>")
    zeilen.append("</li>")
    return "\n".join(zeilen)


def render(daten):
    rubriken = {r["id"]: r for r in daten["rubriken"]}
    for t in daten["tools"]:
        fehlend = [f for f in PFLICHT if not t.get(f)]
        if fehlend:
            sys.exit(f"tools.json: {t.get('name', '?')} fehlt {', '.join(fehlend)}")
        if t["rubrik"] not in rubriken:
            sys.exit(f"tools.json: {t['name']} hat unbekannte Rubrik {t['rubrik']!r}")
    teile = []
    for r in daten["rubriken"]:
        tools = [t for t in daten["tools"] if t["rubrik"] == r["id"]]
        if not tools:
            continue
        rid = "rubrik-" + r["id"]
        teile.append(f'<section class="abschnitt rubrik" aria-labelledby="{e(rid)}">')
        if r.get("untertitel"):
            teile.append(f'<hgroup class="band"><h2 id="{e(rid)}">{e(r["titel"])}</h2><p>{e(r["untertitel"])}</p></hgroup>')
        else:
            teile.append(f'<h2 class="band" id="{e(rid)}">{e(r["titel"])}</h2>')
        teile.append('<ul class="karten">')
        teile.extend(karte(t) for t in tools)
        teile.append("</ul>")
        teile.append("</section>")
    return "\n".join(teile)


def main():
    daten = json.loads((ROOT / "tools.json").read_text(encoding="utf-8"))
    index = ROOT / "index.html"
    alt = index.read_text(encoding="utf-8")
    muster = re.compile(r"(<!-- TOOLS:START[^\n]*-->\n).*?(<!-- TOOLS:END -->)", re.S)
    if not muster.search(alt):
        sys.exit("index.html: Markierungen TOOLS:START/TOOLS:END fehlen")
    neu = muster.sub(lambda m: m.group(1) + render(daten) + "\n" + m.group(2), alt)
    if "--check" in sys.argv:
        if neu != alt:
            sys.exit("index.html ist nicht aktuell: python3 scripts/render_tools.py ausführen")
        return
    index.write_text(neu, encoding="utf-8")


if __name__ == "__main__":
    main()
