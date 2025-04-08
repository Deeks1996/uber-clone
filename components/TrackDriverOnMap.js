// components/TrackDriverOnMap.js
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const TrackDriverOnMap = ({ rideId }) => {
  const [driverLocation, setDriverLocation] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    if (!rideId) return;

    const rideRef = doc(db, "rideRequests", rideId);
    const unsubscribe = onSnapshot(rideRef, (docSnap) => {
      const data = docSnap.data();
      if (data?.driverLocation) {
        setDriverLocation(data.driverLocation);
      }
    });

    return () => unsubscribe();
  }, [rideId]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold mb-2">🧭 Driver's Live Location</h2>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={driverLocation || { lat: 20.5937, lng: 78.9629 }}
        zoom={15}
      >
        {driverLocation && (
          <Marker
            position={driverLocation}
            icon={{
              url: "/driver-icon.png", // customize or replace
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default TrackDriverOnMap;
