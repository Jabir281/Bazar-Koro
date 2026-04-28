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
