import mongoose from 'mongoose';

export interface IStore {
  name: string;
  ownerName: string;
  location: {
    city: string;
    road: string;
    address: string;
  };
  type: 'pharmacy' | 'general_store';
  sellerId: string;
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
    type: { type: String, enum: ['pharmacy', 'general_store'], required: true },
    sellerId: { type: String, required: true }
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