/* =====================================================================
   Gera os assets de imagem usados pela carta em PPTX a partir do que já
   existe no repositório (logo SVG, textura do skatista, fotos da pista).
   Tudo é escrito em .build/ — nada disso é comitado.
   ===================================================================== */
const { abrirNavegador } = require('./navegador');
const fs = require('fs');
const path = require('path');

const RAIZ = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, '.build');

const A4_W = 794, A4_H = 1123;   // A4 em px CSS (96dpi)

const skaterSvg = () =>
  'data:image/svg+xml;base64,' +
  fs.readFileSync(path.join(RAIZ, 'assets/skater-bg.svg')).toString('base64');

// Marca d'água: wordmark "loop" repetida, girada 45°, tom sobre tom.
function textura({ w, h, tile, opacity, invert, fundo }) {
  return `<!doctype html><body style="margin:0;background:transparent">
    <div style="position:relative;width:${w}px;height:${h}px;overflow:hidden;
                background:${fundo || 'transparent'}">
      <div style="position:absolute;inset:0;overflow:hidden">
        <div style="position:absolute;top:50%;left:50%;width:2600px;height:2600px;
          background-image:url('${skaterSvg()}');background-repeat:repeat;background-size:${tile}px;
          transform:translate(-50%,-50%) rotate(45deg);opacity:${opacity};
          ${invert ? 'filter:invert(1);' : ''}"></div>
      </div>
    </div></body>`;
}

async function shot(browser, { html, w, h, file, scale = 2, transparente = true }) {
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await p.setContent(html);
  await p.waitForTimeout(250);
  await p.screenshot({ path: path.join(OUT, file), omitBackground: transparente });
  await p.close();
}

// O logo é SVG inline no site; aqui vira PNG com fundo transparente e sem
// sobras nas bordas, para entrar no slide sem área de proteção fantasma.
async function logoPng(browser) {
  const svg = fs.readFileSync(path.join(RAIZ, '_includes/logo.svg'), 'utf8');
  const bruto = path.join(OUT, 'logo-bruto.png');
  const p = await browser.newPage({ deviceScaleFactor: 1 });
  await p.setContent(`<!doctype html><body style="margin:0;background:transparent">
    <div id="host" style="width:1600px">${svg}</div>
    <style>#host svg{width:100%;height:auto;display:block}</style></body>`);
  await (await p.$('#host')).screenshot({ path: bruto, omitBackground: true });
  await p.close();
  return bruto;
}

async function gerarAssets() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await abrirNavegador();

  // fundos de página inteira (capa e contracapa)
  await shot(browser, {
    html: textura({ w: A4_W, h: A4_H, tile: 300, opacity: 0.15, fundo: '#935bbc' }),
    w: A4_W, h: A4_H, scale: 2.5, file: 'bg-roxo.png', transparente: false,
  });
  await shot(browser, {
    html: textura({ w: A4_W, h: A4_H, tile: 300, opacity: 0.075, invert: true, fundo: '#000000' }),
    w: A4_W, h: A4_H, scale: 2.5, file: 'bg-preto.png', transparente: false,
  });

  const bruto = await logoPng(browser);
  await browser.close();
  return bruto;
}

// As faixas de seção têm alturas diferentes; a textura é gerada no tamanho
// exato de cada uma para não esticar nem recortar o padrão.
async function texturasDeFaixa(specs) {
  const browser = await abrirNavegador();
  for (const s of specs) {
    const w = Math.round(s.w * 96), h = Math.round(s.h * 96);
    await shot(browser, {
      html: textura({ w, h, tile: 150, opacity: 1, invert: s.invert }),
      w, h, file: s.file,
    });
  }
  await browser.close();
}

module.exports = { gerarAssets, texturasDeFaixa, OUT, RAIZ };

if (require.main === module) gerarAssets().then(() => console.log('assets →', OUT));
