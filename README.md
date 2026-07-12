# curriculum-v

Interactive CV — single-page web application with PDF, PNG and JPEG export.

Built with React, Tailwind CSS v4, FastAPI. Deployed to Kubernetes via ArgoCD + Helm.

## Quick start

```bash
npm ci
npm run dev        # dev server at localhost:5173
npm run build      # production build to dist/
npm run preview    # preview production build
```

## Docker

```bash
docker build -t curriculum-v .
docker run -p 8080:8080 curriculum-v
```

## Export

Use the toolbar buttons on the live page to download the CV as PDF, PNG or JPEG.
