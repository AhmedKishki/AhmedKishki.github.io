# ahmedkishki.github.io

Source of my portfolio at <https://ahmedkishki.github.io>, built with [Astro](https://astro.build). Every push to `main` deploys it to GitHub Pages through `.github/workflows/deploy.yml`.

## Adding a project

One markdown file per project in `src/content/projects/`. The file name is the address: `livesubs.md` becomes `/projects/livesubs/`.

```yaml
---
title: livesubs
summary: One short line for the home page.
area: personal          # professional | research | personal
repos:                  # optional
  - { name: livesubs, url: "https://github.com/AhmedKishki/livesubs", note: "MIT" }
languages: [Python]     # optional
started: "2026-10"
updated: "2026-10"
status: Version 1.1.0   # optional
order: 10               # lower comes first in its group
draft: false            # true hides the page from the published site
---
```

Maths is written as `$inline$` or `$$display$$` and rendered with KaTeX at build time; a literal dollar sign is `\$`.

The build stops on a missing or misspelt field and names the file. Groups and their order are in `src/data/areas.ts`; an empty group is hidden.

## Pictures

Put them in `src/assets/projects/<file-name>/` and link them relatively. An italic line under a picture is its caption:

```markdown
![Driver board on the bench](../../assets/projects/livesubs/bench.jpg)
*Driver board on the bench.*
```

The build converts pictures to WebP, so phone photos can go in unchanged.

## CV, photo and contact

`public/cv/` holds copies of the tabular CVs from the applications repository, and `src/assets/portrait.jpg` its CV portrait. After a CV re-render:

```sh
cp ../auto-job/cv/ahmed-alkishki.tabular.en.pdf public/cv/Ahmed-Alkishki-CV.pdf
cp ../auto-job/cv/ahmed-alkishki.tabular.de.pdf public/cv/Ahmed-Alkishki-CV-German.pdf
```

Contact details are in `src/data/areas.ts`.

## Local preview

```sh
npm install
npm run dev       # http://localhost:4321, drafts included
npm run build     # dist/, drafts left out
```

## First deployment

In the repository settings under Pages, set the source to "GitHub Actions".
