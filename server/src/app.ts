import express from 'express'
import cors from 'cors'

import { healthRoute } from './routes/health.js'
import { addRoleRoute, loginRoute, meRoute, registerRoute } from './routes/auth.js'
import { createOrderRoute, getOrderRoute, listMyOrdersRoute, updateOrderStatusRoute } from './routes/orders.js'
import { searchRoute } from './routes/search.js'
import { getProductRoute } from './routes/products.js'
import { requireAuth } from './middleware/auth.js'
import { addProductToStoreRoute, createStoreRoute, getMyStoresRoute, getStoreWithProductsRoute, getAllStoresRoute } from './routes/stores.js'
import { addToCartRoute, getCartSummaryRoute, removeCartItemRoute, updateCartItemQtyRoute } from './routes/cart.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '10mb' })) // increased limit for base64 uploading

  app.get('/api/health', healthRoute)
  app.get('/api/search', searchRoute)
  app.get('/api/products/:id', getProductRoute)

  app.post('/api/auth/register', registerRoute as express.RequestHandler)
  app.post('/api/auth/login', loginRoute as express.RequestHandler)
  app.get('/api/me', requireAuth, meRoute as express.RequestHandler)
  app.post('/api/me/roles', requireAuth, addRoleRoute as express.RequestHandler)

  // Orders
  app.get('/api/orders', requireAuth, listMyOrdersRoute as express.RequestHandler)
  app.post('/api/orders', requireAuth, createOrderRoute as express.RequestHandler)
  app.get('/api/orders/:id', requireAuth, getOrderRoute as express.RequestHandler)
  app.post('/api/orders/:id/status', requireAuth, updateOrderStatusRoute as express.RequestHandler)

  // Cart
  app.post('/api/cart/add', requireAuth, addToCartRoute as express.RequestHandler)
  app.post('/api/cart/update-qty', requireAuth, updateCartItemQtyRoute as express.RequestHandler)
  app.post('/api/cart/remove', requireAuth, removeCartItemRoute as express.RequestHandler)
  app.get('/api/cart/summary', requireAuth, getCartSummaryRoute as express.RequestHandler)

  // Stores and Products
  app.get('/api/stores/all', requireAuth, getAllStoresRoute as express.RequestHandler)
  app.post('/api/stores', requireAuth, createStoreRoute as express.RequestHandler)
  app.get('/api/stores', requireAuth, getMyStoresRoute as express.RequestHandler)
  app.get('/api/stores/:storeId', requireAuth, getStoreWithProductsRoute as express.RequestHandler)
  app.post('/api/stores/:storeId/products', requireAuth, addProductToStoreRoute as express.RequestHandler)

  return app
}