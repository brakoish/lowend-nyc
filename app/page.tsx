import Link from 'next/link';
import Image from 'next/image';
import { getAllArticles } from '@/lib/articles';

export default function HomePage() {
  const articles = getAllArticles();
  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const sideArticles = articles.filter((a) => a.slug !== featuredArticle.slug).slice(0, 2);

  return (
    <main>
      {/* Brutalist 6/3/3 Grid — matching Stitch mockup */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-3 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-[6fr_3fr_3fr] gap-3 lg:gap-4 items-start">

          {/* LEFT COLUMN (6/12) — Feature article */}
          <div className="lg:row-span-2">
            <Link href={`/articles/${featuredArticle.slug}`} className="group block">
              {/* Massive headline ABOVE image */}
              <h1 className="font-display uppercase leading-none group-hover:text-accent-red transition-colors duration-75 mb-3" style={{ fontWeight: 900, fontSize: 'clamp(32px, 6vw, 80px)', lineHeight: '0.88', letterSpacing: '-0.04em' }}>
                {featuredArticle.title}
              </h1>

              {/* Image + overlay text */}
              <div className="relative overflow-hidden mb-3">
                <div className="relative h-[250px] sm:h-[320px]">
                  <Image
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover article-image group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
              </div>

              {/* Red sub-headline + excerpt */}
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <p className="font-display text-accent-red uppercase font-bold leading-none mb-2" style={{ fontSize: 'clamp(18px, 3vw, 36px)', lineHeight: '0.92', letterSpacing: '-0.02em' }}>
                    {featuredArticle.artist.name}: {featuredArticle.excerpt.split(',')[0]}
                  </p>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-[50ch]">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="meta-text mt-3 flex items-center gap-4">
                    <span>POSTED {new Date(featuredArticle.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                    <span>4 MIN READ</span>
                    <span>FEATURE</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Crowd strip at bottom of left column */}
            <div className="relative h-[60px] lg:h-[70px] overflow-hidden mt-3">
              <Image
                src="/images/crowd-nyc.png"
                alt="NYC crowd"
                fill
                className="object-cover article-image opacity-70"
                unoptimized
              />
            </div>
          </div>

          {/* MIDDLE COLUMN (3/12) — Two stacked article cards */}
          {sideArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block"
            >
              <div className="relative h-[160px] lg:h-[180px] overflow-hidden mb-2">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover article-image group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>
              <h2 className="font-display uppercase font-bold leading-none group-hover:text-accent-red transition-colors duration-75 mb-2 line-clamp-4" style={{ fontSize: 'clamp(16px, 2vw, 26px)', lineHeight: '0.92', letterSpacing: '-0.02em' }}>
                {article.title}
              </h2>
              <p className="text-text-secondary text-xs leading-relaxed line-clamp-2 mb-2">
                {article.excerpt.substring(0, 80)}...
              </p>
              <div className="meta-text">
                BY LOWEND · {article.genre[0].toUpperCase()}
              </div>
            </Link>
          ))}

          {/* RIGHT COLUMN (3/12) — Red accent card + extras */}
          <div className="space-y-4">
            {/* Red accent card */}
            <div className="bg-accent-red p-4 relative overflow-hidden">
              <div className="relative z-10">
                <p className="font-display font-bold text-black uppercase leading-none mb-2" style={{ fontSize: 'clamp(14px, 1.5vw, 20px)', lineHeight: '0.95', letterSpacing: '-0.01em' }}>
                  CRUSHING DRUMS:
                </p>
                {/* Small image inset */}
                <div className="relative h-[100px] overflow-hidden mb-2">
                  <Image
                    src="/images/crowd-nyc.png"
                    alt="Event"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="font-display font-bold text-black uppercase leading-none" style={{ fontSize: 'clamp(14px, 1.5vw, 18px)', lineHeight: '0.95' }}>
                  BREAKAWAY NYC PREVIEW
                </p>
              </div>
            </div>

            {/* Additional card */}
            <div>
              <h3 className="font-display uppercase font-bold leading-none mb-2" style={{ fontSize: 'clamp(16px, 2vw, 26px)', lineHeight: '0.92', letterSpacing: '-0.02em' }}>
                LOCAL SPOTLIGHT: 99 SCOTT
              </h3>
              <p className="text-text-secondary text-xs leading-relaxed mb-2">
                The Bushwick warehouse that keeps delivering for Gray Area and Elsewhere Presents.
              </p>
              <div className="meta-text">
                BY LOWEND · ARTICLE
              </div>
              {/* Small photo */}
              <div className="relative h-[100px] overflow-hidden mt-2">
                <Image
                  src="/images/oppidan-99scott.png"
                  alt="99 Scott"
                  fill
                  className="object-cover article-image"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOIN THE NOISE — inline like the mockup */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 mt-4 border-t border-border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="font-display font-bold text-text-primary uppercase leading-none whitespace-nowrap" style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: '0.9', letterSpacing: '-0.03em', fontWeight: 900 }}>
            JOIN THE NOISE
          </h2>
          <form className="flex gap-3 flex-1 lg:max-w-lg">
            <input
              type="email"
              placeholder="JOIN THE NOISE"
              className="flex-1 px-4 py-3 bg-transparent border border-border text-text-primary font-mono text-sm uppercase placeholder:text-text-secondary/50 focus:outline-none focus:border-text-primary transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 border border-text-primary text-text-primary font-display font-bold uppercase tracking-wider hover:bg-text-primary hover:text-page-bg transition-colors duration-75"
            >
              SIGN UP
            </button>
          </form>
          {/* Social icons */}
          <div className="flex items-center gap-4">
            <span className="font-display font-bold uppercase text-xl">IG</span>
            <span className="font-display font-bold uppercase text-xl">SC</span>
            <span className="font-display font-bold uppercase text-xl">FB</span>
          </div>
        </div>
      </section>

      {/* ALL COVERAGE */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display font-bold uppercase tracking-tight whitespace-nowrap" style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 900 }}>ALL COVERAGE</h2>
          <div className="flex-1 h-[1px] bg-border" />
          <span className="meta-text whitespace-nowrap">{articles.length} ARTICLES</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group brutal-card block overflow-hidden"
            >
              <div className="relative h-[200px] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover article-image group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute top-0 left-0 flex">
                  <span className="red-tag">{article.genre[0]}</span>
                </div>
              </div>
              <div className="p-5">
                <p className="font-display text-accent-red uppercase text-xs font-bold tracking-wider mb-1">
                  {article.artist.name}
                </p>
                <h3 className="font-display font-bold uppercase leading-none mb-3 group-hover:text-accent-red transition-colors duration-75 line-clamp-2" style={{ fontSize: 'clamp(16px, 2vw, 24px)', lineHeight: '0.95' }}>
                  {article.title}
                </h3>
                <div className="meta-text">
                  {article.venue} · {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
