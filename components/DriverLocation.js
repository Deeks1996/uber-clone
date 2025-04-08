import { useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DriverLocation = ({ driverId, rideId }) => {
  useEffect(() => {
    if (!rideId || !driverId) return;

    const updateLocation = (position) => {
      const { latitude, longitude } = position.coords;
      const locationRef = doc(db, "driverLocations", driverId);
      
      updateDoc(locationRef, {
        rideId: rideId, 
        location: {
          lat: latitude,
          lng: longitude,
        },
        updatedAt: serverTimestamp(), 
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
    }, 10000); 

    
    return () => clearInterval(interval);
  }, [driverId, rideId]);

  return null; 
};

export default DriverLocation;
