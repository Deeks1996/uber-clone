// pages/api/create-checkout-session.js
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { rideId, price, userId } = req.body;
  console.log("Received body:", req.body);

  if (!rideId || !price || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr', 
              product_data: {
                name: `Ride ${rideId}`,
              },
              unit_amount: Math.round(price * 100),  
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&rideRequestId=${rideId}`,
        cancel_url: `${process.env.BASE_URL}/payment-cancel`,
        client_reference_id: rideId,
        metadata: {
          userId,
          rideId,
        },
      });

      return res.status(200).json({ sessionId: session.id });
    } catch (error) {
      console.error('Error creating Stripe checkout session:', error);
      return res.status(500).json({ error: 'Failed to create checkout session' });
    }
  } 
