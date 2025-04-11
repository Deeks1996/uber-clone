
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
    <div className="p-6 mx-auto w-full md:w-3/4 lg:w-2/3">
      <h2 className="text-2xl font-bold mb-4 text-indigo-800">Completed Rides</h2>
  
      {loading ? (
        <p className="text-gray-600">Loading ride history...</p>
      ) : rides.length === 0 ? (
        <p className="text-red-500">No completed rides found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white border border-gray-300 text-sm">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="py-2 px-4 border-b"> Name</th>
                <th className="py-2 px-4 border-b">From</th>
                <th className="py-2 px-4 border-b">To</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{ride.name}</td>
                  <td className="py-2 px-4 border-b">{ride.pickupLocation}</td>
                  <td className="py-2 px-4 border-b">{ride.dropoffLocation}</td>
                  <td className="py-2 px-6 border-b">
                    {ride.completedAt?.toDate().toLocaleString() || "N/A"}
                  </td>
                  <td className="py-2 px-4 border-b">₹{ride.price || "0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );  
};

export default DriverRideHistory;
