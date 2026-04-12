import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

export default function Signup() {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "buyer";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, roles: [role] }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error("Cannot connect to the server. Please ensure the backend is running.");
      }
      
      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard"); // Redirect to dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-main font-['Plus_Jakarta_Sans'] min-h-screen flex items-center justify-center p-6">
      <div className="neomorph-raised rounded-[2rem] p-10 w-full max-w-md bg-surface">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-xl font-bold text-primary tracking-tight mb-6">Bazar Koro</Link>
          <h2 className="text-3xl font-extrabold text-main tracking-tight mb-2">Create Account</h2>
          <p className="text-muted text-sm">Join your local neighborhood network</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 neomorph-inset text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">Full Name</label>
            <div className="neomorph-inset rounded-xl p-1">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe" 
                className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 placeholder:text-slate-400 outline-none text-sm font-medium text-main" 
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">Email</label>
            <div className="neomorph-inset rounded-xl p-1">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" 
                className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 placeholder:text-slate-400 outline-none text-sm font-medium text-main" 
                required
              />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">Primary Role</label>
             <div className="neomorph-inset rounded-xl p-2 flex items-center gap-2 pr-4 bg-surface">
                 <select 
                   value={role}
                   onChange={(e) => setRole(e.target.value)}
                   className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold outline-none cursor-pointer pl-2 py-2 text-main"
                 >
                     <option value="buyer">Buyer</option>
                     <option value="seller">Seller</option>
                     <option value="driver">Driver</option>
                     <option value="marketer">Marketer</option>
                 </select>
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-2 pl-1">Password</label>
            <div className="neomorph-inset rounded-xl p-1">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 placeholder:text-slate-400 outline-none text-sm font-medium text-main" 
                required
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-6 rounded-xl neomorph-raised bg-surface text-primary font-bold text-lg neomorph-active transition-all disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-muted">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-bold">Log in</Link>
        </p>
      </div>
    </div>
  );
}
