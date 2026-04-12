import express from 'express'
import cors from 'cors'

import { healthRoute } from './routes/health.js'
import { addRoleRoute, loginRoute, meRoute, registerRoute } from './routes/auth.js'
import { searchRoute, suggestRoute } from './routes/search.js'
import { getProductRoute } from './routes/products.js'
import { requireAuth } from './middleware/auth.js'
import { upload } from './middleware/upload.js'
import { addProductToStoreRoute, createStoreRoute, getMyStoresRoute, getStoreWithProductsRoute, getAllStoresRoute, uploadStoreDocumentRoute } from './routes/stores.js'
import { addToCartRoute, getCartSummaryRoute, removeCartItemRoute, updateCartItemQtyRoute } from './routes/cart.js'
import { 
  createOrderRoute, 
  getOrderRoute, 
  listMyOrdersRoute, 
  listStoreOrdersRoute, 
  updateOrderStatusRoute 
} from './routes/orders.js';
import { driverOverviewRoute, setDriverStatusRoute } from './routes/driver.js';
import { getAdminStoresRoute, getAdminStoreRoute, updateStoreStatusRoute, updateStoreActiveRoute, deleteStoreRoute, createAdminRoute } from './routes/admin.js';
import { addReviewRoute, getStoreReviewsRoute, getProductReviewsRoute } from './routes/reviews.js';

// Order payments
import paymentRoutes from './routes/payment.js'

export function createApp() {
  const app = express()

  app.use(cors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-active-role'],
  }))
  app.use(express.json({ limit: '10mb' })) // increased limit for base64 uploading

  app.get('/api/health', healthRoute)
  app.get('/api/search', searchRoute)
  app.get('/api/search/suggest', suggestRoute)
  app.get('/api/products/:id', getProductRoute)

  app.post('/api/auth/register', registerRoute as express.RequestHandler)
  app.post('/api/auth/login', loginRoute as express.RequestHandler)
  app.get('/api/me', requireAuth, meRoute as express.RequestHandler)
  app.post('/api/me/roles', requireAuth, addRoleRoute as express.RequestHandler)

  // Orders
  app.get('/api/orders/me', requireAuth, listMyOrdersRoute);
  app.post('/api/orders', requireAuth, createOrderRoute);
  app.get('/api/orders/:id', requireAuth, getOrderRoute);
  app.patch('/api/orders/:id/status', requireAuth, updateOrderStatusRoute);

  app.get('/api/orders/store/:storeId', requireAuth, listStoreOrdersRoute);

  // Reviews
  app.post('/api/reviews', requireAuth, addReviewRoute as express.RequestHandler);
  app.get('/api/stores/:storeId/reviews', getStoreReviewsRoute as express.RequestHandler);
  app.get('/api/products/:productId/reviews', getProductReviewsRoute as express.RequestHandler);

  // Cart
  app.post('/api/cart/add', requireAuth, addToCartRoute as express.RequestHandler)
  app.post('/api/cart/update-qty', requireAuth, updateCartItemQtyRoute as express.RequestHandler)
  app.post('/api/cart/remove', requireAuth, removeCartItemRoute as express.RequestHandler)
  app.get('/api/cart/summary', requireAuth, getCartSummaryRoute as express.RequestHandler)

  // ✅ NEW: Payment Router
  // We attach it to "/api/payment" so your Cart.tsx fetch call works perfectly
  app.use('/api/payment', paymentRoutes)

  // Driver
  app.get('/api/driver/overview', requireAuth, driverOverviewRoute)
  app.post('/api/driver/status', requireAuth, setDriverStatusRoute)

  // Stores and Products
  app.get('/api/stores/all', requireAuth, getAllStoresRoute as express.RequestHandler)
  app.post('/api/stores', requireAuth, createStoreRoute as express.RequestHandler)
  app.get('/api/stores', requireAuth, getMyStoresRoute as express.RequestHandler)
  app.get('/api/stores/:storeId', requireAuth, getStoreWithProductsRoute as express.RequestHandler)
  app.post('/api/stores/:storeId/products', requireAuth, upload.single('image'), addProductToStoreRoute as express.RequestHandler)
  app.post('/api/stores/:storeId/documents', requireAuth, uploadStoreDocumentRoute as express.RequestHandler)

  // Admin Routes
  app.get('/api/admin/stores', requireAuth, getAdminStoresRoute as express.RequestHandler)
  app.get('/api/admin/stores/:id', requireAuth, getAdminStoreRoute as express.RequestHandler)
  app.patch('/api/admin/stores/:id/status', requireAuth, updateStoreStatusRoute as express.RequestHandler)
  app.patch('/api/admin/stores/:id/active', requireAuth, updateStoreActiveRoute as express.RequestHandler)
  app.delete('/api/admin/stores/:id', requireAuth, deleteStoreRoute as express.RequestHandler)
  app.post('/api/admin/admins', requireAuth, createAdminRoute as express.RequestHandler)

  return app
}