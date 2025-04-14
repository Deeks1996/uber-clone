import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import { useUser } from "@clerk/nextjs";
import DriverLocation from "./DriverLocation";
import { FaCarAlt } from "react-icons/fa";

const DriverDashboard = () => {
  const [rideRequests, setRideRequests] = useState([]);
  const [requestedCount, setRequestedCount] = useState(0);
  const { user } = useUser();
  const [activeRideId, setActiveRideId] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "rideRequests"),
      where("isPaid", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allRides = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const visibleRides = allRides.filter((ride) => {
        const declined = ride?.declinedDrivers || [];

        if (ride.status === "completed") return false;

        if (ride.status === "requested" && !declined.includes(user.id)) {
          return true;
        }

        if (
          ["accepted", "in_progress"].includes(ride.status) &&
          ride.driverId === user.id
        ) {
          return true;
        }

        return false;
      });

      setRideRequests(visibleRides);

      const active = visibleRides.find(
        (r) =>
          ["accepted", "in_progress"].includes(r.status) &&
          r.driverId === user.id
      );
      setActiveRideId(active ? active.id : null);

      const requestedCount = visibleRides.filter(
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
    const driver_name = user.fullName;

    try {
      const updatedData = {
        status: newStatus,
        driverId: driverId,
        driverName: driver_name,
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
    } catch (error) {
      console.error("Error updating ride status:", error);
      toast.error("Failed to update ride status.");
    }
  };

  const declineRideRequest = async (rideId) => {
    if (!user) return;

    const rideRef = doc(db, "rideRequests", rideId);
    const driverId = user.id;

    try {
      const currentRide = rideRequests.find((r) => r.id === rideId);
      const declinedDrivers = currentRide?.declinedDrivers || [];

      await updateDoc(rideRef, {
        declinedDrivers: [...declinedDrivers, driverId],
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error declining ride:", error);
      toast.error("Failed to decline ride.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar requestedCount={requestedCount} />

      {user && (
        <DriverLocation driverId={user.id} rideId={activeRideId} />
      )}
      <div className="flex flex-col items-center p-4">
        <h2 className="text-xl font-medium text-blue-900 mb-2">
          Available Ride Requests
        </h2>

        {rideRequests.length === 0 ? (
          <p className="text-red-700 p-2 rounded">
            No ride requests available
          </p>
        ) : (
          <div className="grid grid-cols-3">
            {rideRequests.map((ride) => (
              <div
                key={ride.id}
                className="bg-slate-200 p-4 rounded-xl shadow-sm border-black border-2 m-1"
              >
                <p className="text-lg flex font-semibold text-blue-900 items-center">
                  <FaCarAlt className="text-red-700 me-2 text-xl" />
                  Ride Request
                </p>
                <p className="text-gray-700">
                  <strong>Request Time:</strong>{" "}
                  {ride.createdAt?.toDate().toLocaleString() || "N/A"}
                </p>
                <p className="text-gray-700">
                  <strong>Name:</strong> {ride.name}
                </p>
                <p className="text-gray-700">
                  <strong>Pickup:</strong> {ride.pickupLocation}
                </p>
                <p className="text-gray-700">
                  <strong>Destination:</strong> {ride.dropoffLocation}
                </p>
                <p className="text-gray-700">
                  <strong>Price:</strong> {ride.price}
                </p>
                <p className="text-gray-700">
                  <strong>Status:</strong>
                  <span
                    className={`ml-2 px-2 text-white rounded 
                      ${
                        ride.status === "accepted"
                          ? "bg-yellow-500"
                          : ride.status === "in_progress"
                          ? "bg-blue-500"
                          : "bg-gray-600"
                      }`}
                  >
                    {ride.status}
                  </span>
                </p>

                {ride.status === "requested" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() =>
                        updateRideStatus(ride.id, "accepted")
                      }
                      className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Accept Ride
                    </button>
                    <button
                      onClick={() => declineRideRequest(ride.id)}
                      className="px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                    >
                      Decline
                    </button>
                  </div>
                )}

                {ride.status === "accepted" &&
                  ride.driverId === user.id && (
                    <button
                      onClick={() =>
                        updateRideStatus(ride.id, "in_progress")
                      }
                      className="mt-3 px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                      Start Ride
                    </button>
                  )}

                {ride.status === "in_progress" &&
                  ride.driverId === user.id && (
                    <button
                      onClick={() =>
                        updateRideStatus(ride.id, "completed")
                      }
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
