# Veyra AI — Autonomous Enterprise Personnel Platform

Production-oriented platform for autonomous AI employees handling conversations, appointments, and lead follow-ups.

## Architecture

- **Frontend**: React 19 + Vite + Tailwind (RTL Arabic / LTR English)
- **Backend**: Express API (same process as Vite in dev; serves `dist/` in production)
- **Persistence**: Versioned JSON document store with atomic writes (`data/store/veyra.json`)
  - Multi-tenant isolation by `organizationId` on every record
  - Encrypted provider API keys (AES-256-GCM)
  - Audit log for sensitive actions
  - Automatic seed of admin + default agents on first run
- **Auth**: HMAC-signed session tokens + server-side session list (revocable)
- **AI providers**: Gemini, Groq, Cerebras, OpenRouter — keys stored encrypted; connection tested before "connected" status
- **PWA**: `manifest.webmanifest` + service worker (static assets only)

> **Deployment note**: GitHub Pages alone cannot run the Express API. Deploy the full Node process (e.g. Railway, Render, Fly.io, VPS) or split static frontend + API host. See [Deployment](#deployment).

## Requirements

- Node.js >= 20
- npm 10+

## Quick start

```bash
cp .env.example .env
# Edit .env — set JWT_SECRET and ENCRYPTION_KEY (required in production)
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:3000`.

On first start the server seeds:

- Organization: Veyra Demo Organization  
- Admin email: value of `ADMIN_EMAIL` (default `admin@veyra.local`)  
- Password: `ADMIN_PASSWORD` if set (≥12 chars), otherwise a one-time password printed in the server log  

Change the password on first login when `mustChangePassword` is true.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development (Vite middleware + API) |
| `npm run build` | Production frontend build → `dist/` |
| `npm start` | Production server (`NODE_ENV=production`) |
| `npm run lint` / `typecheck` | TypeScript check |
| `npm test` | Unit/integration tests |

## API overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Liveness |
| GET | `/api/ready` | — | Readiness + config checks |
| POST | `/api/auth/login` | — | Login → JWT |
| POST | `/api/auth/logout` | Bearer | Revoke session |
| GET | `/api/auth/me` | Bearer | Current user + org |
| GET/POST/PATCH/DELETE | `/api/data/employees` | Bearer | Org-scoped employees |
| GET | `/api/data/conversations` | Bearer | Org-scoped |
| GET | `/api/data/appointments` | Bearer | Org-scoped |
| GET | `/api/data/leads` | Bearer | Org-scoped |
| GET | `/api/data/audit` | admin+ | Audit log (read-only) |
| GET | `/api/providers` | Bearer | Provider status (keys masked) |
| PUT | `/api/providers/:id/key` | admin+ | Save encrypted key |
| POST | `/api/providers/:id/test` | member+ | Live connection probe |
| POST | `/api/feedback` | — | Developer feedback (rate-limited) |

## Security notes

- API keys never returned to the client after save (masked only).
- Gemini auth uses `x-goog-api-key` header (not query string).
- Production refuses to start without `JWT_SECRET` / `SESSION_SECRET`.
- Structured logs redact secrets.
- Audit log is append-only from the API (no delete endpoint for normal users).
- Feedback endpoint rejects content that looks like passwords/API keys.

## Backup & restore

```bash
# Backup is under data/store/backups/ after calling backup programmatically,
# or simply copy:
cp data/store/veyra.json data/store/backups/manual-$(date +%Y%m%d).json

# Restore:
cp data/store/backups/<file>.json data/store/veyra.json
# then restart the server
```

## Deployment

1. Set `NODE_ENV=production`, `JWT_SECRET`, `ENCRYPTION_KEY`, `APP_PUBLIC_URL`.
2. `npm install --legacy-peer-deps && npm run build && npm start`
3. Put TLS termination in front (nginx, Caddy, or platform HTTPS).
4. Persist `data/store` on a volume.
5. Do **not** rely on GitHub Pages for the API.

## Developer contact

Feedback form in the app targets **nidalwatfa99@gmail.com**.  

Configure SMTP env vars for server-side email; otherwise a `mailto:` fallback is returned.

## License

Proprietary — all rights reserved unless otherwise stated by the project owner.
