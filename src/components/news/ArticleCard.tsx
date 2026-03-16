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
      className="group flex gap-4 rounded-xl border border-border bg-bg-surface p-3 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-36">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
            {article.category}
          </span>
          <span className="text-xs text-text-muted">{timeAgo(article.publishedAt)}</span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-text-primary group-hover:text-accent transition-colors">
          {article.title}
        </h3>
        <p className="mt-1 text-xs text-text-muted">{article.source}</p>
      </div>
    </Link>
  );
}
