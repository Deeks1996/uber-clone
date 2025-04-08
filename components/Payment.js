import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import getStripe from '../utils/getStripe';
import Link from "next/link";
import { FaAnglesRight } from "react-icons/fa6";
import { FaAnglesLeft } from "react-icons/fa6";

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { rideId, price, userId } = router.query;

  useEffect(() => {
    if (rideId && price && userId) {
      console.log("Fetched from URL:", { rideId, price, userId });
    }
  }, [rideId, price, userId]);

  
  
  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!rideId || !price || !userId) {
      alert("Missing payment information. Please go back and try again.");
      return;
    }

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rideId,
          price,
          userId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create checkout session");
      }

      const data = await res.json();
      const stripe = await getStripe();
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (err) {
      console.error("Checkout Error:", err);
      alert(err.message || "Something went wrong during checkout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-row justify-center items-center space-x-3 mt-72'>
      <Link href="/user-dashboard" className='bg-blue-400 text-black py-2 px-5 hover:bg-blue-700 rounded-xl font-semibold flex items-center gap-1'> <FaAnglesLeft /> Back </Link>

      <button onClick={handleCheckout} disabled={isLoading || !rideId} className='bg-green-400 text-black p-2 hover:bg-green-700 rounded-xl font-semibold flex items-center gap-1'>
        {isLoading ? 'Processing...' : 'Proceed to Payment'}
        <FaAnglesRight/>
      </button>
      
    </div>
  );
};

export default Payment;
