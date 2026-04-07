import { Request, Response } from 'express';
import Product from '../models/Product.js';

export const getProductRoute = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({
      _id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      storeId: product.storeId.toString(),
      location: product.location,
      createdAt: (product as any).createdAt?.toString(),
      updatedAt: (product as any).updatedAt?.toString(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};