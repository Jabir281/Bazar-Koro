# Module 3: Order Bidding & Assignment Analysis

## 📊 Implementation Status

### ✅ ALREADY IMPLEMENTED (Core Features)

1. **Order Status Flow**
   - Status enum includes: `ready_for_pickup`, `claimed`, `at_store`, `picked_up`, `on_the_way`, `delivered`
   - File: `server/src/models/Order.ts`, `shared/src/index.ts`

2. **Live Feed - Pickup Queue**
   - UI: `client/src/pages/Dashboard.tsx` (lines 595-645)
   - Shows list of orders with status `ready_for_pickup`
   - Auto-updates when driver goes online/claims orders
   - Backend: `server/src/routes/driver.ts` - `driverOverviewRoute`

3. **One-Click Claim Functionality**
   - Driver can claim a delivery with single button click
   - Updates order status from `ready_for_pickup` to `claimed`
   - API: `PATCH /api/orders/:id/status`
   - Code: `Dashboard.tsx` lines 614-631

4. **Driver Status Management**
   - Online/Offline toggle (shows availability)
   - API: `POST /api/driver/status`
   - Backend: `server/src/routes/driver.ts` - `setDriverStatusRoute`

5. **Order Tracking for Drivers**
   - Active deliveries section shows claimed orders
   - Status progression buttons: Arrived → Picked Up → On the Way → Delivered
   - API: `PATCH /api/orders/:id/status` with role-based access

6. **Driver Earnings Dashboard**
   - Daily earnings calculation (৳120 per completed delivery)
   - Completed trips counter
   - Backend calculation: `server/src/routes/driver.ts` (lines 43-50)

7. **Order Information Display**
   - Shows order ID, items, quantities, prices
   - Displays order status

---

## ❌ MISSING/NEEDS IMPLEMENTATION

### 1. **Pickup Location Display** (IMPORTANT)
**Current:** Orders only show items & prices
**Needed:** Display store location (street address, city)

**Files to Modify:**
- Backend: `server/src/routes/driver.ts` - populate store info in `availableOrders` query
- Frontend: `client/src/pages/Dashboard.tsx` - display store location in Pickup Queue card

**Implementation Details:**
```typescript
// Backend needs to populate store location:
const availableOrders = await Order.find({
  status: 'ready_for_pickup',
  'delivery.driverId': null
})
  .populate({
    path: 'lines.storeId',
    select: 'location name'  // Add this
  })
  .sort({ createdAt: -1 })
  .limit(20);
```

---

### 2. **Drop-off Distance Calculation** (HIGH PRIORITY)
**Current:** No distance information
**Needed:** Calculate distance between driver location and pickup location

**Implementation Options:**
- Use Haversine formula for distance calculation
- Store driver's current location (GPS coordinates)
- Display distance in kilometers

**New Fields Needed:**
- Driver's current location in User model
- Geolocation tracking during delivery
- Distance calculation utility function

---

### 3. **Delivery Fee Display** (MEDIUM PRIORITY)
**Current:** Fixed ৳120 recorded in backend, not shown in UI
**Needed:** Prominently display delivery fee in Pickup Queue

**Implementation:**
```tsx
// Add to Pickup Queue card:
<div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
  <span className="font-semibold">Delivery Fee:</span>
  <span className="text-lg font-bold text-green-600">৳120</span>
</div>
```

---

### 4. **Geolocation Integration** (HIGH PRIORITY)
**Current:** Orders show ALL ready_for_pickup orders, not filtered by proximity
**Needed:** 
- Capture driver's GPS coordinates
- Show only nearby orders (within 5-10 km)
- Calculate and display distance to pickup

**Implementation:**
```typescript
// Backend: Filter by proximity
const driverLocation = driver.currentLocation; // Need to add this to User model
const availableOrders = await Order.find({
  status: 'ready_for_pickup',
  'delivery.driverId': null,
  'lines.storeId.location': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [driverLocation.lng, driverLocation.lat]
      },
      $maxDistance: 10000 // 10km in meters
    }
  }
});
```

---

### 5. **Real-Time Updates** (MEDIUM PRIORITY)
**Current:** Updates only on button click (manual polling)
**Enhancement Options:**
- WebSocket for live feed updates
- Auto-refresh every 30 seconds
- Notification when new orders appear

**Simple Implementation:**
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchDriverOverview();
  }, 30000); // Refresh every 30 seconds
  return () => clearInterval(interval);
}, []);
```

---

### 6. **Maps Integration** (NICE TO HAVE)
**Current:** No map display
**Could Add:**
- Store location on map
- Driver location on map
- Route preview (pickup → delivery)
- Use: Leaflet or Mapbox

---

### 7. **Store Address Details** (HIGH PRIORITY)
**Current:** Store location not included in availableOrders response
**Files to Modify:**
- `server/src/routes/driver.ts` - populate store info in query

**Display in Pickup Queue:**
```tsx
<p className="text-xs text-muted">
  {storeData?.location?.road}, {storeData?.location?.city}
</p>
```

---

## 🎯 Recommended Implementation Order

### Phase 1 (Essential - Do First)
1. ✅ **Populate Store Location in API Response**
   - Modify `driverOverviewRoute` to include store data
   - Takes ~30 minutes
   - File: `server/src/routes/driver.ts`

2. ✅ **Display Pickup Location in UI**
   - Show store address in Pickup Queue card
   - Takes ~20 minutes
   - File: `client/src/pages/Dashboard.tsx`

3. ✅ **Display Delivery Fee**
   - Add ৳120 fee display to each order card
   - Takes ~15 minutes
   - File: `client/src/pages/Dashboard.tsx`

### Phase 2 (Important - High Impact)
4. **Add Driver Geolocation**
   - Add `currentLocation` field to User model
   - Update location on status changes
   - Takes ~1-2 hours

5. **Distance Calculation**
   - Implement Haversine formula
   - Display distance to each order
   - Takes ~1-2 hours

6. **Proximity-Based Filtering**
   - Filter orders by distance (5-10km radius)
   - Takes ~1 hour

### Phase 3 (Nice to Have)
7. **Auto-Refresh Feed**
   - Add 30-second polling
   - Takes ~20 minutes

8. **Maps Integration**
   - Add Leaflet/Mapbox
   - Display pickup location on map
   - Takes ~2-3 hours

---

## 📁 Key Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `server/src/routes/driver.ts` | Driver API endpoints | ✅ Core exists, needs enhancements |
| `server/src/models/Order.ts` | Order schema | ✅ Complete |
| `server/src/models/Store.ts` | Store info | ✅ Has location data |
| `client/src/pages/Dashboard.tsx` | Driver UI | ✅ Pickup Queue UI exists |
| `server/src/models/User.ts` | Driver profile | ⚠️ Needs GPS fields |

---

## 🚀 Quick Start Implementation

### Immediate: Add Store Location to API (30 mins)

**File: `server/src/routes/driver.ts`**

```typescript
const availableOrders = await Order.find({
  status: 'ready_for_pickup',
  'delivery.driverId': null
})
  .populate('lines.storeId')  // Add this line
  .sort({ createdAt: -1 })
  .limit(20);
```

### Next: Display in UI (20 mins)

**File: `client/src/pages/Dashboard.tsx` - Pickup Queue section**

```tsx
{driverOverview.availableOrders.map((order) => {
  // Get store from first line (assuming single store per order)
  const store = order.lines[0]?.storeId;
  
  return (
    <div key={order._id} className="...">
      <div>
        <p className="font-semibold">Order #{order._id.slice(-6)}</p>
        <p className="text-xs text-muted">
          {store?.location?.road}, {store?.location?.city}
        </p>
      </div>
      {/* ... rest of card ... */}
    </div>
  );
})}
```

---

## 💡 Notes
- Daily earnings is hardcoded to ৳120 per delivery - consider making configurable
- No surge pricing or distance-based fees currently
- Orders can be from multiple stores - design decision needed for multi-store orders
- Driver geolocation is critical for "nearby" filtering

