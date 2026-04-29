# 🚀 EXAM SURVIVAL TEMPLATES

You'll find 3 files in this folder. When facing an exam question like **"Create a new feature to manage X"**, just copy these 3 files to their respective homes and wire them up.

## 📂 The Files
1. **`FrontendPageTemplate.tsx`**: Everything React. Put this in `client/src/pages/`.
2. **`BackendRouteTemplate.ts`**: Everything Express. Put this in `server/src/routes/`.
3. **`DatabaseModelTemplate.ts`**: Everything Mongoose. Put this in `server/src/models/`.

---

## 🔗 HOW TO LINK THEM TOGETHER IN 4 STEPS

### 1. The Database (Backend)
- Copy `DatabaseModelTemplate.ts` to `server/src/models/YourFeature.ts`.
- Edit the `Schema` at the top to have the fields the exam asks for (e.g. `price: Number`).

### 2. The Routes (Backend)
- Copy `BackendRouteTemplate.ts` to `server/src/routes/yourFeature.ts`.
- Inside `yourFeature.ts`, update the `requireRole('buyer')` if it's meant for sellers/admins.
- Inside `server/src/app.ts`, register the route so the API works:
  ```ts
  import yourFeatureRoute from './routes/yourFeature.js';
  // ... further down inside createApp() ...
  app.use('/api/your-feature', yourFeatureRoute);
  ```

### 3. The Page (Frontend)
- Copy `FrontendPageTemplate.tsx` to `client/src/pages/YourFeature.tsx`.
- Update the `fetch()` lines inside that page to point to `/api/your-feature`.
- Update the `<input>` fields so they match whatever variables you used in your Backend Route & Database Model (e.g. `<input value={formData.price} ... />`).

### 4. Finally, Show the Page (Frontend Routing)
- Open `client/src/App.tsx` (or `main.tsx` depending on your router setup).
- Add the route path so you can visit the page:
  ```tsx
  import YourFeature from './pages/YourFeature';
  // ... inside <Routes> ...
  <Route path="/your-feature" element={<YourFeature />} />
  ```
- **Done! Run `npm run dev:local` and test it.**