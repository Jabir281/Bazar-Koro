import { Request, Response } from 'express'
import Product from '../models/Product.js' // Adjust path if your model is elsewhere
import { SearchFilters, SearchResponse } from '@bazar-koro/shared'

export const searchRoute = async (req: Request<{}, {}, {}, SearchFilters>, res: Response) => {
  try {
    const { 
      keyword, 
      category, 
      minPrice, 
      maxPrice, 
      lat, 
      lng, 
      radius = 10, 
      page = 1, 
      limit = 20 
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    // Keyword Search
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }

    // Category Filter (case‑insensitive exact match)
    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    // Price Range Filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    // Distance/Location Filter (Geospatial)
    if (lat !== undefined && lng !== undefined) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(radius) * 1000, // Convert km to meters
        },
      };
    }

    // Execute Database Queries
    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(limitNum)
        .lean(), // Use lean for better performance on read-only search
      Product.countDocuments(query),
    ]);

    const response: SearchResponse = {
      products: products.map((p: any) => ({
        _id: p._id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        storeId: p.storeId.toString(),
        location: p.location,
        distance: p.distance, // Will be populated if using aggregation later
        createdAt: p.createdAt?.toString(),
        updatedAt: p.updatedAt?.toString(),
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Search Engine Error:', error);
    res.status(500).json({ message: 'Internal server error during search' });
  }
};