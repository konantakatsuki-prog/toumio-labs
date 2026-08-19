# Tomio Labs

Dependency-free static public website for Tomio Labs, built for Cloudflare Pages.

## Local development

```bash
npm run dev
```

Open `http://localhost:4173`.

## Checks and build

```bash
npm run lint
npm run typecheck
npm run build
npm run preview
```

Cloudflare Pages can use `npm run build` as the build command and `dist` as the output directory. `wrangler.toml` already points Pages at `dist`.
