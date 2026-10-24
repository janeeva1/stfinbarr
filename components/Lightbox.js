'use client';
import { useEffect, useState } from 'react';

export default function Lightbox({ photos }) {
  const [i, setI] = useState(-1);
  useEffect(() => {
    const k = (e) => {
      if (i < 0) return;
      if (e.key === 'Escape') setI(-1);
      if (e.key === 'ArrowRight') setI((i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setI((i - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [i, photos.length]);
  if (!photos.length) return <div className="empty">No photos in this album yet.</div>;
  return (
    <>
      <div className="photo-grid">
        {photos.map((p, k) => <button key={p.id} onClick={() => setI(k)}><img src={p.image} alt={p.caption || ''} loading="lazy" /></button>)}
      </div>
      {i >= 0 && (
        <div className="lightbox" onClick={() => setI(-1)}>
          <button className="lb-btn lb-close" onClick={() => setI(-1)}>✕</button>
          <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); setI((i - 1 + photos.length) % photos.length); }}>‹</button>
          <img src={photos[i].image} alt="" onClick={(e) => e.stopPropagation()} />
          {photos[i].caption && <p>{photos[i].caption}</p>}
          <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); setI((i + 1) % photos.length); }}>›</button>
        </div>
      )}
    </>
  );
}
