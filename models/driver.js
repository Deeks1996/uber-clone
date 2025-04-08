// models/driver.js
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Update driver's location in Firestore
export const updateDriverLocation = async (driverId, latitude, longitude) => {
  const driverRef = doc(db, "drivers", driverId);
  await setDoc(driverRef, { latitude, longitude }, { merge: true });
};

