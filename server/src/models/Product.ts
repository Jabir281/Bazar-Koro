import mongoose, { Schema, Document } from 'mongoose';

// Interface extending mongoose Document
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  storeId: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: number[];
  };
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, index: true }, // Index for faster text search
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  
  // This is the specific format MongoDB needs for location
  location: {
    type: {
      type: String, 
      enum: ['Point'], 
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // Note: [longitude, latitude]
      required: true
    }
  }
}, { timestamps: true });

// CRITICAL: This index allows MongoDB to calculate distances
ProductSchema.index({ location: '2dsphere' });

export default mongoose.model<IProduct>('Product', ProductSchema);