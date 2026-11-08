# einsatz.tools

Gemeinsame Startseite für eine Reihe kostenloser Browser-Werkzeuge für BOS und Hilfsorganisationen (THW, Feuerwehr, DRK, DLRG, Malteser, Johanniter, ASB und andere). Jedes Werkzeug läuft im Browser, braucht kein Konto und bildet einen bekannten Papierprozess digital ab.

Die Seite ist statisch: HTML, CSS und ein kleines Skript, kein Framework, kein Build-Schritt mit npm.

Derzeit erreichbar unter https://wattnpapa.github.io/einsatz.tools/. Später soll sie unter https://einsatz.tools laufen (siehe [Eigene Domain](#eigene-domain-einsatztools)).

## Aufbau

| Datei | Zweck |
| --- | --- |
| `tools.json` | Rubriken und Werkzeuge, einzige Datenquelle |
| `index.html` | Startseite; die Tool-Liste zwischen `TOOLS:START` und `TOOLS:END` wird erzeugt |
| `tools.js` | rendert die Karten im Browser aus `tools.json` |
| `scripts/render_tools.py` | bettet die Liste statisch in `index.html` ein (für Aufrufe ohne JavaScript) |
| `style.css` | Gestaltung, Dark Mode über `prefers-color-scheme` |
| `impressum.html`, `datenschutz.html` | Rechtliches, Platzhalter ausfüllen |
| `favicon.svg`, `og.svg` | Quellen für Favicon und Vorschaubild |
| `og.png`, `apple-touch-icon.png` | daraus erzeugt mit `node scripts/og.js` (optional, braucht Playwright) |
| `snippets/footer-link.html` | Hinweis „Teil von einsatz.tools“ für die Footer der einzelnen Werkzeuge |

## Ein Werkzeug ergänzen

Einen Eintrag in `tools.json` unter `tools` anlegen:

```json
{
  "name": "Beispielwerkzeug",
  "url": "https://beispiel.app",
  "rubrik": "logistik",
  "beschreibung": "Ein Satz, was das Werkzeug tut.",
  "abbildung": "Welcher Vordruck oder welche Aufgabe abgebildet wird",
  "zielgruppe": "Für wen es gedacht ist",
  "repo": "https://github.com/wattnpapa/beispiel",
  "status": "beta"
}
```

Pflicht sind `name`, `url`, `rubrik` und `beschreibung`. `abbildung`, `zielgruppe`, `repo` und `status` sind optional; leere Felder erscheinen nicht auf der Karte. Felder, die mit `_` beginnen (zum Beispiel `_todo`), sind Notizen und werden nicht angezeigt.

`rubrik` muss eine `id` aus der Liste `rubriken` sein (`fuehrung`, `logistik`, `ausbildung`). Rubriken ohne Werkzeug werden nicht angezeigt. Eine neue Rubrik entsteht durch einen weiteren Eintrag in `rubriken`; die Reihenfolge dort ist die Reihenfolge auf der Seite.

Danach lokal die statische Liste aktualisieren:

```bash
python3 scripts/render_tools.py
```

Wer das vergisst, ist trotzdem abgesichert: Der Deploy-Workflow führt das Skript vor jeder Veröffentlichung selbst aus. Ein Eintrag lässt sich also auch direkt im GitHub-Webeditor ergänzen.

## Lokal ansehen

```bash
python3 -m http.server 8000
```

Dann http://localhost:8000 öffnen. Über `file://` geöffnet kann der Browser `tools.json` nicht laden; dann erscheint die statisch eingebettete Liste.

## Deployment

`.github/workflows/pages.yml` veröffentlicht die Seite bei jedem Push auf `main` (oder manuell über „Run workflow“) mit `actions/deploy-pages`. Der Workflow bettet die Tool-Liste ein, kopiert nur die Dateien der Seite nach `_site` und lädt sie hoch.

Einmalig im Repository einstellen: Settings → Pages → Build and deployment → Source: **GitHub Actions**.

## Eigene Domain einsatz.tools

Sobald die Domain registriert ist:

1. Beim Registrar diese DNS-Einträge anlegen. Die Adressen stammen aus der GitHub-Dokumentation [Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) (Stand November 2026, vor dem Eintragen dort gegenprüfen):

   | Name | Typ | Wert |
   | --- | --- | --- |
   | `@` (einsatz.tools) | A | 185.199.108.153 |
   | `@` | A | 185.199.109.153 |
   | `@` | A | 185.199.110.153 |
   | `@` | A | 185.199.111.153 |
   | `@` | AAAA | 2606:50c0:8000::153 |
   | `@` | AAAA | 2606:50c0:8001::153 |
   | `@` | AAAA | 2606:50c0:8002::153 |
   | `@` | AAAA | 2606:50c0:8003::153 |
   | `www` | CNAME | wattnpapa.github.io |

   Die AAAA-Einträge sind optional, aber empfohlen.

2. Empfohlen: die Domain vorher unter GitHub → Settings (Profil) → Pages → „Add a domain“ verifizieren, damit niemand anderes sie mit GitHub Pages belegen kann.
3. Datei `CNAME` im Root anlegen mit dem Inhalt `einsatz.tools`. Der Workflow kopiert sie automatisch mit.
4. Unter Settings → Pages → Custom domain `einsatz.tools` eintragen und nach erfolgreicher DNS-Prüfung „Enforce HTTPS“ aktivieren.
5. Absolute URLs umstellen: in `index.html` `canonical`, `og:url` und `og:image` von `https://wattnpapa.github.io/einsatz.tools/` auf `https://einsatz.tools/`, ebenso in `snippets/footer-link.html` und in den bereits eingebauten Footer-Hinweisen der Werkzeuge.

Alle übrigen Pfade der Seite sind relativ und funktionieren unter beiden Adressen.

## Grundsätze der Seite

Kein Tracking, keine Cookies, keine externen Schriften oder Skripte. Die einzige Anfrage nach dem Laden ist `tools.json` vom selben Server.

## Lizenz

Der Code dieser Seite steht unter der [MIT-Lizenz](LICENSE). Die verlinkten Werkzeuge haben eigene Repositories und eigene Lizenzen.
