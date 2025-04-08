import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export const addPayment = async (userId, rideId, amount, status) => {
  const paymentsRef = collection(db, "payments");
  await addDoc(paymentsRef, {
    userId,
    rideId,
    amount,
    status,
    createdAt: new Date(),
  });
};
