
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useUser } from "@clerk/nextjs"; 

const DriverRideHistory = () => {
  const { user } = useUser(); 
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriverRideHistory = async () => {
      try {
        if (!user) return;
        
         console.log("Driver Id:",user.id);

        const q = query(
          collection(db, "rideRequests"),
          where("driverId", "==", user.id),
          where("status", "==", "completed")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRides(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ride history:", error);
        setLoading(false);
      }
    };

    fetchDriverRideHistory();
  }, [user]);

  return (
    <div className="p-3 mx-auto w-1/2">
      <h2 className="text-2xl font-bold mb-3 ">Completed Rides</h2>

      {loading ? (
        <p>Loading ride history...</p>
      ) : rides.length === 0 ? (
        <p className="text-red-500">No completed rides found.</p>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="bg-slate-800 text-white shadow-md rounded-lg p-4 border border-gray-200 "
            >
              <p>
                <strong>Name:</strong> {ride.name}
              </p>
              <p>
                <strong>From:</strong> {ride.pickupLocation}
              </p>
              <p>
                <strong>To:</strong> {ride.dropoffLocation}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {ride.completedAt?.toDate().toLocaleString() || "N/A"}
              </p>
              <p>
                <strong>Amount:</strong> ${ride.price || "0.00"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverRideHistory;
