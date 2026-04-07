// client/src/pages/ProductDetail.tsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { Product } from '../types/search';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading product...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  return (
    <div className="min-h-screen bg-[#e8eaf0] py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/search" className="inline-block mb-6 text-[#707d40] hover:underline">← Back to search</Link>
        <div className="rounded-2xl neomorph-raised p-8 bg-[#e8eaf0]">
          <h1 className="text-3xl font-extrabold text-[#37392d]">{product.name}</h1>
          <p className="text-[#646657] mt-2">{product.description}</p>
          <div className="mt-4 flex gap-4 items-center">
            <span className="text-3xl font-bold text-[#707d40]">${product.price}</span>
            <span className="px-3 py-1 rounded-full bg-[#707d40]/20 text-sm">{product.category}</span>
          </div>
          {product.distance !== undefined && (
            <p className="mt-2 text-sm text-[#646657]">📍 {(product.distance / 1000).toFixed(1)} km away</p>
          )}
          <button className="mt-6 px-6 py-2 rounded-xl bg-[#707d40] text-white font-bold neomorph-raised neomorph-active">
            Contact Seller
          </button>
        </div>
      </div>
    </div>
  );
}