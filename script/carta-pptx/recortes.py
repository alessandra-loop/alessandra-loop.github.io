#!/usr/bin/env python3
"""Recorta o logo e as fotos da pista nas proporções usadas pela carta.

Entra: .build/logo-bruto.png (gerado por assets.js) e as fotos de assets/.
Sai:   .build/logo.png, .build/foto-*.jpg
"""
import os
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..'))
OUT = os.path.join(AQUI, '.build')


def apara_logo():
    """Tira a sobra transparente ao redor do logo."""
    im = Image.open(os.path.join(OUT, 'logo-bruto.png'))
    im = im.crop(im.getbbox())
    im.save(os.path.join(OUT, 'logo.png'))
    print('logo.png', im.size)


def recorta(origem, destino, proporcao, larg_max, foco=0.5):
    """Recorta a foto na proporção pedida, mantendo `foco` (0=topo, 1=base)."""
    im = Image.open(os.path.join(RAIZ, 'assets', origem)).convert('RGB')
    w, h = im.size
    alvo_h = round(w / proporcao)
    if alvo_h <= h:
        topo = int((h - alvo_h) * foco)
        im = im.crop((0, topo, w, topo + alvo_h))
    else:
        alvo_w = round(h * proporcao)
        esq = int((w - alvo_w) / 2)
        im = im.crop((esq, 0, esq + alvo_w, h))
    if im.size[0] > larg_max:
        im = im.resize((larg_max, round(larg_max / proporcao)), Image.LANCZOS)
    im.save(os.path.join(OUT, destino), quality=88, optimize=True)
    print(destino, im.size)


if __name__ == '__main__':
    apara_logo()
    # proporções espelham as caixas do layout em build.js
    recorta('LOOP-PISTA-FOTO-1.jpeg', 'foto-pista.jpg', 3.255 / 2.00, 1300, foco=0.42)
    recorta('LOOP-RECEPCAO.jpeg', 'foto-recepcao.jpg', 3.255 / 2.00, 1300, foco=0.45)
    recorta('LOOP-PISTA-FOTO-2.jpeg', 'foto-obstaculos.jpg', 6.71 / 1.95, 2000, foco=0.40)
