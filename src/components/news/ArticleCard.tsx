import { Link } from "react-router-dom";
import type { Article } from "@/types/news";

interface ArticleCardProps {
  article: Article;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      to={`/news/${article.slug}`}
      className="card-corner group relative flex gap-4 rounded-xl border border-border bg-bg-surface p-3 transition-all duration-300 hover:-translate-y-1 hover:border-accent-red/30 hover:shadow-xl hover:shadow-accent-red/10"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-36">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"; }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent-red/10 px-2.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wider text-accent-red">
            {article.category}
          </span>
          <span className="font-mono text-[11px] text-text-muted">{timeAgo(article.publishedAt)}</span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-display text-xl uppercase leading-tight tracking-wide text-text-primary transition-colors group-hover:text-accent-red">
          {article.title}
        </h3>
        <p className="mt-1 font-body text-[11px] font-medium uppercase tracking-wider text-text-muted">{article.source}</p>
      </div>
    </Link>
  );
}
