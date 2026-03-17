import Link from 'next/link';
import Image from 'next/image';
import { getAllArticles, calculateReadingTime } from '@/lib/articles';
import NewsletterForm from '@/components/NewsletterForm';

export default function HomePage() {
  const articles = getAllArticles();
  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const gridArticles = articles.filter((a) => a.slug !== featuredArticle.slug);

  return (
    <main>
      {/* HERO SECTION — Full width image with overlaid headline */}
      <section className="relative w-full">
        <Link href={`/articles/${featuredArticle.slug}`} className="group block relative">
          {/* Full width image */}
          <div className="relative h-[500px] lg:h-[600px] w-full overflow-hidden">
            <Image
              src={featuredArticle.image}
              alt={featuredArticle.title}
              fill
              className="object-cover article-image transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              unoptimized
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
            
            {/* FEATURE tag */}
            <div className="absolute top-4 left-4">
              <span className="red-tag">FEATURE</span>
            </div>

            {/* Content overlaid at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:px-6 lg:px-12 pb-6">
              {/* Red artist name */}
              <p className="font-display text-accent-red uppercase font-bold mb-2 transition-colors duration-300 group-hover:text-[#FF5555]" style={{ fontSize: 'clamp(14px, 2vw, 24px)' }}>
                {featuredArticle.artist.name === 'LOWEND Editorial' ? 'EDITORIAL' : featuredArticle.artist.name}
              </p>
              {/* Massive headline */}
              <h1 
                className="font-display uppercase leading-[0.95] text-white mb-4 transition-colors duration-300 group-hover:text-[#FF2B2B]"
                style={{ fontSize: 'clamp(28px, 7vw, 96px)', fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                {featuredArticle.title}
              </h1>
              {/* Metadata row */}
              <div className="meta-text flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>POSTED {new Date(featuredArticle.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                <span className="hidden sm:inline">·</span>
                <span>{calculateReadingTime(featuredArticle.content)}</span>
                <span className="hidden sm:inline">·</span>
                <span>{featuredArticle.venue}</span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* COMING UP — Next week's NYC events */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display font-bold uppercase tracking-tight whitespace-nowrap text-accent-red" style={{ fontSize: 'clamp(20px, 3vw, 32px)', fontWeight: 700 }}>COMING UP</h2>
          <div className="flex-1 h-[1px] bg-accent-red/30" />
          <span className="meta-text whitespace-nowrap">MAR 17-23</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* March 18 */}
          <Link href="/articles/eli-escobar-boy-cordero-le-bain" className="group block overflow-hidden border border-[#222] hover:border-[#FF2B2B] transition-all duration-500 ease-out">
            <div className="relative h-[140px] overflow-hidden">
              <Image
                src="/images/eli-escobar-lebain.png"
                alt="Eli Escobar & Boy Cordero at Le Bain"
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
                unoptimized
              />
              <div className="absolute top-0 left-0">
                <span className="red-tag">MAR 18</span>
              </div>
            </div>
            <div className="p-3">
              <p className="font-display text-accent-red uppercase text-xs font-bold tracking-wider mb-1 group-hover:text-[#FF5555] transition-colors duration-300">
                ELI ESCOBAR
              </p>
              <h3 className="font-display font-bold uppercase leading-tight mb-1 group-hover:text-accent-red transition-colors duration-300 line-clamp-2" style={{ fontSize: 'clamp(13px, 1.2vw, 18px)' }}>
                House Heat at Le Bain
              </h3>
              <div className="meta-text">Le Bain · House/Disco</div>
            </div>
          </Link>

          {/* March 20 - Indira */}
          <Link href="/articles/indira-paganotto-knockdown-center" className="group block overflow-hidden border border-[#222] hover:border-[#FF2B2B] transition-all duration-500 ease-out">
            <div className="relative h-[140px] overflow-hidden">
              <Image
                src="/images/indira-paganotto.png"
                alt="Indira Paganotto at Knockdown Center"
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
                unoptimized
              />
              <div className="absolute top-0 left-0">
                <span className="red-tag">MAR 20</span>
              </div>
            </div>
            <div className="p-3">
              <p className="font-display text-accent-red uppercase text-xs font-bold tracking-wider mb-1 group-hover:text-[#FF5555] transition-colors duration-300">
                INDIRA PAGANOTTO
              </p>
              <h3 className="font-display font-bold uppercase leading-tight mb-1 group-hover:text-accent-red transition-colors duration-300 line-clamp-2" style={{ fontSize: 'clamp(13px, 1.2vw, 18px)' }}>
                Acid Mayhem in Queens
              </h3>
              <div className="meta-text">Knockdown Center · Acid Techno</div>
            </div>
          </Link>

          {/* March 20 - Prospa */}
          <Link href="/articles/teksupport-prophecy-prospa-josh-baker" className="group block overflow-hidden border border-[#222] hover:border-[#FF2B2B] transition-all duration-500 ease-out">
            <div className="relative h-[140px] overflow-hidden">
              <Image
                src="/images/prospa-brooklyn.png"
                alt="Prospa at Brooklyn Storehouse"
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
                unoptimized
              />
              <div className="absolute top-0 left-0">
                <span className="red-tag">MAR 20</span>
              </div>
            </div>
            <div className="p-3">
              <p className="font-display text-accent-red uppercase text-xs font-bold tracking-wider mb-1 group-hover:text-[#FF5555] transition-colors duration-300">
                PROSPA
              </p>
              <h3 className="font-display font-bold uppercase leading-tight mb-1 group-hover:text-accent-red transition-colors duration-300 line-clamp-2" style={{ fontSize: 'clamp(13px, 1.2vw, 18px)' }}>
                Teksupport x Prophecy
              </h3>
              <div className="meta-text">Brooklyn Storehouse · Progressive</div>
            </div>
          </Link>

          {/* March 21 - Carl Cox */}
          <Link href="/articles/carl-cox-nicole-moudaber-ilario-alicante-brooklyn-storehouse" className="group block overflow-hidden border border-[#222] hover:border-[#FF2B2B] transition-all duration-500 ease-out">
            <div className="relative h-[140px] overflow-hidden">
              <Image
                src="/images/carl-cox-brooklyn.png"
                alt="Carl Cox at Brooklyn Storehouse"
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
                unoptimized
              />
              <div className="absolute top-0 left-0">
                <span className="red-tag">MAR 21</span>
              </div>
            </div>
            <div className="p-3">
              <p className="font-display text-accent-red uppercase text-xs font-bold tracking-wider mb-1 group-hover:text-[#FF5555] transition-colors duration-300">
                CARL COX
              </p>
              <h3 className="font-display font-bold uppercase leading-tight mb-1 group-hover:text-accent-red transition-colors duration-300 line-clamp-2" style={{ fontSize: 'clamp(13px, 1.2vw, 18px)' }}>
                Techno Royalty Returns
              </h3>
              <div className="meta-text">Brooklyn Storehouse · Techno</div>
            </div>
          </Link>
        </div>
      </section>

      {/* GRID BELOW HERO — Dense 3-column layout */}
      <section className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {gridArticles.map((article, index) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className={`group block overflow-hidden ${index === 2 ? 'bg-[#FF2B2B]' : 'border border-[#222] hover:border-[#FF2B2B]'} transition-all duration-500 ease-out`}
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
              <div className={`p-3 ${index === 2 ? 'text-black' : ''}`}>
                <p className={`font-display uppercase font-bold text-xs mb-1 ${index === 2 ? 'text-black/70 group-hover:text-black' : 'text-accent-red group-hover:text-[#FF5555]'} transition-colors duration-300`}>
                  {article.artist.name === 'LOWEND Editorial' ? 'EDITORIAL' : article.artist.name}
                </p>
                <h3 
                  className={`font-display font-bold uppercase leading-tight mb-2 line-clamp-2 ${index === 2 ? 'group-hover:text-black/80' : 'group-hover:text-accent-red'} transition-colors duration-300`}
                  style={{ fontSize: 'clamp(14px, 1.5vw, 22px)' }}
                >
                  {article.title}
                </h3>
                <div className={`meta-text ${index === 2 ? 'text-black/60' : ''}`}>
                  {article.venue} · {article.genre[0].toUpperCase()}
                </div>
              </div>
            </Link>
          ))}
          
          {/* Red accent card for Breakaway/Pacha promo */}
          <div className="bg-[#FF2B2B] p-4 flex flex-col justify-between min-h-[280px]">
            <div>
              <p className="font-display font-bold text-black uppercase text-xs mb-2">EVENT PREVIEW</p>
              <h3 className="font-display font-bold text-black uppercase leading-tight" style={{ fontSize: 'clamp(18px, 2vw, 28px)' }}>
                BREAKAWAY NYC
              </h3>
              <p className="text-black/80 text-sm mt-2">The biggest bass music event of the summer returns to New York.</p>
            </div>
            <div className="meta-text text-black/60">
              AUG 15-17 · RANDALL&apos;S ISLAND
            </div>
          </div>
        </div>
      </section>

      {/* JOIN THE NOISE — Full-bleed red block */}
      <section className="relative w-full bg-[#FF2B2B] py-12 lg:py-16 mt-8 noise-section">
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
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="font-display font-bold uppercase tracking-tight whitespace-nowrap" style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700 }}>ALL COVERAGE</h2>
          <div className="flex-1 h-[1px] bg-border" />
          <span className="meta-text whitespace-nowrap">{articles.length} ARTICLES</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group block overflow-hidden border border-[#222] hover:border-[#FF2B2B] transition-all duration-500 ease-out"
            >
              <div className="relative h-[200px] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover article-image transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:grayscale-[30%]"
                  unoptimized
                />
                <div className="absolute top-0 left-0 flex">
                  <span className="red-tag">{article.genre[0]}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="font-display text-accent-red uppercase text-xs font-bold tracking-wider mb-1 group-hover:text-[#FF5555] transition-colors duration-300">
                  {article.artist.name === 'LOWEND Editorial' ? 'EDITORIAL' : article.artist.name}
                </p>
                <h3 className="font-display font-bold uppercase leading-tight mb-2 group-hover:text-accent-red transition-colors duration-300 line-clamp-2" style={{ fontSize: 'clamp(14px, 1.5vw, 22px)' }}>
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
