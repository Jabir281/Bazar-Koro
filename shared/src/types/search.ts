// Defines the exact parameters the React client can send in the query string
export interface SearchFilters {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;     // Latitude for distance calculation
  lng?: number;     // Longitude for distance calculation
  radius?: number;  // Search radius in kilometers
  page?: number;    // For pagination
  limit?: number;   // Results per page
}

// Defines the structure of a Product coming from the MongoDB database
export interface Product {
  _id: string;      // MongoDB uses _id by default
  name: string;
  description: string;
  price: number;
  category: string;
  storeId: string;
  // GeoJSON format for MongoDB geospatial queries
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  distance?: number; // Calculated field if user searches by distance
  createdAt?: string;
  updatedAt?: string;
}

// Defines the structure of the API response so the frontend knows what to expect
export interface SearchResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}