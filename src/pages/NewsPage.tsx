import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useNews } from "@/hooks/useNews";
import { KickerRule } from "@/components/margin/EditorialRow";
import { timeAgo } from "@/lib/time";
import type { Article } from "@/types/news";

const ARTICLES_PER_PAGE = 9;

/** Category word — Margin's filter chip, styled as an underlined word. */
function CategoryWord({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer border-b pb-[3px] font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-100 ${
        active
          ? "border-accent text-accent"
          : "border-transparent text-text-secondary hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}

function WellItem({ article }: { article: Article }) {
  return (
    <Link
      to={`/news/${article.slug}`}
      className="group block border-b border-border-alpha py-[30px]"
    >
      <img
        src={article.image}
        alt={article.title}
        loading="lazy"
        className="block w-full object-cover"
        style={{ aspectRatio: "3 / 2" }}
      />
      <div className="mt-3.5 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
        <span>{article.source}</span>
        <span className="text-text-secondary">{timeAgo(article.publishedAt)}</span>
      </div>
      <h3 className="mt-2.5 font-editorial text-[27px] font-normal leading-[1.12] text-text-primary transition-colors duration-150 group-hover:text-accent">
        {article.title}
      </h3>
      <p className="mt-2 font-editorial text-sm italic text-text-secondary">
        {article.source}
      </p>
    </Link>
  );
}

export default function NewsPage() {
  const { articles, loading, error } = useNews();
  const [activeSource, setActiveSource] = useState("All");
  const [page, setPage] = useState(1);

  // The real feed carries sources, not editorial categories — the category
  // words filter by source.
  const sources = useMemo(
    () => ["All", ...Array.from(new Set(articles.map((a) => a.source)))],
    [articles],
  );

  const filtered = useMemo(
    () =>
      activeSource === "All"
        ? articles
        : articles.filter((a) => a.source === activeSource),
    [articles, activeSource],
  );

  const lead = filtered[0];
  const rest = useMemo(() => filtered.slice(1), [filtered]);
  const totalPages = Math.max(1, Math.ceil(rest.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * ARTICLES_PER_PAGE;
    return rest.slice(start, start + ARTICLES_PER_PAGE);
  }, [rest, currentPage]);

  return (
    <div className="page-enter px-6 pb-[72px] pt-12 md:px-14">
      <SEOHead
        title="News"
        description="Latest automotive news, reviews, and industry coverage from the sources enthusiasts actually trust."
        canonicalUrl="https://revd.com/news"
      />

      {/* Front-of-book header */}
      <div className="flex flex-col gap-5 border-b border-accent pb-[18px] md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent">
            Latest coverage
          </div>
          <h1 className="mt-2.5 font-editorial text-[44px] font-normal leading-none tracking-[-0.015em] text-text-primary md:text-[66px]">
            News
          </h1>
        </div>
        <div className="flex flex-wrap items-baseline gap-5 pb-1.5">
          {sources.map((s) => (
            <CategoryWord
              key={s}
              label={s}
              active={activeSource === s}
              onClick={() => {
                setActiveSource(s);
                setPage(1);
              }}
            />
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-11 py-10 md:grid-cols-2">
          <div className="h-72 animate-pulse bg-bg-surface" />
          <div className="h-72 animate-pulse bg-bg-surface" />
        </div>
      ) : error ? (
        <p className="py-16 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-signal-red">
          {error}
        </p>
      ) : !lead ? (
        <p className="py-16 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
          Nothing on the wire{activeSource !== "All" ? ` from ${activeSource}` : ""}
        </p>
      ) : (
        <>
          {/* Lead story */}
          <Link
            to={`/news/${lead.slug}`}
            className="group grid gap-11 border-b border-border-alpha py-10 md:grid-cols-2"
          >
            <div className="flex flex-col justify-center">
              <KickerRule
                kicker={lead.source}
                info={timeAgo(lead.publishedAt)}
                tracking="0.22em"
              />
              <h2 className="mt-4 font-editorial text-[32px] font-normal leading-[1.04] tracking-[-0.015em] text-text-primary transition-colors duration-150 group-hover:text-accent md:text-[50px]">
                {lead.title}
              </h2>
              {lead.excerpt && (
                <p
                  className="mt-[18px] max-w-[480px] text-base leading-[1.65] text-text-secondary"
                  style={{ textWrap: "pretty" }}
                >
                  {lead.excerpt}
                </p>
              )}
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                {lead.source}
              </p>
            </div>
            <div>
              <img
                src={lead.image}
                alt={lead.title}
                className="block w-full object-cover"
                style={{ aspectRatio: "3 / 2" }}
              />
              <p className="mt-2.5 font-editorial text-[13px] italic text-text-secondary">
                {lead.source} · {timeAgo(lead.publishedAt)}
              </p>
            </div>
          </Link>

          {/* Three-column well */}
          <div className="grid gap-x-10 md:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((article) => (
              <WellItem key={article.id} article={article} />
            ))}
          </div>

          {/* Pagination — centred words and a serif numeral, not buttons */}
          {totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-[26px] pt-[34px]"
              aria-label="Pagination"
            >
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary transition-colors duration-100 hover:text-accent disabled:pointer-events-none disabled:opacity-30"
              >
                Previous
              </button>
              <span className="font-editorial text-[22px] text-accent">
                {currentPage}
              </span>
              <span className="font-mono text-[10px] text-text-secondary">
                / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-100 disabled:pointer-events-none disabled:opacity-30 ${
                  currentPage < totalPages
                    ? "border-b border-accent pb-[3px] text-text-primary hover:text-accent"
                    : "text-text-secondary"
                }`}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
