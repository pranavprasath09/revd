import { useState, useEffect } from "react";
import { fetchNews } from "@/utils/newsFetcher";
import type { Article } from "@/types/news";

let cache: Article[] | null = null;

export function useNews() {
  const [articles, setArticles] = useState<Article[]>(cache || []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache) return;

    fetchNews()
      .then((data) => {
        cache = data;
        setArticles(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { articles, loading, error };
}
