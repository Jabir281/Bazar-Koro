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