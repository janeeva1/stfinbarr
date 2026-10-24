import Link from 'next/link';
import { query } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { fmtDate, fmtTime, excerpt } from '@/lib/format';
import HeroSlider from '@/components/HeroSlider';
import Img from '@/components/Img';
import { Suspense } from 'react';
import HomeWord, { HomeWordFallback } from '@/components/HomeWord';
import { videoInfo } from '@/lib/video';

export default async function Home() {
  const s = await getSettings();
  const [slides, mass, events, news, albums, photos, ministries, nextLive, lastRec, feasts] = await Promise.all([
    query('SELECT * FROM slides WHERE active ORDER BY sort_order, id'),
    query("SELECT * FROM mass_times ORDER BY sort_order, id LIMIT 4"),
    query('SELECT * FROM events WHERE published AND start_date >= now() - interval \'1 day\' ORDER BY featured DESC, start_date LIMIT 3'),
    query('SELECT * FROM news WHERE published ORDER BY published_at DESC, id DESC LIMIT 3'),
    query('SELECT a.*, (SELECT count(*)::int FROM gallery_photos p WHERE p.album_id=a.id) n FROM gallery_albums a WHERE published ORDER BY event_date DESC NULLS LAST LIMIT 1'),
    query('SELECT p.*, a.title album FROM gallery_photos p JOIN gallery_albums a ON a.id=p.album_id WHERE a.published ORDER BY p.id DESC LIMIT 5'),
    query('SELECT * FROM ministries ORDER BY id LIMIT 4'),
    query("SELECT * FROM livestreams WHERE published AND kind='Upcoming' AND scheduled_at >= now() - interval '3 hours' ORDER BY scheduled_at LIMIT 1"),
    query("SELECT * FROM livestreams WHERE published AND kind <> 'Upcoming' AND url IS NOT NULL ORDER BY scheduled_at DESC NULLS LAST, id DESC LIMIT 1"),
    query('SELECT * FROM celebrations WHERE published AND COALESCE(end_date, date) >= CURRENT_DATE ORDER BY date LIMIT 2'),
  ]);
  const isLive = s.live_now === 'true';
  const rec = lastRec[0] && videoInfo(lastRec[0].url);

  return (
    <>
      <HeroSlider slides={slides} s={s} />

      <div className="container mass-strip">
        <div className="mass-card">
          <div className="intro">
            <h3>Holy Mass Schedule</h3>
            <p>“Do this in memory of me.” Join us at the table of the Lord.</p>
            <Link href="/mass-times">Full schedule & confessions →</Link>
          </div>
          <div className="times">
            {mass.map((m) => (
              <div className="time" key={m.id}><small>{m.day}</small><strong>{m.time}</strong><span>{m.title}</span></div>
            ))}
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container welcome">
          <div className="photo"><Img src={s.priest_photo} alt={s.priest_name} seed={1} /></div>
          <div>
            <span className="eyebrow">A word from our Parish Priest</span>
            <h2>{s.welcome_title}</h2>
            <p className="muted" style={{ fontSize: 17 }}>{s.welcome_text}</p>
            <p className="quote">“{s.priest_message}”</p>
            <p className="signature">— {s.priest_name}</p>
            <Link href="/about" className="btn btn-primary" style={{ marginTop: 10 }}>Discover Our Parish</Link>
          </div>
        </div>
      </section>

      <section className="section tight soft">
        <div className="container tiles six">
          <Link href="/mass-times" className="tile"><div className="ic">⛪</div><h3>Mass Times</h3><p>Mass, confession, adoration and holy days.</p></Link>
          <Link href="/live" className="tile"><div className="ic">📺</div><h3>Livestream</h3><p>Watch Mass live and recorded homilies.</p></Link>
          <Link href="/readings" className="tile"><div className="ic">📜</div><h3>Daily Readings</h3><p>Today’s and Sunday’s Mass readings.</p></Link>
          <Link href="/sacraments" className="tile"><div className="ic">💧</div><h3>Sacraments</h3><p>Preparation and online registration.</p></Link>
          <Link href="/contact?type=Prayer+Request" className="tile"><div className="ic">🙏</div><h3>Prayer Request</h3><p>Let us pray with you and for you.</p></Link>
          <Link href="/mass-times#intention" className="tile"><div className="ic">🕯️</div><h3>Book a Mass</h3><p>Request a Mass intention for loved ones.</p></Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head center"><span className="eyebrow">Word & Worship</span><h2>Pray with us today</h2><div className="ornament" /></div>
          <div className="word-grid">
            <Suspense fallback={<HomeWordFallback />}><HomeWord /></Suspense>
            <div className={`word-card live-card ${isLive ? 'is-live' : ''}`}>
              <span className="eyebrow">{isLive ? 'Live now' : 'Livestream Mass'}</span>
              {isLive ? (
                <><h3><span className="live-badge"><i /> LIVE</span> {s.live_title}</h3><p className="muted">Holy Mass is being streamed right now.</p></>
              ) : nextLive[0] ? (
                <><h3>Next broadcast</h3><p className="next-broadcast"><b>{nextLive[0].title}</b><br />{fmtDate(nextLive[0].scheduled_at, { weekday: 'long', day: 'numeric', month: 'long' })} · {fmtTime(nextLive[0].scheduled_at)}</p></>
              ) : <><h3>Watch Mass online</h3><p className="muted">{s.live_schedule_text}</p></>}
              {!isLive && rec && (
                <Link href={`/live?v=${lastRec[0].id}`} className="mini-rec">
                  {rec.thumb ? <img src={rec.thumb} alt="" /> : <span className="placeholder-img" style={{ fontSize: 20 }}>▶</span>}
                  <span><small>Latest recording</small><b>{lastRec[0].title}</b></span>
                </Link>
              )}
              <div style={{ marginTop: 'auto' }}><Link href="/live" className="btn btn-primary btn-sm">{isLive ? 'Watch now' : 'Go to livestream'}</Link></div>
            </div>
            <div className="word-card">
              <span className="eyebrow">Holy days & feasts</span>
              {feasts.length ? feasts.map((f) => (
                <div key={f.id} className="feast-mini">
                  <div className="when"><b>{fmtDate(f.date, { day: 'numeric' })}</b><small>{fmtDate(f.date, { month: 'short' })}</small></div>
                  <div><span className="tag" style={{ marginBottom: 4 }}>{f.kind}</span><b style={{ display: 'block', lineHeight: 1.3 }}>{f.title}</b>{f.mass_times && <small className="muted">{f.mass_times}</small>}</div>
                </div>
              )) : <p className="muted">Upcoming holy days will appear here.</p>}
              <div style={{ marginTop: 'auto' }}><Link href="/mass-times#holy-days" className="btn btn-light btn-sm">Liturgical calendar</Link></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">Parish Calendar</span><h2>Upcoming Events</h2></div>
            <Link href="/events" className="link-arrow">View all events →</Link>
          </div>
          {events.length ? (
            <div className="grid g3">
              {events.map((e, k) => (
                <Link key={e.id} href={`/events/${e.id}`} className="card">
                  <div className="thumb"><Img src={e.image} alt={e.title} seed={k} />
                    <div className="date-badge"><b>{new Date(e.start_date).getDate()}</b><small>{fmtDate(e.start_date, { month: 'short' })}</small></div>
                  </div>
                  <div className="body">
                    {e.category && <span className="tag">{e.category}</span>}
                    <h3>{e.title}</h3>
                    <div className="meta"><span>🕘 {fmtTime(e.start_date)}</span>{e.location && <span>📍 {e.location}</span>}</div>
                    <p>{excerpt(e.description, 110)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : <div className="empty">No upcoming events right now. Please check back soon.</div>}
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">Moments of Grace</span><h2>Parish Gallery</h2></div>
            <Link href="/gallery" className="link-arrow">Open the gallery →</Link>
          </div>
          <div className="mosaic">
            {photos.map((p, k) => (
              <Link key={p.id} href={`/gallery/${p.album_id}`}><Img src={p.image} alt={p.caption} seed={k} /><span className="cap">{p.caption || p.album}</span></Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div><span className="eyebrow">News & Announcements</span><h2>From the Parish Office</h2></div>
            <Link href="/news" className="link-arrow">All news →</Link>
          </div>
          <div className="grid g3">
            {news.map((n, k) => (
              <Link key={n.id} href={`/news/${n.id}`} className="card">
                <div className="thumb"><Img src={n.image} alt={n.title} seed={k + 2} /></div>
                <div className="body">
                  <span className="tag">{n.category}</span>
                  <h3>{n.title}</h3>
                  <div className="meta"><span>{fmtDate(n.published_at)}</span></div>
                  <p>{excerpt(n.summary, 120)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-head center"><span className="eyebrow">Get Involved</span><h2>Societies & Ministries</h2><div className="ornament" /></div>
          <div className="grid g4">
            {ministries.map((m, k) => (
              <Link key={m.id} href="/ministries" className="card">
                <div className="thumb" style={{ aspectRatio: '4/3' }}><Img src={m.image} alt={m.name} seed={k} /></div>
                <div className="body"><span className="tag">{m.category}</span><h3 style={{ fontSize: '1.25rem' }}>{m.name}</h3><p style={{ fontSize: 14 }}>{m.meeting_time}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <span className="eyebrow">Support Your Parish</span>
              <h2>“God loves a cheerful giver.”</h2>
              <p>{s.donate_text}</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
              <Link href="/donate" className="btn btn-accent">Give Now</Link>
              <Link href="/contact" className="btn btn-ghost-light">Contact the Office</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
