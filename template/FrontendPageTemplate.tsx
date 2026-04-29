import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; 

// ============================================================================
// 1. COMPONENT SETUP
// ============================================================================
// 🔴 CHANGE THIS: Rename `MyNewFeaturePage` to match what the exam asked for.
export default function MyNewFeaturePage() {
  const navigate = useNavigate();

  // --------------------------------------------------------------------------
  // 📚 STATE MANAGEMENT (React Memory)
  // --------------------------------------------------------------------------
  // `items` will hold the list of things downloaded from the database.
  const [items, setItems] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔴 CHANGE THIS: `formData` holds whatever the user types into the input boxes.
  // Add an empty string `""` or number `0` for every piece of data you want to collect.
  const [formData, setFormData] = useState({
    title: "",      // Example: We are collecting a text string
    amount: 0,      // Example: We are collecting a number
  });

  // --------------------------------------------------------------------------
  // 📥 READ DATA (Runs immediately when the page loads)
  // --------------------------------------------------------------------------
  useEffect(() => {
    fetchData(); // Triggers the download below as soon as you open the page
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Grabs your login passport
      
      // 🔴 CHANGE THIS URL: Update `/api/YOUR_URL_HERE` to point to a file in `server/src/routes/...`
      const res = await fetch("/api/YOUR_URL_HERE", {
        method: "GET", // A "GET" request means we only want to read info
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-active-role": "buyer", // 🔴 CHANGE THIS: Put exactly who is looking at this page (buyer, seller, marketer, admin)
        },
      });

      if (!res.ok) throw new Error("Failed to download data from server");
      
      // If success, save the downloaded backend list to the `items` state.
      const data = await res.json();
      setItems(data); 
    } catch (err: any) {
      setError(err.message); // Show error at top of screen
    } finally {
      setLoading(false); // Make the "Loading..." text disappear
    }
  };

  // --------------------------------------------------------------------------
  // 📤 CREATE DATA (Runs when the user clicks the "Submit" Button)
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Stops the webpage from reloading suddenly
    setError(null);

    try {
      const token = localStorage.getItem("token");

      // 🔴 CHANGE THIS URL: Update `/api/YOUR_URL_HERE` 
      const res = await fetch("/api/YOUR_URL_HERE", {
        method: "POST", // A "POST" request means we are sending NEW info to save
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-active-role": "buyer", // 🔴 CHANGE THIS: (buyer, seller, marketer, admin)
        },
        body: JSON.stringify(formData), // This scoops up the typed inputs and packages them for the backend
      });

      if (!res.ok) throw new Error("Failed to save your new item to database");

      // 🔴 CHANGE THIS: Clean up the inputs so they are totally empty for the next time!
      setFormData({ title: "", amount: 0 }); 
      fetchData(); // Immediately re-download the list so the new item shows up automatically!
      alert("Successfully created!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // --------------------------------------------------------------------------
  // 🗑️ DELETE DATA (Runs when user clicks a "Delete" Button)
  // --------------------------------------------------------------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this forever?")) return;

    try {
      const token = localStorage.getItem("token");
      
      // 🔴 CHANGE THIS URL: Keep the `${id}` part at the end so backend knows what to delete!
      const res = await fetch(`/api/YOUR_URL_HERE/${id}`, {
        method: "DELETE", // A "DELETE" request removes info
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-active-role": "buyer", // 🔴 CHANGE THIS: (buyer, seller, marketer, admin)
        },
      });

      if (!res.ok) throw new Error("Failed to delete from database");
      
      fetchData(); // Re-download the list to show the item is gone.
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  // ============================================================================
  // 🎨 RENDER THE HTML (JSX UI)
  // ============================================================================
  return (
    <div className="min-h-screen bg-surface text-main font-['Plus_Jakarta_Sans'] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My New Feature Dashboard</h1>
          <Link to="/dashboard" className="text-primary hover:underline">Back to Main Dashboard</Link>
        </div>

        {/* ERROR WARNING BOX */}
        {error && (
          <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm font-medium border border-red-500/20">
            {error}
          </div>
        )}

        {/* ==================== THE CREATION FORM (INPUTS) ===================== */}
        <div className="neomorph-raised rounded-[2rem] p-8">
          <h2 className="text-xl font-bold mb-4">Create A New Item</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 🔴 HIGHLIGHT THIS: HOW TO DO A TEXT INPUT */}
            <div>
              <label className="block text-sm font-bold text-muted mb-2">Title</label>
              <input
                type="text"
                // 1. It reads the current exact value from state
                value={formData.title} 
                // 2. It updates the exact state immediately as you type a letter
                onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                className="w-full neomorph-inset rounded-xl px-4 py-3 bg-surface border-none focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            {/* 🔴 HIGHLIGHT THIS: HOW TO DO A NUMBER INPUT */}
            <div>
              <label className="block text-sm font-bold text-muted mb-2">Amount ($)</label>
              <input
                type="number"
                value={formData.amount}
                // Notice `Number(e.target.value)` so it saves as an integer instead of a string!
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full neomorph-inset rounded-xl px-4 py-3 bg-surface border-none focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white font-bold rounded-xl py-3 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
            >
              Save New Record
            </button>
          </form>
        </div>

        {/* ================== THE LIST RENDERER (SHOWING DATA) ================= */}
        <div className="neomorph-raised rounded-[2rem] p-8">
          <h2 className="text-xl font-bold mb-4">Saved Database Items</h2>
          
          {loading ? (
            <div className="text-center py-8 text-muted">Downloading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted">Nothing found in the database. Create one above!</div>
          ) : (
            <div className="space-y-4">
              {/* `items.map()` loops through the array we got from the GET request */}
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 border border-white/20 rounded-xl bg-surface shadow-sm">
                  
                  {/* 🔴 CHANGE THIS: `item.title` and `item.amount` must match your DB structure! */}
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm font-bold text-primary">Amount: ${item.amount}</p>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(item._id || item.id)} // This passes the clicked item ID string to the delete function
                    className="text-red-500 text-sm font-bold bg-red-500/10 px-3 py-1 rounded-lg hover:bg-red-500/20"
                  >
                    Delete Item
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
          <h2 className="text-xl font-bold mb-4">Saved Items</h2>
          
          {loading ? (
            <div className="text-center py-8 text-muted">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted">No items found. Create one above!</div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 border border-white/20 rounded-xl bg-surface shadow-sm">
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-sm text-muted">{item.description}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(item._id || item.id)}
                    className="text-red-500 text-sm font-bold bg-red-500/10 px-3 py-1 rounded-lg hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
