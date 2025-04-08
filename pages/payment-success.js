"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id, rideRequestId } = router.query;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (rideRequestId) {
      localStorage.setItem("recentRideId", rideRequestId); // Save rideRequestId in localStorage
      localStorage.setItem("payment_success_notification", "true");

      const updatePaymentStatus = async () => {
        try {
          const rideRef = doc(db, "rideRequests", rideRequestId);
          await updateDoc(rideRef, { isPaid: true });
          console.log("Firestore updated: isPaid = true");
        } catch (error) {
          console.error("Error updating payment status:", error);
        }
      };

      updatePaymentStatus();
    }

    if (session_id) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);

            // Redirect using window.location.href
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
      <h1 className="text-2xl font-bold text-green-600">Payment Successful</h1>
      <p className="mt-4">
        Redirecting to your dashboard in <span className="font-semibold">{countdown}</span>...
      </p>
    </div>
  );
}
