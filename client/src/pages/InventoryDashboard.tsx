import { useState, useEffect } from "react";
import { Edit2, Trash2, PackageX, PackageCheck, X, Image as ImageIcon } from "lucide-react";
import { useParams } from "react-router-dom";

interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity?: number;
  isOutOfStock?: boolean;
  imageUrl?: string;   
  image?: string;      
}

export default function InventoryDashboard() {
  const { storeId } = useParams(); 

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // ✅ New state to track the currently selected filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    stockQuantity: 0,
    isOutOfStock: false,
    imageUrl: "",    
  });

  useEffect(() => {
    if (storeId) {
      fetchProducts();
    }
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      let response = await fetch(`/api/stores/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = await response.json();
      let productsArr: Product[] = [];
      
      if (Array.isArray(data)) {
        productsArr = data;
      } else if (data && data.products) {
        productsArr = data.products;
      } else if (data && data.length > 0 && data[0].products) {
        productsArr = data[0].products;
      }
      
      if (productsArr.length === 0) {
        response = await fetch(`/api/products/store/${storeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = await response.json();
        if (Array.isArray(data)) {
          productsArr = data;
        }
      }
      
      setProducts(productsArr);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStockStatus = async (product: Product) => {
    const productId = product._id || product.id;
    if (!productId) return;
    
    try {
      const token = localStorage.getItem("token");
      const updatedStatus = !product.isOutOfStock;

      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-active-role": "seller",
        },
        body: JSON.stringify({ isOutOfStock: updatedStatus }),
      });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => ((p._id || p.id) === productId ? { ...p, isOutOfStock: updatedStatus } : p))
        );
      }
    } catch (error) {
      console.error("Failed to toggle stock:", error);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "x-active-role": "seller",
        },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const productId = editingProduct._id || editingProduct.id;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-active-role": "seller",
        },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        const updated = await res.json();
        const updatedId = updated._id || updated.id;
        setProducts((prev) => prev.map((p) => ((p._id || p.id) === updatedId ? updated : p)));
        setEditingProduct(null);
      } else {
        const errorData = await res.json();
        alert(`Failed to edit product:\n\n${JSON.stringify(errorData, null, 2)}`);
      }
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/stores/${storeId}/products`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-active-role": "seller", 
        },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        const addedProduct = await res.json();
        setProducts((prev) => [addedProduct, ...prev]); 
        setShowAddModal(false); 
        
        setNewProduct({
          name: "",
          description: "",
          price: 0,
          category: "",
          stockQuantity: 0,
          isOutOfStock: false,
          imageUrl: "",
        });
      } else {
        const errorData = await res.json();
        const errorText = JSON.stringify(errorData, null, 2);
        console.error("Backend error details:", errorText);
        alert(`Backend refused the data. Here is exactly why:\n\n${errorText}`);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("A network error occurred. Check the console.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEditing && editingProduct) {
          setEditingProduct({ ...editingProduct, imageUrl: base64String });
        } else {
          setNewProduct({ ...newProduct, imageUrl: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="p-8 text-center text-main font-bold">Loading inventory...</div>;

  const validProducts = products.filter((product) => !!(product._id || product.id));

  // ✅ Dynamically extract all unique categories from the products array
  const uniqueCategories = Array.from(new Set(validProducts.map((p) => p.category).filter(Boolean)));
  
  // ✅ Filter products based on selected tab
  const displayedProducts = selectedCategoryFilter === "All" 
    ? validProducts 
    : validProducts.filter((p) => p.category === selectedCategoryFilter);

  return (
    <div className="min-h-screen bg-surface p-8 font-['Plus_Jakarta_Sans']">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-main">Inventory Management</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl neomorph-raised hover:neomorph-inset transition-all font-bold"
          >
            + Add New Product
          </button>
        </div>

        {/* ✅ Dynamic Category Filters */}
        {uniqueCategories.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setSelectedCategoryFilter("All")}
              className={`px-6 py-2 rounded-xl font-bold transition-all ${
                selectedCategoryFilter === "All"
                  ? "bg-primary text-white neomorph-inset"
                  : "bg-surface text-muted neomorph-raised hover:text-main"
              }`}
            >
              All Items
            </button>
            {uniqueCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategoryFilter(category)}
                className={`px-6 py-2 rounded-xl font-bold transition-all ${
                  selectedCategoryFilter === category
                    ? "bg-primary text-white neomorph-inset"
                    : "bg-surface text-muted neomorph-raised hover:text-main"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Product List */}
        <div className="neomorph-raised rounded-3xl p-6 space-y-4">
          {displayedProducts.length === 0 ? (
            <p className="text-center text-muted py-8 font-medium">
              {selectedCategoryFilter === "All" 
                ? "No products found in your inventory." 
                : `No products found in the "${selectedCategoryFilter}" category.`}
            </p>
          ) : (
            displayedProducts.map((product) => {
              const productId = product._id || product.id;
              const displayImage = product.imageUrl || product.image; 
              
              return (
                <div key={productId} className="flex items-center justify-between p-4 neomorph-inset rounded-2xl bg-surface">
                  {/* Thumbnail Preview */}
                  <div className="h-16 w-16 bg-gray-200 rounded-xl neomorph-inset flex items-center justify-center overflow-hidden mr-4 shrink-0">
                    {displayImage ? (
                      <img src={displayImage} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={24} className="text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-main">{product.name}</h3>
                    <p className="text-sm text-muted font-medium line-clamp-1">
                      {product.description || "No description"}
                    </p>
                    <p className="text-xs text-muted font-medium mt-1">
                      Category: <span className="text-primary font-bold">{product.category || "Uncategorized"}</span> | Stock: {product.stockQuantity || 0}
                    </p>
                  </div>

                  <div className="w-32 text-center">
                    <span className="text-lg font-extrabold text-primary">Tk {product.price}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleStockStatus(product)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                        product.isOutOfStock
                          ? "bg-red-100 text-red-600 neomorph-inset"
                          : "bg-green-100 text-green-600 neomorph-raised hover:neomorph-inset"
                      }`}
                    >
                      {product.isOutOfStock ? <PackageX size={18} /> : <PackageCheck size={18} />}
                      {product.isOutOfStock ? "Out of Stock" : "In Stock"}
                    </button>

                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-3 text-blue-500 neomorph-raised rounded-xl hover:neomorph-inset transition-all"
                    >
                      <Edit2 size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(productId)}
                      className="p-3 text-red-500 neomorph-raised rounded-xl hover:neomorph-inset transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Shared Datalist for Categories */}
      <datalist id="existing-categories">
        {uniqueCategories.map((cat) => (
          <option key={cat} value={cat} />
        ))}
      </datalist>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface neomorph-raised rounded-3xl p-8 max-w-md w-full relative my-8">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-2 text-muted hover:text-main"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-main mb-6">Edit Product</h2>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-2">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="w-full p-2 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white"
                />
                {(editingProduct.imageUrl || editingProduct.image) && (
                  <img src={editingProduct.imageUrl || editingProduct.image} alt="Preview" className="mt-4 h-24 w-24 object-cover rounded-xl shadow-md" />
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-4 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">Description</label>
                <textarea
                  required
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full p-4 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium resize-none h-24"
                  placeholder="Describe the product..."
                />
              </div>

              {/* ✅ Updated Category Input with list attribute */}
              <div>
                <label className="block text-sm font-bold text-muted mb-2">Category</label>
                <input
                  type="text"
                  required
                  list="existing-categories"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full p-4 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium"
                  placeholder="Select or type a new category..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-muted mb-2">Price (Tk)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.price === 0 ? "" : editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value === "" ? 0 : Number(e.target.value) })}
                    className="w-full p-4 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-muted mb-2">Stock Qty</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingProduct.stockQuantity === 0 ? "" : editingProduct.stockQuantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: e.target.value === "" ? 0 : Number(e.target.value) })}
                    className="w-full p-4 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-primary text-white py-4 rounded-xl neomorph-raised hover:neomorph-inset active:neomorph-inset transition-all font-extrabold text-lg"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface neomorph-raised rounded-3xl p-8 max-w-md w-full relative my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-muted hover:text-main"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-main mb-6">Add New Product</h2>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-2">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="w-full p-2 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white"
                />
                {newProduct.imageUrl && (
                  <img src={newProduct.imageUrl} alt="Preview" className="mt-4 h-24 w-24 object-cover rounded-xl shadow-md" />
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-4 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium"
                  placeholder="e.g., Loose Baking Powder"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-2">Description</label>
                <textarea
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-4 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium resize-none h-24"
                  placeholder="Describe the product..."
                />
              </div>

              {/* ✅ Updated Category Input with list attribute */}
              <div>
                <label className="block text-sm font-bold text-muted mb-2">Category</label>
                <input
                  type="text"
                  required
                  list="existing-categories"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full p-4 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium"
                  placeholder="Select or type a new category..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-muted mb-2">Price (Tk)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.price === 0 ? "" : newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value === "" ? 0 : Number(e.target.value) })}
                    className="w-full p-4 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-muted mb-2">Stock Qty</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.stockQuantity === 0 ? "" : newProduct.stockQuantity}
                    onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: e.target.value === "" ? 0 : Number(e.target.value) })}
                    className="w-full p-4 neomorph-inset rounded-xl bg-surface focus:outline-none text-main font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-primary text-white py-4 rounded-xl neomorph-raised hover:neomorph-inset active:neomorph-inset transition-all font-extrabold text-lg"
              >
                Create Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}