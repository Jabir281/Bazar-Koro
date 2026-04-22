# Module 4: Promoted Listings Engine

## Overview
The Promoted Listings Engine allows sellers to promote their products by setting an advertising budget. Promoted products are visually tagged as "Sponsored" and automatically sorted to appear at the top of search results and product listings.

## Features

### 1. **Product Promotion**
- Sellers can set an ad budget (minimum ৳100) for their products
- Promotions have a configurable duration (1-365 days)
- Promoted products display a "Sponsored" badge

### 2. **Search Results Prioritization**
- Promoted products automatically appear at the top of:
  - Search results based on keyword/category/filters
  - Product feed on homepage
  - Location-based search results
- Non-promoted products appear below sponsored listings
- Multiple promoted products are sorted by creation date

### 3. **Automatic Expiry**
- Promotions automatically expire after the set duration
- Products are automatically untagged as promoted after expiry
- No manual renewal required (but can be extended anytime)

### 4. **Seller Dashboard**
- View promotion status for each product
- Promote/cancel promotions from the Store View
- See budget and remaining duration
- Real-time updates

## Backend Routes

### POST `/api/products/:productId/promote`
**Promote a product**
- **Auth**: Required (Seller role)
- **Body**:
  ```json
  {
    "adBudget": 500,
    "durationDays": 30
  }
  ```
- **Response**: Updated product with promotion details

### GET `/api/products/:productId/ad-status`
**Check promotion status of a product**
- **Auth**: Required
- **Response**:
  ```json
  {
    "productId": "...",
    "isPromoted": true,
    "isActive": true,
    "adBudget": 500,
    "promotedUntil": "2026-05-22T...",
    "daysRemaining": 30
  }
  ```

### DELETE `/api/products/:productId/promote`
**Cancel promotion before expiry**
- **Auth**: Required (Seller role)
- **Response**: Cancelled product

### GET `/api/promotions/active`
**Get all currently active promotions (Admin)**
- **Auth**: Required
- **Response**: List of all products with active promotions

## Frontend Implementation

### Components Updated
1. **ProductList.tsx**: Added "Sponsored" badge for promoted products
2. **StoreView.tsx**: Added promotion modal and promote button for each product

### User Flow
1. Seller views their store
2. For each product, they see a "Promote Product" button
3. Clicking opens a promotion modal with:
   - Ad Budget input (minimum ৳100)
   - Duration input (1-365 days)
   - Cost preview
4. Confirm promotion
5. Product immediately shows "Sponsored" badge
6. Product appears at top of search results

## Database Schema

### Product Model Updates
```typescript
{
  ...existing fields...
  adBudget?: number;           // Promotion budget in Taka
  isPromoted?: boolean;        // Currently promoted?
  promotedUntil?: Date;        // When promotion expires
}
```

## Search Algorithm

Modified `/api/search` endpoint:
1. Apply geo-location filter (if provided)
2. Apply text/category/price filters
3. **NEW**: Calculate `isCurrentlyPromoted` field:
   - True if `isPromoted=true` AND `promotedUntil > now`
   - False otherwise
4. Sort by:
   - `isCurrentlyPromoted` (DESC) - promoted first
   - `createdAt` (DESC) - newest first
5. Apply pagination

## Key Benefits

✅ **For Sellers**: Simple way to boost product visibility
✅ **For Platform**: Revenue stream from promotional advertising
✅ **For Buyers**: Better discovery of featured products
✅ **For Search**: Improved sorting and ranking system

## Future Enhancements

- Analytics dashboard for promotion performance
- A/B testing for different bidding strategies
- Automated budgeting recommendations
- Category-specific promotion rates
- Performance-based refunds

## Testing

### Manual Testing Steps
1. Create a seller account
2. Create a store with 2+ products
3. Go to Store View
4. Click "Promote Product" on any product
5. Set budget (e.g., ৳500) and duration (e.g., 30 days)
6. Confirm promotion
7. Verify "Sponsored" badge appears
8. Go to search page and confirm product appears at top
9. Check `/api/products/:id/ad-status` to verify promotion is active

### Test Cases
- [ ] Promote product successfully
- [ ] Verify promoted product appears at top of search
- [ ] Cancel promotion before expiry
- [ ] Verify promotion expires automatically
- [ ] Check multiple promoted products sort by date
- [ ] Verify non-sellers cannot promote products
- [ ] Verify sellers can only promote their own products
