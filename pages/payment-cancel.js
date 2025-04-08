"use client";
import { useEffect, useState } from "react";


export default function PaymentCancel() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    localStorage.setItem("payment_cancel_notification", "true");

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          window.location.href = "/user-dashboard";
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-blue-300">
      <h1 className="text-2xl font-bold text-red-600">Payment Cancelled</h1>
      <p className="mt-4">
        Your payment has been cancelled. Redirecting to dashboard in{" "}
        <span className="font-semibold">{countdown}</span>...
      </p>
    </div>
  );
}
