# Gurveer's personal website

Static HTML, CSS, and JavaScript portfolio with a seven-jump goose runner entrance.

## Local preview

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173.

## GitHub Pages

Published repository: https://github.com/gurverm/gurverm.github.io

GitHub Pages serves the contents of this project's `dist` directory uploaded to the root of the repository's `main` branch. In Settings → Pages, the source is **Deploy from a branch**, with branch **main** and folder **/ (root)**.

To publish changes, update the website files in `dist`, then upload the changed files to that repository's root. `.nojekyll` keeps the site as plain static files.

The local `.github/workflows/deploy-pages.yml` is an alternative Actions deployment configuration; it is not used by the published branch-based site.
