// Converts a YouTube or Facebook link (any common format) into an embeddable player URL.
export function videoInfo(url, { autoplay = false } = {}) {
  if (!url) return null;
  let u;
  try { u = new URL(url.trim()); } catch { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  let id = null;
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (host.endsWith('youtube.com') || host === 'youtube-nocookie.com') {
    if (u.searchParams.get('v')) id = u.searchParams.get('v');
    else {
      const m = u.pathname.match(/^\/(?:live|embed|shorts|v)\/([\w-]{6,})/);
      if (m) id = m[1];
      const ch = u.pathname.match(/^\/channel\/(UC[\w-]+)/);
      if (!id && ch) return { provider: 'youtube', embed: `https://www.youtube.com/embed/live_stream?channel=${ch[1]}${autoplay ? '&autoplay=1' : ''}`, thumb: null, link: url };
    }
  }
  if (id && /^[\w-]{6,}$/.test(id)) {
    return { provider: 'youtube', id, embed: `https://www.youtube.com/embed/${id}?rel=0${autoplay ? '&autoplay=1' : ''}`, thumb: `https://img.youtube.com/vi/${id}/hqdefault.jpg`, link: `https://www.youtube.com/watch?v=${id}` };
  }
  if (host.endsWith('facebook.com') || host === 'fb.watch') {
    return { provider: 'facebook', embed: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=1280${autoplay ? '&autoplay=true' : ''}`, thumb: null, link: url };
  }
  return null;
}

export function channelLiveEmbed(channelId) {
  if (!channelId || !/^UC[\w-]{10,}$/.test(channelId.trim())) return null;
  return { provider: 'youtube', embed: `https://www.youtube.com/embed/live_stream?channel=${channelId.trim()}`, link: `https://www.youtube.com/channel/${channelId.trim()}/live` };
}
