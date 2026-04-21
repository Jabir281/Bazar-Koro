// server/src/models/Order.ts
import mongoose from 'mongoose';

const orderLineSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  qty: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lines: [orderLineSchema],
  status: {
    type: String,
    enum: ['placed', 'paid', 'accepted', 'rejected', 'ready_for_pickup', 'claimed', 'at_store', 'picked_up', 'on_the_way', 'delivered'],
    default: 'placed'
  },
  delivery: {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    proof: {
      pinLast4: String,
      photoUrl: String
    }
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);