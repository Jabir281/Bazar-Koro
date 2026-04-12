// client/src/components/SearchFilters.tsx
import { useState, useEffect, useRef } from 'react';
import type { SearchFilters as FilterType, SearchSuggestion } from '../types/search';

const CATEGORIES = ['Groceries', 'Pharmacy', 'Electronics', 'Clothing'];

interface SearchFiltersProps {
  onSearch: (params: FilterType) => void;
  initialParams?: FilterType;
}

export function SearchFilters({ onSearch, initialParams = {} }: SearchFiltersProps) {
  const [keyword, setKeyword] = useState(initialParams.keyword || '');
  const [category, setCategory] = useState(initialParams.category || '');
  const [minPrice, setMinPrice] = useState(initialParams.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(initialParams.maxPrice?.toString() || '');
  const [radius, setRadius] = useState(initialParams.radius?.toString() || '100');
  
  // Keep track of coordinates so they aren't lost when searching
  const [lat, setLat] = useState<number | undefined>(initialParams.lat);
  const [lng, setLng] = useState<number | undefined>(initialParams.lng);

  // Suggestion States
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [useLocation, setUseLocation] = useState(!!(initialParams.lat && initialParams.lng));
  const [locationStatus, setLocationStatus] = useState('');

  // Debounced fetch for suggestions
  useEffect(() => {
    if (keyword.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?keyword=${encodeURIComponent(keyword)}`);
        if (res.ok) {
          const data: SearchSuggestion[] = await res.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        } else {
          console.error("Suggestion API returned an error:", res.status);
        }
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    }, 300);

    return () => clearTimeout(fetchTimer);
  }, [keyword]);

  // Close dropdown if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestionName: string) => {
    setKeyword(suggestionName);
    setShowSuggestions(false);
    triggerSearch(suggestionName); 
  };

  const triggerSearch = (searchKeyword: string, searchLat = lat, searchLng = lng) => {
    onSearch({
      keyword: searchKeyword,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      radius: radius ? Number(radius) : undefined,
      lat: searchLat,
      lng: searchLng,
      page: 1,
      limit: 10,
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation not supported');
      return;
    }
    setLocationStatus('Fetching location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        setLat(newLat);
        setLng(newLng);
        setLocationStatus('');
        setUseLocation(true);
        triggerSearch(keyword, newLat, newLng);
      },
      (err) => {
        setLocationStatus(`Error: ${err.message}`);
        setUseLocation(false);
      }
    );
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (useLocation && (!lat || !lng)) {
      getCurrentLocation();
    } else {
      triggerSearch(keyword);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl neomorph-raised bg-[#e8eaf0]">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        
        {/* Keyword Search with Autocomplete Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-sm font-medium text-[#646657] mb-1">Search</label>
          <input
            type="text"
            placeholder="Product name..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            className="w-full px-4 py-2 rounded-xl neomorph-inset bg-[#e8eaf0] focus:outline-none"
            autoComplete="off"
          />
          
          {/* Suggestion Dropdown UI */}
          {showSuggestions && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <ul className="py-1 text-sm text-[#37392d]">
                {suggestions.map((item) => (
                  <li 
                    key={item._id}
                    onClick={() => handleSuggestionClick(item.name)}
                    className="px-4 py-2 hover:bg-[#e8eaf0] hover:text-[#707d40] cursor-pointer transition-colors"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Category Dropdown */}
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

        {/* Min Price */}
        <div>
          <label className="block text-sm font-medium text-[#646657] mb-1">Min Price</label>
          <input
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-4 py-2 rounded-xl neomorph-inset bg-[#e8eaf0] focus:outline-none"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium text-[#646657] mb-1">Max Price</label>
          <input
            type="number"
            placeholder="Any"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-4 py-2 rounded-xl neomorph-inset bg-[#e8eaf0] focus:outline-none"
          />
        </div>

        {/* Radius */}
        <div>
          <label className="block text-sm font-medium text-[#646657] mb-1">Radius (km)</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full px-4 py-2 rounded-xl neomorph-inset bg-[#e8eaf0] focus:outline-none"
          />
        </div>
      </div>

      {/* Buttons */}
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
          className="px-8 py-2 rounded-xl bg-[#707d40] text-white font-bold neomorph-raised hover:bg-[#5e6b36] transition"
        >
          Search
        </button>
      </div>
    </form>
  );
}