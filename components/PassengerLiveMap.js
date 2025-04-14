import { useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { db } from "../lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { getHeading } from "../utils/getHeading";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const PassengerLiveMap = ({ rideId }) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const mapRef = useRef(null);
  const [prevLocation, setPrevLocation] = useState(null);
  const [heading, setHeading] = useState(0);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (!rideId) return;

    const getDriverId = async () => {
      const rideRef = doc(db, "rideRequests", rideId);
      const rideSnap = await getDoc(rideRef);

      if (rideSnap.exists()) {
        const data = rideSnap.data();
        if (data.driverId) {
          console.log("Driver ID fetched:", data.driverId);
          setDriverId(data.driverId); 
        } else {
          console.log("No driverId found in ride request.");
        }
      } else {
        console.log("Ride request not found.");
      }
    };

    getDriverId();
  }, [rideId]);

  useEffect(() => {
    console.log("Driver ID:",driverId);
    if (!driverId) return;

    const locationRef = doc(db, "driverLocations", driverId);

    const unsubscribe = onSnapshot(locationRef, (snapshot) => {
      const data = snapshot.data();
      if (data?.location) {
        if (driverLocation) {
          const angle = getHeading(driverLocation, data.location);
          setHeading(angle);
        }
        setPrevLocation(driverLocation);
        setDriverLocation(data.location);
      }
    });

    return () => unsubscribe();
  }, [driverId, driverLocation]);

  console.log("Driver Location:", driverLocation);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={
        driverLocation
          ? { lat: driverLocation.lat, lng: driverLocation.lng }
          : { lat: 20.5937, lng: 78.9629 } // (India)
      }
      zoom={14}
      onLoad={(map) => (mapRef.current = map)}
    >
      {driverLocation && (
        <Marker
          position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
          icon={{
            url: "/car-icon.png",
            scaledSize: new window.google.maps.Size(30, 40),
            rotation: heading,
            anchor: new window.google.maps.Point(20, 20), 
          }}
          
        />
      )}
    </GoogleMap>
  ) : (
    <p>Loading map...</p>
  );
};

export default PassengerLiveMap;
