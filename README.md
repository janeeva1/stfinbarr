# St. Finbarr's Catholic Church, Rayfield, Jos — Website, CMS & Church Management

One Next.js project with a PostgreSQL database (Neon in production).

**Public website** — homepage (banner slider, motto, Mass times, today's Gospel, livestream, holy days), About (history, mission, patron saint, clergy), Mass & confession times, holy days/feasts/novenas, **daily and Sunday Mass readings**, **livestream Mass** with recorded Masses & homilies, sacraments with online registration, events, news, photo gallery, ministries, contact & prayer requests, Mass intentions, giving, privacy notice. Burgundy, gold & cream design; works on phones.

**Admin (`/admin`)** — edit everything without a developer, change colours/fonts/logo/banners, go live with one button, approve posts, parish records (parishioners, sacramental register, donations, Mass intentions, inbox), visit statistics, CSV export, full backup & restore.

## Going live on Sunday
1. Start the stream on YouTube or Facebook and copy the video link.
2. Admin → Settings → **📺 Livestream** → paste the link → press **Go LIVE**. A red LIVE bar appears on every page and the video plays on the Livestream page.
3. After Mass press **Switch OFF live**. Add the recording under **Livestream & Recordings** (kind: Recorded Mass or Homily) so people can watch it again.

## Mass readings
Readings appear automatically every day (from the Evangelizo.org reader feed, cached in the database). To use different readings for a date (e.g. a local feast), add them under **Mass Readings (manual)** — they replace the automatic ones for that date.

## Staff roles
| Role | Can do |
|---|---|
| admin | Everything, including staff accounts and backups |
| priest | Everything except staff accounts & backups; approves announcements and events |
| editor | Website and liturgy content; announcements/events wait for approval |
| secretary | Parish records, Mass intentions and inbox |

## Run it

```
npm install
npm run dev
```
Open http://localhost:3000. The admin is at http://localhost:3000/admin

**Database:** nothing to install. If `DATABASE_URL` in `.env` is empty (or PostgreSQL isn't running on this computer), `npm run dev` starts a **built-in PostgreSQL** automatically and keeps its data in `.data/postgres`.
To use your own PostgreSQL instead, set `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/st_finbarr` in `.env`.
Either way, tables and sample content are created automatically on first run.

**Default admin login:** `admin@stfinbarr.org` / `admin123` — change it in Admin → Admin Users.

## Hosting on Render + Neon
1. **Neon:** create a project and copy its connection string (the one ending in `?sslmode=require…`).
2. **GitHub:** push this folder to a GitHub repository (`.env` is not uploaded — that's intended).
3. **Render:** New → Blueprint → pick the repo (it reads `render.yaml`), or New → Web Service with
   Build `npm install && npm run build` and Start `npm start`.
4. In Render → Environment, set `DATABASE_URL` to the Neon connection string. `SESSION_SECRET` is generated for you.
5. Deploy. On first start the tables, admin user and sample content are created in Neon automatically.

Uploaded images are stored in the database, so they survive redeploys (Render's free plan has no permanent disk).
Photos are resized in the browser before upload to keep the database small.

## Other commands
- `npm run db:reset` — wipe the database and start again with fresh sample content.
- `npm run build && npm start` — production mode.

Uploaded images are saved in the `uploads/` folder.
