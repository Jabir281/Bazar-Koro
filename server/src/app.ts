import express from 'express'
import cors from 'cors'

import { healthRoute } from './routes/health.js'
import { loginRoute, meRoute, registerRoute } from './routes/auth.js'
import { createOrderRoute, getOrderRoute, listMyOrdersRoute, updateOrderStatusRoute } from './routes/orders.js'
import { requireAuth } from './middleware/auth.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', healthRoute)

  app.post('/api/auth/register', registerRoute)
  app.post('/api/auth/login', loginRoute)
  app.get('/api/me', requireAuth, meRoute)

  app.get('/api/orders', requireAuth, listMyOrdersRoute)
  app.post('/api/orders', requireAuth, createOrderRoute)
  app.get('/api/orders/:id', requireAuth, getOrderRoute)
  app.post('/api/orders/:id/status', requireAuth, updateOrderStatusRoute)

  return app
}
