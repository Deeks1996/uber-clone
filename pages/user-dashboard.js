"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RideRequestForm from "../components/RideRequestform";
import Navbar from "../components/Navbar";
import { useSearchParams } from "next/navigation";
import useCurrentRideId from "../hooks/useCurrentRideId";
import { useUser } from "@clerk/nextjs";
import PassengerLiveMap from "@/components/PassengerLiveMap";
import Link from "next/link";

const Dashboard = () => {
  const { user } = useUser();
  const rideId = useCurrentRideId(); 
  const searchParams = useSearchParams();

  // Check if rideId exists before trying to destructure
  if (!rideId) {
    return <div>Loading or No Ride Available</div>;
  }

  // Get current rideId for the passenger using custom hook
  const { rideId: fetchedRideId, loading } = useCurrentRideId(user?.id);
  const [isRideRequested, setIsRideRequested] = useState(false);

  useEffect(() => {
    const queryRideId = searchParams.get("rideId");

    if (queryRideId) {
      setIsRideRequested(true);

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

  return (
    <div className="min-h-screen bg-blue-300">
      <Navbar />

      <div className="p-5">
        {!isRideRequested && !fetchedRideId && !loading && <RideRequestForm />}
      </div>

      {isRideRequested || fetchedRideId ? (
        <div className="p-4 space-y-3">
        <Link href="/" className="bg-green-700 text-white hover:bg-green-600 px-5 py-1 rounded-xl"> Back </Link>
        <PassengerLiveMap rideId={fetchedRideId} />

        
        </div>
      ) : (
        <p></p>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Dashboard;
