import { useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DriverLocation = ({ driverId, rideId }) => {
  useEffect(() => {
    if (!rideId || !driverId) return;

    const updateLocation = (position) => {
      const { latitude, longitude } = position.coords;

      // Create reference to the document we want to update (driverLocations/{driverId})
      const locationRef = doc(db, "driverLocations", driverId);

      // Update location and associated rideId
      updateDoc(locationRef, {
        rideId: rideId, // Make sure the rideId is updated
        location: {
          lat: latitude,
          lng: longitude,
        },
        updatedAt: serverTimestamp(), // Automatically timestamp when update occurs
      })
        .then(() => {
          console.log("Location updated:", latitude, longitude);
        })
        .catch((err) => {
          console.error("Location update error:", err.message);
        });
    };

    const handleError = (err) => {
      console.error("Geolocation error:", err.message);
    };

    // Get location every 10 seconds
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(updateLocation, handleError);
    }, 10000); // Updates location every 10 seconds

    // Cleanup the interval when component unmounts
    return () => clearInterval(interval);
  }, [driverId, rideId]);

  return null; // This component doesn't render anything; it only updates Firestore
};

export default DriverLocation;
