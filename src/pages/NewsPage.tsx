import { useState, useMemo } from "react";
import CategoryFilter from "@/components/ui/CategoryFilter";
import ArticleCard from "@/components/news/ArticleCard";
import SEOHead from "@/components/ui/SEOHead";
import LoadingState from "@/components/ui/LoadingState";
import { useNews } from "@/hooks/useNews";

const CATEGORIES = [
  "All",
  "Supercars",
  "JDM",
  "European",
  "Muscle",
  "Electric",
  "Motorsport",
];

const ARTICLES_PER_PAGE = 6;

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);

  const { articles, loading, error } = useNews();

  const filtered = useMemo(() => {
    if (activeCategory === "All") return articles;
    return articles.filter((a) => a.category === activeCategory);
  }, [articles, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ARTICLES_PER_PAGE;
    return filtered.slice(start, start + ARTICLES_PER_PAGE);
  }, [filtered, currentPage]);

  function handleCategoryChange(category: string) {
    setActiveCategory(category);
    setPage(1);
  }

  return (
    <div className="page-enter">
      <SEOHead
        title="News"
        description="Latest automotive news, reviews, and industry coverage from the world's best sources. Supercars, JDM, European, Muscle, Electric, and Motorsport."
        canonicalUrl="https://revd.com/news"
      />

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.15em] text-accent-red">
            Latest Coverage
          </p>
          <h1 className="font-display mt-2 text-3xl uppercase tracking-wider text-text-primary sm:text-4xl">
            News
          </h1>
          <p className="font-body mt-2 max-w-xl text-base leading-relaxed text-text-secondary">
            The latest from the automotive world — curated from the sources
            enthusiasts actually trust.
          </p>
        </header>

        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            categories={CATEGORIES}
            active={activeCategory}
            onChange={handleCategoryChange}
          />
        </div>

        {/* Article Grid */}
        {loading ? (
          <LoadingState />
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-sm text-accent-red">{error}</p>
          </div>
        ) : paginatedArticles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-text-muted">
              No articles found in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {paginatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-10 flex items-center justify-center gap-3"
            aria-label="Pagination"
          >
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:border-accent-red/40 hover:text-text-primary disabled:pointer-events-none disabled:opacity-30"
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
              Previous
            </button>

            <span className="font-mono text-xs font-medium tabular-nums text-text-muted">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-10 items-center gap-1.5 rounded-lg border border-border bg-bg-surface px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary transition-colors hover:border-accent-red/40 hover:text-text-primary disabled:pointer-events-none disabled:opacity-30"
            >
              Next
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
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
