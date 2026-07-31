import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useNews } from "@/hooks/useNews";
import { KickerRule } from "@/components/margin/EditorialRow";
import { longDate, timeAgo } from "@/lib/time";

const fallbackImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80";

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { articles, loading } = useNews();
  const [copied, setCopied] = useState(false);

  const article = useMemo(
    () => articles.find((a) => a.slug === slug),
    [articles, slug],
  );

  const related = useMemo(() => {
    if (!article) return [];
    return articles
      .filter((a) => a.source === article.source && a.id !== article.id)
      .slice(0, 3);
  }, [articles, article]);

  if (loading) {
    return (
      <div className="page-enter px-6 py-12 md:px-14">
        <div className="mx-auto max-w-[680px] space-y-5">
          <div className="h-12 w-2/3 animate-pulse bg-bg-surface" />
          <div className="h-64 animate-pulse bg-bg-surface" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page-enter px-6 pb-20 pt-12 md:px-14">
        <SEOHead title="Article Not Found" description="This article could not be found." />
        <h1 className="font-editorial text-[62px] font-normal leading-none text-text-primary">
          Not found
        </h1>
        <p className="mt-4 max-w-[460px] font-editorial text-lg italic text-text-secondary">
          The story you're looking for has left the newsstand.
        </p>
        <Link
          to="/news"
          className="mt-7 inline-block border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-primary hover:text-accent"
        >
          Back to the front of book →
        </Link>
      </div>
    );
  }

  const paragraphs = article.content
    ? article.content.split("\n\n").filter(Boolean)
    : [];
  const readMinutes = Math.max(
    1,
    Math.round(
      (article.content ?? article.excerpt).split(/\s+/).length / 200,
    ),
  );

  const share = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: article.title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="page-enter grid gap-12 px-6 pb-20 pt-12 md:px-14 lg:grid-cols-[220px_1fr_220px]">
      <SEOHead
        title={article.title}
        description={article.excerpt}
        ogImage={article.image}
        canonicalUrl={`https://revd.com/news/${article.slug}`}
      />

      {/* Left margin — running metadata */}
      <div className="font-mono text-[9px] uppercase leading-[2.2] tracking-[0.2em] text-text-muted max-lg:hidden">
        {article.source}
        <br />
        News wire
        <br />
        {readMinutes} min read
      </div>

      {/* Measure */}
      <div className="mx-auto w-full max-w-[680px]">
        <KickerRule
          kicker={article.source}
          info={longDate(article.publishedAt)}
          tracking="0.24em"
        />
        <h1 className="mt-[18px] font-editorial text-[36px] font-normal leading-[1.02] tracking-[-0.02em] text-text-primary md:text-[62px]">
          {article.title}
        </h1>
        {article.excerpt && (
          <p
            className="mt-5 text-lg leading-relaxed text-text-secondary md:text-[19px]"
            style={{ textWrap: "pretty" }}
          >
            {article.excerpt}
          </p>
        )}
        <p className="mt-[22px] border-t border-border-alpha pt-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary">
          Via {article.source} · {timeAgo(article.publishedAt)}
        </p>

        <img
          src={article.image}
          alt={article.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
          className="mt-[30px] block w-full object-cover"
          style={{ aspectRatio: "3 / 2" }}
        />
        <p className="mt-2.5 font-editorial text-[13px] italic text-text-secondary">
          {article.title} — {article.source}.
        </p>

        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 64)}
              className="mt-6 text-[17px] leading-[1.75] text-text-primary"
              style={{ textWrap: "pretty" }}
            >
              {paragraph}
            </p>
          ))
        ) : (
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            This dispatch continues at {article.source}
          </p>
        )}

        {/* More from the same desk */}
        {related.length > 0 && (
          <div className="mt-10 border-t border-accent pt-[22px]">
            <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
              More from {article.source}
            </div>
            <div className="mt-5 grid gap-7 md:grid-cols-3">
              {related.map((a) => (
                <Link key={a.id} to={`/news/${a.slug}`} className="group block">
                  <img
                    src={a.image}
                    alt={a.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                    className="block w-full object-cover"
                    style={{ aspectRatio: "3 / 2" }}
                  />
                  <h4 className="mt-2.5 font-editorial text-[21px] font-normal leading-[1.15] text-text-primary transition-colors duration-150 group-hover:text-accent">
                    {a.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right margin — actions */}
      <div className="flex flex-row gap-6 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted lg:flex-col lg:text-right lg:leading-[2.2]">
        <button
          onClick={share}
          className="cursor-pointer text-left uppercase tracking-[0.2em] transition-colors duration-100 hover:text-accent lg:text-right"
        >
          {copied ? "Copied ✓" : "Share"}
        </button>
        <Link
          to="/news"
          className="transition-colors duration-100 hover:text-accent"
        >
          All news
        </Link>
      </div>
    </article>
  );
}
