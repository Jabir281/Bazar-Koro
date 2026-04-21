import express from 'express'
import cors from 'cors'

import { healthRoute } from './routes/health.js'
import { addRoleRoute, loginRoute, meRoute, registerRoute } from './routes/auth.js'
import { searchRoute, suggestRoute } from './routes/search.js'
import { getProductRoute, getProductsByStoreRoute, updateProductRoute } from './routes/products.js'
import { requireAuth } from './middleware/auth.js'
import { addProductToStoreRoute, createStoreRoute, getMyStoresRoute, getStoreWithProductsRoute, getAllStoresRoute, uploadStoreDocumentRoute } from './routes/stores.js'
import { addToCartRoute, getCartSummaryRoute, removeCartItemRoute, updateCartItemQtyRoute } from './routes/cart.js'
import { 
  createOrderRoute, 
  getOrderRoute, 
  listMyOrdersRoute, 
  listStoreOrdersRoute, 
  updateOrderStatusRoute 
} from './routes/orders.js';
import { driverOverviewRoute, setDriverStatusRoute, setDriverGoalRoute } from './routes/driver.js';
import { getAdminStoresRoute, getAdminStoreRoute, updateStoreStatusRoute, updateStoreActiveRoute, deleteStoreRoute, createAdminRoute } from './routes/admin.js';


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
  app.put('/api/products/:id', requireAuth, updateProductRoute as express.RequestHandler)
  //app.delete('/api/products/:id', requireAuth, deleteProductRoute as express.RequestHandler)

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
  // Cart
  app.post('/api/cart/add', requireAuth, addToCartRoute as express.RequestHandler)
  app.post('/api/cart/update-qty', requireAuth, updateCartItemQtyRoute as express.RequestHandler)
  app.post('/api/cart/remove', requireAuth, removeCartItemRoute as express.RequestHandler)
  app.get('/api/cart/summary', requireAuth, getCartSummaryRoute as express.RequestHandler)

  // Payment Router
  app.use('/api/payment', paymentRoutes)

  // Driver
  app.get('/api/driver/overview', requireAuth, driverOverviewRoute)
  app.post('/api/driver/status', requireAuth, setDriverStatusRoute)
  app.post('/api/driver/goal', requireAuth, setDriverGoalRoute)

  // Stores and Products
  app.get('/api/stores/all', requireAuth, getAllStoresRoute as express.RequestHandler)
  app.post('/api/stores', requireAuth, createStoreRoute as express.RequestHandler)
  app.get('/api/stores', requireAuth, getMyStoresRoute as express.RequestHandler)
  app.get('/api/stores/:storeId', requireAuth, getStoreWithProductsRoute as express.RequestHandler)
  app.post('/api/stores/:storeId/products', requireAuth, addProductToStoreRoute as express.RequestHandler)
  app.get('/api/products/store/:storeId', requireAuth, getProductsByStoreRoute as express.RequestHandler)

  return app
}