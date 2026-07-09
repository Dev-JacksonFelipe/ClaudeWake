# CLAUDE.md — setup guide for Claude Code

You are helping a user **self-host their own instance** of ClaudeWake. This file
tells you how to guide them from zero to a working deployment. Be concise, do the
work you can, and only ask the user for things that genuinely require their own
account/login.

## What this project is

A single-user Next.js 15 app that opens the user's Claude usage window on a schedule.
- **Storage:** Upstash Redis (encrypted token, config, schedules, run history).
- **Scheduling:** Upstash QStash (cron → `POST /api/trigger`).
- **Auth:** username + password (`APP_USERNAME` / `APP_PASSWORD`) with an HMAC-signed
  session cookie. Single-user only — never make it multi-tenant.
- **Hosting:** Vercel.

## Golden rules

- **Never commit secrets.** `.env.local` is gitignored; keep it that way. Only
  `.env.example` (placeholders) belongs in git.
- The Claude token is encrypted with `TOKEN_ENCRYPTION_KEY` (AES-256-GCM). If that key
  changes after a token is saved, the saved token becomes unreadable — warn the user.
- Keep the app single-user. Each person deploys their own instance with their own token.

## Steps to guide the user through

1. **Prerequisites (user action):** confirm they have a GitHub account, a Vercel
   account, and an Upstash account (all free). If not, point them to sign up.

2. **Upstash Redis (user action, you interpret the values):** ask them to create a
   Redis database and copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   from the REST API section.

3. **Upstash QStash (user action):** ask them to copy `QSTASH_TOKEN`,
   `QSTASH_CURRENT_SIGNING_KEY`, and `QSTASH_NEXT_SIGNING_KEY`.

4. **Generate secrets (you can do this):** run, and give the user the two DIFFERENT
   values:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # SESSION_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # TOKEN_ENCRYPTION_KEY
   ```

5. **Choose login credentials (user action):** ask for `APP_USERNAME` and a strong
   `APP_PASSWORD`.

6. **Deploy to Vercel:** guide them to import the repo on Vercel and set every
   variable from the table in `README.md`. `APP_URL` is auto-detected in production;
   don't set it unless a schedule needs an explicit URL.

7. **Claude token (user action):** the user runs `claude setup-token` in their own
   terminal (needs the Claude CLI and their login) and pastes the token into the
   app's **Settings** page. It is encrypted before being stored.

8. **Schedule:** in the dashboard, add the times to open the usage window. Suggest the
   "Test now" button to confirm the token and trigger work end to end.

## Commands

- Dev server: `npm run dev`
- Build: `npm run build`
- Typecheck: `npx tsc --noEmit`
- Lint: `npm run lint`

## Where things live

- `app/api/*` — API routes (`auth`, `config`, `schedules`, `trigger`, `history`).
- `lib/*` — auth, crypto, redis, qstash, config, schedules, history, rate limiting.
- `components/*` — dashboard UI, schedule list, history table, login scene.
- `middleware.ts` — protects everything except `/login`, `/api/auth`, `/api/trigger`.
