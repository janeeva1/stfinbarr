import Link from 'next/link';

export default function Footer({ s, mass = [] }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand">{s.logo ? <img src={s.logo} className="brand-logo" alt="" /> : <span className="brand-mark">✝</span>}<span className="brand-text"><strong>{s.parish_name}</strong><small>{s.diocese}</small></span></div>
            <p style={{ fontSize: 14.5 }}>{s.tagline}. {s.mission_text}</p>
            <div style={{ display: 'flex', gap: 14, fontSize: 14 }}>
              {s.facebook && <a href={s.facebook}>Facebook</a>}{s.instagram && <a href={s.instagram}>Instagram</a>}{s.youtube && <a href={s.youtube}>YouTube</a>}
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/about">About the Parish</Link></li><li><Link href="/events">Events</Link></li>
              <li><Link href="/news">News & Bulletins</Link></li><li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/ministries">Societies</Link></li><li><Link href="/donate">Give Online</Link></li>
            </ul>
          </div>
          <div>
            <h4>Mass Times</h4>
            <ul>{mass.slice(0, 5).map((m) => <li key={m.id}><b style={{ color: '#fff' }}>{m.day}</b> · {m.time}</li>)}</ul>
          </div>
          <div>
            <h4>Visit Us</h4>
            <ul>
              <li>📍 {s.address}</li><li>📞 {s.phone}</li><li>✉️ {s.email}</li>
              <li style={{ whiteSpace: 'pre-line' }}>🕘 {s.office_hours}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {s.parish_name}. All rights reserved.</span>
          <span>Ad Majorem Dei Gloriam ✠</span>
        </div>
      </div>
    </footer>
  );
}
