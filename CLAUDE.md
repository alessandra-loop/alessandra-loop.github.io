# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

The website for **Loop Skate Park** — a skate and roller-skating school in
Belo Horizonte / MG, Brazil (Caiçara neighborhood). It is a small, static
**Jekyll site served by GitHub Pages** at the custom domain
`loopskatepark.com.br` (see `CNAME`).

All user-facing content is in **Brazilian Portuguese (`pt-BR`)**. Keep copy,
comments, and UI text in Portuguese to match the existing style.

There is **no committed build tooling** (no `Gemfile`, no `package.json`).
GitHub Pages builds the Jekyll site automatically on push to `main`, so what you
commit is what ships. For local preview there is a helper — `script/render.sh` —
that installs Jekyll on the fly and renders into `_site/` (see "Working in this
repo"); it is a dev convenience only and installs nothing into the repo.

## Repository layout

```
index.html                              # Landing / "linktree" page (site root)
sobre/index.html                        # "Sobre a Loop" page (uses base-style.html)
manual-dos-alunos-e-responsaveis/
  index.html                            # Student & guardian handbook (long page)
mural/                                  # "Mural da Loop" — blog hub + section pages
_layouts/                               # Jekyll layouts for the mural (post / section)
_picos/                                 # Mural collection: "picos" (skate spots) posts
_includes/                              # Reusable Liquid partials
  brand-tokens.html                     # Shared brand fonts (@font-face) + --loop-* palette
  base-style.html                       # Shared design system (bands/cards/toc…); includes brand-tokens
  footer.html  footer-style.html        # Shared footer markup + its CSS
  band.html  card.html  note.html  shout.html   # Content components
  mural-post-card.html                  # Mural post preview card
  logo.svg  loop-logo.svg  icon-*.svg   # Inline logo & icon SVGs
_config.yml                             # Jekyll config (title, sitemap plugin, mural collections)
assets/
  fonts/*.woff2                         # Self-hosted brand fonts (latin subset)
  skater-bg.svg                         # Watermark background texture
CNAME                                   # Custom domain: loopskatepark.com.br
favicon.png   loop-logo.png             # Favicon & Open Graph image
README.md     llms.txt                  # Link list & LLM-facing site summary
script/render.sh                        # Local Jekyll install + build/serve helper
.claude/skills/loop-skatepark-brand/    # Brand identity skill (colors, type, logo)
```

`.gitignore` excludes Jekyll build output (`_site/`, `.jekyll-cache/`,
`.jekyll-metadata`) — never commit those.

## How the pages are built

- Each HTML page starts with an **empty Jekyll front matter block** (two lines
  of `---`). This is required so Jekyll processes the Liquid tags in the file.
  Do not remove it.
- Pages pull shared markup from `_includes/` via Liquid `{% include %}` tags.
- Reference assets with the `relative_url` filter, e.g.
  `{{ '/assets/fonts/anton-latin.woff2' | relative_url }}`, so paths stay
  correct under the custom domain.
- **Shared styles come from `_includes/`, page-specific CSS stays inlined.**
  The brand tokens (the `@font-face` declarations + the `--loop-*` palette) live
  once in `brand-tokens.html`; the full design system (bands, cards, toc, notes,
  etc.) lives in `base-style.html`, which itself includes `brand-tokens.html`.
  `sobre/` and the manual pull in `base-style.html` and add only their own
  page-specific rules inline. `index.html` is a standalone linktree: it includes
  `brand-tokens.html` (so tokens are never duplicated) but keeps its own inlined
  layout CSS instead of the design system.
- **A design token is defined in exactly one place** — edit the palette or a
  font in `brand-tokens.html` and every page updates. Do not paste `--loop-*`
  values or `@font-face` blocks into a page's `<style>`; reference the tokens by
  name (e.g. `var(--loop-rosa)`).

### `_includes` components (Liquid partials)

**Shared stylesheets** (included in the `<head>`, no parameters):

- `brand-tokens.html` — single source of truth for the brand: the four
  self-hosted `@font-face` blocks (Anton / Oswald / Barlow) and the `--loop-*`
  palette. Included directly by `index.html`, and transitively (via
  `base-style.html`) by every other page.
- `base-style.html` — the shared design system used by `sobre/` and the mural/
  manual pages: base typography vars (`--ink`/`--display`/`--head`/`--body`),
  layout, `.hero`, `.toc`, `.band`, `.card`, `.note`, `.shout`, `.check`,
  `.cta-btn`, etc. Include this and add only page-specific CSS inline.

**Content components** — passed parameters via `include.<name>`:

- `band.html` — full-width colored section header. Params: `color`
  (`ciano` / `roxo` / `rosa` / `preto`), `id` (anchor target), `eyebrow`, `title`.
- `card.html` — bordered info card in a grid. Params: `variant`
  (`c1`–`c4` / `roxo`), `title`, `text`.
- `note.html` — callout box. Params: `title`, `text`, optional `bg`.
- `shout.html` — bold black highlight banner. Param: `text`.
- `footer.html` — shared site footer (redes sociais + navegação + endereço).
  Param: `subtitle` (e.g. `subtitle="Escola de skate e patins"`).
- `footer-style.html` — `<style>` block with the footer's shared CSS. Include it
  in each page's `<head>` so the footer rules aren't duplicated. (A page may
  still add a small `footer{…}` override for its own box model, as `index.html`
  does for the full-width bar.)
- `logo.svg` / `loop-logo.svg` — inline SVG logos included directly.

## Brand & design conventions

This project has a **strict visual identity**. A dedicated skill,
`loop-skatepark-brand` (`.claude/skills/`), documents the full rules — consult
it before producing or restyling any visual/branded output.

**Official palette** — defined once as CSS variables in
`_includes/brand-tokens.html`; always reference them by name, never scatter raw
hex values:

```css
--loop-preto:   #000000;   /* text on light, outlines            */
--loop-branco:  #ffffff;   /* text on dark, breathing room       */
--loop-ciano:   #18d7df;   /* highlights, links                  */
--loop-roxo:    #935bbc;   /* primary institutional background   */
--loop-rosa:    #ffb3d1;   /* buttons / CTAs, logo elements      */
--loop-amarelo: #f6c707;   /* attention accents                  */
--loop-bege:    #e8d4bf;   /* soft surfaces                      */
```

**Typography** (self-hosted `.woff2` in `assets/fonts/`, latin subset; the
`@font-face` declarations live in `_includes/brand-tokens.html`):

- **Anton** — display / headings (weight 400 only; never synthesize bold).
- **Oswald** — labels, buttons, eyebrows (condensed).
- **Barlow** — body copy.

Headings are uppercase condensed; body stays readable. Maintain **AA contrast**
— e.g. white on the purple background passes; cyan on purple does not (there are
existing code comments noting this). Do not distort, recolor, or rotate the logo
outside brand rules.

## Working in this repo

- **Verify visually**: open the HTML in a browser (Chromium/Playwright is
  available) to check rendering. There is no test suite or linter.
- **Render with Jekyll** for full fidelity (Liquid `{% include %}`, collections,
  the mural blog): run `script/render.sh` — it `gem install`s Jekyll + the
  plugins from `_config.yml` and builds into `_site/`. Use `script/render.sh serve`
  to preview at `http://localhost:4000` (or `script/render.sh serve <port>`).
  Then point Playwright/Chromium at the served `_site` output. This is the only
  reliable way to check the mural pages, since opening the raw files renders the
  CSS but not the Liquid.
- Keep changes minimal and match the surrounding code style: inline CSS, BR
  Portuguese comments, existing component patterns.
- The manual page is `noindex` (`<meta name="robots" content="noindex">`); the
  landing page is fully indexed with SEO/Open Graph meta. Preserve these.
- When adding links or contact info, keep them consistent across `index.html`,
  `README.md`, `llms.txt`, and `_includes/footer.html`.

## Git & deployment workflow

- Production branch is `main`; pushing to it triggers the GitHub Pages build and
  deploys to `loopskatepark.com.br`.
- **Commits in this project are always made directly on `main`.** Do not open
  feature branches or pull requests unless the repo owner explicitly asks. Because
  every push to `main` deploys live, verify the change locally first (see
  `script/render.sh`), then commit and push.
- Commit messages in this repo are typically in Portuguese — follow that
  convention.
