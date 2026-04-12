import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, ArrowLeft } from "lucide-react";

export default function CreateStore() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    description: "",
    operatingHours: "",
    type: "general_store",
    location: {
      city: "",
      road: "",
      address: "",
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-active-role": "seller"
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create store");
      }

      navigate("/dashboard"); // Take them back so they see their store
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-main font-['Plus_Jakarta_Sans'] p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-primary hover:text-primary-dark font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>

      <div className="w-full max-w-2xl neomorph-raised rounded-3xl p-8 md:p-10 bg-surface">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full neomorph-inset flex items-center justify-center text-primary mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Create Your Store</h2>
          <p className="text-muted text-sm mt-2">Fill in your information to set up your digital storefront.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 neomorph-inset text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">Store Name</label>
              <div className="neomorph-inset rounded-xl p-1">
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Super Mart" 
                  className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 outline-none text-sm font-medium" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">Owner Name</label>
              <div className="neomorph-inset rounded-xl p-1">
                <input 
                  type="text" 
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="John Doe" 
                  className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 outline-none text-sm font-medium" 
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">Short Description</label>
              <div className="neomorph-inset rounded-xl p-1">
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your store..." 
                  className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 outline-none text-sm font-medium resize-none h-20" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">Operating Hours</label>
              <div className="neomorph-inset rounded-xl p-1">
                <textarea 
                  value={formData.operatingHours}
                  onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                  placeholder="e.g., Mon-Fri: 9AM - 8PM" 
                  className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 outline-none text-sm font-medium resize-none h-20" 
                />
              </div>
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">Store Type</label>
              <div className="relative neomorph-inset rounded-xl p-1">
                <select 
                  className="w-full appearance-none bg-transparent px-4 py-3 outline-none text-sm font-medium cursor-pointer"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  <option value="general_store">General Store</option>
                  <option value="pharmacy">Pharmacy</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
          </div>

          <div className="pt-4 border-t border-slate-200/50">
             <h3 className="text-sm font-bold text-main mb-4">Location Details</h3>
             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">City</label>
                  <div className="neomorph-inset rounded-xl p-1">
                    <input 
                      type="text" 
                      value={formData.location.city}
                      onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                      className="w-full bg-transparent border-none px-4 py-3 outline-none text-sm font-medium" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">Road/Street</label>
                  <div className="neomorph-inset rounded-xl p-1">
                    <input 
                      type="text" 
                      value={formData.location.road}
                      onChange={(e) => setFormData({ ...formData, location: { ...formData.location, road: e.target.value } })}
                      className="w-full bg-transparent border-none px-4 py-3 outline-none text-sm font-medium" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">Full Address / Landmark</label>
                  <div className="neomorph-inset rounded-xl p-1">
                    <textarea 
                      value={formData.location.address}
                      onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                      className="w-full bg-transparent border-none px-4 py-3 outline-none text-sm font-medium resize-none h-24" 
                      required
                    />
                  </div>
                </div>
             </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-primary text-white font-bold py-4 rounded-xl neomorph-raised active:neomorph-inset transition-all disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Store"}
          </button>
        </form>
      </div>
    </div>
  );
}
