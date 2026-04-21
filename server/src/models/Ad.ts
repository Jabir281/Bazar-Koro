import mongoose from 'mongoose';

export interface IAd {
  imageUrl: string;
  status: 'active' | 'inactive';
  impressions: number;
  clicks: number;
}

const adSchema = new mongoose.Schema<IAd>(
  {
    imageUrl: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

adSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
  },
});

export const Ad = mongoose.model<IAd>('Ad', adSchema);