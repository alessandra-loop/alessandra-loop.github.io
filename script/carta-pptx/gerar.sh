#!/usr/bin/env bash
#
# gerar.sh — monta a carta de apresentação em PPTX (A4 retrato) e o PDF.
#
# Assim como script/render.sh, isto é só ferramenta de geração: o repositório
# segue sem build tooling comitado (nada de package.json). As dependências são
# instaladas globalmente e os intermediários ficam em .build/, fora do git.
#
# Uso:
#   script/carta-pptx/gerar.sh          # gera o .pptx e o .pdf
#   script/carta-pptx/gerar.sh pptx     # só o .pptx
#
# Saída: carta-de-apresentacao/carta-de-apresentacao-loop-skate-park.{pptx,pdf}
set -euo pipefail

cd "$(dirname "$0")"
RAIZ="$(cd ../.. && pwd)"
SAIDA="$RAIZ/carta-de-apresentacao"
NOME="carta-de-apresentacao-loop-skate-park"

echo "==> Instalando dependências"
export NODE_PATH="$(npm root -g)"
node -e "require('pptxgenjs')" 2>/dev/null || npm install -g --silent pptxgenjs
# Só instala o Playwright se não houver um no ambiente: atualizar a versão
# existente quebra o par pacote/Chromium já baixado (veja navegador.js).
node -e "require('playwright')" 2>/dev/null || {
  npm install -g --silent playwright
  npx --yes playwright install chromium >/dev/null 2>&1 || true
}
export NODE_PATH="$(npm root -g)"
python3 -m pip install --quiet "fonttools[woff]" Pillow

# As fontes da marca são .woff2 (web); o LibreOffice precisa delas como .ttf
# instaladas no sistema para renderizar o PDF com Anton/Oswald/Barlow.
echo "==> Instalando as fontes da marca para o LibreOffice"
mkdir -p "$HOME/.fonts"
python3 - "$RAIZ" <<'PY'
import sys, os
from fontTools.ttLib import TTFont
raiz = sys.argv[1]
fontes = {
    'anton-latin.woff2': 'Anton-Regular.ttf',
    'oswald-latin.woff2': 'Oswald-Variable.ttf',
    'barlow-latin-400.woff2': 'Barlow-Regular.ttf',
    'barlow-latin-700.woff2': 'Barlow-Bold.ttf',
}
for origem, destino in fontes.items():
    f = TTFont(os.path.join(raiz, 'assets/fonts', origem))
    f.flavor = None
    f.save(os.path.join(os.path.expanduser('~/.fonts'), destino))
PY
fc-cache -f >/dev/null 2>&1 || true

echo "==> Gerando fundos, texturas e recortes"
node assets.js
python3 recortes.py

echo "==> Montando o PPTX"
mkdir -p "$SAIDA"
node build.js

if [ "${1:-tudo}" = "pptx" ]; then
  exit 0
fi

echo "==> Convertendo para PDF"
soffice --headless --norestore -env:UserInstallation=file:///tmp/lo-carta \
  --convert-to pdf --outdir "$SAIDA" "$SAIDA/$NOME.pptx" >/dev/null
echo "OK → $SAIDA/$NOME.pdf"
