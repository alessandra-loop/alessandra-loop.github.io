const pptxgen = require('pptxgenjs');
const { measureAll } = require('./measure');
const { texturasDeFaixa, OUT } = require('./assets');
const path = require('path');
const fs = require('fs');
const K = require('./content');

/* =====================================================================
   Carta de apresentação da Loop Skate Park — documento A4 retrato (5 páginas).
   Paleta e tipografia seguem _includes/brand-tokens.html.
   O layout usa medição real das fontes da marca + justificação vertical:
   cada página distribui a sobra de altura nos respiros entre blocos.
   ===================================================================== */

const C = {
  preto: '000000', branco: 'FFFFFF', ciano: '18D7DF', roxo: '935BBC',
  rosa: 'FFB3D1', amarelo: 'F6C707', bege: 'E8D4BF', ink: '111111',
};
const FD = 'Anton', FH = 'Oswald', FB = 'Barlow';

// A4 retrato, em polegadas
const PW = 8.27, PH = 11.69, MG = 0.78, CW = PW - 2 * MG;
const FOOT_Y = PH - 0.70;      // régua do rodapé das páginas internas
const Y_MAX = FOOT_Y - 0.36;   // limite inferior do conteúdo

const B = (f) => path.join(OUT, f);
const LOGO = B('logo.png');
const LOGO_AR = (() => {
  const h = fs.readFileSync(LOGO).subarray(16, 24);   // IHDR: largura + altura
  return h.readUInt32BE(0) / h.readUInt32BE(4);
})();

const S = {
  body:      { font: FB, size: 11,   lineSpacing: 17 },
  lead:      { font: FB, size: 13,   lineSpacing: 20 },
  bandTitle: { font: FD, size: 30,   lineSpacing: 32, uppercase: true },
  capaTitle: { font: FD, size: 46,   lineSpacing: 55, uppercase: true },
  shout:     { font: FD, size: 15.5, lineSpacing: 20, uppercase: true },
  sub:       { font: FD, size: 18,   lineSpacing: 20, uppercase: true },
  cardTitle: { font: FH, size: 11.5, lineSpacing: 14, bold: true, uppercase: true },
  cardBody:  { font: FB, size: 10,   lineSpacing: 14 },
  check:     { font: FB, size: 10,   lineSpacing: 13.5 },
  finalTxt:  { font: FB, size: 12,   lineSpacing: 18 },
};

/* ---------------- medição ---------------- */
const reqs = [], idx = {};
function need(key, text, style, w, tol = 0.98) {
  idx[key] = reqs.length;
  reqs.push({ text: String(text).replace(/\*\*/g, ''), w: w * tol, ...style });
}
let sizes = [];
const H = (k) => sizes[idx[k]].h;

/* ---------------- texto rico (**negrito**) ---------------- */
function runs(text) {
  return String(text).split(/(\*\*[^*]+\*\*)/).filter((s) => s !== '').map((seg) => {
    const b = seg.startsWith('**');
    return { text: b ? seg.slice(2, -2) : seg, options: { bold: b, breakLine: false } };
  });
}
const T = (style, extra = {}) => ({
  fontFace: style.font, fontSize: style.size, lineSpacing: style.lineSpacing,
  bold: !!style.bold, charSpacing: style.charSpacing || 0,
  margin: 0, valign: 'top', ...extra,
});

/* ---------------- registro das medidas ---------------- */
const cardW = (CW - 0.26) / 2, cardInnerW = cardW - 0.52;
const itemW = (CW - 0.22) / 2, itemInnerW = itemW - 0.70;

need('capa.titulo', K.capa.titulo.join('\n'), S.capaTitle, CW);
need('p2.band', K.p2.band.titulo, S.bandTitle, CW);
need('p2.lead', K.p2.lead, S.lead, CW - 0.30);
K.p2.paragrafos.forEach((p, i) => need('p2.p' + i, p, S.body, CW));
need('p2.shout', K.p2.shout, S.shout, CW - 0.72);
need('p3.band', K.p3.band.titulo, S.bandTitle, CW);
K.p3.paragrafos.forEach((p, i) => need('p3.p' + i, p, S.body, CW));
need('p3.sub', K.p3.subtitulo, S.sub, CW - 0.44);
need('p3.intro', K.p3.intro, S.body, CW);
K.p3.cards.forEach((c, i) => {
  need('p3.ct' + i, c.titulo, S.cardTitle, cardInnerW);
  need('p3.cb' + i, c.texto, S.cardBody, cardInnerW);
});
need('p3.fecho', K.p3.fecho, S.body, CW);
need('p4.band', K.p4.band.titulo, S.bandTitle, CW);
K.p4.itens.forEach((t, i) => need('p4.i' + i, t, S.check, itemInnerW, 1));
need('p4.shout', K.p4.shout, S.shout, CW - 0.72);
K.p4.paragrafos.forEach((p, i) => need('p4.p' + i, p, S.body, CW));
need('p5.texto', K.p5.texto, S.finalTxt, 5.7);

/* =====================================================================
   Fluxo vertical: os blocos declaram altura + respiro; a sobra da página
   é redistribuída nos respiros (até 2x) para o texto não ficar "caindo"
   no alto da folha.
   ===================================================================== */
function flow(blocks, yStart, yMax) {
  const totalH = blocks.reduce((a, b) => a + b.h, 0);
  const totalGap = blocks.reduce((a, b) => a + (b.gap || 0), 0);
  const sobra = yMax - yStart - totalH - totalGap;
  const extra = sobra > 0 ? Math.min(sobra * 0.85, totalGap * 0.55) : 0;
  const f = totalGap > 0 ? extra / totalGap : 0;
  let y = yStart;
  for (const b of blocks) {
    b.draw(y);
    y += b.h + (b.gap || 0) * (1 + f);
  }
  return { fim: y, sobra };
}

/* ---------------- componentes ---------------- */
function pageFooter(slide, num) {
  slide.addShape('rect', { x: MG, y: FOOT_Y, w: CW, h: 0.02, fill: { color: C.preto } });
  slide.addText('Loop Skate Park · Carta de apresentação · 2026', {
    ...T({ font: FH, size: 8, lineSpacing: 11, charSpacing: 1.6 }),
    x: MG, y: FOOT_Y + 0.14, w: CW - 0.6, h: 0.2, color: '555555',
  });
  slide.addText(String(num), {
    ...T({ font: FD, size: 10, lineSpacing: 12 }),
    x: PW - MG - 0.6, y: FOOT_Y + 0.12, w: 0.6, h: 0.24, color: C.preto, align: 'right',
  });
}

const bandH = (key) => 0.54 + 0.22 + 0.20 + H(key) + 0.44;

function band(slide, cfg, key, texFile) {
  const bg = { ciano: C.ciano, rosa: C.rosa, roxo: C.roxo, preto: C.preto }[cfg.color];
  const dark = cfg.color === 'roxo' || cfg.color === 'preto';
  const fg = dark ? C.branco : C.preto;
  const h = bandH(key);
  slide.addShape('rect', { x: 0, y: 0, w: PW, h, fill: { color: bg } });
  slide.addImage({ path: texFile, x: 0, y: 0, w: PW, h, transparency: 86 });
  slide.addText(cfg.eyebrow.toUpperCase(), {
    ...T({ font: FH, size: 10, lineSpacing: 13, bold: true, charSpacing: 3.2 }),
    x: MG, y: 0.54, w: CW, h: 0.22, color: fg,
  });
  slide.addText(cfg.titulo.toUpperCase(), {
    ...T(S.bandTitle), x: MG, y: 0.54 + 0.22 + 0.20, w: CW, h: H(key) + 0.10, color: fg,
  });
  return h;
}

const shoutH = (key) => H(key) + 0.52;

function shout(slide, text, key, y) {
  const h = shoutH(key);
  slide.addShape('roundRect', { x: MG, y, w: CW, h, fill: { color: C.preto }, rectRadius: 0.16 });
  slide.addText(text.toUpperCase(), {
    ...T(S.shout, { valign: 'middle' }),
    x: MG + 0.36, y, w: CW - 0.72, h, color: C.branco,
  });
  slide.addShape('triangle', {           // rabinho do balão
    x: MG + CW - 0.66, y: y + h - 0.01, w: 0.26, h: 0.20,
    fill: { color: C.preto }, line: { type: 'none' }, rotate: 180,
  });
  return h;
}

// Foto com moldura preta + legenda (padrão .photo do site)
const FOTO_BORDA = 0.035;
const FOTO_LEG = 0.20 + 0.19;
function foto(slide, { x, w, h, path, legenda }, y) {
  const b = FOTO_BORDA;
  // a moldura ocupa a caixa inteira; a imagem entra recuada pela espessura
  // da borda, para que a aresta externa caia na mesma coluna do texto
  slide.addShape('rect', { x, y, w, h, fill: { color: C.preto } });
  slide.addImage({ path, x: x + b, y: y + b, w: w - b * 2, h: h - b * 2 });
  slide.addText(legenda.toUpperCase(), {
    ...T({ font: FH, size: 9, lineSpacing: 12.5, bold: true, charSpacing: 1.6 }),
    x, y: y + h + 0.20, w, h: 0.19, color: '444444',
  });
}

// Check preto dentro de um selo na cor de destaque: o amarelo e o ciano
// não têm contraste suficiente para virar traço solto sobre o branco.
function check(slide, cx, cy, cor) {
  const lado = 0.30;
  const x = cx - lado / 2, y = cy - lado / 2;
  slide.addShape('roundRect', {
    x, y, w: lado, h: lado, rectRadius: 0.07,
    fill: { color: cor }, line: { color: C.preto, width: 1.5 },
  });
  slide.addShape('line', {
    x: x + 0.075, y: y + 0.145, w: 0.055, h: 0.07,
    line: { color: C.preto, width: 2.25 },
  });
  slide.addShape('line', {
    x: x + 0.13, y: y + 0.085, w: 0.10, h: 0.13, flipV: true,
    line: { color: C.preto, width: 2.25 },
  });
}

// Contorno centrado na aresta: recua meia espessura para a borda externa
// ficar exatamente na coluna do texto.
function caixa(slide, { x, y, w, h, fill, traco }) {
  const m = traco / 72 / 2;
  slide.addShape('rect', {
    x: x + m, y: y + m, w: w - m * 2, h: h - m * 2,
    fill: { color: fill }, line: { color: C.preto, width: traco },
  });
}

function paragrafo(slide, text, key, y, style = S.body, extra = {}) {
  slide.addText(runs(text), {
    ...T(style), x: MG, y, w: CW, h: H(key) + 0.06, color: C.ink, ...extra,
  });
}

/* =====================================================================
   Montagem
   ===================================================================== */
function buildDeck() {
  const pres = new pptxgen();
  pres.defineLayout({ name: 'A4', width: PW, height: PH });
  pres.layout = 'A4';
  pres.author = 'Loop Skate Park';
  pres.company = 'Loop Skate Park';
  pres.title = 'Carta de Apresentação — Loop Skate Park';
  pres.subject = 'Carta de apresentação para marcas, empresas e coletivos';

  /* ---------- 1. CAPA ---------- */
  {
    const s = pres.addSlide();
    s.background = { path: B('bg-roxo.png') };
    const logoW = 3.0, logoH = logoW / LOGO_AR;
    const tituloH = H('capa.titulo');
    const stack = logoH + 0.80 + 0.22 + 0.46 + tituloH + 0.46 + 0.44 + 0.56 + 0.30;
    let y = 1.30 + (Y_MAX - 1.30 - stack) / 2 - 0.30;

    s.addImage({ path: LOGO, x: (PW - logoW) / 2, y, w: logoW, h: logoH });
    y += logoH + 0.80;

    s.addText(K.capa.eyebrow.toUpperCase(), {
      ...T({ font: FH, size: 10, lineSpacing: 14, bold: true, charSpacing: 3.4 }),
      x: MG, y, w: CW, h: 0.22, color: C.branco, align: 'center',
    });
    y += 0.22 + 0.46;

    s.addText(K.capa.titulo.join('\n').toUpperCase(), {
      ...T(S.capaTitle), x: MG, y, w: CW, h: tituloH + 0.2, color: C.branco, align: 'center',
    });
    y += tituloH + 0.46;

    const pillW = 1.55;
    s.addShape('roundRect', {
      x: (PW - pillW) / 2, y, w: pillW, h: 0.44, fill: { color: C.amarelo }, rectRadius: 0.22,
    });
    s.addText(K.capa.ano, {
      ...T({ font: FH, size: 14, lineSpacing: 18, bold: true, charSpacing: 5 }),
      x: (PW - pillW) / 2, y: y + 0.10, w: pillW, h: 0.26, color: C.preto, align: 'center',
    });
    y += 0.44 + 0.56;

    s.addText(K.capa.linha, {
      ...T({ font: FB, size: 12.5, lineSpacing: 17 }),
      x: MG, y, w: CW, h: 0.3, color: C.branco, align: 'center',
    });

    s.addShape('rect', { x: MG, y: PH - 1.16, w: CW, h: 0.02, fill: { color: C.branco } });
    s.addText(K.capa.rodape, {
      ...T({ font: FH, size: 10, lineSpacing: 14, bold: true, charSpacing: 2.4 }),
      x: MG, y: PH - 0.96, w: CW, h: 0.26, color: C.branco, align: 'center',
    });
  }

  /* ---------- 2. QUEM SOMOS ---------- */
  {
    const s = pres.addSlide();
    s.background = { color: C.branco };
    const bh = band(s, K.p2.band, 'p2.band', B('tex-band-2.png'));

    const blocks = [];
    blocks.push({
      h: H('p2.lead'), gap: 0.42, draw: (y) => {
        s.addShape('rect', { x: MG, y: y - 0.03, w: 0.10, h: H('p2.lead') + 0.12, fill: { color: C.amarelo } });
        s.addText(runs(K.p2.lead), {
          ...T(S.lead), x: MG + 0.30, y, w: CW - 0.30, h: H('p2.lead') + 0.08, color: C.ink,
        });
      },
    });
    K.p2.paragrafos.forEach((p, i) => blocks.push({
      h: H('p2.p' + i), gap: 0.24, draw: (y) => paragrafo(s, p, 'p2.p' + i, y),
    }));
    blocks.push({ h: shoutH('p2.shout'), gap: 0.44, draw: (y) => shout(s, K.p2.shout, 'p2.shout', y) });
    const fW = (CW - 0.20) / 2, fH = 1.92;
    blocks.push({
      h: fH + FOTO_LEG, gap: 0, draw: (y) => {
        foto(s, { x: MG, w: fW, h: fH, path: B('foto-pista.jpg'), legenda: 'Pista indoor — street e transições' }, y);
        foto(s, { x: MG + fW + 0.20, w: fW, h: fH, path: B('foto-recepcao.jpg'), legenda: 'Recepção e convivência' }, y);
      },
    });

    const r = flow(blocks, bh + 0.54, Y_MAX);
    console.log('pág 2 → fim', r.fim.toFixed(2), 'sobra', r.sobra.toFixed(2));
    pageFooter(s, 2);
  }

  /* ---------- 3. PARCERIAS + INICIATIVAS SOCIAIS ---------- */
  {
    const s = pres.addSlide();
    s.background = { color: C.branco };
    const bh = band(s, K.p3.band, 'p3.band', B('tex-band-3.png'));

    const blocks = [];
    K.p3.paragrafos.forEach((p, i) => blocks.push({
      h: H('p3.p' + i), gap: i === K.p3.paragrafos.length - 1 ? 0.52 : 0.24,
      draw: (y) => paragrafo(s, p, 'p3.p' + i, y),
    }));
    blocks.push({
      h: Math.max(H('p3.sub'), 0.30), gap: 0.22, draw: (y) => {
        const d = 0.19, alt = Math.max(H('p3.sub'), 0.30);
        s.addShape('rect', {
          x: MG + (d * Math.SQRT2 - d) / 2, y: y + (alt - d) / 2, w: d, h: d, rotate: 45,
          fill: { color: C.rosa }, line: { color: C.preto, width: 2 },
        });
        s.addText(K.p3.subtitulo.toUpperCase(), {
          ...T(S.sub), x: MG + 0.44, y: y - 0.04, w: CW - 0.44, h: H('p3.sub') + 0.1, color: C.preto,
        });
      },
    });
    blocks.push({ h: H('p3.intro'), gap: 0.28, draw: (y) => paragrafo(s, K.p3.intro, 'p3.intro', y) });

    const padX = 0.26, padT = 0.24, padB = 0.26, gapT = 0.10;
    const cardH = Math.max(...K.p3.cards.map((c, i) =>
      padT + H('p3.ct' + i) + gapT + H('p3.cb' + i) + padB));
    blocks.push({
      h: cardH, gap: 0.32, draw: (y) => {
        K.p3.cards.forEach((c, i) => {
          const x = MG + i * (cardW + 0.26);
          caixa(s, { x, y, w: cardW, h: cardH, fill: C[c.cor], traco: 2.25 });
          s.addText(c.titulo.toUpperCase(), {
            ...T(S.cardTitle), x: x + padX, y: y + padT, w: cardInnerW, h: H('p3.ct' + i) + 0.06,
            color: C.preto,
          });
          s.addText(c.texto, {
            ...T(S.cardBody), x: x + padX, y: y + padT + H('p3.ct' + i) + gapT,
            w: cardInnerW, h: H('p3.cb' + i) + 0.08, color: C.ink,
          });
        });
      },
    });
    blocks.push({ h: H('p3.fecho'), gap: 0.40, draw: (y) => paragrafo(s, K.p3.fecho, 'p3.fecho', y) });
    blocks.push({
      h: 1.82 + FOTO_LEG, gap: 0, draw: (y) =>
        foto(s, { x: MG, w: CW, h: 1.82, path: B('foto-obstaculos.jpg'), legenda: 'Obstáculos e área de prática' }, y),
    });

    const r = flow(blocks, bh + 0.54, Y_MAX);
    console.log('pág 3 → fim', r.fim.toFixed(2), 'sobra', r.sobra.toFixed(2));
    pageFooter(s, 3);
  }

  /* ---------- 4. POSSIBILIDADES + ASSINATURA ---------- */
  {
    const s = pres.addSlide();
    s.background = { color: C.branco };
    const bh = band(s, K.p4.band, 'p4.band', B('tex-band-4.png'));

    const padY = 0.13, gapCol = 0.22, gapRow = 0.11, rows = 4;
    // altura única para todas as caixas: a grade lê como grade, sem uma
    // fileira mais alta que as outras por causa de um item mais longo
    const itemH = Math.max(...K.p4.itens.map((_, i) => H('p4.i' + i))) + padY * 2;
    const listH = itemH * rows + gapRow * (rows - 1);

    const blocks = [];
    blocks.push({
      h: listH, gap: 0.32, draw: (y0) => {
        let ry = y0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < 2; c++) {
            const i = r * 2 + c, x = MG + c * (itemW + gapCol), h = itemH;
            caixa(s, { x, y: ry, w: itemW, h, fill: C.branco, traco: 2 });
            // o ciclo anda na linha E na coluna, senão cada coluna fica
            // com um par fixo de cores
            const accent = [C.ciano, C.rosa, C.amarelo, C.roxo][(r + c) % 4];
            check(s, x + 0.30, ry + h / 2, accent);
            s.addText(K.p4.itens[i], {
              ...T(S.check, { valign: 'middle' }), x: x + 0.56, y: ry, w: itemInnerW, h, color: C.ink,
            });
          }
          ry += itemH + gapRow;
        }
      },
    });
    blocks.push({ h: shoutH('p4.shout'), gap: 0.34, draw: (y) => shout(s, K.p4.shout, 'p4.shout', y) });
    K.p4.paragrafos.forEach((p, i) => blocks.push({
      h: H('p4.p' + i), gap: i === K.p4.paragrafos.length - 1 ? 0.28 : 0.18,
      draw: (y) => paragrafo(s, p, 'p4.p' + i, y),
    }));
    blocks.push({
      h: 1.20, gap: 0, draw: (y) => {
        s.addShape('rect', { x: MG, y, w: CW, h: 0.035, fill: { color: C.preto } });
        s.addText(K.p4.assinatura.nome.toUpperCase(), {
          ...T({ font: FD, size: 25, lineSpacing: 27 }),
          x: MG, y: y + 0.30, w: CW, h: 0.40, color: C.preto,
        });
        s.addText(K.p4.assinatura.linhas.join('\n'), {
          ...T({ font: FH, size: 10.5, lineSpacing: 16, bold: true, charSpacing: 1.4 }),
          x: MG, y: y + 0.74, w: CW, h: 0.46, color: C.preto,
        });
      },
    });

    const r = flow(blocks, bh + 0.54, Y_MAX);
    console.log('pág 4 → fim', r.fim.toFixed(2), 'sobra', r.sobra.toFixed(2));
    pageFooter(s, 4);
  }

  /* ---------- 5. FECHO / CONTATO ---------- */
  {
    const s = pres.addSlide();
    s.background = { path: B('bg-preto.png') };

    const logoW = 1.95, logoH = logoW / LOGO_AR;
    const btnW = 5.1, btnH = 0.92, btnGap = 0.26, btnX = (PW - btnW) / 2;
    const CONTATO_Y = PH - 1.80;   // topo do bloco de endereço/site
    // a pilha (logo → botões) é centrada entre o topo da folha e o bloco de
    // contato, com o mesmo respiro em cima e embaixo
    const pilha = logoH + 0.80 + 0.86 + 0.42 + H('p5.texto') + 0.74
                + btnH * 2 + btnGap;
    let y = 1.05 + (CONTATO_Y - 0.50 - 1.05 - pilha) / 2;
    s.addImage({ path: LOGO, x: (PW - logoW) / 2, y, w: logoW, h: logoH });
    y += logoH + 0.80;

    s.addText(K.p5.titulo.toUpperCase(), {
      ...T({ font: FD, size: 50, lineSpacing: 54 }),
      x: MG, y, w: CW, h: 0.86, color: C.branco, align: 'center',
    });
    y += 0.86 + 0.42;

    s.addText(K.p5.texto, {
      ...T(S.finalTxt), x: (PW - 5.7) / 2, y, w: 5.7, h: H('p5.texto') + 0.1,
      color: C.branco, align: 'center',
    });
    y += H('p5.texto') + 0.74;

    K.p5.botoes.forEach((b) => {
      // rótulo + valor centrados como um grupo dentro do botão
      const rotH = 0.20, valH = 0.30, entre = 0.05;
      const topo = y + (btnH - (rotH + entre + valH)) / 2;
      s.addShape('roundRect', { x: btnX, y, w: btnW, h: btnH, fill: { color: C[b.cor] }, rectRadius: 0.16 });
      s.addText(b.rotulo.toUpperCase(), {
        ...T({ font: FH, size: 9.5, lineSpacing: 13, bold: true, charSpacing: 3 }),
        x: btnX, y: topo, w: btnW, h: rotH, color: C.preto, align: 'center',
      });
      s.addText(b.valor, {
        ...T({ font: FH, size: 16, lineSpacing: 20, bold: true }),
        x: btnX, y: topo + rotH + entre, w: btnW, h: valH, color: C.preto, align: 'center',
        underline: { style: 'none' }, hyperlink: { url: b.link },
      });
      y += btnH + btnGap;
    });
    console.log('pág 5 → fim botões', y.toFixed(2), '| bloco de contato em', CONTATO_Y.toFixed(2));

    // a régua acompanha a largura da linha de endereço que ela separa
    const reguaW = 4.7;
    s.addShape('rect', {
      x: (PW - reguaW) / 2, y: CONTATO_Y, w: reguaW, h: 0.02,
      fill: { color: C.branco, transparency: 55 },
    });
    s.addText(K.p5.endereco, {
      ...T({ font: FH, size: 9.5, lineSpacing: 14, charSpacing: 1.2 }),
      x: MG, y: CONTATO_Y + 0.30, w: CW, h: 0.24, color: C.branco, align: 'center',
    });
    s.addText(K.p5.site, {
      ...T({ font: FH, size: 12, lineSpacing: 17, bold: true, charSpacing: 2.4 }),
      x: MG, y: CONTATO_Y + 0.66, w: CW, h: 0.28, color: C.ciano, align: 'center',
      hyperlink: { url: 'https://loopskatepark.com.br' },
    });
  }

  return pres;
}

(async () => {
  sizes = await measureAll(reqs);
  await texturasDeFaixa([
    { file: 'tex-band-2.png', w: PW, h: bandH('p2.band'), invert: false },
    { file: 'tex-band-3.png', w: PW, h: bandH('p3.band'), invert: false },
    { file: 'tex-band-4.png', w: PW, h: bandH('p4.band'), invert: true },
  ]);
  const pres = buildDeck();
  const destino = path.resolve(__dirname, '../../carta-de-apresentacao',
    'carta-de-apresentacao-loop-skate-park.pptx');
  await pres.writeFile({ fileName: destino });
  console.log('OK →', destino);
})();
