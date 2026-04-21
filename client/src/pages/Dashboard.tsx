import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Plus, ShoppingBag, Store, TrendingUp, User, Shield, Truck, Megaphone } from "lucide-react";
import { SellerOMS } from '../components/SellerOMS'; // <-- Imported here!

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
  status?: string;
  isActive?: boolean;
}

interface BuyerOrderLine {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
}

interface BuyerOrder {
  _id: string;
  status: 'placed' | 'paid' | 'accepted' | 'rejected' | 'ready_for_pickup' | 'claimed' | 'at_store' | 'picked_up' | 'on_the_way' | 'delivered';
  lines: BuyerOrderLine[];
  delivery?: {
    deliveryPin?: string;
  };
  createdAt: string;
}

interface DriverOrderLine {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
}

interface DriverOrder {
  _id: string;
  status: 'placed' | 'accepted' | 'rejected' | 'ready_for_pickup' | 'claimed' | 'at_store' | 'picked_up' | 'on_the_way' | 'delivered';
  lines: DriverOrderLine[];
  createdAt: string;
}

interface DriverOverview {
  isOnline: boolean;
  dailyEarnings: number;
  completedTrips: number;
  activeDeliveries: DriverOrder[];
  availableOrders: DriverOrder[];
  driverDailyGoal?: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const [stores, setStores] = useState<UserStore[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<BuyerOrder[]>([]);
  const [driverOverview, setDriverOverview] = useState<DriverOverview | null>(null);
  
  const [driverGoalInput, setDriverGoalInput] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [driverPinInputs, setDriverPinInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUserData();
  }, [selectedRole]);

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

      if (resolvedRole === "seller") {
        const storeRes = await fetch("/api/stores", { headers: { "Authorization": `Bearer ${token}`, "x-active-role": "seller" } });
        if (storeRes.ok) {
          setStores(await storeRes.json());
        }
      }

      if (resolvedRole === "buyer") {
        const [storeRes, orderRes] = await Promise.all([
          fetch("/api/stores/all", { headers: { "Authorization": `Bearer ${token}`, "x-active-role": "buyer" } }),
          fetch("/api/orders/me", { headers: { "Authorization": `Bearer ${token}`, "x-active-role": "buyer" } }),
        ]);

        if (storeRes.ok) {
          setStores(await storeRes.json());
        }

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setBuyerOrders(orderData.orders || []);
        }
      }

      if (resolvedRole === "driver") {
        const driverRes = await fetch("/api/driver/overview", { headers: { "Authorization": `Bearer ${token}`, "x-active-role": "driver" } });
        if (driverRes.ok) {
          const data = await driverRes.json();
          setDriverOverview(data);
          setDriverGoalInput(data.driverDailyGoal?.toString() || '');
        }
      } else {
        setDriverOverview(null);
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
    if (user.roles.includes(newRole)) {
      setSelectedRole(newRole);
      return;
    }

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
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSelectedRole(newRole);
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

  const RoleIcon = () => {
    switch (user.activeRole) {
      case "buyer": return <ShoppingBag className="w-6 h-6" />;
      case "seller": return <Store className="w-6 h-6" />;
      case "driver": return <Truck className="w-6 h-6" />;
      case "marketer": return <TrendingUp className="w-6 h-6" />;
      case "admin": return <Shield className="w-6 h-6" />;
      default: return <User className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-surface text-main font-['Plus_Jakarta_Sans']">
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
            <div className="relative w-full sm:w-auto">
              <select 
                className="w-full sm:w-auto appearance-none bg-transparent neomorph-inset rounded-xl px-4 py-2.5 pr-8 font-semibold text-sm outline-none cursor-pointer text-main"
                value={user.activeRole}
                onChange={handleRoleChange}
              >
                <option value="buyer">Buyer Mode</option>
                <option value="seller">Seller Mode</option>
                <option value="driver">Driver Mode</option>
                <option value="marketer">Marketer Mode</option>
                {user.roles.includes("admin") && <option value="admin">Admin Mode</option>}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {user.activeRole === "marketer" && (
              <button
                onClick={() => navigate("/marketer/create-ad")}
                title="Create Ad Campaign"
                className="flex items-center justify-center w-11 h-11 rounded-xl neomorph-raised active:neomorph-inset transition-all text-primary"
              >
                <Megaphone className="w-5 h-5" />
              </button>
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

            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold tracking-tight">Your Orders</h2>
              {buyerOrders.length === 0 ? (
                <div className="neomorph-inset rounded-3xl p-8 text-center text-muted">
                  No orders have been placed yet. Your pending orders will appear here.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {buyerOrders.map((order) => (
                    <div key={order._id} className="neomorph-raised rounded-3xl p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div>
                          <p className="text-sm font-bold text-main">Order #{order._id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-muted">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                          {order.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.lines.map((line) => (
                          <div key={line.productId} className="flex justify-between text-sm text-main">
                            <span>{line.qty}x {line.name}</span>
                            <span>৳{(line.unitPrice * line.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {order.delivery?.deliveryPin && order.status !== 'delivered' && order.status !== 'rejected' && (
                        <div className="mt-4 pt-4 border-t border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <Shield className="w-4 h-4 text-primary" />
                            Share this PIN with your driver at handoff:
                          </div>
                          <div className="px-4 py-2 bg-primary/10 text-primary font-mono font-bold tracking-widest rounded-xl text-lg text-center">
                            {order.delivery.deliveryPin}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.length === 0 ? (
                <div className="neomorph-raised rounded-3xl p-6 flex flex-col items-center justify-center min-h-[12rem] text-center space-y-3 col-span-full">
                  <Store className="w-8 h-8 text-primary" />
                  <h3 className="font-bold text-lg">Your Shops</h3>
                  <p className="text-sm text-muted">You haven't set up any stores yet. Click 'Create Store' to get started!</p>
                </div>
              ) : (
                stores.map((s) => (
                  <div key={s.id} className="neomorph-raised rounded-3xl p-6 flex flex-col justify-center min-h-[12rem] space-y-2 group">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Store className="w-5 h-5" />
                       </div>
                       <div>
                         <h3 className="font-bold text-xl leading-tight text-main line-clamp-1">{s.name}</h3>
                         <div className="flex flex-wrap gap-2 items-center mt-1">
                           <span className="text-[0.65rem] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">{s.type.replace('_', ' ')}</span>
                           {s.status === 'pending' && <span className="text-[0.65rem] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full">Pending...</span>}
                           {s.status === 'rejected' && <span className="text-[0.65rem] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-full">Rejected</span>}
                           {s.isActive === false && <span className="text-[0.65rem] font-bold text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-full">Unavailable</span>}
                         </div>
                       </div>
                    </div>
                    <p className="text-sm font-medium text-muted mt-auto">By {s.ownerName}</p>
                    <p className="text-xs text-slate-500 truncate mb-4">{s.location.road}, {s.location.city}</p>
                    
                    <button 
                      onClick={() => navigate(`/seller/stores/${s.id}`)}
                      className="w-full mt-2 py-2.5 rounded-xl bg-primary text-white font-semibold neomorph-raised active:neomorph-inset transition-all flex items-center justify-center gap-2"
                    >
                      <span>Manage Store</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* --- SELLER OMS SECTION --- */}
            {stores.length > 0 && (
              <div className="mt-12 space-y-8">
                <h2 className="text-2xl font-extrabold tracking-tight border-t border-primary/20 pt-8">Incoming Orders</h2>
                {stores.map(store => (
                  <div key={store.id} className="space-y-4">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" /> 
                      {store.name}
                    </h3>
                    <SellerOMS storeId={store.id} />
                  </div>
                ))}
              </div>
            )}
            {/* -------------------------- */}
          </div>
        )}

        {user.activeRole === "driver" && driverOverview && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="neomorph-raised rounded-3xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted">Availability</p>
                    <p className="text-2xl font-extrabold text-main">{driverOverview.isOnline ? 'Online' : 'Offline'}</p>
                  </div>
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      if (!token) return;
                      const res = await fetch('/api/driver/status', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                          'x-active-role': 'driver',
                        },
                        body: JSON.stringify({ online: !driverOverview.isOnline }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setDriverOverview((prev) => prev ? { ...prev, isOnline: data.isOnline } : prev);
                      }
                    }}
                    className={`px-4 py-2 rounded-xl font-semibold neomorph-raised active:neomorph-inset transition-all ${driverOverview.isOnline ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                  >
                    {driverOverview.isOnline ? 'Go Offline' : 'Go Online'}
                  </button>
                </div>
                <p className="text-sm text-muted">Toggle your availability to accept deliveries when you are ready to work.</p>
              </div>

              <div className="neomorph-raised rounded-3xl p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted">Daily Earnings & Goal</p>
                  {!isEditingGoal ? (
                    <button 
                      onClick={() => setIsEditingGoal(true)}
                      className="text-xs font-bold text-primary hover:opacity-80 transition-colors"
                    >
                      {driverOverview.driverDailyGoal ? 'Edit Goal' : 'Set Goal'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={driverGoalInput}
                        onChange={(e) => setDriverGoalInput(e.target.value)}
                        className="w-20 px-2 py-1 neomorph-inset rounded-lg bg-transparent outline-none text-sm font-bold text-main"
                        placeholder="e.g. 500"
                        autoFocus
                      />
                      <button 
                        onClick={async () => {
                          const token = localStorage.getItem('token');
                          if (!token) return;
                          const res = await fetch('/api/driver/goal', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                              'x-active-role': 'driver',
                            },
                            body: JSON.stringify({ goal: Number(driverGoalInput) || 0 }),
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setDriverOverview(prev => prev ? { ...prev, driverDailyGoal: data.driverDailyGoal } : prev);
                            setIsEditingGoal(false);
                          }
                        }}
                        className="text-xs font-bold bg-primary text-white px-2 py-1 rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-end gap-3 mb-4">
                  <p className="text-4xl font-extrabold text-primary">৳{driverOverview.dailyEarnings.toFixed(2)}</p>
                  {!!driverOverview.driverDailyGoal && (
                    <p className="text-sm font-medium text-muted pb-1 border-l border-primary/20 pl-3">
                      / ৳{driverOverview.driverDailyGoal.toFixed(2)} 
                      <span className="text-[0.65rem] ml-2 bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Today's Target</span>
                    </p>
                  )}
                </div>

                {!!driverOverview.driverDailyGoal && driverOverview.driverDailyGoal > 0 && (
                  <div className="relative w-full h-4 neomorph-inset rounded-full overflow-hidden p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${Math.min(100, (driverOverview.dailyEarnings / driverOverview.driverDailyGoal) * 100)}%` }}
                    />
                  </div>
                )}
                {!!driverOverview.driverDailyGoal && driverOverview.driverDailyGoal > 0 && driverOverview.dailyEarnings >= driverOverview.driverDailyGoal && (
                  <p className="text-xs font-bold text-green-500 mt-3 flex items-center gap-1 animate-pulse">
                    <TrendingUp className="w-3 h-3" /> Goal Reached! Outstanding performance!
                  </p>
                )}
                <p className="text-xs text-muted mt-3">Only completed delivery fees are counted (৳120 per trip).</p>
              </div>

              <div className="neomorph-raised rounded-3xl p-6 md:col-span-1 flex flex-col justify-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted">Completed Trips</p>
                <p className="text-3xl font-extrabold text-primary pt-2">{driverOverview.completedTrips}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="neomorph-raised rounded-3xl p-6">
                <h2 className="text-xl font-bold mb-4">Active Deliveries</h2>
                {driverOverview.activeDeliveries.length === 0 ? (
                  <div className="text-sm text-muted">No active deliveries right now.</div>
                ) : (
                  <div className="space-y-4">
                    {driverOverview.activeDeliveries.map((order) => {
                      const nextAction = order.status === 'claimed'
                        ? { label: 'Arrived at Store', nextStatus: 'at_store' }
                        : order.status === 'at_store'
                        ? { label: 'Picked Up', nextStatus: 'picked_up' }
                        : order.status === 'picked_up'
                        ? { label: 'On the Way', nextStatus: 'on_the_way' }
                        : order.status === 'on_the_way'
                        ? { label: 'Mark Delivered', nextStatus: 'delivered' }
                        : null;

                      const advanceOrder = async (extraBody: Record<string, unknown> = {}) => {
                        if (!nextAction) return;
                        const token = localStorage.getItem('token');
                        if (!token) return;
                        const res = await fetch(`/api/orders/${order._id}/status`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                            'x-active-role': 'driver',
                          },
                          body: JSON.stringify({ status: nextAction.nextStatus, ...extraBody }),
                        });
                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}));
                          alert(data.error || 'Failed to update order.');
                          return;
                        }
                        const overviewRes = await fetch('/api/driver/overview', {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'x-active-role': 'driver',
                          },
                        });
                        if (overviewRes.ok) setDriverOverview(await overviewRes.json());
                        setDriverPinInputs((prev) => {
                          const next = { ...prev };
                          delete next[order._id];
                          return next;
                        });
                      };

                      const isDeliverStep = nextAction?.nextStatus === 'delivered';
                      const pinValue = driverPinInputs[order._id] || '';

                      return (
                        <div key={order._id} className="border border-primary/10 rounded-3xl p-4 neomorph-inset">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                              <p className="font-semibold text-main">Order #{order._id.slice(-6).toUpperCase()}</p>
                              <p className="text-xs text-muted">{order.status.replace(/_/g, ' ')}</p>
                            </div>
                            {nextAction && !isDeliverStep && (
                              <button
                                onClick={() => advanceOrder()}
                                className="mt-2 w-full bg-primary text-white rounded-xl py-2 font-semibold neomorph-raised active:neomorph-inset transition-all"
                              >
                                {nextAction.label}
                              </button>
                            )}
                          </div>
                          <div className="space-y-2 text-sm text-main">
                            {order.lines.map((line) => (
                              <div key={line.productId} className="flex justify-between">
                                <span>{line.qty}x {line.name}</span>
                                <span>৳{(line.unitPrice * line.qty).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {isDeliverStep && (
                            <div className="mt-4 pt-4 border-t border-primary/20 space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                                <Shield className="w-3 h-3 text-primary" />
                                Enter buyer's 4-digit PIN to complete delivery
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={4}
                                  value={pinValue}
                                  onChange={(e) =>
                                    setDriverPinInputs((prev) => ({
                                      ...prev,
                                      [order._id]: e.target.value.replace(/\D/g, '').slice(0, 4),
                                    }))
                                  }
                                  placeholder="••••"
                                  className="flex-1 neomorph-inset rounded-xl px-4 py-2 bg-transparent outline-none font-mono tracking-[0.5em] text-center text-lg text-main"
                                />
                                <button
                                  onClick={() => {
                                    if (pinValue.length !== 4) {
                                      alert('PIN must be 4 digits.');
                                      return;
                                    }
                                    advanceOrder({ proof: { pinLast4: pinValue } });
                                  }}
                                  disabled={pinValue.length !== 4}
                                  className="px-4 py-2 bg-primary text-white rounded-xl font-semibold neomorph-raised active:neomorph-inset transition-all disabled:opacity-50"
                                >
                                  {nextAction!.label}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="neomorph-raised rounded-3xl p-6">
                <h2 className="text-xl font-bold mb-4">Pickup Queue</h2>
                {!driverOverview.isOnline ? (
                  <div className="text-sm text-muted">Go online to claim new deliveries.</div>
                ) : driverOverview.availableOrders.length === 0 ? (
                  <div className="text-sm text-muted">No nearby pickups currently available.</div>
                ) : (
                  <div className="space-y-4">
                    {driverOverview.availableOrders.map((order) => (
                      <div key={order._id} className="border border-primary/10 rounded-3xl p-4 neomorph-inset">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div>
                            <p className="font-semibold text-main">Order #{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-muted">Ready for pickup</p>
                          </div>
                          <button
                            onClick={async () => {
                              const token = localStorage.getItem('token');
                              if (!token) return;
                              const res = await fetch(`/api/orders/${order._id}/status`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`,
                                  'x-active-role': 'driver',
                                },
                                body: JSON.stringify({ status: 'claimed' }),
                              });
                              if (res.ok) {
                                const overviewRes = await fetch('/api/driver/overview', {
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'x-active-role': 'driver',
                                  },
                                });
                                if (overviewRes.ok) setDriverOverview(await overviewRes.json());
                              }
                            }}
                            className="mt-2 bg-primary text-white rounded-xl py-2 px-3 font-semibold neomorph-raised active:neomorph-inset transition-all"
                          >
                            Claim
                          </button>
                        </div>
                        <div className="space-y-2 text-sm text-main">
                          {order.lines.map((line) => (
                            <div key={line.productId} className="flex justify-between">
                              <span>{line.qty}x {line.name}</span>
                              <span>৳{(line.unitPrice * line.qty).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {user.activeRole === "marketer" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight mb-4">Marketing Dashboard</h2>
            <div className="neomorph-inset rounded-3xl p-8 flex flex-col items-center justify-center min-h-[40vh] text-muted gap-4">
              <p>View affiliate campaigns and promotional content stats.</p>
              <button 
                onClick={() => navigate("/marketer/analytics")}
                className="px-6 py-3 bg-primary text-white rounded-xl neomorph-raised hover:neomorph-inset active:neomorph-inset transition-all font-bold"
              >
                View Analytics
              </button>
            </div>
          </div>
        )}

        {user.activeRole === "admin" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold tracking-tight mb-4">Admin Dashboard</h2>
            <div className="neomorph-inset rounded-3xl p-6 text-muted text-sm">
              Use the Admin Operations panel at <button onClick={() => navigate("/admin")} className="text-primary font-bold underline">/admin</button> to manage stores and accounts.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
