import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { paymentId, rideId } = req.body;

    if (!paymentId || !rideId) {
      return res.status(400).json({ error: "Payment ID and Ride ID are required." });
    }

    try {
      // 1. Process the refund through Stripe
      const refund = await stripe.refunds.create({
        payment_intent: paymentId,
      });

      // 2. Update payments collection
      const paymentRef = doc(db, "payments", paymentId);
      await updateDoc(paymentRef, {
        status: "refunded",
        refundId: refund.id,
        refundAmount: refund.amount / 100,
        refundTimestamp: new Date().toISOString(),
      });

      // 3. Optionally, update the rideRequest collection to reflect the refund
      const rideRef = doc(db, "rideRequests", rideId);
      await updateDoc(rideRef, {
        status: "cancelled",  // Or "refunded"
      });

      return res.status(200).json({ success: true, refund });
    } catch (error) {
      console.error("Refund failed:", error.message);
      return res.status(500).json({ error: error.message || "Refund failed" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
