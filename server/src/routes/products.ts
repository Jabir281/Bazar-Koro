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
      
      // ✅ Added the new inventory fields here!
      stockQuantity: (product as any).stockQuantity ?? 1,
      isOutOfStock: (product as any).isOutOfStock ?? false,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ NEW: UPDATE a product (Edit price, category, stock, toggle out-of-stock)
export const updateProductRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, location, stockQuantity, isOutOfStock } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, category, location, stockQuantity, isOutOfStock },
      { new: true } // Returns the newly updated document
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// ✅ NEW: DELETE a product
export const deleteProductRoute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product successfully deleted' });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// ✅ GET all products for a specific store
export const getProductsByStoreRoute = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.params;
    const products = await Product.find({ storeId }).lean();
    res.json(products);
  } catch (error) {
    console.error("Fetch products by store error:", error);
    res.status(500).json({ message: 'Failed to fetch products for store' });
  }
};