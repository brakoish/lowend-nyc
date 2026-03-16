import Link from 'next/link';
import Image from 'next/image';
import { getAllArticles } from '@/lib/articles';

export default function HomePage() {
  const articles = getAllArticles();
  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const sideArticles = articles.filter((a) => a.slug !== featuredArticle.slug).slice(0, 2);

  return (
    <main>
      {/* Brutalist Asymmetric Hero Grid */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_3fr] gap-4 lg:gap-5 items-start">

          {/* FEATURED — Massive left panel */}
          <Link
            href={`/articles/${featuredArticle.slug}`}
            className="group brutal-card block overflow-hidden lg:row-span-2"
          >
            {/* Feature tag */}
            <div className="flex items-center gap-3 px-6 pt-5 pb-3">
              <span className="red-tag">FEATURE</span>
              <span className="meta-text">{featuredArticle.venue} / {new Date(featuredArticle.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
            </div>

            {/* Massive headline OVER the image */}
            <div className="relative">
              <div className="relative h-[280px] sm:h-[360px] lg:h-[400px] overflow-hidden">
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  fill
                  className="object-cover article-image group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                {/* Dark gradient overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/60 to-transparent" />
              </div>
              {/* Title overlapping the image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <h1 className="font-display font-bold uppercase leading-none group-hover:text-accent-red transition-colors duration-75 text-text-primary" style={{ fontSize: 'clamp(28px, 5vw, 64px)', lineHeight: '0.9', letterSpacing: '-0.02em' }}>
                  {featuredArticle.title}
                </h1>
              </div>
            </div>

            <div className="p-6 lg:p-8 pt-4">
              {/* Red artist line */}
              <p className="font-display text-accent-red uppercase font-bold tracking-tight mb-3" style={{ fontSize: 'clamp(18px, 2.5vw, 32px)' }}>
                {featuredArticle.artist.name}
              </p>
              {/* Excerpt */}
              <p className="text-text-secondary text-sm leading-relaxed max-w-[55ch] mb-4">
                {featuredArticle.excerpt}
              </p>
              {/* Genre tags */}
              <div className="flex gap-2">
                {featuredArticle.genre.map((genre) => (
                  <span key={genre} className="font-mono text-[10px] uppercase tracking-wider text-accent-red border border-accent-red/30 px-2 py-0.5">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          {/* SIDE CARDS — stacked right */}
          {sideArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group brutal-card block overflow-hidden"
            >
              <div className="relative h-[180px] lg:h-[200px] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover article-image group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
                <div className="absolute top-0 left-0">
                  <span className="red-tag">{article.genre[0]}</span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="font-display font-bold uppercase leading-none mb-2 group-hover:text-accent-red transition-colors duration-75 line-clamp-3" style={{ fontSize: 'clamp(18px, 2vw, 28px)', lineHeight: '0.95', letterSpacing: '-0.01em' }}>
                  {article.title}
                </h2>
                <p className="font-display text-accent-red uppercase text-sm font-bold tracking-tight mb-2">
                  {article.artist.name}
                </p>
                <p className="text-text-secondary text-xs leading-relaxed mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="meta-text">
                  {article.venue} · {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                </div>
              </div>
            </Link>
          ))}

          {/* RED ACCENT CARD — small promo block */}
          <div className="hidden lg:block bg-accent-red p-5 relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-mono text-[10px] uppercase tracking-widest text-black/60 mb-2">COMING UP</p>
              <p className="font-display font-bold text-black uppercase text-xl leading-tight mb-2">BREAKAWAY NYC</p>
              <p className="font-display font-bold text-black/70 uppercase text-sm">TIËSTO · OPPIDAN · LILLY PALMER</p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-black/50 mt-3">JUL 17 · UNDER THE K BRIDGE · BK</p>
            </div>
          </div>
        </div>
      </section>

      {/* JOIN THE NOISE — Red brutalist newsletter */}
      <section className="noise-section py-14 lg:py-20 mt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-black/50 mb-3">NEWSLETTER</p>
              <h2 className="font-display font-bold text-black uppercase leading-none" style={{ fontSize: 'clamp(48px, 8vw, 100px)', lineHeight: '0.82', letterSpacing: '-0.03em' }}>
                JOIN THE<br />NOISE
              </h2>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 lg:max-w-lg w-full lg:w-auto">
              <input
                type="email"
                placeholder="YOUR@EMAIL.COM"
                className="flex-1 px-5 py-4 bg-black/20 border-2 border-black/40 text-black font-mono text-sm uppercase placeholder:text-black/40 focus:outline-none focus:border-black transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-black text-accent-red font-display font-bold uppercase tracking-wider text-lg hover:bg-black/80 transition-colors duration-75"
              >
                SUBSCRIBE →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ALL COVERAGE */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-14">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="font-display font-bold text-3xl sm:text-4xl uppercase tracking-tight whitespace-nowrap">ALL COVERAGE</h2>
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
