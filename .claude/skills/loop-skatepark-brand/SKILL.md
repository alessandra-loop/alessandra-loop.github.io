---
name: loop-skatepark-brand
description: >-
  Aplica a identidade visual oficial da Loop Skatepark (cores, tipografia e
  regras de uso da marca) a qualquer artefato que se beneficie do visual da
  marca — apresentações, documentos, posts, cartazes, páginas web, mockups e
  peças gráficas. Use sempre que o usuário mencionar a Loop Skatepark, o
  manual/guia da marca Loop, cores institucionais da Loop, ou pedir para deixar
  algo "com a cara da Loop", "no estilo da Loop", "com a identidade da Loop",
  ou para aplicar formatação visual, cores de marca ou padrões de design da
  Loop Skatepark — mesmo que não diga explicitamente "marca" ou "branding".
---

# Marca Loop Skatepark

Guia de identidade visual da **Loop Skatepark**. Use estas regras ao produzir
qualquer peça — web, impressa, slides, redes sociais — que deva parecer "da Loop".

## Regras que valem sempre

- **Contraste em primeiro lugar** — texto e logo precisam ser legíveis sobre o
  fundo escolhido.
- **Cores só da paleta oficial** — use os valores HEX/RGB abaixo para fidelidade;
  não introduza cores fora da paleta.
- **Títulos em condensada caixa-alta; corpo legível** — hierarquia clara entre
  display, subtítulo e texto de leitura.
- **Respeite proteção, redução e integridade do logo** — não distorça, não
  recolore fora da paleta, não gire e não aplique efeitos que descaracterizem a
  wordmark; mantenha área de proteção ao redor e um tamanho mínimo em que a
  palavra "loop" e "skatepark" continuem legíveis.

## Paleta oficial

Sempre exponha a paleta como variáveis CSS (ou tokens equivalentes) e referencie
por nome, nunca com HEX solto espalhado pelo código.

| Token           | HEX       | Uso típico                          |
| --------------- | --------- | ----------------------------------- |
| `--loop-preto`  | `#000000` | Texto sobre claro, contornos        |
| `--loop-branco` | `#ffffff` | Texto sobre escuro, respiros        |
| `--loop-ciano`  | `#18d7df` | Destaques, links, detalhes vibrantes |
| `--loop-roxo`   | `#935bbc` | Fundo institucional principal       |
| `--loop-rosa`   | `#ffb3d1` | Botões / CTAs, elementos da logo    |
| `--loop-amarelo`| `#f6c707` | Destaque de atenção, acentos        |
| `--loop-bege`   | `#e8d4bf` | Fundos suaves, superfícies neutras  |

```css
:root {
  --loop-preto:   #000000;
  --loop-branco:  #ffffff;
  --loop-ciano:   #18d7df;
  --loop-roxo:    #935bbc;
  --loop-rosa:    #ffb3d1;
  --loop-amarelo: #f6c707;
  --loop-bege:    #e8d4bf;
}
```

## Tipografia

Stack de fontes **condensadas** nos títulos; corpo em fonte legível de leitura.

| Papel      | Fonte     | Fallback stack                                        |
| ---------- | --------- | ----------------------------------------------------- |
| Display    | **Anton** | `'Oswald','Bebas Neue','Arial Narrow',Impact,sans-serif` |
| Subtítulo / rótulos | **Oswald** | `'Bebas Neue','Arial Narrow',Impact,sans-serif` |
| Corpo      | **Barlow**| `'Segoe UI',Arial,sans-serif`                         |

```css
:root {
  --font-display: 'Anton', 'Oswald', 'Bebas Neue', 'Arial Narrow', Impact, sans-serif;
  --font-head:    'Oswald', 'Bebas Neue', 'Arial Narrow', Impact, sans-serif;
  --font-body:    'Barlow', 'Segoe UI', Arial, sans-serif;
}
```

- Anton só possui o peso 400 — **não** aplique `font-weight` bold nele (evita
  bold sintético); a fonte já é pesada.
- Títulos: `--font-display`, `text-transform: uppercase`.
- Rótulos/botões: `--font-head` (Oswald), caixa-alta, com `letter-spacing`.
- Texto corrido: `--font-body` (Barlow), pesos 400 e 700.

## Web / HTML

- Use a stack de fontes condensadas nos títulos e a paleta em variáveis CSS
  (blocos acima).
- **Self-host das fontes**: prefira servir as fontes do próprio domínio em vez
  da folha de estilo render-blocking do Google Fonts, para manter o caminho
  crítico curto e do mesmo origin. Este repositório já traz o subset `latin`
  (cobre acentuação PT-BR) em `assets/fonts/`:
  - `anton-latin.woff2` — Anton 400
  - `oswald-latin.woff2` — Oswald variável 400–700
  - `barlow-latin-400.woff2` / `barlow-latin-700.woff2` — Barlow 400 / 700

  Declare com `@font-face` + `font-display: swap` e faça `preload` das fontes de
  exibição acima da dobra (Anton, Oswald). Veja `index.html` como referência.
- Fundos podem usar o padrão da wordmark **"loop"** repetida em tom sobre tom
  (mesma cor, leve variação de luminosidade) para textura de marca.
- Contraste em primeiro lugar: garanta que texto sobre `--loop-roxo` fique em
  `--loop-branco` (ou `--loop-ciano` para destaque), e texto sobre `--loop-rosa`
  fique em `--loop-preto`.

## Logo

- Preserve a integridade da wordmark: não estique, comprima, gire nem recolore
  fora da paleta.
- Mantenha uma **área de proteção** livre ao redor do logo.
- Respeite um **tamanho mínimo** de redução em que "loop" e "skatepark"
  permaneçam nítidos e legíveis.
- Aplique o logo sobre fundos com contraste suficiente; use a versão que melhor
  se destaca do fundo.
