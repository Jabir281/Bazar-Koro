import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Image as ImageIcon } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  imageUrl: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export default function StoreView() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Form State
  const [pName, setPName] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pCategory, setPCategory] = useState("general");
  const [pLat, setPLat] = useState("");
  const [pLng, setPLng] = useState("");
  const [pImageBase64, setPImageBase64] = useState("");
  const [pLoading, setPLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchStoreAndProducts();
  }, [storeId]);

  const fetchStoreAndProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/stores/${storeId}`, {
        headers: { "Authorization": `Bearer ${token}`, "x-active-role": "seller" }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
       alert("File size exceeds 2MB limit!");
       return;
    }

    setProductImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
       setPImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
       alert("Document size exceeds 2MB limit!");
       return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
       const base64 = reader.result as string;
       const token = localStorage.getItem("token");
       try {
         const res = await fetch(`/api/stores/${storeId}/documents`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              "x-active-role": "seller"
            },
            body: JSON.stringify({ documentUrl: base64 })
         });
         if (!res.ok) throw new Error("Upload failed");
         alert("Document uploaded successfully for admin review!");
         // Refetch
         fetchStoreAndProducts();
       } catch (err: any) {
         alert(err.message);
       }
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setPLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      const price = Number(pPrice);
      if (Number.isNaN(price)) throw new Error('Enter a valid product price');
      if (!productImageFile && !pImageBase64) throw new Error('Product image is required');
      if ((pLat && !pLng) || (!pLat && pLng)) throw new Error('Please enter both latitude and longitude or leave both blank');

      const formData = new FormData();
      formData.append("name", pName.trim());
      formData.append("description", pDesc.trim());
      formData.append("price", String(price));
      formData.append("category", pCategory.trim() || 'general');
      
      if (productImageFile) {
         formData.append("image", productImageFile);
      } else if (pImageBase64) {
         formData.append("imageUrl", pImageBase64);
      }

      if (pLat && pLng) {
         formData.append("location[type]", "Point");
         formData.append("location[coordinates][0]", String(pLng));
         formData.append("location[coordinates][1]", String(pLat));
      }

      const res = await fetch(`/api/stores/${storeId}/products`, {
         method: "POST",
         headers: {
            "Authorization": `Bearer ${token}`,
            "x-active-role": "seller"
         },
         body: formData
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.error || errBody?.message || "Failed to add product");
      }
      
      const newProduct = await res.json();
      setProducts(prev => [...prev, { ...newProduct, id: newProduct.id ?? newProduct._id }] as Product[]);
      
      // Reset
      setPName("");
      setPDesc("");
      setPPrice("");
      setPCategory("general");
      setPLat("");
      setPLng("");
      setPImageBase64("");
      setProductImageFile(null);
      setShowAddProduct(false);

    } catch (err: any) {
       alert(err.message);
    } finally {
      setPLoading(false);
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
             <button onClick={() => navigate("/dashboard")} className="p-3 bg-surface neomorph-raised rounded-full text-primary">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{store.name}</h1>
                <p className="text-muted font-medium text-sm">Owner: {store.ownerName} • {store.location.city}</p>
                {store.description && <p className="text-sm mt-1 text-main">{store.description}</p>}
                {store.operatingHours && <p className="text-xs mt-1 text-primary font-semibold uppercase tracking-wide">Hours: {store.operatingHours}</p>}
             </div>
          </div>
          
          <div className="flex gap-3">
             <label className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface text-primary neomorph-raised hover:neomorph-inset active:neomorph-inset transition-all font-semibold shadow-inner cursor-pointer text-sm">
                <span>Upload Document</span>
                <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" className="hidden" onChange={handleDocumentUpload} />
             </label>
             <button 
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white neomorph-raised active:neomorph-inset transition-all font-semibold text-sm"
             >
               <Plus className="w-5 h-5" />
               <span>Add Product</span>
             </button>
          </div>
        </div>

        {/* Add Product Form Modal */}
        {showAddProduct && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-surface neomorph-raised rounded-[2rem] w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto">
                 <button onClick={() => setShowAddProduct(false)} className="absolute top-6 right-6 text-slate-500 hover:text-red-500 font-bold px-3 py-1 rounded-full neomorph-raised">✕</button>
                 <h2 className="text-2xl font-bold mb-6 text-center">Add New Product</h2>
                 
                 <form onSubmit={handleAddProduct} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1 pl-1">Product Name</label>
                      <div className="neomorph-inset rounded-xl p-1">
                        <input type="text" required value={pName} onChange={e=>setPName(e.target.value)} className="w-full bg-transparent px-4 py-2 outline-none text-sm font-medium" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1 pl-1">Description</label>
                      <div className="neomorph-inset rounded-xl p-1">
                        <textarea required value={pDesc} onChange={e=>setPDesc(e.target.value)} className="w-full bg-transparent px-4 py-2 outline-none text-sm font-medium h-20 resize-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1 pl-1">Price (Taka)</label>
                      <div className="neomorph-inset rounded-xl p-1">
                        <input type="number" step="0.01" min="0" required value={pPrice} onChange={e=>setPPrice(e.target.value)} className="w-full bg-transparent px-4 py-2 outline-none text-sm font-medium" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1 pl-1">Category</label>
                      <div className="neomorph-inset rounded-xl p-1">
                        <input type="text" value={pCategory} onChange={e=>setPCategory(e.target.value)} placeholder="general" className="w-full bg-transparent px-4 py-2 outline-none text-sm font-medium" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1 pl-1">Latitude</label>
                        <div className="neomorph-inset rounded-xl p-1">
                          <input type="number" step="0.000001" value={pLat} onChange={e=>setPLat(e.target.value)} placeholder="23.7806" className="w-full bg-transparent px-4 py-2 outline-none text-sm font-medium" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1 pl-1">Longitude</label>
                        <div className="neomorph-inset rounded-xl p-1">
                          <input type="number" step="0.000001" value={pLng} onChange={e=>setPLng(e.target.value)} placeholder="90.2794" className="w-full bg-transparent px-4 py-2 outline-none text-sm font-medium" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1 pl-1">Image Image (Limit 2MB)</label>
                      <div 
                         onClick={() => fileInputRef.current?.click()}
                         className={`neomorph-inset rounded-xl p-8 border-2 border-dashed ${pImageBase64 ? 'border-primary' : 'border-slate-300'} flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200/50 transition-colors`}
                      >
                         {pImageBase64 ? (
                            <img src={pImageBase64} alt="Preview" className="h-32 object-contain rounded-lg" />
                         ) : (
                            <>
                               <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                               <span className="text-sm font-medium text-slate-500">Click to upload product image</span>
                            </>
                         )}
                         <input type="file" required={!pImageBase64} accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                      </div>
                    </div>
                    
                    <button type="submit" disabled={pLoading} className="w-full mt-4 bg-primary text-white py-3 rounded-xl font-bold neomorph-raised hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50">
                       {pLoading ? "Uploading..." : "Publish Product"}
                    </button>
                 </form>
              </div>
           </div>
        )}

        {/* Products Grid */}
        <h3 className="text-xl font-bold mb-4 tracking-tight">Products ({products.length})</h3>
        
        {products.length === 0 ? (
           <div className="neomorph-inset rounded-3xl p-12 text-center text-muted font-medium border border-slate-300 border-dashed">
              Your store is currently empty. Click 'Add Product' to start selling!
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => (
                 <div key={p.id} className="neomorph-raised rounded-2xl p-4 flex flex-col group hover:-translate-y-1 transition-transform">
                    <div className="neomorph-inset rounded-xl p-2 mb-4 h-48 flex items-center justify-center overflow-hidden bg-white">
                       <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 space-y-1">
                       <h4 className="font-bold text-lg leading-tight text-main">{p.name}</h4>
                       <p className="text-xs text-muted line-clamp-2">{p.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200">
                       <div className="text-lg font-extrabold text-primary">TK {p.price.toFixed(2)}</div>
                    </div>
                 </div>
              ))}
           </div>
        )}

      </div>
    </div>
  );
}
