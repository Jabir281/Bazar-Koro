import mongoose from 'mongoose';

export interface IStore {
  name: string;
  ownerName: string;
  location: {
    city: string;
    road: string;
    address: string;
  };
  description?: string;
  operatingHours?: string;
  type: 'pharmacy' | 'general_store';
  sellerId: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  documents: string[];
}

const storeSchema = new mongoose.Schema<IStore>(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    location: {
      city: { type: String, required: true },
      road: { type: String, required: true },
      address: { type: String, required: true }
    },
    description: { type: String },
    operatingHours: { type: String },
    type: { type: String, enum: ['pharmacy', 'general_store'], required: true },
    sellerId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    isActive: { type: Boolean, default: true },
    documents: [{ type: String }]
  },
  { timestamps: true }
);

storeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  }
});

export const Store = mongoose.model<IStore>('Store', storeSchema);