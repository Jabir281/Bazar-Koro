<<<<<<< HEAD
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
=======
import mongoose from 'mongoose';

export interface IProduct {
  storeId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    storeId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true } // Storing base64 string for simplicity
  },
  { timestamps: true }
);

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  }
});

export const Product = mongoose.model<IProduct>('Product', productSchema);
>>>>>>> 2fef71fe83e9cf94cd8925093b644a31cb050982
