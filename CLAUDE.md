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
manual-dos-alunos-e-responsaveis/
  index.html                            # Student & guardian handbook (long page)
_includes/                              # Reusable Liquid partials
  band.html    card.html    note.html   # Content components
  shout.html   footer.html              # Content components
  logo.svg     loop-logo.svg            # Inline logo SVGs
_config.yml                             # Jekyll config (just sets the site title)
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
- **CSS is inlined** in a `<style>` block inside each page's `<head>`. There is
  no shared stylesheet. If you change a design token, update it everywhere it
  appears (currently both `index.html` and the manual).

### `_includes` components (Liquid partials)

Passed parameters via `include.<name>`:

- `band.html` — full-width colored section header. Params: `color`
  (`ciano` / `roxo` / `rosa` / `preto`), `id` (anchor target), `eyebrow`, `title`.
- `card.html` — bordered info card in a grid. Params: `variant`
  (`c1`–`c4` / `roxo`), `title`, `text`.
- `note.html` — callout box. Params: `title`, `text`, optional `bg`.
- `shout.html` — bold black highlight banner. Param: `text`.
- `footer.html` — shared site footer (redes sociais + navegação + endereço).
  Param: `subtitle` (e.g. `subtitle="Escola de skate e patins"`).
- `footer-style.html` — `<style>` block with the footer's shared CSS. Include it
  in each page's `<head>` so the footer rules aren't duplicated. (This is the one
  exception to the "no shared stylesheet" rule — only the footer is centralized;
  a page may still add a small `footer{…}` override for its own box model, as
  `index.html` does for the full-width bar.)
- `logo.svg` / `loop-logo.svg` — inline SVG logos included directly.

## Brand & design conventions

This project has a **strict visual identity**. A dedicated skill,
`loop-skatepark-brand` (`.claude/skills/`), documents the full rules — consult
it before producing or restyling any visual/branded output.

**Official palette** — always expose these as CSS variables and reference them
by name; never scatter raw hex values:

```css
--loop-preto:   #000000;   /* text on light, outlines            */
--loop-branco:  #ffffff;   /* text on dark, breathing room       */
--loop-ciano:   #18d7df;   /* highlights, links                  */
--loop-roxo:    #935bbc;   /* primary institutional background   */
--loop-rosa:    #ffb3d1;   /* buttons / CTAs, logo elements      */
--loop-amarelo: #f6c707;   /* attention accents                  */
--loop-bege:    #e8d4bf;   /* soft surfaces                      */
```

**Typography** (self-hosted `.woff2` in `assets/fonts/`, latin subset):

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
