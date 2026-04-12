import mongoose from 'mongoose'

export interface IProduct {
  name: string
  description: string
  price: number
  category?: string
  storeId: mongoose.Types.ObjectId
  imageUrl: string
  location?: {
    type: 'Point'
    coordinates: [number, number]
  }
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, default: 'general' },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    imageUrl: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        required: false,
      },
    },
  },
  { timestamps: true }
)

productSchema.index({ location: '2dsphere' }, { sparse: true })

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id
    delete ret._id
  },
})

export default mongoose.model<IProduct>('Product', productSchema)
