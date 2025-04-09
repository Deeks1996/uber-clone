"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import axios from "axios";

export default function PaymentSuccess() {
  const router = useRouter();
  const { session_id, rideRequestId } = router.query;
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!session_id || !rideRequestId) return;

    const updatePaymentStatus = async () => {
      try {
        // Step 1: Fetch Checkout Session from Stripe
        const res = await axios.post("/api/get-session-details", {
          session_id,
        });

        const { payment_intent } = res.data || {};

        if (!payment_intent) {
          console.error("No payment_intent found in session data.");
          return;
        }

        // Step 2: Update Firestore rideRequests
        const rideRef = doc(db, "rideRequests", rideRequestId);

        await updateDoc(rideRef, {
          isPaid: true,
          status: "requested",
          paymentId: payment_intent, 
        });

        console.log("Firestore updated with paymentId:", paymentId);

        localStorage.setItem("payment_success_notification", "true");
      } catch (error) {
        console.error("Error updating payment and ride status:", error);
      }
    };

    updatePaymentStatus();

    // Countdown redirect
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          window.location.href = `/user-dashboard?payment=success&rideId=${rideRequestId}`;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session_id, rideRequestId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-blue-300">
      <h1 className="text-2xl font-bold text-green-800 flex items-center">
        Payment Successful
        <IoCheckmarkDoneCircleSharp className="ml-2 text-green-600" />
      </h1>
      <p className="mt-4">
        Redirecting to your dashboard in{" "}
        <span className="font-semibold">{countdown}</span>...
      </p>
    </div>
  );
}
