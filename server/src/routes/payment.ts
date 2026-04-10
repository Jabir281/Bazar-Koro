import express from "express";
import Stripe from "stripe";

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-03-25.dahlia", 
});

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { items } = req.body;

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // MODULE 1 PART 4 REQUIREMENT: Commission Logic
    const commission = Math.round(totalAmount * 0.1); 
    const sellerAmount = totalAmount - commission;

    console.log("💰 Payment Breakdown:");
    console.log({ totalAmount, commission, sellerAmount });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100, // Stripe expects cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      
      // MODULE 1 PART 4 REQUIREMENT: Generate Digital Receipt
      invoice_creation: {
        enabled: true,
      },



      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: "Payment failed" });
  }
});

export default router;