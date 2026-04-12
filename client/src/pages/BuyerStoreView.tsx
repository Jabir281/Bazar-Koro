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
   const [addingProductId, setAddingProductId] = useState<string | null>(null);

  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    fetchStoreAndProducts();
    fetchCartSummary();
  }, [storeId]);

  const fetchCartSummary = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`/api/cart/summary`, {
        headers: { "Authorization": `Bearer ${token}`, "x-active-role": "buyer" }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items) {
           setCartItemCount(data.items.reduce((acc: number, item: any) => acc + item.qty, 0));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

   const addToCart = async (productId: string) => {
      const token = localStorage.getItem("token");
      if (!token) {
         navigate("/login");
         return;
      }

      setAddingProductId(productId);
      try {
         const res = await fetch(`/api/cart/add`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}`,
               "x-active-role": "buyer",
            },
            body: JSON.stringify({ productId, qty: 1 }),
         });

         if (!res.ok) throw new Error("Failed to add to cart");
         
         const data = await res.json();
         if (data.items) {
            setCartItemCount(data.items.reduce((acc: number, item: any) => acc + item.qty, 0));
         }
      } catch (err: any) {
         alert(err.message);
      } finally {
         setAddingProductId(null);
      }
   };

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

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center">Loading...</div>;
  if (error || !store) return <div className="min-h-screen bg-surface flex items-center justify-center font-bold text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-surface text-main font-['Plus_Jakarta_Sans'] p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-300">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate("/dashboard")} className="p-3 bg-surface neomorph-raised hover:neomorph-inset active:neomorph-inset transition-all rounded-full text-primary">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                   {store.name} 
                   <span className="text-[0.65rem] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full align-middle">{store.type.replace('_', ' ')}</span>
                </h1>
                <p className="text-muted font-medium text-sm mt-1 flex items-center gap-1">
                   <Store className="w-4 h-4 text-slate-400" />
                   {store.location.road}, {store.location.city}
                </p>
             </div>
          </div>
               <div className="flex items-center gap-4">
                  <button
                     onClick={() => navigate("/buyer/cart")}
                     className="relative px-4 py-2 rounded-xl neomorph-raised active:neomorph-inset transition-all font-semibold flex items-center gap-2 text-primary"
                  >
                     <ShoppingCart className="w-4 h-4" />
                     <span>Cart</span>
                     {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                           {cartItemCount}
                        </span>
                     )}
                  </button>
                  <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Store Owner</p>
                      <p className="font-semibold text-lg">{store.ownerName}</p>
                  </div>
               </div>
        </div>

        {/* Products Grid */}
        <h3 className="text-xl font-bold mb-4 tracking-tight">Available Goods ({products.length})</h3>
        
        {products.length === 0 ? (
           <div className="neomorph-inset rounded-3xl p-12 text-center text-muted font-medium">
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
                       <h4 className="font-bold text-lg leading-tight text-main">{p.name}</h4>
                       <p className="text-xs text-muted line-clamp-2">{p.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                       <div className="text-xl font-extrabold text-primary">TK {p.price.toFixed(2)}</div>
                       <button
                          onClick={() => addToCart(p.id)}
                          disabled={addingProductId === p.id}
                          className="p-2 bg-primary text-white rounded-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-60"
                        >
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
