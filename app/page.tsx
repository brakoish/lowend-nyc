import Link from 'next/link';
import Image from 'next/image';
import { getAllArticles, calculateReadingTime } from '@/lib/articles';
import NewsletterForm from '@/components/NewsletterForm';

export default function HomePage() {
  const articles = getAllArticles();
  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const gridArticles = articles.filter((a) => a.slug !== featuredArticle.slug);
  // Take first 4 articles for sidebar
  const sidebarArticles = gridArticles.slice(0, 4);

  return (
    <main>
      {/* HERO SECTION — Two column: large hero left, narrow sidebar right */}
      <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-1">
          {/* Main hero — large left column */}
          <Link href={`/articles/${featuredArticle.slug}`} className="group block relative">
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] w-full overflow-hidden">
              <Image
                src={featuredArticle.image}
                alt={featuredArticle.title}
                fill
                className="object-cover article-image transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                unoptimized
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
              
              {/* FEATURE tag */}
              <div className="absolute top-3 left-3">
                <span className="red-tag">FEATURE</span>
              </div>

              {/* Content overlaid at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:px-4 lg:px-6 pb-4">
                {/* Red artist name */}
                <p className="font-display text-accent-red uppercase font-bold mb-1 transition-colors duration-300 group-hover:text-[#FF3333]" style={{ fontSize: 'clamp(12px, 1.5vw, 18px)' }}>
                  {featuredArticle.artist.name === 'LOWEND Editorial' ? 'EDITORIAL' : featuredArticle.artist.name}
                </p>
                {/* Massive headline */}
                <h1 
                  className="font-display uppercase leading-[0.9] text-white mb-3 transition-colors duration-300 group-hover:text-accent-red"
                  style={{ fontSize: 'clamp(24px, 5vw, 72px)', fontWeight: 800, letterSpacing: '-0.02em' }}
                >
                  {featuredArticle.title}
                </h1>
                {/* Metadata row */}
                <div className="meta-text flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{new Date(featuredArticle.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                  <span>·</span>
                  <span>{calculateReadingTime(featuredArticle.content)}</span>
                  <span>·</span>
                  <span>{featuredArticle.venue}</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Sidebar — narrow right column with stacked cards */}
          <div className="hidden lg:flex flex-col gap-1">
            {sidebarArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="group block relative flex-1 overflow-hidden"
              >
                <div className="relative h-full min-h-[145px] overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover article-image transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:grayscale-[30%]"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
                  
                  {/* Genre tag */}
                  <div className="absolute top-2 left-2">
                    <span className="red-tag text-[10px] px-2 py-1">{article.genre[0]}</span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="font-display text-accent-red uppercase font-bold text-[10px] mb-0.5 group-hover:text-[#FF3333] transition-colors">
                      {article.artist.name === 'LOWEND Editorial' ? 'EDITORIAL' : article.artist.name}
                    </p>
                    <h3 className="font-display font-bold uppercase leading-tight text-white group-hover:text-accent-red transition-colors line-clamp-2" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                      {article.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* COMING UP — Next week's NYC events */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="font-display font-bold uppercase tracking-tight whitespace-nowrap text-accent-red" style={{ fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: 700 }}>COMING UP</h2>
          <div className="flex-1 h-[1px] bg-accent-red/30" />
          <span className="meta-text whitespace-nowrap">MAR 17-23</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
          {/* March 18 */}
          <Link href="/articles/eli-escobar-boy-cordero-le-bain" className="group block overflow-hidden border border-border hover:border-accent-red focus-visible:border-accent-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg transition-all duration-500 ease-out">
            <div className="relative h-[100px] sm:h-[120px] overflow-hidden">
              <Image
                src="/images/eli-escobar-lebain.png"
                alt="Eli Escobar & Boy Cordero at Le Bain"
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
                unoptimized
              />
              <div className="absolute top-0 left-0">
                <span className="red-tag text-[10px] px-2 py-0.5">MAR 18</span>
              </div>
            </div>
            <div className="p-2">
              <p className="font-display text-accent-red uppercase text-[10px] font-bold tracking-wider mb-0.5 group-hover:text-[#FF3333] transition-colors duration-300">
                ELI ESCOBAR
              </p>
              <h3 className="font-display font-bold uppercase leading-tight mb-0.5 group-hover:text-accent-red transition-colors duration-300 line-clamp-2" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                House Heat at Le Bain
              </h3>
              <div className="meta-text text-[10px]">Le Bain · House/Disco</div>
            </div>
          </Link>

          {/* March 20 - Indira */}
          <Link href="/articles/indira-paganotto-knockdown-center" className="group block overflow-hidden border border-border hover:border-accent-red focus-visible:border-accent-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg transition-all duration-500 ease-out">
            <div className="relative h-[100px] sm:h-[120px] overflow-hidden">
              <Image
                src="/images/indira-paganotto.png"
                alt="Indira Paganotto at Knockdown Center"
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
                unoptimized
              />
              <div className="absolute top-0 left-0">
                <span className="red-tag text-[10px] px-2 py-0.5">MAR 20</span>
              </div>
            </div>
            <div className="p-2">
              <p className="font-display text-accent-red uppercase text-[10px] font-bold tracking-wider mb-0.5 group-hover:text-[#FF3333] transition-colors duration-300">
                INDIRA PAGANOTTO
              </p>
              <h3 className="font-display font-bold uppercase leading-tight mb-0.5 group-hover:text-accent-red transition-colors duration-300 line-clamp-2" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                Acid Mayhem in Queens
              </h3>
              <div className="meta-text text-[10px]">Knockdown Center · Acid Techno</div>
            </div>
          </Link>

          {/* March 20 - Prospa */}
          <Link href="/articles/teksupport-prophecy-prospa-josh-baker" className="group block overflow-hidden border border-border hover:border-accent-red focus-visible:border-accent-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg transition-all duration-500 ease-out">
            <div className="relative h-[100px] sm:h-[120px] overflow-hidden">
              <Image
                src="/images/prospa-brooklyn.png"
                alt="Prospa at Brooklyn Storehouse"
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
                unoptimized
              />
              <div className="absolute top-0 left-0">
                <span className="red-tag text-[10px] px-2 py-0.5">MAR 20</span>
              </div>
            </div>
            <div className="p-2">
              <p className="font-display text-accent-red uppercase text-[10px] font-bold tracking-wider mb-0.5 group-hover:text-[#FF3333] transition-colors duration-300">
                PROSPA
              </p>
              <h3 className="font-display font-bold uppercase leading-tight mb-0.5 group-hover:text-accent-red transition-colors duration-300 line-clamp-2" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                Teksupport x Prophecy
              </h3>
              <div className="meta-text text-[10px]">Brooklyn Storehouse · Progressive</div>
            </div>
          </Link>

          {/* March 21 - Carl Cox */}
          <Link href="/articles/carl-cox-nicole-moudaber-ilario-alicante-brooklyn-storehouse" className="group block overflow-hidden border border-border hover:border-accent-red focus-visible:border-accent-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg transition-all duration-500 ease-out">
            <div className="relative h-[100px] sm:h-[120px] overflow-hidden">
              <Image
                src="/images/carl-cox-brooklyn.png"
                alt="Carl Cox at Brooklyn Storehouse"
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
                unoptimized
              />
              <div className="absolute top-0 left-0">
                <span className="red-tag text-[10px] px-2 py-0.5">MAR 21</span>
              </div>
            </div>
            <div className="p-2">
              <p className="font-display text-accent-red uppercase text-[10px] font-bold tracking-wider mb-0.5 group-hover:text-[#FF3333] transition-colors duration-300">
                CARL COX
              </p>
              <h3 className="font-display font-bold uppercase leading-tight mb-0.5 group-hover:text-accent-red transition-colors duration-300 line-clamp-2" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                Techno Royalty Returns
              </h3>
              <div className="meta-text text-[10px]">Brooklyn Storehouse · Techno</div>
            </div>
          </Link>
        </div>
      </section>

      {/* GRID BELOW HERO — Dense 3-column layout */}
      <section className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {gridArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block overflow-hidden border border-border hover:border-accent-red focus-visible:border-accent-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg transition-all duration-500 ease-out"
            >
              {/* Image */}
              <div className="relative h-[200px] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover article-image transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:grayscale-[30%]"
                  unoptimized
                />
              </div>
              {/* Content */}
              <div className="p-3">
                <p className="font-display uppercase font-bold text-xs mb-1 text-accent-red group-hover:text-[#FF3333] transition-colors duration-300">
                  {article.artist.name === 'LOWEND Editorial' ? 'EDITORIAL' : article.artist.name}
                </p>
                <h3 
                  className="font-display font-bold uppercase leading-tight mb-2 line-clamp-2 group-hover:text-accent-red transition-colors duration-300"
                  style={{ fontSize: 'clamp(14px, 1.5vw, 22px)' }}
                >
                  {article.title}
                </h3>
                <div className="meta-text">
                  {article.venue} · {article.genre[0].toUpperCase()}
                </div>
              </div>
            </Link>
          ))}
          
          {/* Red accent card for Breakaway/Pacha promo */}
          <a href="https://breakawaymusic.com/newyork/" target="_blank" rel="noopener noreferrer" className="bg-accent-red p-4 flex flex-col justify-between min-h-[280px] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg">
            <div>
              <p className="font-display font-bold text-black uppercase text-xs mb-2">EVENT PREVIEW</p>
              <h3 className="font-display font-bold text-black uppercase leading-tight group-hover:underline" style={{ fontSize: 'clamp(18px, 2vw, 28px)' }}>
                BREAKAWAY NYC
              </h3>
              <p className="text-black/80 text-sm mt-2">The biggest bass music event of the summer returns to New York.</p>
            </div>
            <div className="meta-text text-black/60">
              AUG 15-17 · RANDALL&apos;S ISLAND
            </div>
          </a>
        </div>
      </section>

      {/* JOIN THE NOISE — Full-bleed red block */}
      <section className="relative w-full bg-accent-red py-12 lg:py-16 mt-8 noise-section">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1">
              <h2 
                className="font-display font-bold text-black uppercase leading-none"
                style={{ fontSize: 'clamp(36px, 10vw, 120px)' }}
              >
                JOIN THE NOISE
              </h2>
              <p className="text-black/60 mt-3 font-mono text-sm max-w-md">
                Get the latest on NYC&apos;s underground bass scene. New mixes, artist features, and event previews delivered weekly.
              </p>
            </div>
            <div className="flex-1 lg:max-w-lg">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      {/* ALL COVERAGE */}
      <section className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-display font-bold uppercase tracking-tight whitespace-nowrap" style={{ fontSize: 'clamp(18px, 2.5vw, 32px)', fontWeight: 700 }}>ALL COVERAGE</h2>
          <div className="flex-1 h-[1px] bg-border" />
          <span className="meta-text whitespace-nowrap">{articles.length} ARTICLES</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block overflow-hidden border border-border hover:border-accent-red focus-visible:border-accent-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-page-bg transition-all duration-500 ease-out"
            >
              <div className="relative h-[120px] sm:h-[140px] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover article-image transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:grayscale-[30%]"
                  unoptimized
                />
                <div className="absolute top-0 left-0 flex">
                  <span className="red-tag text-[10px] px-2 py-0.5">{article.genre[0]}</span>
                </div>
              </div>
              <div className="p-2">
                <p className="font-display text-accent-red uppercase text-[10px] font-bold tracking-wider mb-0.5 group-hover:text-[#FF3333] transition-colors duration-300">
                  {article.artist.name === 'LOWEND Editorial' ? 'EDITORIAL' : article.artist.name}
                </p>
                <h3 className="font-display font-bold uppercase leading-tight mb-1 group-hover:text-accent-red transition-colors duration-300 line-clamp-2" style={{ fontSize: 'clamp(11px, 1vw, 14px)' }}>
                  {article.title}
                </h3>
                <div className="meta-text text-[10px]">
                  {article.venue} · {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
