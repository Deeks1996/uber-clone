import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { rideId, price, userId } = req.body;

  if (!rideId || !price || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const paymentId = uuidv4();

    const paymentRef = doc(db, 'payments', paymentId);
    await setDoc(paymentRef, {
      paymentId,
      rideId,
      userId,
      amount: Number(price),
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ paymentId });
  } catch (error) {
    console.error('Error creating payment record:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
