import type { Response } from 'express'
import { z } from 'zod'

import type { AuthedRequest } from '../middleware/auth.js'
import { Cart } from '../models/Cart.js'
import Product from '../models/Product.js'
import { Store } from '../models/Store.js'

const addToCartSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().positive().optional().default(1),
})

const updateQtySchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int().nonnegative(),
})

const removeItemSchema = z.object({
  productId: z.string().min(1),
})

function requireBuyer(req: AuthedRequest, res: Response): req is AuthedRequest & { user: NonNullable<AuthedRequest['user']> } {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' })
    return false
  }
  if (req.user.activeRole !== 'buyer') {
    res.status(403).json({ error: 'Only buyers can use cart endpoints' })
    return false
  }
  return true
}

function computeSummary(items: any[]) {
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.qty, 0)
  const deliveryCharge = items.length > 0 ? 120 : 0
  const total = subtotal + deliveryCharge

  const groupedByStore = new Map<string, { storeId: string; storeName?: string; items: any[]; subtotal: number }>()
  for (const item of items) {
    const key = item.storeId
    const existing = groupedByStore.get(key)
    if (existing) {
      existing.items.push(item)
      existing.subtotal += item.unitPrice * item.qty
    } else {
      groupedByStore.set(key, {
        storeId: item.storeId,
        storeName: item.storeName,
        items: [item],
        subtotal: item.unitPrice * item.qty,
      })
    }
  }

  return {
    items,
    grouped: [...groupedByStore.values()],
    subtotal,
    deliveryCharge,
    total,
  }
}

export async function addToCartRoute(req: AuthedRequest, res: Response) {
  if (!requireBuyer(req, res)) return

  const parsed = addToCartSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() })

  const { productId, qty } = parsed.data

  const product = await Product.findById(productId)
  if (!product) return res.status(404).json({ error: 'Product not found' })

  const store = await Store.findById(typeof product.storeId === 'string' ? product.storeId : product.storeId.toString())
  if (!store) return res.status(404).json({ error: 'Store not found for product' })

  const storeId = typeof product.storeId === 'string' ? product.storeId : product.storeId.toString()

  const cart = (await Cart.findOne({ buyerId: req.user.id })) ?? new Cart({ buyerId: req.user.id, items: [] })

  const existingIndex = cart.items.findIndex((i) => i.productId === productId)
  if (existingIndex >= 0) {
    cart.items[existingIndex].qty += qty
    cart.items[existingIndex].unitPrice = product.price
    cart.items[existingIndex].name = product.name
    cart.items[existingIndex].storeId = storeId
    cart.items[existingIndex].storeName = store.name
    cart.items[existingIndex].imageUrl = product.imageUrl
  } else {
    cart.items.push({
      productId,
      storeId,
      storeName: store.name,
      name: product.name,
      unitPrice: product.price,
      qty,
      imageUrl: product.imageUrl,
    })
  }

  await cart.save()
  return res.status(201).json(computeSummary(cart.items))
}

export async function updateCartItemQtyRoute(req: AuthedRequest, res: Response) {
  if (!requireBuyer(req, res)) return

  const parsed = updateQtySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() })

  const { productId, qty } = parsed.data

  const cart = await Cart.findOne({ buyerId: req.user.id })
  if (!cart) return res.json(computeSummary([]))

  const index = cart.items.findIndex((i) => i.productId === productId)
  if (index < 0) return res.status(404).json({ error: 'Cart item not found' })

  if (qty === 0) {
    cart.items.splice(index, 1)
  } else {
    cart.items[index].qty = qty
  }

  await cart.save()
  return res.json(computeSummary(cart.items))
}

export async function removeCartItemRoute(req: AuthedRequest, res: Response) {
  if (!requireBuyer(req, res)) return

  const parsed = removeItemSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() })

  const cart = await Cart.findOne({ buyerId: req.user.id })
  if (!cart) return res.json(computeSummary([]))

  cart.items = cart.items.filter((i) => i.productId !== parsed.data.productId)
  await cart.save()
  return res.json(computeSummary(cart.items))
}

export async function getCartSummaryRoute(req: AuthedRequest, res: Response) {
  if (!requireBuyer(req, res)) return

  const cart = await Cart.findOne({ buyerId: req.user.id })
  return res.json(computeSummary(cart?.items ?? []))
}
