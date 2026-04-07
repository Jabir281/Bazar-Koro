import mongoose from 'mongoose'

export interface ICartItem {
  productId: string
  storeId: string
  storeName?: string
  name: string
  unitPrice: number
  qty: number
  imageUrl?: string
}

export interface ICart {
  buyerId: string
  items: ICartItem[]
}

const cartItemSchema = new mongoose.Schema<ICartItem>(
  {
    productId: { type: String, required: true },
    storeId: { type: String, required: true },
    storeName: { type: String },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    imageUrl: { type: String },
  },
  { _id: false }
)

const cartSchema = new mongoose.Schema<ICart>(
  {
    buyerId: { type: String, required: true, index: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
)

cartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: any) {
    ret.id = ret._id
    delete ret._id
  },
})

export const Cart = mongoose.model<ICart>('Cart', cartSchema)
