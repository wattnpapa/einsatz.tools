// Rendert die Tool-Karten aus tools.json. Ohne JavaScript bleibt die
// statisch eingebettete Liste aus scripts/render_tools.py stehen; beide
// erzeugen dasselbe Markup.
(function () {
  "use strict";
  var ziel = document.getElementById("tools");
  if (!ziel || !window.fetch) return;

  function el(tag, attrs, kinder) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    (kinder || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  function host(url) {
    try { return new URL(url).host; } catch (e) { return url; }
  }

  var SYMBOLE = ["blatt", "auftrag", "nachricht", "karte", "qr", "funk"];
  var SVG = "http://www.w3.org/2000/svg";

  function symbol(name) {
    var svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "symbol");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var use = document.createElementNS(SVG, "use");
    use.setAttribute("href", "#sym-" + (SYMBOLE.indexOf(name) >= 0 ? name : "blatt"));
    svg.appendChild(use);
    return svg;
  }

  function karte(t) {
    var kopf = el("div", { "class": "feld kopfzeile" }, [
      symbol(t.symbol),
      el("h3", {}, [
        el("a", { "class": "karte-link", href: t.url }, [t.name]),
        t.status ? " " : null,
        t.status ? el("span", { "class": "status" }, [t.status]) : null
      ]),
      el("span", { "class": "adresse", "aria-hidden": "true" }, [host(t.url)])
    ]);
    var angaben = [["Bildet ab", t.abbildung], ["Für", t.zielgruppe]].filter(function (a) { return a[1]; });
    var dl = angaben.length ? el("dl", {}, angaben.map(function (a) {
      return el("div", { "class": "feld" }, [el("dt", {}, [a[0]]), el("dd", {}, [a[1]])]);
    })) : null;
    var fuss = t.repo ? el("p", { "class": "feld karte-fuss" }, [
      el("a", { "class": "repo", href: t.repo }, [
        "Quellcode", el("span", { "class": "sr-only" }, [" von " + t.name])
      ])
    ]) : null;
    return el("li", { "class": "karte" }, [
      el("article", {}, [kopf, el("p", { "class": "feld beschreibung" }, [t.beschreibung]), dl, fuss])
    ]);
  }

  function render(daten) {
    var frag = document.createDocumentFragment();
    daten.rubriken.forEach(function (r) {
      var tools = daten.tools.filter(function (t) { return t.rubrik === r.id; });
      if (!tools.length) return;
      var rid = "rubrik-" + r.id;
      var h2 = el("h2", { id: rid }, [r.titel]);
      var kopf = r.untertitel ? el("hgroup", { "class": "band" }, [h2, el("p", {}, [r.untertitel])])
                              : (h2.setAttribute("class", "band"), h2);
      frag.appendChild(el("section", { "class": "abschnitt rubrik", "aria-labelledby": rid }, [
        kopf, el("ul", { "class": "karten" }, tools.map(karte))
      ]));
    });
    ziel.replaceChildren(frag);
  }

  fetch("tools.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () { /* statische Liste bleibt stehen */ });
})();
