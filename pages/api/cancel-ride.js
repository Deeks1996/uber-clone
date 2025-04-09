import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { rideId, paymentId } = req.body;

  if (!rideId || !paymentId) {
    return res.status(400).json({ error: "Missing rideId or paymentId" });
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
    });

    const rideRef = doc(db, "rideRequests", rideId);
    await updateDoc(rideRef, {
      status: "cancelled",
      isRefunded: true,
      refundId: refund.id,
    });

    return res.status(200).json({ success: true, refund });
  } catch (err) {
    console.error("Cancel Ride Error:", err);
    return res.status(500).json({ error: err?.message || "Ride cancellation failed" });
  }
}
