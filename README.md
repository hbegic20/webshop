# Staple — Webshop

Full-stack webshop: React + TypeScript frontend, Node.js + Express + TypeScript backend.
The backend and frontend are separate projects that only talk over HTTP.

- Build plan: [`WEBSHOP_BUILD_PLAN.md`](./WEBSHOP_BUILD_PLAN.md)
- Design reference: [`CLAUDE.md`](./CLAUDE.md) / [`DESIGN.md`](./DESIGN.md)

## Requirements

- Node.js 20.19+ or 22.12+ (required by Vite)
- npm

## Getting started

Install dependencies in each project (once):

```bash
cd backend && npm install
cd ../frontend && npm install
```

Run both in separate terminals:

```bash
# Terminal 1 — backend (auto-reloads on change)
cd backend
npm run dev        # http://localhost:3000
```

```bash
# Terminal 2 — frontend
cd frontend
npm run dev        # http://localhost:5173
```

Check the backend is up:

```bash
curl http://localhost:3000/health
```

The backend port can be changed with the `PORT` environment variable (`PORT=4000 npm run dev`).

## Scripts

| Command | backend | frontend |
| --- | --- | --- |
| `npm run dev` | Start server with `tsx watch` | Start Vite dev server |
| `npm run build` | Compile TypeScript to `dist/` | Type-check + production build |
| `npm start` | Run compiled `dist/server.js` | — |
| `npm run preview` | — | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` | — |
| `npm run lint` | ESLint | ESLint |
| `npm run format` | Prettier (write) | Prettier (write) |
| `npm run format:check` | Prettier (check) | Prettier (check) |

## Project structure

```
webshop/
├── backend/        Express + TypeScript API
│   └── src/server.ts
└── frontend/       React + TypeScript (Vite)
    └── src/
```
