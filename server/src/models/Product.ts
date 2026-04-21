import mongoose from 'mongoose'

export interface IProduct {
  name: string
  description: string
  price: number
  category?: string
  stockQuantity: number     // Added for inventory
  isOutOfStock: boolean     // Added for inventory
  storeId: mongoose.Types.ObjectId
  weight?: number
  imageUrl: string          // Notice it's imageUrl, not image
  location?: {
    type: 'Point'
    coordinates: [number, number]
  }
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true }, // Required!
    price: { type: Number, required: true },
    category: { type: String, default: 'general' },
    stockQuantity: { type: Number, default: 0 },   // Added
    isOutOfStock: { type: Boolean, default: false }, // Added
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    weight: { type: Number, default: 1 },
    imageUrl: { type: String, required: true },    // Required!
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