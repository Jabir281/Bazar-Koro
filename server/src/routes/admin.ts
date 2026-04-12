import type { Response } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth.js';
import { Store } from '../models/Store.js';
import { User } from '../models/User.js';
import { hashPassword } from '../auth.js';

export async function getAdminStoresRoute(req: AuthedRequest, res: Response) {
  if (!req.user || req.user.activeRole !== 'admin') {
    return res.status(403).json({ error: 'Only admins can view this' });
  }

  try {
    const stores = await Store.find().sort({ createdAt: -1 });
    return res.json(stores);
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

export async function getAdminStoreRoute(req: AuthedRequest, res: Response) {
  if (!req.user || req.user.activeRole !== 'admin') {
    return res.status(403).json({ error: 'Only admins can view this' });
  }

  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    return res.json(store);
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

export async function updateStoreStatusRoute(req: AuthedRequest, res: Response) {
  if (!req.user || req.user.activeRole !== 'admin') {
    return res.status(403).json({ error: 'Only admins can update store status' });
  }

  const { status } = req.body;
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!store) return res.status(404).json({ error: 'Store not found' });
    return res.json(store);
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

export async function updateStoreActiveRoute(req: AuthedRequest, res: Response) {
  if (!req.user || req.user.activeRole !== 'admin') {
    return res.status(403).json({ error: 'Only admins can update store availability' });
  }

  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'isActive must be a boolean' });
  }

  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );
    if (!store) return res.status(404).json({ error: 'Store not found' });
    return res.json(store);
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

export async function deleteStoreRoute(req: AuthedRequest, res: Response) {
  if (!req.user || req.user.activeRole !== 'admin') {
    return res.status(403).json({ error: 'Only admins can delete stores' });
  }

  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    return res.json({ message: 'Store deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

export async function createAdminRoute(req: AuthedRequest, res: Response) {
  if (!req.user || req.user.activeRole !== 'admin') {
    return res.status(403).json({ error: 'Only admins can create other admins' });
  }

  // Double check if it's the super admin. We can rely on email or another flag.
  if (req.user.email !== 'irtizajabir1@gmail.com') {
    return res.status(403).json({ error: 'Only the super admin can create other admins' });
  }

  const schema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload' });

  try {
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await hashPassword(parsed.data.password);
    const user = new User({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      roles: ['admin'] // explicitly create as admin
    });

    await user.save();
    return res.status(201).json({ message: 'Admin created successfully', user: { id: user._id, email: user.email } });
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
