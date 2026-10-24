# St. Finbarr's Catholic Church — Website, CMS & Church Management

A single Next.js project with a PostgreSQL database. It contains:

- **Public website** — home page slider, Mass & confession times, events, news & announcements, photo gallery (albums + lightbox), societies & ministries, clergy, contact & prayer requests, Mass intention booking, and a giving page.
- **CMS** (`/admin`) — edit everything on the website: slides, events, news, gallery albums & photos (with bulk upload), Mass times, clergy, ministries, page text, parish details, and **the colour theme** (presets or any custom colours + heading font, with live preview).
- **Church management** — parishioner register (families, zones, societies, sacraments received), sacramental register, offerings & donations (with totals), Mass intentions, inbox for messages & prayer requests, admin users. Dashboard with key numbers.

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
