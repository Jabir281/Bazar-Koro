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

function calculateDeliveryCharge(distance: number, weight: number): number {
  let baseFee = 0;
  if (distance <= 2) {
    baseFee = 50;
  } else if (distance <= 6) {
    baseFee = 50 + (distance - 2) * 12;
  } else {
    baseFee = 98 + (distance - 6) * 15;
  }
  
  return baseFee;
}

async function computeSummary(items: any[]) {
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.qty, 0)
  
  const productIds = items.map((i) => i.productId)
  const products = await Product.find({ _id: { $in: productIds } })
  
  let totalDelivery = 0

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

  let platformFee = 0;

  if (items.length > 0) {
    for (const group of groupedByStore.values()) {
        let storeWeight = 0;
        for (const item of group.items) {
          const product = products.find(p => p.id === item.productId || p._id.toString() === item.productId);
          const weight = product && (product as any).weight ? (product as any).weight : 1; 
          storeWeight += weight * item.qty;
        }
        
        // Mock distance for now (4.5 km) since buyer location is not strictly available in this schema
        const distance = 4.5; 
        totalDelivery += calculateDeliveryCharge(distance, storeWeight);
    }
    
    // Platform fee
    platformFee = 10;
  }

  let total = subtotal + totalDelivery + platformFee
  total = Math.round(total / 5) * 5

  return {
    items,
    grouped: [...groupedByStore.values()],
    subtotal,
    deliveryCharge: totalDelivery,
    platformFee,
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

  // ✅ Check if there's enough stock
  if ((product as any).stockQuantity < qty) {
    return res.status(400).json({ error: 'Not enough stock available', available: (product as any).stockQuantity })
  }

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

  // ✅ Decrease product stock by the quantity added to cart
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $inc: { stockQuantity: -qty },
    },
    { new: true }
  )

  // ✅ Auto-toggle isOutOfStock when stock reaches 0
  if (updatedProduct && (updatedProduct as any).stockQuantity <= 0) {
    await Product.findByIdAndUpdate(productId, { isOutOfStock: true, stockQuantity: 0 })
  }

  await cart.save()
  return res.status(201).json(await computeSummary(cart.items))
}

export async function updateCartItemQtyRoute(req: AuthedRequest, res: Response) {
  if (!requireBuyer(req, res)) return

  const parsed = updateQtySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() })

  const { productId, qty } = parsed.data

  const cart = await Cart.findOne({ buyerId: req.user.id })
  if (!cart) return res.json(await computeSummary([]))

  const index = cart.items.findIndex((i) => i.productId === productId)
  if (index < 0) return res.status(404).json({ error: 'Cart item not found' })

  const oldQty = cart.items[index].qty
  const qtyDifference = qty - oldQty // Positive if increasing, negative if decreasing

  // ✅ Adjust stock based on quantity change
  if (qtyDifference !== 0) {
    const product = await Product.findById(productId)
    if (product) {
      if (qtyDifference > 0) {
        // Increasing quantity - check if enough stock
        if ((product as any).stockQuantity < qtyDifference) {
          return res.status(400).json({ error: 'Not enough stock available', available: (product as any).stockQuantity })
        }
        // Decrease stock
        await Product.findByIdAndUpdate(productId, { $inc: { stockQuantity: -qtyDifference } })
      } else {
        // Decreasing quantity - restore stock
        await Product.findByIdAndUpdate(productId, {
          $inc: { stockQuantity: -qtyDifference }, // This adds back since qtyDifference is negative
          isOutOfStock: false // Re-enable if it was out of stock
        })
      }
    }
  }

  if (qty === 0) {
    cart.items.splice(index, 1)
  } else {
    cart.items[index].qty = qty
  }

  await cart.save()
  return res.json(await computeSummary(cart.items))
}

export async function removeCartItemRoute(req: AuthedRequest, res: Response) {
  if (!requireBuyer(req, res)) return

  const parsed = removeItemSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() })

  const cart = await Cart.findOne({ buyerId: req.user.id })
  if (!cart) return res.json(await computeSummary([]))

  const itemToRemove = cart.items.find((i) => i.productId === parsed.data.productId)
  
  // ✅ Restore stock when item is removed from cart
  if (itemToRemove) {
    await Product.findByIdAndUpdate(itemToRemove.productId, {
      $inc: { stockQuantity: itemToRemove.qty }, // Add back the quantity
      isOutOfStock: false // Re-enable if it was out of stock
    })
  }

  cart.items = cart.items.filter((i) => i.productId !== parsed.data.productId)
  await cart.save()
  return res.json(await computeSummary(cart.items))
}

export async function getCartSummaryRoute(req: AuthedRequest, res: Response) {
  if (!requireBuyer(req, res)) return

  const cart = await Cart.findOne({ buyerId: req.user.id })
  return res.json(await computeSummary(cart?.items ?? []))
}
