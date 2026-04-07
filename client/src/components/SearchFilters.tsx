// client/src/components/SearchFilters.tsx
import { useState } from 'react';
import type { SearchFilters as FilterType } from '../types/search';

const CATEGORIES = ['Groceries', 'Pharmacy', 'Electronics', 'Clothing']; // extend as needed

interface SearchFiltersProps {
  onSearch: (params: FilterType) => void;
  initialParams?: FilterType;
}

export function SearchFilters({ onSearch, initialParams = {} }: SearchFiltersProps) {
  const [keyword, setKeyword] = useState(initialParams.keyword || '');
  const [category, setCategory] = useState(initialParams.category || '');
  const [minPrice, setMinPrice] = useState(initialParams.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(initialParams.maxPrice?.toString() || '');
  const [radius, setRadius] = useState(initialParams.radius?.toString() || '10');
  const [useLocation, setUseLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported');
      return;
    }
    setLocationStatus('Fetching location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        // Store them in a ref or state, but we'll just trigger search immediately
        onSearch({
          keyword,
          category: category || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          radius: radius ? Number(radius) : undefined,
          lat,
          lng,
          page: 1,
          limit: 10,
        });
        setLocationStatus('');
        setUseLocation(true);
      },
      (err) => {
        setLocationStatus(`Error: ${err.message}`);
        setUseLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // If useLocation is true but we don't have lat/lng yet, call getCurrentLocation
    if (useLocation) {
      getCurrentLocation();
    } else {
      onSearch({
        keyword,
        category: category || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        radius: radius ? Number(radius) : undefined,
        page: 1,
        limit: 10,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl neomorph-raised bg-[#e8eaf0]">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-sm font-medium text-[#646657] mb-1">Search</label>
          <input
            type="text"
            placeholder="Product name..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-4 py-2 rounded-xl neomorph-inset bg-[#e8eaf0] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#646657] mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-xl neomorph-inset bg-[#e8eaf0]"
          >
            <option value="">All</option>
            {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#646657] mb-1">Min Price</label>
          <input
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-4 py-2 rounded-xl neomorph-inset bg-[#e8eaf0]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#646657] mb-1">Max Price</label>
          <input
            type="number"
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-4 py-2 rounded-xl neomorph-inset bg-[#e8eaf0]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#646657] mb-1">Radius (km)</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full px-4 py-2 rounded-xl neomorph-inset bg-[#e8eaf0]"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={getCurrentLocation}
            className={`px-4 py-2 rounded-xl neomorph-raised neomorph-active text-sm font-semibold ${useLocation ? 'text-[#707d40] border-2 border-[#707d40]' : 'text-[#646657]'}`}
          >
            📍 Use my location
          </button>
          {locationStatus && <span className="text-xs text-red-500">{locationStatus}</span>}
        </div>
        <button
          type="submit"
          className="px-8 py-2 rounded-xl bg-[#707d40] text-white font-bold neomorph-raised neomorph-active hover:bg-[#5e6b36] transition"
        >
          Search
        </button>
      </div>
    </form>
  );
}