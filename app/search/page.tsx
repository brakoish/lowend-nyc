import type { Metadata } from 'next';
import Search from '@/components/Search';

export const metadata: Metadata = {
  title: 'Search Articles',
  description: 'Search LOWEND NYC articles by keyword, genre, or venue.',
};

export default function SearchPage() {
  return (
    <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
      <h1 className="font-display uppercase text-3xl md:text-4xl mb-8">
        Search Articles
      </h1>
      <Search />
    </main>
  );
}
