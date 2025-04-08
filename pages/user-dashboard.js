import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RideRequestForm from "../components/RideRequestform";
import Navbar from "../components/Navbar";
import { useSearchParams } from "next/navigation";
import useCurrentRideId from "../hooks/useCurrentRideId";
import { useUser } from "@clerk/nextjs";
import PassengerLiveMap from "@/components/PassengerLiveMap";
import Link from "next/link";
import { db } from "../lib/firebase"; 
import { doc, onSnapshot } from "firebase/firestore";

const Dashboard = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const { rideId: fetchedRideId, loading } = useCurrentRideId(user?.id);
  const [isRideRequested, setIsRideRequested] = useState(false);
  const [rideStatus, setRideStatus] = useState("requested");

  const hasAccepted = useRef(false);

  useEffect(() => {
    const queryRideId = searchParams.get("rideId");

    if (queryRideId) {
      setIsRideRequested(true);
      setRideStatus("requested");

      const notifySuccess = localStorage.getItem("payment_success_notification");
      if (notifySuccess) {
        toast.success("Ride request submitted successfully!");
        localStorage.removeItem("payment_success_notification");
      }
    }

    const notifyCancel = localStorage.getItem("payment_cancel_notification");
    if (notifyCancel) {
      toast.error("Ride request was cancelled.");
      localStorage.removeItem("payment_cancel_notification");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!fetchedRideId) return;

    const rideDocRef = doc(db, "rideRequests", fetchedRideId);

    const unsubscribe = onSnapshot(rideDocRef, (snapshot) => {
      const rideData = snapshot.data();

      if (rideData?.status === "accepted" && !hasAccepted.current) {
        setRideStatus("accepted"); 
        hasAccepted.current = true; 
        toast.success("Driver has accepted your ride!");
      }

      if (rideData?.status === "completed") {
        setRideStatus("completed"); 
        toast.success("Ride is completed!");
      }
    });

    return () => unsubscribe();
  }, [fetchedRideId]);

  return (
    <div className="min-h-screen bg-blue-300">
      <Navbar />

      <div className="p-5">
        {!isRideRequested && !fetchedRideId && !loading && <RideRequestForm />}
      </div>

      {rideStatus === "requested" && (
        <div className="p-4 space-y-3 text-center text-lg font-semibold text-red-600 mb-3">
          <p> Driver not assigned yet! </p>
        </div>
      )}

      {(isRideRequested || fetchedRideId) && rideStatus !== "completed" ? (
        <div className="p-4 space-y-3">
          <PassengerLiveMap rideId={fetchedRideId} />
        </div>
      ) : null}

      {rideStatus === "completed" && (
        <div className="p-4 space-y-3 text-center text-lg font-semibold text-green-600">
          <p>Ride has been completed!</p>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
};

export default Dashboard;
