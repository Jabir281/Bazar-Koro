import type { Response } from 'express'
import { z } from 'zod'

import type { AuthedRequest } from '../middleware/auth.js'
import { createOrder, getOrderById, listOrdersForBuyer, updateOrder } from '../storage.js'

const cartLineSchema = z.object({
  productId: z.string().min(1),
  storeId: z.string().min(1),
  name: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  qty: z.number().int().positive(),
})

const createOrderSchema = z.object({
  lines: z.array(cartLineSchema).min(1),
})

const statusSchema = z.enum([
  'placed',
  'accepted',
  'rejected',
  'ready_for_pickup',
  'claimed',
  'at_store',
  'picked_up',
  'on_the_way',
  'delivered',
])

const updateStatusSchema = z.object({
  status: statusSchema,
  driverId: z.string().optional(),
  proof: z
    .object({
      pinLast4: z.string().length(4).optional(),
      photoUrl: z.string().url().optional(),
    })
    .optional(),
})

export function listMyOrdersRoute(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
  if (req.user.activeRole !== 'buyer') {
    return res.status(403).json({ error: 'Only buyers can list their orders in this starter API' })
  }
  return res.json({ orders: listOrdersForBuyer(req.user.id) })
}

export function createOrderRoute(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
  if (req.user.activeRole !== 'buyer') {
    return res.status(403).json({ error: 'Only buyers can create orders in this starter API' })
  }

  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() })

  const storeIds = [...new Set(parsed.data.lines.map((l) => l.storeId))]
  const order = createOrder({ buyerId: req.user.id, lines: parsed.data.lines, storeIds })
  return res.status(201).json({ order })
}

export function getOrderRoute(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
  const order = getOrderById(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found' })

  const canSee = req.user.activeRole === 'admin' || order.buyerId === req.user.id
  if (!canSee) return res.status(403).json({ error: 'Not allowed' })

  return res.json({ order })
}

export function updateOrderStatusRoute(req: AuthedRequest, res: Response) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' })

  const order = getOrderById(req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found' })

  const parsed = updateStatusSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() })

  const nextStatus = parsed.data.status
  const role = req.user.activeRole

  const allowedByRole: Record<string, Set<string>> = {
    buyer: new Set(['placed']),
    seller: new Set(['accepted', 'rejected', 'ready_for_pickup']),
    driver: new Set(['claimed', 'at_store', 'picked_up', 'on_the_way', 'delivered']),
    admin: new Set(['accepted', 'rejected', 'ready_for_pickup', 'claimed', 'at_store', 'picked_up', 'on_the_way', 'delivered']),
    marketer: new Set([]),
  }

  if (!allowedByRole[role]?.has(nextStatus)) {
    return res.status(403).json({
      error: 'Role cannot set that status in this starter API',
      details: { role, nextStatus },
    })
  }

  const updated = {
    ...order,
    status: nextStatus,
    delivery:
      role === 'driver'
        ? {
            driverId: parsed.data.driverId ?? order.delivery?.driverId ?? req.user.id,
            proof: parsed.data.proof ?? order.delivery?.proof,
          }
        : order.delivery,
  }

  return res.json({ order: updateOrder(updated) })
}
