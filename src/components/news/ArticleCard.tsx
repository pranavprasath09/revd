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
      className="group flex gap-4 rounded-xl border border-border bg-bg-surface p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10"
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:h-28 sm:w-36">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
            {article.category}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{timeAgo(article.publishedAt)}</span>
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug tracking-tight text-text-primary transition-colors group-hover:text-accent">
          {article.title}
        </h3>
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-text-muted">{article.source}</p>
      </div>
    </Link>
  );
}
