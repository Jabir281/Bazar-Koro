import express, { Response } from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';
import Order from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { computeSummary } from './cart.js';
import { sendDigitalReceipt } from '../utils/sendReceipt.js'; // Import your new mailman!
import { User } from '../models/User.js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-03-25.dahlia",
});

// ==========================================
// 1. INITIALIZE CHECKOUT (Before Payment)
// ==========================================
router.post("/create-checkout-session", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.activeRole !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can checkout' });
    }

    const cart = await Cart.findOne({ buyerId: req.user.id });
    if (!cart?.items?.length) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }
    
    // Calculate accurate dynamic delivery charge
    const summary = await computeSummary(cart.items, req.user.id);
    const deliveryCharge = summary.deliveryCharge;
    const deliveryDistanceKm = (summary as any).deliveryDistanceKm || 0;

    const lineItems = cart.items.map((item) => ({
      name: item.name,
      price: item.unitPrice,
      quantity: item.qty,
      storeId: item.storeId,
      productId: item.productId,
    }));

    const totalAmount = lineItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const commission = Math.round(totalAmount * 0.1);
    const sellerAmount = totalAmount - commission;

    console.log("💰 Payment Breakdown:", { totalAmount, commission, sellerAmount, deliveryCharge, deliveryDistanceKm });

    // Create the order as 'placed' (which means unpaid for now)
    const order = await Order.create({
      buyerId: new mongoose.Types.ObjectId(req.user.id),
      lines: cart.items,
      deliveryFee: deliveryCharge, // Record it in the order
      deliveryDistanceKm: deliveryDistanceKm,
      status: 'placed',
    });

    const stripeLineItems: any[] = lineItems.map((item) => ({
      price_data: {
        currency: "bdt",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    // Add Delivery Charge as an extra item
    if (deliveryCharge > 0) {
      stripeLineItems.push({
        price_data: {
          currency: "bdt",
          product_data: {
            name: "Delivery Charge",
            description: "Distance-based dynamic delivery fee",
          },
          unit_amount: deliveryCharge * 100, // Stripe uses cents/poisha
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email, // Stripe will use this for its own receipts
      payment_method_types: ["card"],
      line_items: stripeLineItems,
      mode: "payment",
      invoice_creation: {
        enabled: true,
      },
      // ✅ Trick: Pass the orderId in the URL so the frontend knows which order succeeded!
      success_url: `http://localhost:5173/success?orderId=${order._id}`,
      cancel_url: "http://localhost:5173/cancel",
    });

    // 🚨 Notice we DO NOT empty the cart here anymore! 
    // They might cancel the payment, and we want them to keep their items.

    res.json({ url: session.url, orderId: order._id });

  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Payment failed" });
  }
});


// ==========================================
// 2. CONFIRM SUCCESS (After Payment)
// ==========================================
router.post("/payment-success", requireAuth, async (req: AuthedRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    console.log("[payment-success] Called with orderId:", orderId);

    if (!orderId) {
      console.error("[payment-success] No orderId provided");
      return res.status(400).json({ error: "Order ID is required" });
    }

    // 1. Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.error("[payment-success] Order not found for id:", orderId);
      return res.status(404).json({ error: "Order not found" });
    }

    // Prevent running this code twice if the user refreshes the success page
    if (order.status === 'paid') {
      console.log("[payment-success] Order already marked as paid:", orderId);
      return res.json({ success: true, message: "Order already processed" });
    }

    // 2. Mark order as paid
    order.status = 'paid';
    await order.save();
    console.log("[payment-success] Order marked as paid:", orderId);

    // 3. NOW it is safe to empty their cart!
    await Cart.findOneAndUpdate(
      { buyerId: req.user?.id },
      { $set: { items: [] } }
    );
    console.log("[payment-success] Cart emptied for user:", req.user?.id);

    // 4. Send the digital receipt to the buyer's email from the order
    const buyer = await User.findById(order.buyerId);
    if (buyer && buyer.email) {
      try {
        const itemsTotal = order.lines.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
        const orderDeliveryFee = (order as any).deliveryFee || 0;
        await sendDigitalReceipt(buyer.email, {
          _id: order._id,
          totalAmount: itemsTotal + orderDeliveryFee
        });
        console.log("[payment-success] Receipt email sent to:", buyer.email);
      } catch (emailErr) {
        console.error("[payment-success] Error sending receipt email:", emailErr);
      }
    } else {
      console.warn("[payment-success] No buyer email found for receipt.");
    }

    res.json({ success: true, message: "Payment confirmed, cart emptied, and receipt sent!" });
  } catch (error: any) {
    console.error("[payment-success] Uncaught error:", error);
    res.status(500).json({ error: error?.message || "Failed to process success" });
  }
});

export default router;