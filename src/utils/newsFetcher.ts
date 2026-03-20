import type { Article } from "@/types/news";

const RSS_URL =
  "https://api.rss2json.com/v1/api.json?rss_url=https://www.motor1.com/rss/news/all/";

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

export async function fetchNews(): Promise<Article[]> {
  const res = await fetch(RSS_URL);
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);

  const data = await res.json();
  if (data.status !== "ok" || !Array.isArray(data.items)) {
    throw new Error("Invalid RSS response");
  }

  return data.items.map((item: RssItem): Article => {
    const slug = slugify(item.title);
    const image =
      item.thumbnail || item.enclosure?.link || FALLBACK_IMAGE;

    return {
      id: slug,
      title: item.title,
      slug,
      excerpt: stripHtml(item.description).slice(0, 200),
      source: "Motor1",
      category: "News",
      image,
      publishedAt: item.pubDate,
    };
  });
}
