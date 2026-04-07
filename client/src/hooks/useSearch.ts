// client/src/hooks/useSearch.ts
import { useState, useCallback } from 'react';
import type { SearchFilters, SearchResponse, Product } from '../types/search';

export function useSearch() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const performSearch = useCallback(async (params: SearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params.keyword) query.append('keyword', params.keyword);
      if (params.category) query.append('category', params.category);
      if (params.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
      if (params.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
      if (params.lat !== undefined) query.append('lat', String(params.lat));
      if (params.lng !== undefined) query.append('lng', String(params.lng));
      if (params.radius !== undefined) query.append('radius', String(params.radius));
      if (params.page) query.append('page', String(params.page));
      if (params.limit) query.append('limit', String(params.limit));

      const res = await fetch(`/api/search?${query.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const data: SearchResponse = await res.json();
      setProducts(data.products);
      setTotal(data.total);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return { products, loading, error, total, currentPage, totalPages, performSearch };
}