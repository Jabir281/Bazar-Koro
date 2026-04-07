import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Store } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function BuyerStoreView() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchStoreAndProducts();
  }, [storeId]);

  const fetchStoreAndProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/stores/${storeId}`, {
        headers: { "Authorization": `Bearer ${token}`, "x-active-role": "buyer" }
      });

      if (!res.ok) throw new Error("Failed to load store data");
      
      const data = await res.json();
      setStore(data.store);
      setProducts(data.products);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#e8eaf0] flex items-center justify-center">Loading...</div>;
  if (error || !store) return <div className="min-h-screen bg-[#e8eaf0] flex items-center justify-center font-bold text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#e8eaf0] text-[#37392d] font-['Plus_Jakarta_Sans'] p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-300">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate("/dashboard")} className="p-3 bg-[#e8eaf0] neomorph-raised hover:neomorph-inset active:neomorph-inset transition-all rounded-full text-[#707d40]">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                   {store.name} 
                   <span className="text-[0.65rem] font-bold text-[#707d40] uppercase tracking-widest bg-[#707d40]/10 px-3 py-1 rounded-full align-middle">{store.type.replace('_', ' ')}</span>
                </h1>
                <p className="text-[#646657] font-medium text-sm mt-1 flex items-center gap-1">
                   <Store className="w-4 h-4 text-slate-400" />
                   {store.location.road}, {store.location.city}
                </p>
             </div>
          </div>
          <div className="text-right hidden sm:block">
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Store Owner</p>
             <p className="font-semibold text-lg">{store.ownerName}</p>
          </div>
        </div>

        {/* Products Grid */}
        <h3 className="text-xl font-bold mb-4 tracking-tight">Available Goods ({products.length})</h3>
        
        {products.length === 0 ? (
           <div className="neomorph-inset rounded-3xl p-12 text-center text-[#646657] font-medium">
              This store hasn't added any products yet.
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => (
                 <div key={p.id} className="neomorph-raised rounded-2xl p-4 flex flex-col group hover:-translate-y-1 transition-all">
                    <div className="neomorph-inset rounded-xl p-2 mb-4 h-48 flex items-center justify-center overflow-hidden bg-white">
                       <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 space-y-1">
                       <h4 className="font-bold text-lg leading-tight text-[#37392d]">{p.name}</h4>
                       <p className="text-xs text-[#646657] line-clamp-2">{p.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                       <div className="text-xl font-extrabold text-[#707d40]">${p.price.toFixed(2)}</div>
                       <button className="p-2 bg-[#707d40] text-white rounded-lg hover:scale-105 active:scale-95 transition-transform">
                          <ShoppingCart className="w-5 h-5" />
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        )}

      </div>
    </div>
  );
}