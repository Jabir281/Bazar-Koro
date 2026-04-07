import type { Response } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth.js';
import { Store } from '../models/Store.js';
import Product from '../models/Product.js';

const storeSchema = z.object({
  name: z.string().min(1),
  ownerName: z.string().min(1),
  location: z.object({
    city: z.string().min(1),
    road: z.string().min(1),
    address: z.string().min(1)
  }),
  type: z.enum(['pharmacy', 'general_store'])
});

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  imageUrl: z.string() // expected to be base64 data url from frontend
});

export async function createStoreRoute(req: AuthedRequest, res: Response) {
  if (!req.user || req.user.activeRole !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can create a store' });
  }

  const parsed = storeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid data', details: parsed.error.flatten() });

  try {
    const store = new Store({
      ...parsed.data,
      sellerId: req.user.id
    });
    const saved = await store.save();
    return res.status(201).json(saved);
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

export async function getAllStoresRoute(req: AuthedRequest, res: Response) {
  try {
    const stores = await Store.find();
    return res.json(stores);
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

export async function getMyStoresRoute(req: AuthedRequest, res: Response) {
  if (!req.user || req.user.activeRole !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can view their stores' });
  }

  try {
    const stores = await Store.find({ sellerId: req.user.id });
    return res.json(stores);
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

export async function getStoreWithProductsRoute(req: AuthedRequest, res: Response) {
  try {
    const store = await Store.findById(req.params.storeId);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    
    // Security check: If requested as seller, make sure it belongs to them
    if (req.user?.activeRole === 'seller' && store.sellerId !== req.user.id) {
       return res.status(403).json({ error: 'Not your store' });
    }

    const products = await Product.find({ storeId: { $in: [store.id, store._id] } });
    return res.json({ store, products });
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

export async function addProductToStoreRoute(req: AuthedRequest, res: Response) {
  if (!req.user || req.user.activeRole !== 'seller') {
    return res.status(403).json({ error: 'Only sellers can add products' });
  }

  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid product data', details: parsed.error.flatten() });

  try {
    const store = await Store.findById(req.params.storeId);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    if (store.sellerId !== req.user.id) return res.status(403).json({ error: 'Not your store' });

    const product = new Product({
      ...parsed.data,
      storeId: store.id
    });
    const saved = await product.save();
    return res.status(201).json(saved);
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}