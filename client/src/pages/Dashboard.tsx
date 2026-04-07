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

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    if (!user) return;
    
    setLoading(true);
    // If they already have this role, simply switch
    if (user.roles.includes(newRole)) {
      setSelectedRole(newRole);
      return;
    }

    // Role missing, attach it automatically behind the scenes
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/me/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!res.ok) throw new Error("Failed to add role");
      
      const data = await res.json();
      localStorage.setItem("token", data.token); // update local token with new claims
      localStorage.setItem("user", JSON.stringify(data.user));

      setSelectedRole(newRole); // Trigger a refresh for the new context
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-6">
        <div className="neomorph-inset rounded-2xl p-6 text-center text-red-500 max-w-sm w-full">
          {error || "Failed to load dashboard"}
          <button 
            onClick={() => navigate("/login")}
            className="mt-4 w-full bg-primary text-white py-2 rounded-xl neomorph-raised active:neomorph-inset transition-all font-semibold"
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
    <div className="min-h-screen bg-surface text-main font-['Plus_Jakarta_Sans']">
      {/* Top Navigation */}
      <nav className="p-6">
        <div className="neomorph-raised rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full neomorph-inset flex items-center justify-center text-primary">
              <RoleIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Welcome, {user.name}</h1>
              <p className="text-sm font-medium text-muted capitalize">{user.activeRole} Mode</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Role Switcher always visible */}
            <div className="relative w-full sm:w-auto">
              <select 
                className="w-full sm:w-auto appearance-none bg-transparent neomorph-inset rounded-xl px-4 py-2.5 pr-8 font-semibold text-sm outline-none cursor-pointer text-main"
                value={user.activeRole}
                onChange={handleRoleChange}
              >
                <option value="buyer">Buyer Mode</option>
                <option value="seller">Seller Mode</option>
                <option value="marketer">Marketer Mode</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

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
                <div className="neomorph-inset rounded-3xl p-8 flex items-center justify-center min-h-[40vh] text-muted col-span-full">
                  No stores are currently available in your area. Check back later!
                </div>
              ) : (
                stores.map((s) => (
                  <Link to={`/buyer/stores/${s.id}`} key={s.id} className="neomorph-raised hover:neomorph-inset active:neomorph-inset rounded-3xl p-6 flex flex-col justify-center min-h-[12rem] space-y-2 transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Store className="w-5 h-5" />
                       </div>
                       <div>
                         <h3 className="font-bold text-xl leading-tight text-main">{s.name}</h3>
                         <span className="text-[0.65rem] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">{s.type.replace('_', ' ')}</span>
                       </div>
                    </div>
                    <p className="text-sm font-medium text-muted mt-auto">By {s.ownerName}</p>
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
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white neomorph-raised active:neomorph-inset transition-all font-semibold shadow-inner"
              >
                <Plus className="w-5 h-5" />
                <span>Create Store</span>
              </button>
            </div>
            
            {/* Store List Component implementation continues */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.length === 0 ? (
                <div className="neomorph-raised rounded-3xl p-6 flex flex-col items-center justify-center min-h-[12rem] text-center space-y-3 col-span-full">
                  <Store className="w-8 h-8 text-primary" />
                  <h3 className="font-bold text-lg">Your Shops</h3>
                  <p className="text-sm text-muted">You haven't set up any stores yet. Click 'Create Store' to get started!</p>
                </div>
              ) : (
                stores.map((s) => (
                  <Link to={`/seller/stores/${s.id}`} key={s.id} className="neomorph-raised hover:neomorph-inset active:neomorph-inset rounded-3xl p-6 flex flex-col justify-center min-h-[12rem] space-y-2 transition-all group">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Store className="w-5 h-5" />
                       </div>
                       <div>
                         <h3 className="font-bold text-xl leading-tight text-main">{s.name}</h3>
                         <span className="text-[0.65rem] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">{s.type.replace('_', ' ')}</span>
                       </div>
                    </div>
                    <p className="text-sm font-medium text-muted mt-auto">By {s.ownerName}</p>
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
            <div className="neomorph-inset rounded-3xl p-8 flex items-center justify-center min-h-[40vh] text-muted">
              View affiliate campaigns and promotional content stats. (Coming soon)
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
