/* Abre o Chromium do Playwright, caindo para o binário já instalado no
   ambiente quando a versão do pacote não trouxe o browser correspondente. */
const { chromium } = require('playwright');
const fs = require('fs');

const CANDIDATOS = [
  process.env.CHROMIUM_PATH,
  '/opt/pw-browsers/chromium',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
].filter(Boolean);

async function abrirNavegador() {
  try {
    return await chromium.launch();
  } catch (erro) {
    for (const bin of CANDIDATOS) {
      if (fs.existsSync(bin)) return chromium.launch({ executablePath: bin });
    }
    throw erro;
  }
}

module.exports = { abrirNavegador };
