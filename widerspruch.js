// Widerspruch gegen die Reichweitenmessung (GoatCounter liest localStorage "skipgc").
(function () {
  "use strict";
  var knopf = document.getElementById("widerspruch");
  var status = document.getElementById("widerspruch-status");
  if (!knopf || !status) return;
  function aktiv() {
    try { return localStorage.getItem("skipgc") === "t"; } catch (e) { return null; }
  }
  function zeigen() {
    var a = aktiv();
    if (a === null) {
      status.textContent = "Dein Browser erlaubt keinen lokalen Speicher, der Widerspruch lässt sich hier nicht ablegen.";
      knopf.hidden = true;
      return;
    }
    status.textContent = a ? "Widerspruch ist gesetzt: Aufrufe aus diesem Browser werden nicht gezählt."
                           : "Aufrufe aus diesem Browser werden gezählt.";
    knopf.textContent = a ? "Widerspruch zurücknehmen" : "Der Zählung widersprechen";
    knopf.hidden = false;
  }
  knopf.addEventListener("click", function () {
    try {
      if (aktiv()) localStorage.removeItem("skipgc"); else localStorage.setItem("skipgc", "t");
    } catch (e) { /* zeigen() meldet das */ }
    zeigen();
  });
  zeigen();
})();
