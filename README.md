# R-IIT Bharat Mentors

Personalised JEE & NEET Coaching  
**Your Ambition. Our Guidance. A Personalised Path.**

Independent React + Node application. Runs without any ChatGPT login or paid AI API. SQLite locally; Supabase server-only REST storage when hosted on Render Free.

## Live application

- Website: https://riit-bharat-mentors-uu3f.onrender.com
- Student studio: https://riit-bharat-mentors-uu3f.onrender.com/learn
- Owner workspace: https://riit-bharat-mentors-uu3f.onrender.com/admin
- Health: https://riit-bharat-mentors-uu3f.onrender.com/api/health

## Included workflows

| Feature | Operation |
| --- | --- |
| Public site | Program tabs, pricing calculator, FAQs, privacy notice, validated demo enquiry form |
| Owner inbox | Authenticated search, status/notes updates, CSV export |
| Learning accounts | Adult/guardian email + password, scrypt password hashing, HttpOnly sessions, logout, owner-assisted password reset |
| Practice | JEE, NEET, Foundation; exam/subject/difficulty/paper/topic filters; random sampling without repetition within each attempt; 1–90 questions; 1–180 minutes |
| Scoring | Single-correct MCQs: +4 correct, −1 incorrect, 0 skipped; answer keys withheld until submission |
| Analysis | Total marks, attempted accuracy, correct/incorrect/skipped, time used, topic accuracy, weak-topic suggestions, answer explanations and history |
| Question bank | Admin uploads CSV/JSON/text/formatted text PDF, reviews extracted questions, publishes/hides questions, exports bank |
| Lessons | One free demo per account, preferred-time requests, owner-confirmed time, private per-booking Google Meet link |
| Payments | Paid one-hour lesson requests after completed demo; owner-configured UPI ID/payee/price; bank-reference submission; manual owner verification |
| Owner oversight | Student results and topic breakdowns, lesson management, payment settings, lesson terms, downloadable learning backup |

## Start using the deployed app

1. Open `/admin`. Sign in with the value of **ADMIN_PASSWORD** in your Render service → Environment. If you set ADMIN_PASSWORD_HASH instead, use the original password you hashed. Keep these values private. Nothing is printed in the app or committed.
2. Under **Payment & terms**, enter your real UPI ID, exact payee name, lesson price, business contact email, payment instructions and rescheduling/refund terms. Save. No sample payee is configured on the live site. Paid bookings stay closed until these details are supplied.
3. Under **Question bank**, the original starter bank is available. Download a CSV or JSON template for your own papers. Upload, validate, review every answer and explanation, confirm usage rights and publish. Hide a question to stop future tests using it.
4. A learner/guardian opens `/learn`, creates an account with a 12–128 character password and consent, then starts practice or requests a free demo under **My lessons**. This app does not send account verification emails; email identifies the account.
5. In **Lessons**, create a meeting using the **Create a Google Meet link** button. Google requires your own Google account. Paste the generated `https://meet.google.com/abc-defg-hij` link, select the confirmed lesson time and save as Scheduled. The student sees the link in their account. A requested time is not an automatically reserved calendar slot; coordinate tutor availability yourself.
6. After delivering the demo, mark it Completed. The student can request a one-hour paid lesson. Their booking quotes the current price, UPI payee and terms. They pay using a compatible phone UPI/bank app and submit the transaction reference.
7. Check your actual bank receipt. Only then select **Verified** and confirm the paid lesson time/Meet link. A submitted reference is never treated as proof of payment. The application does not receive funds or verify bank transactions automatically.
8. Review student test summaries/topic analysis in **Students & results**. Use the backup download regularly and keep it private. Verify identity before resetting a learner password.

## Run on your computer

Node.js **22.13+** (Node 22 LTS recommended) and npm required.

```bash
git clone --branch riit-bharat-launch --single-branch https://github.com/sahithya9550/coaching-platform.git
cd coaching-platform
npm ci
npm run setup
npm run build
npm start
```

Choose a unique owner password during setup. Setup creates private `.env` with a password hash, random SESSION_SECRET and DB_PROVIDER=sqlite. Input is visible in your terminal, so run it privately.

- Website: http://localhost:3000
- Learner: http://localhost:3000/learn
- Owner: http://localhost:3000/admin

In the local owner workspace click **Question bank → Add original starter questions**. A fresh local database starts empty. Hosted questions are not copied to your computer automatically.

Records persist in `data/enquiries.sqlite`. Stop with Ctrl+C. Restart with `npm start`. Back up this database with the server stopped, plus `.env`, privately. Sessions expire after eight hours and clear on restart; sign in again. `npm run dev` rebuilds and starts the server, without hot reload.

## Question import formats

CSV header:

```csv
exam,subject,level,topic,text,A,B,C,D,correct,explanation,source,year,paper
JEE,Chemistry,Easy,Mole concept,"Moles in 18 g of water (18 g/mol)?",0.5,1,2,18,B,"18/18 = 1 mol.",Original,,Practice
```

JSON uses an array of objects with the same metadata, `options: ["A text","B text","C text","D text"]`, and `correct: "B"` or numeric index `1` (indexes 0–3). Download the exact templates in the admin workspace.

- Exam: JEE, NEET or Foundation.
- Subject: Mathematics, Physics, Chemistry, Botany or Zoology.
- Level: Easy, Medium or Hard; levels are assigned by the admin, not inferred by AI.
- Required: topic, question text, four options, correct answer, explanation, source.
- Optional: year and paper name.
- 1–500 questions per import; file up to 5 MB. Repeat imports as needed within storage limits. Import requests are not a transaction across the whole batch; after a database/network error, check the bank before retrying to avoid duplicates.

Text PDFs and `.txt` files must use this grammar for every question:

```text
Q1. What is 1 + 1?
A) 1
B) 2
C) 3
D) 4
Answer: B
Explanation: Adding one and one gives two.
```

For PDF/text choose exam, subject, level, topic and source in the import form. Extraction supports text PDFs up to 100 pages, not arbitrary paper layouts. Scans need transcription/OCR outside this app. Diagrams, numerical-response questions, multiple-correct JEE Advanced formats and complex equation rendering are not supported. All questions must be reviewed; the app never guesses missing answer keys.

Starter bank: **24 original questions**, not official past-year questions. There is no preloaded complete IIT/JEE/NEET archive. Import only material you own or have permission to use and label paper/year/source accurately. Random tests draw from the published bank; if too few questions match, reduce the requested count or import more.

## Free hosting and costs

This deployment selects **Render Free + Supabase Free** with a free `onrender.com` hostname. No gateway subscription, paid AI API, paid video service or paid custom domain is configured by this application. The account owner must keep the provider accounts on Free and monitor account-level usage/billing; this code cannot impose a provider-wide spending cap.

**Free is not unlimited.** Render has monthly resource/bandwidth/build quotas and sleeps after 15 minutes idle; a cold start may take about a minute. Supabase Free currently includes a 500 MB database and limited egress; inactive projects can pause. Stored question snapshots and results consume database capacity. At scale you must archive data, self-host on your own hardware or choose more capacity. There is no promise of permanent zero-cost unlimited hosting or an uptime SLA.

A regular `.com` registration costs money. The current free URL is the domain to use for a ₹0 launch. Direct UPI is a bank/app handoff, not a payment gateway integration; bank/provider terms apply. Automated card gateways typically charge transaction fees and require merchant setup, so none is enabled. Google Meet requires the mentor's own account and is subject to Google's limits.

Sources checked 9 November 2026:
- https://render.com/docs/free
- https://supabase.com/pricing
- https://support.google.com/meet/answer/7317473
- https://razorpay.com/pricing/

## Re-deploy / move to another host

Current Render service follows **riit-bharat-launch** automatically. Build: `npm ci --include=dev && npm run build`; start: `npm start`; health: `/api/health`. Push changes to this branch to redeploy; leave the original `main` branch untouched.

For a new Supabase project, run **supabase.sql** and **platform.sql** once in SQL Editor. Both tables have RLS and deny anonymous/browser access. Only the Node server receives the secret API key.

| Environment variable | Value |
| --- | --- |
| NODE_VERSION | 22 |
| NODE_ENV | production for HTTPS hosting |
| DB_PROVIDER | supabase on Render Free; sqlite on a persistent disk/local computer |
| SUPABASE_URL | Your project's HTTPS URL |
| SUPABASE_SECRET_KEY | Server-only secret key; never put it in browser code |
| ADMIN_PASSWORD | Unique owner password, at least 12 characters |
| SESSION_SECRET | Random private string, at least 32 characters |
| PORT | Host-assigned, defaults to 3000 |
| SQLITE_PATH | Optional persistent database path for SQLite |

For another Node host: `npm ci`, `npm run build`, `npm start`. The process binds `0.0.0.0:$PORT`. Use one application instance, HTTPS and a trusted reverse proxy. The current in-memory sessions/rate limits and serialized write queue assume a single Node instance. Multi-instance scaling needs shared sessions and database transactions.

Render Free disks are temporary: the app refuses SQLite there. Use Supabase to keep records across restarts. Never upload `.env`, `data/` or credentials. There is no need to create a hosted `.env` file; Render supplies environment variables.

Docker:

```bash
docker build -t riit-mentors .
docker run --rm -p 3000:3000 --env-file .env -v riit-data:/app/data riit-mentors
```

For a local HTTP Docker demo, omit NODE_ENV=production; for public hosting use HTTPS and production secure cookies. The container installs runtime dependencies for PDF extraction.

## Verification and practical limits

```bash
npm test
npm run build
npm audit --omit=dev
```

Every production build runs the tests first, including on Render. Tests cover enquiry flow, owner authentication/export, database persistence, missing hosted configuration, modern Supabase key headers, student login/ownership boundaries, reviewed imports, test randomisation and hidden answer keys, scoring/idempotency, deadline enforcement, demo eligibility, manual payment verification, Meet URL validation, CSV/text/real-PDF parsing, password reset/session revocation and learning-data persistence.

Practice is single-answer MCQ preparation, not an official exam simulation for every JEE/NEET question format. Analysis is descriptive; there are no fake percentiles/ranks, adaptive AI questions, proctoring or admission predictions. Students may see the same question across different tests. Timers continue when leaving a test; after the deadline only pre-deadline saved responses count. After a restart sign in again, then resume the saved attempt.

Meet creation, tutor/time coordination, payment receipt verification, refunds, identity checks and question review are owner tasks. There is no Google OAuth/Calendar automation, automatic email/WhatsApp messaging, gateway settlement, OCR, full paper archive, subscriptions, group scheduling or entitlement system for paid test courses. Marketing group enquiries continue through the existing enquiry inbox; the lesson studio handles individual lessons. Forgotten owner passwords are reset privately in the host environment.
