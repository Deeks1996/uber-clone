import { useState, useEffect } from "react";
import { db } from "../lib/firebase"; 
import { serverTimestamp, collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import Navbar from '@/components/Navbar';
import { ToastContainer,toast } from "react-toastify";
import { useUser } from '@clerk/nextjs';
import DriverLocation from "./DriverLocation";

const DriverDashboard = () => {
  const [rideRequests, setRideRequests] = useState([]);
  const [requestedCount, setRequestedCount] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    if(!user) return;

    const q = query(
      collection(db, "rideRequests"),
      where("status", "in", ["requested", "accepted", "in_progress"]),
      where("isPaid", "==", true),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRideRequests(requests);

      const requestedCount = requests.filter(
        (ride) => ride.status === "requested"
      ).length;
      setRequestedCount(requestedCount);
    });

    return () => unsubscribe();
  }, [user]);

  const updateRideStatus = async (rideId, newStatus) => {
    
    if (!user) {
      toast.error("You must be logged in to update ride status.");
      return;
    }

    const rideRef = doc(db, "rideRequests", rideId);
    const driverId = user.id; 

    try {
      const updatedData = {
        status: newStatus,
        driverId: driverId, 
        updatedAt: serverTimestamp(),
      };

      if (newStatus === "accepted") {
        updatedData.acceptedAt = serverTimestamp();
      } else if (newStatus === "in_progress") {
        updatedData.startedAt = serverTimestamp();
      } else if (newStatus === "completed") {
        updatedData.completedAt = serverTimestamp();
      }

      await updateDoc(rideRef, updatedData);

      toast.success(`Ride ${newStatus}!`, { position: 'top-right', autoClose: 2000 });
    } catch (error) {
      console.error("Error updating ride status:", error);
      toast.error("Failed to update ride status.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar requestedCount={requestedCount} />
      {user && <DriverLocation driverId={user.id} />} 
      <div className="flex flex-col items-center p-4 ">
        <h2 className="text-xl font-medium text-blue-900 mb-2">Available Ride Requests</h2>

        {rideRequests.length === 0 ? (
          <p className="text-red-500 bg-slate-800 p-2 rounded">No ride requests available</p>
        ) : (
          <div className="grid grid-cols-3">
            {rideRequests.map((ride) => (
              <div key={ride.id} className="bg-slate-200 p-4 rounded-xl shadow-sm border-black border-2 m-1">
                <p className="text-lg font-semibold text-gray-800">🚖 Ride Request </p>
                <p className="text-gray-700">
                  <strong>Request Time:</strong>{" "}
                  {ride.createdAt?.toDate().toLocaleString() || "N/A"}
                </p>
                <p className="text-gray-700"><strong>Name:</strong> {ride.name}</p>
                <p className="text-gray-700"><strong>Pickup:</strong> {ride.pickupLocation}</p>
                <p className="text-gray-700"><strong>Destination:</strong> {ride.dropoffLocation}</p>
                <p className="text-gray-700"><strong>Price:</strong> {ride.price}</p>
                <p className="text-gray-700"><strong>Status:</strong> 
                  <span className={`ml-2 px-2  text-white rounded 
                    ${ride.status === "accepted" ? "bg-yellow-500" : 
                      ride.status === "in_progress" ? "bg-blue-500" :
                      "bg-gray-600"}`}>
                    {ride.status}
                  </span>
                </p>

                {ride.status === "requested" && (
                  <button
                    onClick={() => updateRideStatus(ride.id, "accepted")}
                    className="mt-3 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Accept Ride
                  </button>
                )}

                {ride.status === "accepted" && (
                  <button
                    onClick={() => updateRideStatus(ride.id, "in_progress")}
                    className="mt-3 px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    Start Ride
                  </button>
                )}

                {ride.status === "in_progress" && (
                  <button
                    onClick={() => updateRideStatus(ride.id, "completed")}
                    className="mt-3 px-4 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
                  >
                    Complete Ride
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default DriverDashboard;
