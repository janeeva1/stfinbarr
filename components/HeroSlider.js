'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HeroSlider({ slides, s }) {
  const list = slides.length ? slides : [{ id: 0, title: s.welcome_title, subtitle: s.tagline, image: s.hero_image, button_text: 'Mass Times', button_link: '/mass-times' }];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % list.length), 6500);
    return () => clearInterval(t);
  }, [list.length]);
  const cur = list[i];
  return (
    <section className="hero">
      {list.map((sl, k) => (
        <div key={sl.id} className={`hero-slide ${k === i ? 'on' : ''}`}>
          <img src={sl.image || s.hero_image} alt="" onError={(e) => { e.currentTarget.src = '/images/gallery-service.jpg'; }} />
        </div>
      ))}
      <div className="container hero-content">
        <span className="eyebrow">{s.parish_name}</span>
        <h1 key={cur.id}>{cur.title}</h1>
        <p className="lead">{cur.subtitle}</p>
        <div className="hero-actions">
          {cur.button_text && <Link href={cur.button_link || '/'} className="btn btn-accent">{cur.button_text} →</Link>}
          <Link href="/about" className="btn btn-ghost-light">Plan Your Visit</Link>
        </div>
      </div>
      {list.length > 1 && (
        <div className="hero-dots">{list.map((sl, k) => <button key={sl.id} aria-label={`Slide ${k + 1}`} className={k === i ? 'on' : ''} onClick={() => setI(k)} />)}</div>
      )}
    </section>
  );
}
