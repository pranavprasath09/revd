import type { Article } from "@/types/news";

const FEEDS = [
  { url: "https://www.motor1.com/rss/news/all/", source: "Motor1" },
  { url: "https://www.thedrive.com/feed", source: "The Drive" },
  { url: "https://www.topgear.com/car-news/rss", source: "Top Gear" },
  { url: "https://www.roadandtrack.com/rss/all.xml", source: "Road & Track" },
];

const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80";

interface RssItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  enclosure?: { link?: string };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.trim() || "";
}

async function fetchFeed(feedUrl: string, source: string): Promise<Article[]> {
  try {
    const res = await fetch(RSS2JSON + encodeURIComponent(feedUrl));
    if (!res.ok) return [];

    const data = await res.json();
    if (data.status !== "ok" || !Array.isArray(data.items)) return [];

    return data.items.map((item: RssItem): Article => {
      const slug = slugify(item.title);
      const image = item.thumbnail || item.enclosure?.link || FALLBACK_IMAGE;

      return {
        id: slug,
        title: item.title,
        slug,
        excerpt: stripHtml(item.description).slice(0, 200),
        source,
        category: "News",
        image,
        publishedAt: item.pubDate,
      };
    });
  } catch {
    return [];
  }
}

export async function fetchNews(): Promise<Article[]> {
  const results = await Promise.all(
    FEEDS.map((feed) => fetchFeed(feed.url, feed.source))
  );

  const all = results.flat();

  // Deduplicate by title (normalized lowercase)
  const seen = new Set<string>();
  const unique = all.filter((article) => {
    const key = article.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort newest first
  unique.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return unique;
}
