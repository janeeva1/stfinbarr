import Link from 'next/link';
import { query, one } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { videoInfo, channelLiveEmbed } from '@/lib/video';
import { fmtDate, fmtTime } from '@/lib/format';
import PageHero from '@/components/PageHero';

export const metadata = { title: 'Livestream Mass' };

const TABS = [['all', 'All recordings'], ['Recorded Mass', 'Masses'], ['Homily', 'Homilies'], ['Special Event', 'Special events']];

export default async function Live({ searchParams }) {
  const s = await getSettings();
  const isLive = s.live_now === 'true';
  const tab = TABS.some(([k]) => k === searchParams?.tab) ? searchParams.tab : 'all';
  const [upcoming, recordings] = await Promise.all([
    query("SELECT * FROM livestreams WHERE published AND kind='Upcoming' AND scheduled_at >= now() - interval '3 hours' ORDER BY scheduled_at LIMIT 6"),
    query(`SELECT * FROM livestreams WHERE published AND kind <> 'Upcoming' AND url IS NOT NULL ${tab !== 'all' ? 'AND kind=$1' : ''} ORDER BY scheduled_at DESC NULLS LAST, id DESC LIMIT 24`, tab !== 'all' ? [tab] : []),
  ]);

  // What to show in the main player
  let player = null, playerTitle = '', playerMeta = '';
  const watchId = Number(searchParams?.v) || 0;
  if (watchId) {
    const r = await one('SELECT * FROM livestreams WHERE id=$1 AND published', [watchId]);
    if (r) { player = videoInfo(r.url, { autoplay: true }); playerTitle = r.title; playerMeta = [r.kind, r.preacher, r.scheduled_at && fmtDate(r.scheduled_at)].filter(Boolean).join(' · '); }
  } else if (isLive) {
    player = videoInfo(s.live_url, { autoplay: true }) || channelLiveEmbed(s.youtube_channel_id);
    playerTitle = s.live_title;
  }
  const next = upcoming[0];

  return (
    <>
      <PageHero title="Livestream Mass" text="Pray with us wherever you are — watch Holy Mass live, or catch up on recent Masses and homilies." banner="banner_mass" />
      <section className="section">
        <div className="container">
          {player ? (
            <div className="live-player">
              <div className="live-head">
                {!watchId && <span className="live-badge"><i /> LIVE NOW</span>}
                <div><h2 style={{ margin: 0 }}>{playerTitle}</h2>{playerMeta && <p className="muted" style={{ margin: 0 }}>{playerMeta}</p>}</div>
              </div>
              <div className="video-frame"><iframe src={player.embed} title={playerTitle} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /></div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                {player.link && <a href={player.link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Open on {player.provider === 'facebook' ? 'Facebook' : 'YouTube'} ↗</a>}
                {watchId > 0 && <Link href="/live" className="btn btn-light btn-sm">← Back to livestream</Link>}
              </div>
            </div>
          ) : (
            <div className="offline-card">
              <div className="offline-icon">📺</div>
              <div>
                <span className="eyebrow">Not live right now</span>
                <h2>{next ? 'Next broadcast' : 'Watch Mass online'}</h2>
                {next ? (
                  <p className="next-broadcast"><b>{next.title}</b><br />{fmtDate(next.scheduled_at, { weekday: 'long', day: 'numeric', month: 'long' })} at {fmtTime(next.scheduled_at)}</p>
                ) : null}
                <p className="muted">{s.live_offline_text}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {s.youtube && s.youtube !== '#' && <a href={s.youtube} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Our YouTube channel ↗</a>}
                  {s.facebook && s.facebook !== '#' && <a href={s.facebook} target="_blank" rel="noreferrer" className="btn btn-light btn-sm">Our Facebook page ↗</a>}
                </div>
              </div>
            </div>
          )}

          <div className="live-grid">
            <div className="panel">
              <h3>📅 Broadcast schedule</h3>
              <p className="muted" style={{ fontSize: 15 }}>{s.live_schedule_text}</p>
              {upcoming.length ? (
                <ul className="schedule-list">
                  {upcoming.map((u) => (
                    <li key={u.id}><div className="when"><b>{fmtDate(u.scheduled_at, { day: 'numeric' })}</b><small>{fmtDate(u.scheduled_at, { month: 'short' })}</small></div>
                      <div><strong>{u.title}</strong><div className="muted" style={{ fontSize: 14 }}>{fmtDate(u.scheduled_at, { weekday: 'long' })} · {fmtTime(u.scheduled_at)}{u.preacher && ` · ${u.preacher}`}</div></div></li>
                  ))}
                </ul>
              ) : <p className="muted">Upcoming broadcasts will be listed here.</p>}
            </div>
            <div className="panel">
              <h3>ℹ️ Watching tips</h3>
              <ul className="tips">
                <li>The player appears at the top of this page as soon as we go live — refresh the page at the start time.</li>
                <li>If the video does not load, use the YouTube or Facebook button to watch there.</li>
                <li>Those following Mass online are encouraged to make an <b>Act of Spiritual Communion</b>.</li>
                <li>Livestreams may occasionally be interrupted by network problems — thank you for your patience.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-head"><div><span className="eyebrow">Watch again</span><h2>Recorded Masses & Homilies</h2></div></div>
          <div className="tabs">{TABS.map(([k, l]) => <Link key={k} href={k === 'all' ? '/live' : `/live?tab=${encodeURIComponent(k)}`} className={tab === k ? 'on' : ''}>{l}</Link>)}</div>
          {recordings.length ? (
            <div className="grid g3">
              {recordings.map((r) => {
                const v = videoInfo(r.url);
                return (
                  <Link key={r.id} href={`/live?v=${r.id}`} className="card">
                    <div className="thumb video-thumb">{v?.thumb ? <img src={v.thumb} alt="" loading="lazy" /> : <div className="placeholder-img">▶</div>}<span className="play">▶</span></div>
                    <div className="body"><span className="tag">{r.kind}</span><h3 style={{ fontSize: '1.3rem' }}>{r.title}</h3>
                      <div className="meta">{r.scheduled_at && <span>{fmtDate(r.scheduled_at)}</span>}{r.preacher && <span>{r.preacher}</span>}</div></div>
                  </Link>
                );
              })}
            </div>
          ) : <div className="empty">Recorded Masses and homilies will appear here once they are added.</div>}
        </div>
      </section>
    </>
  );
}
