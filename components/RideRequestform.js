import React, { useState, useEffect, useRef } from 'react';
import { useLoadScript, GoogleMap, Marker, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';
import { db } from "../lib/firebase"; 
import { useUser } from "@clerk/nextjs"; 
import { addDoc, collection, getDocs, query, where, doc, updateDoc, serverTimestamp }  from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation'; 
import Payment from './Payment';
import { FaMapMarkerAlt } from "react-icons/fa";

const libraries = ['places']; 
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const RideRequestForm = () => {
  const { user } = useUser();
  const router = useRouter();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [directions, setDirections] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [price, setPrice] = useState(0);
  const [showPayment, setShowPayment] = useState(false);

  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  const packageOptions = [
    { value: 'standard', label: 'Standard - ₹200 + ₹20/km' },
    { value: 'economy', label: 'Economy - ₹400 + ₹30/km' },
    { value: 'premium', label: 'Premium - ₹800 + ₹50/km' },
  ];

  // const findNearestDriver = async (pickupCoords) => {
  //   const driversSnapshot = await getDocs(
  //     query(collection(db, 'drivers'), where('isAvailable', '==', true))
  //   );
  
  //   let nearestDriver = null;
  //   let minDistance = Infinity;
  
  //   driversSnapshot.forEach(docSnap => {
  //     const driver = docSnap.data();
  //     if (driver.location) {
  //       const distance = getDistance(
  //         { latitude: pickupCoords.lat, longitude: pickupCoords.lng },
  //         { latitude: driver.location.lat, longitude: driver.location.lng }
  //       );
  //       if (distance < minDistance) {
  //         minDistance = distance;
  //         nearestDriver = { ...driver, id: docSnap.id, distance };
  //       }
  //     }
  //   });
  
  //   return nearestDriver;
  // };
  
  // Helper to calculate ETA using Google Maps API
  const calculateETA = async (pickupCoords, driverCoords) => {
    const directionsService = new google.maps.DirectionsService();
    const result = await new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: driverCoords,
          destination: pickupCoords,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (res, status) => {
          if (status === 'OK') resolve(res);
          else reject(status);
        }
      );
    });
  
    return result.routes[0].legs[0].duration.text;
  };

  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      calculateRoute();
    }
  }, [pickupCoords, dropoffCoords]);

  const handlePackageSelection = (e) => {
    const selectedPkg = e.target.value;
    setSelectedPackage(selectedPkg);
    
    if (selectedPkg && pickupCoords && dropoffCoords) {
      const distance = getDistance(pickupCoords, dropoffCoords);
      calculatePrice(distance, selectedPkg); 
    }
  };

  const getDistance = (pickup, dropoff) => {
    if (pickup && dropoff) {
      const radlat1 = Math.PI * pickup.lat / 180;
      const radlat2 = Math.PI * dropoff.lat / 180;
      const theta = pickup.lng - dropoff.lng;
      const radtheta = Math.PI * theta / 180;
      let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515; // Convert to miles
      dist = dist * 1.60934; // Convert to kilometers
      return dist;
    }
    return 0;
  };

  const calculateRoute = () => {
    if (pickupCoords && dropoffCoords) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickupCoords,
          destination: dropoffCoords,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
            const distance = result.routes[0].legs[0].distance.value / 1000;
            calculatePrice(distance, selectedPackage); 
          } else {
            console.error('Error fetching directions: ', status);
          }
        }
      );
    }
  };
  
  const calculatePrice = (distance, selectedPkg) => {
    let baseFare = 0;
    let perKmRate = 0;
  
    switch (selectedPkg) {
      case 'standard':
        baseFare = 200;
        perKmRate = 20;
        break;
      case 'economy':
        baseFare = 400;
        perKmRate = 30;
        break;
      case 'premium':
        baseFare = 800;
        perKmRate = 50;
        break;
      default:
        break;
    }
  
    const calculatedPrice = baseFare + distance * perKmRate;
    setPrice(calculatedPrice);
  };

  const handlePlaceSelect = (ref, setLocation, setCoords) => {
    const place = ref.current.getPlace();
    if (place && place.geometry) {
      setLocation(place.formatted_address);
      setCoords({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  const handleRideRequest = async () => {
    if (!user) {
      toast.error("You must be logged in to request a ride.",{position:'top-right',autoClose:2000});
      return;
    }

    if (!pickupCoords || !dropoffCoords || !selectedPackage || !user) {
    toast.error("Please fill all fields", { position: 'top-right', autoClose: 2000 });
    return;
  }

    try {
    //   const driver = await findNearestDriver(pickupCoords);

    // if (!driver) {
    //   toast.error("No drivers available nearby", { position: 'top-right', autoClose: 3000 });
    //   return;
    // }

    // const eta = await calculateETA(pickupCoords, driver.location);

    const rideRef = await addDoc(collection(db, 'rideRequests'), {
        userId: user.id, 
        name: user.firstName,
        pickupLocation,
        dropoffLocation,
        selectedPackage,
        price,
        pickupCoords, 
        dropoffCoords,
        status: "requested",
        // assignedDriver: {
        //   id: driver.id,
        //   name: driver.name,
        //   phone: driver.phone,
        // },
        // eta,
        createdAt: serverTimestamp(),
      });

      // // Make driver unavailable
      // await updateDoc(doc(db, 'drivers', driver.id), {
      //   isAvailable: false,
      // });
  
      // Create Stripe Checkout session via API
    // 🔁 Redirect to Payment Page with query parameters
    router.push(`/payment?rideId=${rideRef.id}&price=${price}&userId=${user.id}`);

      // toast.success('Ride Request Submitted! ',{position:'top-right',autoClose:2000});
      // setPickupLocation('');
      // setDropoffLocation('');
      // setPickupCoords(null);
      // setDropoffCoords(null);
      // setSelectedPackage('');
      // setPrice(0);
      // setDirections(null);
    } catch (error) {
      toast.error('Error submitting ride request', {position:'top-right',autoClose:2000});
      console.error('Error submitting request:',error);
    }
  };

  if (loadError) return <div>Map cannot be loaded right now, sorry.</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="flex space-x-4">
      {!showPayment ? (<div className="p-6 bg-gray-800 rounded-lg shadow-md w-1/3 max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-white">Request a Ride</h2>

        <div className="form-group mb-4 relative">
          <FaMapMarkerAlt className='absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 text-xl' />
          <Autocomplete
            onLoad={(autocomplete) => (pickupRef.current = autocomplete)}
            onPlaceChanged={() => handlePlaceSelect(pickupRef, setPickupLocation, setPickupCoords)}
          >
            <input
              type="text"
              placeholder="Enter Pickup Location"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              className="w-full pl-12 pr-3 py-3 border rounded bg-transparent text-white"  // Add padding on left side to accommodate the icon
            />
          </Autocomplete>
        </div>

        <div className="form-group mb-4 relative">
          <FaMapMarkerAlt className='absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 text-xl' />
          <Autocomplete
            onLoad={(autocomplete) => (dropoffRef.current = autocomplete)}
            onPlaceChanged={() => handlePlaceSelect(dropoffRef, setDropoffLocation, setDropoffCoords)}
          >
            <input
              type="text"
              placeholder="Enter Drop-off Location"
              value={dropoffLocation}
              onChange={(e) => setDropoffLocation(e.target.value)}
               className="w-full pl-12 pr-3 py-3 border rounded bg-transparent text-white"
            />
          </Autocomplete>
        </div>

        {/* Ride Package Selection */}
        <div className="form-group mb-4">
          <select
            value={selectedPackage}
            onChange={handlePackageSelection}
            className="w-full p-3 border rounded bg-transparent text-white"
          >
            <option value="" className="text-black">Select Ride Package</option>
            {packageOptions.map((pkg) => (
              <option key={pkg.value} value={pkg.value} className="text-black">
                {pkg.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4 text-white">
        {price > 0 && selectedPackage && (
          <p>Estimated Price: ₹{price}</p>
        )}
        </div>

        <button onClick={handleRideRequest} className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-700">
          Submit Ride Request
        </button>
      </div>
) : (
      <Payment
        user={user}
        pickupLocation={pickupLocation}
        dropoffLocation={dropoffLocation}
        pickupCoords={pickupCoords}
        dropoffCoords={dropoffCoords}
        selectedPackage={selectedPackage}
        price={price}
        setShowPayment={setShowPayment}
      />
      )}
      
      <div className="w-3/4">
      <GoogleMap
        mapContainerStyle={{ height: "500px", width: "100%" }}
        zoom={12}
        center={pickupCoords || { lat: 20.5937, lng: 78.9629 }}
      >
        {pickupCoords && <Marker position={pickupCoords} />}
        {dropoffCoords && <Marker position={dropoffCoords} />}
        {directions && 
          <DirectionsRenderer directions={directions} />
        }
      </GoogleMap>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RideRequestForm;
