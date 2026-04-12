import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, CheckCircle, XCircle, Trash2, Key, Users, EyeOff, Eye } from "lucide-react";

interface StoreData {
  id: string;
  name: string;
  ownerName: string;
  type: string;
  location: { city: string, road: string, address: string };
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  documents: string[];
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Create admin modal
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminName, setNewAdminName] = useState("");

  const isSuperAdmin = user?.email?.toLowerCase().trim() === "irtizajabir1@gmail.com";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (!token || !userStr) {
        navigate("/login");
        return;
      }
      
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      
      if (!parsedUser.roles.includes("admin")) {
        navigate("/dashboard");
        return;
      }

      const res = await fetch("/api/admin/stores", {
        headers: { "Authorization": `Bearer ${token}`, "x-active-role": "admin" }
      });

      if (res.ok) {
        const data = await res.json();
        setStores(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/stores/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "x-active-role": "admin" },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchData();
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/stores/${id}/active`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "x-active-role": "admin" },
      body: JSON.stringify({ isActive: !currentActive })
    });
    if (res.ok) fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to completely delete this store?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/stores/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}`, "x-active-role": "admin" },
    });
    if (res.ok) fetchData();
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
     e.preventDefault();
     const token = localStorage.getItem("token");
     const res = await fetch(`/api/admin/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "x-active-role": "admin" },
        body: JSON.stringify({ name: newAdminName, email: newAdminEmail, password: newAdminPassword })
     });
     if (res.ok) {
       alert("Admin created successfully!");
       setShowAdminModal(false);
     } else {
       const data = await res.json();
       alert(data.error || "Failed to create admin");
     }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-slate-100 flex justify-center items-center">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-['Plus_Jakarta_Sans'] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-700">
           <div className="flex items-center gap-4">
              <Settings className="text-primary w-8 h-8" />
              <div>
                <h1 className="text-3xl font-extrabold text-white">Admin Operations</h1>
                <p className="text-slate-400 text-sm">System oversight, store approvals, and access control.</p>
              </div>
           </div>
           <div className="flex items-center gap-4">
              {isSuperAdmin && (
                 <button onClick={() => setShowAdminModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
                   <Key className="w-4 h-4" />
                   Create Admin
                 </button>
              )}
              <button 
                 onClick={() => {
                   localStorage.removeItem("token");
                   localStorage.removeItem("user");
                   navigate("/login");
                 }}
                 className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-sm"
              >
                 Logout
              </button>
           </div>
        </div>

        {/* Stores List */}
        <div>
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-200">
             <Users className="w-5 h-5 text-indigo-400"/> Store Directory & Approvals
           </h2>
           
           <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
             <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b border-slate-700 bg-slate-800/50 text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Store Details</th>
                    <th className="px-6 py-4">Status & Visiblity</th>
                    <th className="px-6 py-4">Documents</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                   {stores.map(store => (
                     <tr key={store.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                           <p className="font-bold text-slate-100">{store.name}</p>
                           <p className="text-xs text-slate-400">Owner: {store.ownerName}</p>
                           <p className="text-xs text-slate-500 mt-1">{store.location.city}, {store.location.road}</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-2 items-start">
                             <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                store.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : store.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                             }`}>
                               {store.status}
                             </div>
                             
                             <div className={`text-xs ml-1 flex items-center gap-1 ${store.isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                                {store.isActive ? <Eye className="w-3 h-3"/> : <EyeOff className="w-3 h-3"/>}
                                {store.isActive ? "Visible" : "Unavailable (Hidden)"}
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           {store.documents && store.documents.length > 0 ? (
                              <button className="text-indigo-400 hover:text-indigo-300 font-medium underline decoration-indigo-400/30 hover:decoration-indigo-300">
                                View {store.documents.length} Doc(s)
                              </button>
                           ) : (
                              <span className="text-slate-500 italic text-xs">No docs uploaded</span>
                           )}
                        </td>
                        <td className="px-6 py-4 flex gap-2 justify-end items-center">
                           {store.status === 'pending' && (
                             <>
                               <button title="Approve" onClick={() => handleUpdateStatus(store.id, "approved")} className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg">
                                  <CheckCircle className="w-4 h-4" />
                               </button>
                               <button title="Reject" onClick={() => handleUpdateStatus(store.id, "rejected")} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg">
                                  <XCircle className="w-4 h-4" />
                               </button>
                             </>
                           )}
                           
                           <button 
                             title={store.isActive ? "Make Unavailable" : "Make Available"}
                             onClick={() => handleToggleActive(store.id, store.isActive)} 
                             className="p-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg"
                           >
                              {store.isActive ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4" />}
                           </button>

                           <button 
                             title="Delete Store"
                             onClick={() => handleDelete(store.id)} 
                             className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors rounded-lg ml-2"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </td>
                     </tr>
                   ))}
                   {stores.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-8 text-slate-500">No stores found.</td>
                      </tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>

      </div>

      {/* Admin Creation Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Create New Admin</h3>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                 <div>
                   <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Name</label>
                   <input required type="text" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" />
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Email</label>
                   <input required type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" />
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Password</label>
                   <input required type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500" />
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowAdminModal(false)} className="flex-1 py-2 rounded-lg bg-slate-700 text-sm font-semibold hover:bg-slate-600">Cancel</button>
                    <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500">Create</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}