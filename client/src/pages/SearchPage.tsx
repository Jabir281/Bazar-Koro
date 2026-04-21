// client/src/pages/SearchPage.tsx
import { useState, useEffect } from 'react';
import { useSearch } from '../hooks/useSearch';
import { SearchFilters } from '../components/SearchFilters';
import { ProductList } from '../components/ProductList';
import { Pagination } from '../components/Pagination';
import type { SearchFilters as FilterType } from '../types/search';
import { X } from 'lucide-react';

export default function SearchPage() {
  const { products, loading, total, currentPage, totalPages, performSearch } = useSearch();
  const [currentFilters, setCurrentFilters] = useState<FilterType>({});
  
  const [ad, setAd] = useState<{ id: string, imageUrl: string } | null>(null);
  const [showAd, setShowAd] = useState(false);

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
    
    // Fetch active ad
    const fetchAd = async () => {
      try {
        const res = await fetch('/api/ads/active');
        if (res.ok) {
          const activeAd = await res.json();
          setAd(activeAd);
          setShowAd(true);
          
          // Track impression
          await fetch(`/api/ads/${activeAd.id}/impression`, { method: 'POST' });
        }
      } catch (err) {
        console.error("Failed to load ad", err);
      }
    };
    
    fetchAd();
  }, []); // Empty dependency array = run once on mount

  const handleSearch = (filters: FilterType) => {
    setCurrentFilters(filters);
    performSearch(filters);
  };

  const handlePageChange = (newPage: number) => {
    performSearch({ ...currentFilters, page: newPage });
  };

  const handleAdClick = async () => {
    if (ad) {
      await fetch(`/api/ads/${ad.id}/click`, { method: 'POST' });
      // In a real app, this might redirect somewhere. For now, just track.
    }
  };

  return (
    <div className="min-h-screen bg-[#e8eaf0] py-8 px-4 md:px-8 relative">
      {/* Ad Popup */}
      {showAd && ad && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-300">
          <div className="relative w-[90%] max-w-lg bg-surface neomorph-raised rounded-3xl p-4 animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setShowAd(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <div 
              className="w-full rounded-2xl overflow-hidden cursor-pointer"
              onClick={handleAdClick}
            >
              {ad.imageUrl.startsWith("data:application/pdf") ? (
                 <iframe src={ad.imageUrl} className="w-full h-[60vh] rounded-2xl border-none" />
              ) : (
                 <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto object-contain max-h-[70vh] rounded-2xl" />
              )}
            </div>
            <p className="text-center text-xs text-muted mt-3 font-medium uppercase tracking-widest">Sponsored Content</p>
          </div>
        </div>
      )}

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