# � The 2-Page "Exam Survival" Cheatsheet for Bazar Koro

*Zero jargon. Just where to look and what to change.*

## 🧩 THE 4-STEP RULE TO ADD OR CHANGE ANYTHING
Whenever asked to "add a field" (like adding a Phone Number to a Store) or "create a feature", do exactly this in order:
1. **Database:** Open `server/src/models/` and add the new word (e.g., `phone: String`).
2. **Backend API:** Open `server/src/routes/` and save/read that new word from the database.
3. **Frontend UI:** Open `client/src/pages/` and add an `<input>` box or text text to show it.
4. **Link them:** Use `fetch('/api/...')` in the frontend to send the data to the backend.

---

## 🎯 WHERE TO EDIT YOUR 6 MAIN FEATURES

### 1️⃣ Role Dashboard (Buyer / Seller / Marketer)
* **What it does:** Shows different stats based on your role.
* **To change the UI/Layout:** Open [client/src/pages/Dashboard.tsx](client/src/pages/Dashboard.tsx).
  * Go to line `if (selectedRole === "seller")`. Copy that whole chunk if you need a new role tab.
* **To fix Permissions:** Open [server/src/middleware/auth.ts](server/src/middleware/auth.ts).
  * Use `requireRole('admin')` on routes to lock people out.

### 2️⃣ Store Profile Creation
* **What it does:** Sellers create standard shops.
* **To add a new input field (e.g. "Store Twitter Link"):**
  1. Open [server/src/models/Store.ts](server/src/models/Store.ts) -> add `twitterLink: { type: String }`
  2. Open [client/src/pages/CreateStore.tsx](client/src/pages/CreateStore.tsx) 
  3. Add `<input name="twitterLink" onChange={(e) => setFormData({...})} ... />`
  4. It automatically saves when they submit!

### 3️⃣ Google Maps (Routing / Locations)
* **What it does:** Auto-fills addresses using coordinates.
* **Where the Map UI lives:** [client/src/components/MapLocationPicker.tsx](client/src/components/MapLocationPicker.tsx). Edit this file to change zoom level or map colors.
* **Where the Backend connects:** [server/src/utils/googleMaps.ts](server/src/utils/googleMaps.ts).
* **Fixing Map crashes:** Always make sure `GOOGLE_MAPS_API_KEY` is inside `server/.env`.

### 4️⃣ Ad Analytics (Track Performance)
* **What it does:** Marketers view Clicks & Impressions. CTR = `(Clicks / Impressions) * 100`.
* **To track a NEW metric (like "Time Spent"):**
  1. Open [server/src/models/Ad.ts](server/src/models/Ad.ts) -> add `timeSpent: { type: Number, default: 0 }`.
  2. Open [server/src/routes/ads.ts](server/src/routes/ads.ts) -> find `trackClickRoute` and add `$inc: { timeSpent: 5 }`.
* **To show it on screen:** Open [client/src/pages/AdAnalytics.tsx](client/src/pages/AdAnalytics.tsx) and add a new `<td>{ad.timeSpent}</td>` column.

### 5️⃣ Proof of Delivery (4-Digit PIN)
* **What it does:** Driver needs buyer's PIN to finish drop-off.
* **The magic logic:** Every order generates a `deliveryPin: "1234"` when created.
* **To change when/how PIN is checked:** Open [server/src/routes/orders.ts](server/src/routes/orders.ts). Search for `updateOrderStatusRoute`.
  * Look for the exact code: `if (status === 'delivered' && req.body.pin !== order.deliveryPin)`. Change that `if` statement to turn the feature on or off!
* **Where the Driver enters it:** Order lists inside `Dashboard.tsx` or `DriverOverview` tabs.

### 6️⃣ Google Login
* **What it does:** Replaces email/password with Google accounts.
* **To fix/edit Google logic:** Open [server/src/routes/auth.ts](server/src/routes/auth.ts) and find `googleLoginRoute`.
* **To change the Login button:** Open [client/src/pages/Login.tsx](client/src/pages/Login.tsx).

---

## ✂️ COPY-PASTE CHEAT CODES

## ✂️ THE "ADD A NEW FEATURE / BUTTON" TEMPLATE

If the exam says **"Add a button that changes [X] or creates [Y]"**, follow this copy-paste blueprint. It connects a button on the UI directly to the database.

### 1) THE FRONTEND BUTTON (Paste in any `client/src/pages/` file)
```tsx
// 1. Put this above the "return" statement
const handleMyNewAction = async () => {
  const token = localStorage.getItem('token');
  try {
    // 👇 WHAT TO CHANGE: Method (POST=create, PATCH=update, DELETE=remove)
    const res = await fetch('/api/YOUR_URL_HERE', {
      method: 'POST', 
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-active-role': 'buyer' // 👇 WHAT TO CHANGE: 'buyer', 'seller', 'marketer', or 'driver'
      },
      // 👇 WHAT TO CHANGE: The data you want to send to the backend
      body: JSON.stringify({ customValue: "hello" }) 
      // Note: Delete the 'body' line completely if making a GET or DELETE request
    });
    
    if (res.ok) alert("Success!");
    else alert("Failed!");
  } catch (err) {
    console.error(err);
  }
};

// 2. Put this inside your HTML/return statement
<button onClick={handleMyNewAction} className="bg-primary text-white px-4 py-2 rounded">
  Click Me To Do Action
</button>
```

### 2) THE BACKEND ROUTE (Paste in a `server/src/routes/` file)
```ts
// 1. 👇 WHAT TO CHANGE: Make it `router.post`, `router.patch`, `router.get`, or `router.delete`
// 2. 👇 WHAT TO CHANGE: Match the URL from the frontend (e.g., '/YOUR_URL_HERE')
router.post('/YOUR_URL_HERE', requireAuth, async (req: any, res: any) => {
  try {
    // 3. This reads the data you sent from the frontend `body: JSON.stringify(...)`
    const { customValue } = req.body; 

    // 4. 👇 CHOOSE ONE OF THESE DATABASE FUNCTIONS & DELETE THE REST:
    
    // A) TO CREATE NEW DATA (Match HTTP POST)
    // const newDoc = await ModelName.create({ customValue, userId: req.user.id });
    
    // B) TO UPDATE EXISTING DATA (Match HTTP PATCH or PUT)
    // const updatedDoc = await ModelName.findByIdAndUpdate(req.params.id, { $set: { customValue } }, { new: true });
    
    // C) TO FIND/READ DATA (Match HTTP GET)
    // const results = await ModelName.find({ userId: req.user.id });
    
    // D) TO DELETE DATA (Match HTTP DELETE)
    // await ModelName.findByIdAndDelete(req.params.id);

    // 5. Send success back to the frontend
    res.json({ message: "Action completed successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});
```

### 🚨 3 SECOND FIXES
* **"401 Unauthorized"** = You forgot to send the `Authorization` header in your fetch.
* **"Failed to Fetch"** = You forgot to start the server! Run `npm run dev:local`.
* **UI won't update** = You changed a `server/src/models/...` file but didn't restart the terminal.
* **Making a whole new page?** = Copy `client/src/pages/Login.tsx`, rename it, delete the inputs, and start fresh. It already has the loading/error bars built-in perfectly!

---

## ⚙️ EXACT WORKFLOW OF YOUR 6 CORE FEATURES
*Use this to understand exactly how the existing code connects, so you can easily add extensions to them!*

### 1. Role RBAC (Multi-Role Dashboards)
**How it works:** You have one account, but can switch hats. The frontend tells the backend "I am acting as a seller right now" by sending a special header (`x-active-role`). 
**To extend:** If the team lead says "Make a new VIP Role", you add it to the user model strings, and then use the middleware block below to protect lines of code.
```typescript
// 💻 FRONTEND: How it tells the backend who is acting
headers: { "x-active-role": "seller" } // or "buyer", "admin"

// ⚙️ BACKEND: How it blocks unauthorized roles (server/src/middleware/auth.ts)
export const requireRole = (role: string) => {
  return (req, res, next) => {
    // If the header doesn't match the required role, block them!
    if (req.headers['x-active-role'] !== role) return res.status(403).send("Forbidden");
    next();
  };
};
// Attach to a route like: router.post('/secrets', requireRole('seller'), ...)
```

### 2. Store Profile Creation & Map Location
**How it works:** When a seller creates a store, the `MapLocationPicker.tsx` component returns a `lat` and `lng`. The frontend sends this to the backend, which saves it in a MongoDB "GeoJSON" format (special formatting for maps).
**To extend:** If asked to "Add a delivery radius", you would add a `radius` number field to the Store model.
```typescript
// 💻 FRONTEND: The data shape sent to the backend
const formData = {
  storeName: "My Shop",
  location: { lat: 40.7128, lng: -74.0060 } // Comes straight from the map pin!
};

// ⚙️ BACKEND: How MongoDB saves the Map Coordinates (server/src/models/Store.ts)
location: {
  type: { type: String, default: 'Point' }, // Must be exactly 'Point'
  coordinates: [Number] // Important: [Lng, Lat] order!
}
```

### 3. Route Integration & Distance Fees
**How it works:** Once coordinates are saved from the feature above, things like Cart checkout or Driver deliveries use math to calculate distance. 
**To extend:** If asked to "Change delivery fee to $5 per km", you just find the math logic below in the backend and change the multiplier.
```typescript
// ⚙️ BACKEND math logic (e.g., inside server/src/routes/orders.ts)
// Turf.js or basic distance formulas are often used to find distance between two [Lng, Lat] points.
const distanceInKm = calculateDistance(store.location, buyer.location); 
const deliveryFee = distanceInKm * 2.50; // Change this math for exam questions!
```

### 4. CTR Ad Analytics (Click-Through Rate)
**How it works:** Standard web tracking. The database holds 2 numbers: `impressions` and `clicks`. When a page loads an ad, it tells the backend to +1 impression. When a user clicks it, it tells the backend to +1 click.
**To extend:** If told to "track how many times it was shared", add a `shares` number to the DB, and make a new button that does `$inc: { shares: 1 }`.
```typescript
// 💻 FRONTEND: When the "Click Ad" button is pressed
fetch(`/api/ads/${adId}/click`, { method: "POST" })

// ⚙️ BACKEND: Instantly math updates the DB without downloading the data first
router.post('/:id/click', async (req, res) => {
  // $inc is MongoDB magic for "increase this number by 1"
  await AdModel.findByIdAndUpdate(req.params.id, { 
    $inc: { clicks: 1 } 
  });
});
```

### 5. Proof of Delivery PINs
**How it works:** When a buyer makes an order, the server generates a random 4-digit string and saves it. The driver cannot change the order status to "Completed" unless they type that exact string into their app.
**To extend:** If asked to "Make the PIN 6 digits", you just change the randomizer string length. If asked to "Add a Driver PIN for pickup", copy this exact logic but for a "pickupPin".
```typescript
// ⚙️ BACKEND: Generating it (server/src/routes/orders.ts)
const newPin = Math.floor(1000 + Math.random() * 9000).toString(); // Generates 1000-9999
const order = await Order.create({ ..., deliveryPin: newPin });

// ⚙️ BACKEND: Checking it when driver finishes
if (req.body.status === 'delivered') {
  if (req.body.enteredPin !== order.deliveryPin) {
    return res.status(400).json({ error: "Wrong PIN!" }); // Blocks completion!
  }
}
```

### 6. Google Auth
**How it works:** Instead of checking a password, frontend uses Google's popup window. Google gives the frontend a secure hidden string (`credential`). Frontend sends that string to your backend. Backend asks Google "is this real?", and if yes, logs the user in.
**To extend:** To switch to Apple/Facebook auth, it's the exact same flow—just different popup buttons.
```typescript
// 💻 FRONTEND: The Google button gives back a credential
import { GoogleLogin } from '@react-oauth/google';
<GoogleLogin 
  onSuccess={(response) => {
    // Send response.credential to your backend Route!
    fetch('/api/auth/google', { body: JSON.stringify({ token: response.credential }) })
  }} 
/>

// ⚙️ BACKEND: Checking with Google (server/src/routes/auth.ts)
const { OAuth2Client } = require('google-auth-library');
const ticket = await client.verifyIdToken({ idToken: req.body.token });
const googleUser = ticket.getPayload(); // Extracts their real email/name
// Now you either find them in the DB by email, or create a brand new User!
```
