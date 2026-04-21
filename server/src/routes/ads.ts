import type { Response, Request } from 'express';
import { z } from 'zod';
import type { AuthedRequest } from '../middleware/auth.js';
import { Ad } from '../models/Ad.js';

// Get active ad (Public)
export async function getActiveAdRoute(req: Request, res: Response) {
  try {
    const ad = await Ad.findOne({ status: 'active' }).sort({ createdAt: -1 });
    if (!ad) return res.status(404).json({ error: 'No active ad found' });
    return res.json(ad);
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

// Track impression (Public)
export async function trackImpressionRoute(req: Request, res: Response) {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, { $inc: { impressions: 1 } }, { new: true });
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

// Track click (Public)
export async function trackClickRoute(req: Request, res: Response) {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } }, { new: true });
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

// Upload Ad (Marketer only)
export async function uploadAdRoute(req: AuthedRequest, res: Response) {
  if (!req.user || (req.user.activeRole !== 'marketer' && req.user.activeRole !== 'admin')) {
    return res.status(403).json({ error: 'Only marketers can upload ads' });
  }

  const schema = z.object({
    imageUrl: z.string().url(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });

  try {
    // Set all other ads to inactive
    await Ad.updateMany({ status: 'active' }, { status: 'inactive' });

    const newAd = new Ad({
      imageUrl: parsed.data.imageUrl,
      status: 'active',
      impressions: 0,
      clicks: 0,
    });

    await newAd.save();
    return res.status(201).json(newAd);
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

// View Ad Analytics (Marketer only)
export async function getAdAnalyticsRoute(req: AuthedRequest, res: Response) {
  if (!req.user || (req.user.activeRole !== 'marketer' && req.user.activeRole !== 'admin')) {
    return res.status(403).json({ error: 'Only marketers or admins can view analytics' });
  }

  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    return res.json(ads);
  } catch (error: any) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}