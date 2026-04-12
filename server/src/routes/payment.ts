import express, { Request, Response } from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import { requireAuth, AuthedRequest } from '../middleware/auth.js';
import Order from '../models/Order.js';
import { Cart } from '../models/Cart.js';

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-03-25.dahlia",
});

router.post("/create-checkout-session", requireAuth, async (req: Request, res: Response) => {
  const authedReq = req as AuthedRequest;
  try {
    if (!authedReq.user) return res.status(401).json({ error: 'Not authenticated' });
    if (authedReq.user.activeRole !== 'buyer') {
      return res.status(403).json({ error: 'Only buyers can checkout' });
    }

    const cart = await Cart.findOne({ buyerId: authedReq.user.id });
    if (!cart?.items?.length) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

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

    console.log("💰 Payment Breakdown:", { totalAmount, commission, sellerAmount });

    const order = await Order.create({
      buyerId: new mongoose.Types.ObjectId(authedReq.user.id),
      lines: cart.items,
      status: 'placed',
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      invoice_creation: {
        enabled: true,
      },
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    cart.items = [];
    await cart.save();

    res.json({ url: session.url, orderId: order._id });

  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Payment failed" });
  }
});

export default router;