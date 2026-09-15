const { abrirNavegador } = require('./navegador');

// Mede a altura real (em polegadas) de blocos de texto usando as fontes da
// marca instaladas no sistema, para que o layout A4 possa ser montado com
// posições absolutas sem sobreposição.
async function measureAll(items) {
  const browser = await abrirNavegador();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.setContent('<!doctype html><html><body style="margin:0"></body></html>');
  const out = await page.evaluate((items) => {
    const PX = 96;            // 1 polegada = 96px CSS
    const PT = 96 / 72;       // 1pt = 1.333px
    return items.map((it) => {
      const d = document.createElement('div');
      d.style.position = 'absolute';
      d.style.left = '-9999px';
      d.style.width = (it.w * PX) + 'px';
      d.style.fontFamily = it.font;
      d.style.fontSize = (it.size * PT) + 'px';
      d.style.lineHeight = (it.lineSpacing * PT) + 'px';
      d.style.fontWeight = it.bold ? '700' : '400';
      d.style.letterSpacing = ((it.charSpacing || 0) * PT) + 'px';
      d.style.textTransform = it.uppercase ? 'uppercase' : 'none';
      d.style.whiteSpace = 'pre-wrap';
      d.style.wordBreak = 'normal';
      d.textContent = it.text;
      document.body.appendChild(d);
      const h = d.getBoundingClientRect().height;
      const lines = Math.max(1, Math.round(h / (it.lineSpacing * PT)));
      d.remove();
      return { lines, h: h / PX };
    });
  }, items);
  await browser.close();
  return out;
}

module.exports = { measureAll };
