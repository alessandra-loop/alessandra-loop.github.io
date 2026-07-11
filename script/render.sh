#!/usr/bin/env bash
#
# render.sh — instala o Jekyll e renderiza o site localmente.
#
# O GitHub Pages já builda o site automaticamente a cada push na `main`; este
# script é só para PRÉ-VISUALIZAR/validar localmente antes de publicar. Ele não
# faz parte do que é servido (o repositório continua sem build tooling comitado:
# nada de Gemfile/package.json).
#
# Uso:
#   script/render.sh            # instala deps (se preciso) e builda em _site/
#   script/render.sh serve      # idem e sobe um servidor em http://localhost:4000
#   script/render.sh serve 4599 # serve numa porta específica
#
# Requer Ruby + RubyGems (já presentes no ambiente dos agentes).
set -euo pipefail

# Gems necessárias: o Jekyll e os plugins declarados em _config.yml.
# Hoje o único plugin é jekyll-sitemap — mantenha esta lista em sincronia com
# a chave `plugins:` do _config.yml.
GEMS=(jekyll jekyll-sitemap)

echo "==> Instalando dependências: ${GEMS[*]}"
gem install --no-document "${GEMS[@]}"

# O executável do jekyll fica no bindir do RubyGems, que nem sempre está no PATH.
export PATH="$(ruby -e 'print Gem.bindir'):$PATH"

# Roda sempre a partir da raiz do repositório (script/ fica um nível abaixo).
cd "$(dirname "$0")/.."

case "${1:-build}" in
  serve)
    port="${2:-4000}"
    echo "==> Servindo em http://localhost:${port}  (Ctrl+C para parar)"
    exec jekyll serve --host 0.0.0.0 --port "${port}"
    ;;
  build|*)
    echo "==> Buildando em _site/ ..."
    jekyll build
    echo "==> Pronto. Saída em _site/ (ex.: _site/mural/index.html)."
    ;;
esac
