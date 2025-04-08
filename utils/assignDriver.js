// utils/assignDriver.js
import { getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { haversineDistance } from "./distance";

// Get all drivers and calculate the nearest one
export const assignNearestDriver = async (riderId, pickupLocation) => {
  const driversRef = collection(db, "drivers");
  const q = query(driversRef, where("status", "==", "available")); // Only consider available drivers
  const querySnapshot = await getDocs(q);

  let nearestDriver = null;
  let minDistance = Infinity;

  querySnapshot.forEach((doc) => {
    const driverData = doc.data();
    const { latitude, longitude } = driverData;

    // Calculate the distance to the rider's pickup location
    const distance = haversineDistance(
      pickupLocation.latitude,
      pickupLocation.longitude,
      latitude,
      longitude
    );

    // If this driver is closer, update nearestDriver
    if (distance < minDistance) {
      minDistance = distance;
      nearestDriver = doc.id;
    }
  });

  if (nearestDriver) {
    // Update the rider's request with the assigned driver
    // This can be done by setting the driver's ID in the rider's document
    const riderRef = doc(db, "rides", riderId);
    await setDoc(riderRef, { driverId: nearestDriver, status: "assigned" }, { merge: true });

    // Optionally, update the driver's status to "busy"
    const driverRef = doc(db, "drivers", nearestDriver);
    await setDoc(driverRef, { status: "busy" }, { merge: true });
  } else {
    console.log("No available drivers found.");
  }
};
