import type { Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import type { AuthedRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import Order from '../models/Order.js';

const driverStatusSchema = z.object({
  online: z.boolean(),
});

export const driverOverviewRoute = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.activeRole !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can access this endpoint' });
    }

    const user = await User.findById(req.user.id).select('isOnline');
    if (!user) return res.status(404).json({ error: 'Driver not found' });

    const driverObjectId = new mongoose.Types.ObjectId(req.user.id);
    const activeStatuses = ['claimed', 'at_store', 'picked_up', 'on_the_way'];

    const activeDeliveries = await Order.find({
      'delivery.driverId': driverObjectId,
      status: { $in: activeStatuses }
    }).sort({ updatedAt: -1 });

    const completedTrips = await Order.countDocuments({
      'delivery.driverId': driverObjectId,
      status: 'delivered'
    });

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    const todaysDeliveries = await Order.find({
      'delivery.driverId': driverObjectId,
      status: 'delivered',
      updatedAt: { $gte: todayStart, $lt: todayEnd }
    });

    const dailyEarnings = todaysDeliveries.length * 120;

    const availableOrders = await Order.find({
      status: 'ready_for_pickup',
      'delivery.driverId': null
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.json({
      isOnline: !!user.isOnline,
      dailyEarnings,
      completedTrips,
      activeDeliveries,
      availableOrders,
    });
  } catch (error) {
    console.error('Driver Overview Error:', error);
    return res.status(500).json({ error: 'Failed to load driver overview' });
  }
};

export const setDriverStatusRoute = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.activeRole !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can update their status' });
    }

    const parsed = driverStatusSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isOnline: parsed.data.online },
      { new: true, runValidators: true }
    ).select('isOnline');

    if (!user) return res.status(404).json({ error: 'Driver not found' });

    return res.json({ isOnline: !!user.isOnline });
  } catch (error) {
    console.error('Set Driver Status Error:', error);
    return res.status(500).json({ error: 'Failed to update driver status' });
  }
};
