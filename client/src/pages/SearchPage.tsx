// client/src/pages/SearchPage.tsx
import { useState, useEffect } from 'react';
import { useSearch } from '../hooks/useSearch';
import { SearchFilters } from '../components/SearchFilters';
import { ProductList } from '../components/ProductList';
import { Pagination } from '../components/Pagination';
import type { SearchFilters as FilterType } from '../types/search';

export default function SearchPage() {
  const { products, loading, total, currentPage, totalPages, performSearch } = useSearch();
  const [currentFilters, setCurrentFilters] = useState<FilterType>({});

  // Load all products on initial mount (empty filters)
  useEffect(() => {
    // Check if there are URL query params (e.g., from a shared link)
    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get('keyword') || undefined;
    const category = urlParams.get('category') || undefined;
    const minPrice = urlParams.get('minPrice') ? Number(urlParams.get('minPrice')) : undefined;
    const maxPrice = urlParams.get('maxPrice') ? Number(urlParams.get('maxPrice')) : undefined;
    const radius = urlParams.get('radius') ? Number(urlParams.get('radius')) : undefined;

    const initialFilters: FilterType = {
      keyword,
      category,
      minPrice,
      maxPrice,
      radius,
      page: 1,
      limit: 10,
    };
    setCurrentFilters(initialFilters);
    performSearch(initialFilters);
  }, []); // Empty dependency array = run once on mount

  const handleSearch = (filters: FilterType) => {
    setCurrentFilters(filters);
    performSearch(filters);
  };

  const handlePageChange = (newPage: number) => {
    performSearch({ ...currentFilters, page: newPage });
  };

  return (
    <div className="min-h-screen bg-[#e8eaf0] py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-[#37392d] mb-2">Find local products</h1>
        <p className="text-[#646657] mb-6">Discover what your neighbors are selling near you</p>

        <SearchFilters onSearch={handleSearch} initialParams={currentFilters} />

        <div className="mt-2 text-sm text-[#646657]">
          {!loading && total > 0 && `Found ${total} product(s)`}
        </div>

        <ProductList products={products} loading={loading} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}