import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const articlesDirectory = path.join(process.cwd(), 'content/articles');

export interface ArticleMetadata {
  title: string;
  slug: string;
  date: string;
  venue: string;
  location: string;
  featured: boolean;
  image: string;
  excerpt: string;
  genre: string[];
  artist: {
    name: string;
    realName?: string;
    instagram: string;
    soundcloud: string;
    spotify: string;
    residentadvisor?: string;
    beatport?: string;
  };
}

export interface Article extends ArticleMetadata {
  content: string;
}

export function getAllArticles(): Article[] {
  const fileNames = fs.readdirSync(articlesDirectory);
  const articles = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const fullPath = path.join(articlesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        ...(data as ArticleMetadata),
        content,
      };
    });

  return articles.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getArticleBySlug(slug: string): Article | null {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      ...(data as ArticleMetadata),
      content,
    };
  } catch {
    return null;
  }
}

export function getAllArtists() {
  const articles = getAllArticles();
  const artistsMap = new Map();

  articles.forEach((article) => {
    const artistKey = article.artist.name.toLowerCase();
    if (!artistsMap.has(artistKey)) {
      artistsMap.set(artistKey, {
        name: article.artist.name,
        realName: article.artist.realName,
        instagram: article.artist.instagram,
        soundcloud: article.artist.soundcloud,
        spotify: article.artist.spotify,
        residentadvisor: article.artist.residentadvisor,
        beatport: article.artist.beatport,
        genres: Array.from(new Set(article.genre)),
        image: article.image,
        articles: [article],
      });
    } else {
      const artist = artistsMap.get(artistKey);
      artist.articles.push(article);
      artist.genres = Array.from(new Set([...artist.genres, ...article.genre]));
    }
  });

  return Array.from(artistsMap.values()).filter(a => a.name !== 'LOWEND Editorial');
}
