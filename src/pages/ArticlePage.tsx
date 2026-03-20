import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import Badge from "@/components/ui/Badge";
import ArticleCard from "@/components/news/ArticleCard";
import LoadingState from "@/components/ui/LoadingState";
import { useNews } from "@/hooks/useNews";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { articles, loading } = useNews();

  const article = useMemo(
    () => articles.find((a) => a.slug === slug),
    [articles, slug],
  );

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return articles
      .filter((a) => a.category === article.category && a.id !== article.id)
      .slice(0, 3);
  }, [articles, article]);

  if (loading) {
    return <LoadingState message="Loading article…" />;
  }

  if (!article) {
    return (
      <>
        <SEOHead title="Article Not Found" description="This article could not be found." />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-display text-2xl uppercase tracking-wide text-text-primary">
            Article not found
          </h1>
          <p className="font-body mt-3 text-sm text-text-secondary">
            The article you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/news"
            className="font-body mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-red transition-colors hover:text-accent-hover"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 3L5 8l5 5" />
            </svg>
            Back to News
          </Link>
        </div>
      </>
    );
  }

  const paragraphs = article.content
    ? article.content.split("\n\n").filter(Boolean)
    : [];

  return (
    <div className="page-enter">
      <SEOHead
        title={article.title}
        description={article.excerpt}
        ogImage={article.image}
        canonicalUrl={`https://revd.com/news/${article.slug}`}
      />

      <article className="pb-20">
        {/* Back link */}
        <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
          <Link
            to="/news"
            className="font-body inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted transition-colors hover:text-accent-red"
          >
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 3L5 8l5 5" />
            </svg>
            Back to News
          </Link>
        </div>

        {/* Hero Image */}
        <div className="mx-auto mt-6 max-w-4xl px-4 sm:px-6">
          <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border">
            <img
              src={article.image}
              alt={article.title}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"; }}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Article Header */}
        <header className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Badge variant="tag">{article.category}</Badge>
            <span className="font-body text-[11px] font-medium uppercase tracking-wider text-text-muted">
              {article.source}
            </span>
            <span className="font-body text-[11px] text-text-muted" aria-hidden="true">
              &middot;
            </span>
            <time
              dateTime={article.publishedAt}
              className="font-mono text-[11px] font-medium uppercase tracking-wider text-text-muted"
            >
              {formatDate(article.publishedAt)}
            </time>
          </div>

          <h1 className="font-display mt-5 text-2xl uppercase tracking-wide leading-tight text-text-primary sm:text-3xl lg:text-4xl">
            {article.title}
          </h1>

          <p className="font-body mt-4 text-base leading-relaxed text-text-secondary sm:text-lg">
            {article.excerpt}
          </p>

          <hr className="mt-8 border-border" />
        </header>

        {/* Article Body */}
        <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
          <div className="space-y-6">
            {paragraphs.map((paragraph: string, index: number) => (
              <p
                key={index}
                className="font-body text-base leading-relaxed text-text-secondary sm:text-[17px] sm:leading-[1.75]"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <aside className="mx-auto mt-16 max-w-3xl px-4 sm:px-6">
            <hr className="mb-10 border-border" />
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.15em] text-accent-red">
              More in {article.category}
            </p>
            <h2 className="section-label mt-2">
              Related Articles
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4">
              {relatedArticles.map((related) => (
                <ArticleCard key={related.id} article={related} />
              ))}
            </div>
          </aside>
        )}
      </article>
    </div>
  );
}
