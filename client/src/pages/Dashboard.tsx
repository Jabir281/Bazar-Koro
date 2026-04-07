import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Plus, ShoppingBag, Store, TrendingUp, User, Shield } from "lucide-react";

type UserRole = "buyer" | "seller" | "driver" | "marketer" | "admin";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  activeRole: UserRole;
}

interface UserStore {
  id: string;
  name: string;
  ownerName: string;
  type: string;
  location: { city: string, road: string, address: string };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const [stores, setStores] = useState<UserStore[]>([]);

  useEffect(() => {
    fetchUserData();
  }, [selectedRole]); // Re-fetch when role changes

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const headers: Record<string, string> = {
        "Authorization": `Bearer ${token}`
      };
      
      if (selectedRole) {
        headers["x-active-role"] = selectedRole;
      }

      const response = await fetch("/api/me", { headers });
      
      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUser(data);

      const resolvedRole = selectedRole || data.activeRole;
      if (!selectedRole) setSelectedRole(resolvedRole);

      // Fetch stores if they are a seller
      if (resolvedRole === "seller") {
        const storeRes = await fetch("/api/stores", { headers: { "Authorization": `Bearer ${token}`, "x-active-role": "seller" } });
        if (storeRes.ok) {
          setStores(await storeRes.json());
        }
      }

      if (resolvedRole === "buyer") {
        const storeRes = await fetch("/api/stores/all", { headers: { "Authorization": `Bearer ${token}`, "x-active-role": "buyer" } });
        if (storeRes.ok) {
          setStores(await storeRes.json());
        }
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8eaf0] text-[#707d40]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#707d40]"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8eaf0] p-6">
        <div className="neomorph-inset rounded-2xl p-6 text-center text-red-500 max-w-sm w-full">
          {error || "Failed to load dashboard"}
          <button 
            onClick={() => navigate("/login")}
            className="mt-4 w-full bg-[#707d40] text-white py-2 rounded-xl neomorph-raised active:neomorph-inset transition-all font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Determine Icon for active role
  const RoleIcon = () => {
    switch (user.activeRole) {
      case "buyer": return <ShoppingBag className="w-6 h-6" />;
      case "seller": return <Store className="w-6 h-6" />;
      case "marketer": return <TrendingUp className="w-6 h-6" />;
      case "admin": return <Shield className="w-6 h-6" />;
      default: return <User className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#e8eaf0] text-[#37392d] font-['Plus_Jakarta_Sans']">
      {/* Top Navigation */}
      <nav className="p-6">
        <div className="neomorph-raised rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full neomorph-inset flex items-center justify-center text-[#707d40]">
              <RoleIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Welcome, {user.name}</h1>
              <p className="text-sm font-medium text-[#646657] capitalize">{user.activeRole} Mode</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Role Switcher */}
            {user.roles.length > 1 && (
              <div className="relative w-full sm:w-auto">
                <select 
                  className="w-full sm:w-auto appearance-none bg-transparent neomorph-inset rounded-xl px-4 py-2.5 pr-8 font-semibold text-sm outline-none cursor-pointer text-[#37392d]"
                  value={user.activeRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                >
                  <option disabled value="">Switch View...</option>
                  {user.roles.map((r) => (
                    <option key={r} value={r} className="capitalize">{r} Mode</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#707d40]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            )}

            <button 
              onClick={handleLogout}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl neomorph-raised active:neomorph-inset transition-all font-semibold text-red-500 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area Based on Active Role */}
      <main className="px-6 pb-10 max-w-6xl mx-auto">
        {user.activeRole === "buyer" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight mb-4">Discover Local Stores</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.length === 0 ? (
                <div className="neomorph-inset rounded-3xl p-8 flex items-center justify-center min-h-[40vh] text-[#646657] col-span-full">
                  No stores are currently available in your area. Check back later!
                </div>
              ) : (
                stores.map((s) => (
                  <Link to={`/buyer/stores/${s.id}`} key={s.id} className="neomorph-raised hover:neomorph-inset active:neomorph-inset rounded-3xl p-6 flex flex-col justify-center min-h-[12rem] space-y-2 transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-full bg-[#707d40]/10 flex items-center justify-center text-[#707d40] group-hover:scale-110 transition-transform">
                          <Store className="w-5 h-5" />
                       </div>
                       <div>
                         <h3 className="font-bold text-xl leading-tight text-[#37392d]">{s.name}</h3>
                         <span className="text-[0.65rem] font-bold text-[#707d40] uppercase tracking-widest bg-[#707d40]/10 px-2 py-0.5 rounded-full">{s.type.replace('_', ' ')}</span>
                       </div>
                    </div>
                    <p className="text-sm font-medium text-[#646657] mt-auto">By {s.ownerName}</p>
                    <p className="text-xs text-slate-500 truncate">{s.location.road}, {s.location.city}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {user.activeRole === "seller" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-extrabold tracking-tight">Seller Hub</h2>
              <button 
                onClick={() => navigate("/seller/create-store")}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#707d40] text-white neomorph-raised active:neomorph-inset transition-all font-semibold shadow-inner"
              >
                <Plus className="w-5 h-5" />
                <span>Create Store</span>
              </button>
            </div>
            
            {/* Store List Component implementation continues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.length === 0 ? (
                <div className="neomorph-raised rounded-3xl p-6 flex flex-col items-center justify-center min-h-[12rem] text-center space-y-3 col-span-full">
                  <Store className="w-8 h-8 text-[#707d40]" />
                  <h3 className="font-bold text-lg">Your Shops</h3>
                  <p className="text-sm text-[#646657]">You haven't set up any stores yet. Click 'Create Store' to get started!</p>
                </div>
              ) : (
                stores.map((s) => (
                  <Link to={`/seller/stores/${s.id}`} key={s.id} className="neomorph-raised hover:neomorph-inset active:neomorph-inset rounded-3xl p-6 flex flex-col justify-center min-h-[12rem] space-y-2 transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-full bg-[#707d40]/10 flex items-center justify-center text-[#707d40] group-hover:scale-110 transition-transform">
                          <Store className="w-5 h-5" />
                       </div>
                       <div>
                         <h3 className="font-bold text-xl leading-tight text-[#37392d]">{s.name}</h3>
                         <span className="text-[0.65rem] font-bold text-[#707d40] uppercase tracking-widest bg-[#707d40]/10 px-2 py-0.5 rounded-full">{s.type.replace('_', ' ')}</span>
                       </div>
                    </div>
                    <p className="text-sm font-medium text-[#646657] mt-auto">By {s.ownerName}</p>
                    <p className="text-xs text-slate-500 truncate">{s.location.road}, {s.location.city}</p>
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {user.activeRole === "marketer" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight mb-4">Marketing Dashboard</h2>
            <div className="neomorph-inset rounded-3xl p-8 flex items-center justify-center min-h-[40vh] text-[#646657]">
              View affiliate campaigns and promotional content stats. (Coming soon)
            </div>
          </div>
        )}
      </main>
    </div>
  );
}