"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id, rideRequestId } = router.query;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (rideRequestId) {
      localStorage.setItem("payment_success_notification", "true");

      // Update payment status and ride status to "requested"
      const updatePaymentStatus = async () => {
        try {
          const rideRef = doc(db, "rideRequests", rideRequestId);
          
          // Update Firestore: payment successful, ride status is now "requested"
          await updateDoc(rideRef, {
            isPaid: true,
            status: "requested", // Update the ride status to "requested"
          });
          console.log("Firestore updated: isPaid = true, status = requested");
        } catch (error) {
          console.error("Error updating payment and ride status:", error);
        }
      };

      updatePaymentStatus();
    }

    if (session_id) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            
            // Redirect to user-dashboard with rideId and success query params
            window.location.href = `/user-dashboard?payment=success&rideId=${rideRequestId}`;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [session_id, rideRequestId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-blue-300">
      <h1 className="text-2xl font-bold text-green-800">Payment Successful <IoCheckmarkDoneCircleSharp/></h1>
      <p className="mt-4">
        Redirecting to your dashboard in <span className="font-semibold">{countdown}</span>...
      </p>
    </div>
  );
}
