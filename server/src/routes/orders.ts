import type { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import type { AuthedRequest } from '../middleware/auth.js';
import Order from '../models/Order.js'; // Using the real MongoDB model now!
import { User } from '../models/User.js';

// --- TEAMMATE's ZOD SCHEMAS (Kept exactly as they wrote them) ---
const cartLineSchema = z.object({
  productId: z.string().min(1),
  storeId: z.string().min(1),
  name: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  qty: z.number().int().positive(),
});

const createOrderSchema = z.object({
  lines: z.array(cartLineSchema).min(1),
});

const statusSchema = z.enum([
  'placed', 'accepted', 'rejected', 'ready_for_pickup', 'claimed', 'at_store', 'picked_up', 'on_the_way', 'delivered'
]);

const updateStatusSchema = z.object({
  status: statusSchema,
  driverId: z.string().optional(),
  proof: z.object({
    pinLast4: z.string().length(4).optional(),
    photoUrl: z.string().url().optional(),
  }).optional(),
});
// ----------------------------------------------------------------

// 1. BUYER: List their own orders
export const listMyOrdersRoute = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.activeRole !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can list their orders' });
    }
    
    const orders = await Order.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ error: 'Database error fetching orders' });
  }
};

// 2. BUYER: Create a new order
export const createOrderRoute = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.activeRole !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can create orders' });
    }

    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });

    // Save directly to MongoDB with the safe ObjectId conversion
    const order = await Order.create({
      buyerId: new mongoose.Types.ObjectId(req.user.id),
      lines: parsed.data.lines,
      status: 'placed'
    });

    return res.status(201).json({ order });
  } catch (err) {
    return res.status(500).json({ error: 'Database error creating order' });
  }
};

// 3. ANY: Get a specific order by ID
export const getOrderRoute = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Teammate's visibility check
    const canSee = req.user.activeRole === 'admin' || order.buyerId.toString() === req.user.id;
    if (!canSee) return res.status(403).json({ error: 'Not allowed' });

    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ error: 'Database error fetching order' });
  }
};

// 4. SELLER: View incoming orders for their store (NEW for Feature 2!)
export const listStoreOrdersRoute = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.activeRole !== 'seller' && req.user.activeRole !== 'admin') {
      return res.status(403).json({ error: 'Only sellers can view store orders' });
    }
    
    const { storeId } = req.params;
    const orders = await Order.find({ 'lines.storeId': storeId }).sort({ createdAt: -1 });
    
    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ error: 'Database error fetching store orders' });
  }
};

// 5. SELLER/DRIVER: Update status using teammate's strict role checks
export const updateOrderStatusRoute = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });

    const nextStatus = parsed.data.status;
    const role = req.user.activeRole;

    const allowedByRole: Record<string, Set<string>> = {
      buyer: new Set(['placed']),
      seller: new Set(['accepted', 'rejected', 'ready_for_pickup']),
      driver: new Set(['claimed', 'at_store', 'picked_up', 'on_the_way', 'delivered']),
      admin: new Set(['accepted', 'rejected', 'ready_for_pickup', 'claimed', 'at_store', 'picked_up', 'on_the_way', 'delivered']),
      marketer: new Set([]),
    };

    if (role === 'driver') {
      const driver = await User.findById(req.user.id).select('isOnline');
      if (!driver?.isOnline) {
        return res.status(403).json({ error: 'Driver must be online to update delivery status' });
      }
    }

    if (!allowedByRole[role]?.has(nextStatus)) {
      return res.status(403).json({
        error: 'Role cannot set that status',
        details: { role, nextStatus },
      });
    }

    // Apply updates
    order.status = nextStatus as any;
    
    if (role === 'driver') {
      // 1. Ensure the delivery object exists
      if (!order.delivery) {
        order.delivery = { driverId: null, proof: {} } as any;
      }
      
      const driverIdString = parsed.data.driverId ?? req.user.id;
      
      // 2. Add the '!' operator after order.delivery to satisfy TypeScript
      if (!order.delivery!.driverId) {
        order.delivery!.driverId = new mongoose.Types.ObjectId(driverIdString) as any;
      }
      
      if (parsed.data.proof) {
        order.delivery!.proof = parsed.data.proof;
      }
    }

    await order.save();
    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ error: 'Database error updating status' });
  }
};