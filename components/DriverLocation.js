import { useEffect } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; 
import { db } from "@/lib/firebase";

const DriverLocation = ({ driverId, rideId }) => {
  useEffect(() => {
    if (!rideId || !driverId) return;
    console.log("driverId:", driverId, "rideId:", rideId);

    const updateLocation = (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Retrieved location:", latitude, longitude);

      const locationRef = doc(db, "driverLocations", driverId);
      
      console.log(" Attempting to update location for:", driverId);

      setDoc(locationRef, {
        rideId: rideId, 
        location: {
          lat: latitude,
          lng: longitude,
        },
        updatedAt: serverTimestamp(), 
      },{ merge: true })
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
      console.log("⏱️ Getting location...");
    
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported!");
        return;
      }
    
      navigator.geolocation.getCurrentPosition(updateLocation, handleError);
    }, 10000);
    
    
    return () => clearInterval(interval);
  }, [driverId, rideId]);

  return null; 
};

export default DriverLocation;