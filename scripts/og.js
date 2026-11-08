// Erzeugt og.png und apple-touch-icon.png aus den SVG-Quellen.
// Optional, nur bei Änderungen an og.svg oder favicon.svg nötig. Braucht Playwright.
// Aufruf: node scripts/og.js
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const root = path.resolve(__dirname, "..");
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto("file://" + path.join(root, "og.svg"));
  await p.screenshot({ path: path.join(root, "og.png") });
  const i = await b.newPage({ viewport: { width: 180, height: 180 } });
  await i.goto("file://" + path.join(root, "favicon.svg"));
  await i.screenshot({ path: path.join(root, "apple-touch-icon.png") });
  await b.close();
})();
