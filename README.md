# R-IIT Bharat Mentors — Standalone Edition

**Personalised JEE & NEET Coaching**

**Your Ambition. Our Guidance. A Personalised Path.**

A self-contained React website and Node.js API. The owner uses a password you choose. No proprietary sign-in service or original hosting platform is required.

## What is included

- Coaching website, JEE/NEET/Foundation tabs, pricing calculator, FAQs and enquiry privacy notice.
- Demo enquiry form with validation and adult/guardian consent.
- Private owner inbox: search, statuses, internal notes, CSV export and logout.
- SQLite storage for local use or a persistent server disk.
- Optional Supabase database adapter for hosts with temporary disks.
- Dockerfile and Render free-plan blueprint.

Not included: automatic email/WhatsApp messages, payments, video classrooms, calendar booking, or a full learning-management system. You coordinate demos and contact parents yourself. The testing course remains marked as planned.

## Run locally for zero software cost

Install Node.js 22 LTS, version 22.13 or newer, and npm. Extract this ZIP and open Terminal in the project directory.

```bash
npm ci
npm run setup
npm run build
npm start
```

The ZIP also includes a prebuilt frontend. For the quickest run, skip installation and rebuilding and run just `npm run setup`, then `npm start`. Node.js is still required.

During setup, choose a unique admin password of at least 12 characters. Terminal input is visible, so run setup privately. Setup saves a password hash and a random session secret to `.env`; it does not include a preset password.

Open:

- Website: http://localhost:3000
- Owner inbox: http://localhost:3000/admin

Sign in with the password you chose. Records stay in `data/enquiries.sqlite`. Back up that file (with the server stopped) and `.env` privately. Do not upload either to a public repository. Stop with Control+C. Restart with `npm start`.

`npm run dev` rebuilds the frontend and starts the same server. It does not provide automatic hot reload. `npm test` runs the backend integration and persistence tests.

## Zero-budget hosted option: Render Free + Supabase Free

This is a free-tier deployment path for initial low-traffic use, not a promise of unlimited capacity or availability forever. You need your own free GitHub, Supabase and Render accounts. This package does not create those accounts or deploy into them automatically.

### 1. Create the database

1. Sign in at https://supabase.com and create a **Free** project.
2. Open SQL Editor and run the included `supabase.sql` once.
3. Copy the project URL and the server-side **secret** API key (`sb_secret_...`) from the project's API settings. This key is server-only: never put it in `src/`, browser settings or a public repository.
4. The SQL enables row-level security and denies browser/anonymous access. The Node server accesses the database on behalf of the application.

### 2. Put the code in your GitHub repository

Create a repository and upload the extracted project files. Include the dotfiles `.gitignore` and `.dockerignore`. Exclude `.env`, `data/`, `node_modules/`, and `dist/`.

If using Git locally:

```bash
git init
git add .
git commit -m "Add standalone coaching website"
```

Then follow GitHub's instructions to add your repository remote and push. No private credentials should be committed.

### 3. Deploy on Render

At https://render.com create a **Web Service**, connect your repository, and select **Free**. Use:

| Setting | Value |
|---|---|
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Health check | `/api/health` |
| NODE_VERSION | `22` |
| NODE_ENV | `production` |
| DB_PROVIDER | `supabase` |
| SUPABASE_URL | Your project's HTTPS URL |
| SUPABASE_SECRET_KEY | Your server-only secret key |
| ADMIN_PASSWORD | A unique password of at least 12 characters |
| SESSION_SECRET | A random secret of at least 32 characters |

Generate a session secret on your own computer:

```bash
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Paste the result into Render's secret environment settings. Keep it private. Alternatively, use the supplied `render.yaml` Blueprint; it selects the Free plan and generates SESSION_SECRET automatically. Confirm that no paid resources are selected before deploying.

Use the actual free URL Render assigns, such as `your-service-name.onrender.com`. The example is not a reserved address. Open `/admin` at that same URL to sign in. Submit a dummy demo request, then verify it appears in the inbox, can be updated, and exports correctly.

### Free-plan limits

- Render Free web services sleep after 15 minutes without traffic; the next visit can take about a minute to start. They have usage quotas. Render's documentation positions Free instances for testing/hobby use, not production reliability.
- Render Free local files are lost on restart, redeploy or idle shutdown. **Do not use SQLite on Render Free.** This app refuses to start in that configuration instead of silently losing enquiries.
- Supabase Free currently includes 500 MB database space and may pause after a week of inactivity. Restore paused projects from its dashboard. Stay on Free and within quotas for a zero subscription budget.
- Use a free hosting subdomain. A normal custom `.com` registration costs money and is not part of a zero-budget setup.
- No free service is a guarantee of unlimited traffic or permanent uptime. Keep regular CSV backups of enquiries.

Sources checked 9 November 2026:
- https://render.com/docs/free
- https://supabase.com/pricing

## Run on another host

Any host that supports Node.js 22.13+ can run `npm ci`, `npm run build`, then `npm start`. The server binds to `0.0.0.0` and uses the host's `PORT` environment variable (default 3000).

- With a persistent disk: use `DB_PROVIDER=sqlite`, set `SQLITE_PATH` to a path on that disk, and run a single application instance.
- With a temporary disk: use `DB_PROVIDER=supabase` and set its server-only credentials.
- For publicly hosted admin access, use HTTPS and `NODE_ENV=production` so the session cookie is Secure. Keep TLS termination at the host/reverse proxy.
- Static-only hosting (for example, GitHub Pages) cannot run this Node backend and private inbox by itself.

Docker build:

```bash
docker build -t riit-mentors .
```

Run the container with the environment variables above and, for SQLite, a persistent volume mounted at `/app/data`. Publish container port 3000 behind HTTPS. The runtime image needs no npm dependencies; the backend uses built-in Node modules.

## Files

- `src/`: React pages, owner login/inbox and styles.
- `server/index.mjs`: API, password sessions, validation, rate limits, CSV and static hosting.
- `server/store.mjs`: SQLite and Supabase adapters.
- `scripts/setup.mjs`: private local configuration.
- `supabase.sql`: hosted database schema and access restrictions.
- `tests/app.test.mjs`: enquiry, owner-session, export and persistence checks.
- `render.yaml`: optional free-plan deployment settings.
- `Dockerfile`: portable container build.

## Security and operation

Admin sessions expire after eight hours and are cleared by logout. Server restarts also clear sessions, so sign in again. Login and enquiry submissions have basic request limits. Admin reads and exports require a valid session; writes use a same-origin check plus a custom request header. No browser code contains database credentials.

The inbox shows the latest 1,000 entries. CSV export includes up to 10,000. Click Refresh enquiries to load new requests. Status updates do not send messages or book a class.

The ZIP contains code and a built frontend, not existing customer data or production credentials. Real enquiries from any previous system are not migrated automatically. The Supabase adapter still needs your own project and credentials before online deployment can be verified.
