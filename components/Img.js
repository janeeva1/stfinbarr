'use client';
import { useState } from 'react';

const FALLBACKS = ['/images/gallery-service.jpg', '/images/gallery-community.jpg', '/images/gallery-choir.jpg', '/images/gallery-prayer.jpg'];

export default function Img({ src, alt = '', className, style, seed = 0 }) {
  const [err, setErr] = useState(false);
  if (!src) return <div className="placeholder-img">✝</div>;
  return <img src={err ? FALLBACKS[seed % 4] : src} alt={alt} className={className} style={style} loading="lazy" onError={() => setErr(true)} />;
}
