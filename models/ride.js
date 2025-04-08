import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export const requestRide = async (userId, pickup, dropoff, rideType, price,name) => {
  const ridesRef = collection(db, "rides");
  const rideDoc = await addDoc(ridesRef, {
    userId,
    name,
    pickup,
    dropoff,
    rideType,
    price,
    status: "requested",
    createdAt:  serverTimestamp(),
  });
  return rideDoc.id;
};
