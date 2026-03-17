import { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';

const SITE_URL = 'https://lowend-nyc.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const now = new Date();
  
  // Static pages with proper priorities
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/artists`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Article pages with proper priorities
  const articlePages = articles.map((article) => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly' as const,
    priority: article.featured ? 0.95 : 0.9,
  }));

  // Genre pages (if implemented)
  const genrePages = [
    'techno', 'house', 'garage', 'bass', 'dnb', 'ambient'
  ].map(genre => ({
    url: `${SITE_URL}/genre/${genre}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Venue pages (if implemented)
  const venuePages = [
    'knockdown-center',
    'brooklyn-mirage',
    'basement',
    'elsewhere',
    'nowadays',
  ].map(venue => ({
    url: `${SITE_URL}/venue/${venue}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  return [...staticPages, ...articlePages, ...genrePages, ...venuePages];
}
