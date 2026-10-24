import PageNav from './PageNav';
import { getSettings } from '@/lib/settings';

// Banner at the top of inner pages. `image` (e.g. an event photo) wins;
// otherwise the page's banner uploaded in Admin → Settings → Images is used.
export default async function PageHero({ title, text, image, banner, crumbTitle }) {
  const s = await getSettings();
  const bg = image || (banner && s[banner]) || s.hero_image || '/images/gallery-service.jpg';
  return (
    <>
      <section className="page-hero">
        <img className="bg" src={bg} alt="" />
        <div className="container">
          <h1>{title}</h1>
          {text && <p>{text}</p>}
        </div>
      </section>
      <PageNav title={crumbTitle || title} />
    </>
  );
}
