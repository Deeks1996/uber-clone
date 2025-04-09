import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RideRequestForm from "../components/RideRequestform";
import Navbar from "../components/Navbar";
import { useSearchParams } from "next/navigation";
import useCurrentRideId from "../hooks/useCurrentRideId";
import { useUser } from "@clerk/nextjs";
import PassengerLiveMap from "@/components/PassengerLiveMap";
import RideProgressTracker from "../components/RideProgressTracker";
import { db } from "../lib/firebase";
import { doc, onSnapshot, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import ReviewModal from "../components/ReviewModal";
import axios from 'axios';

const Dashboard = () => {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const { rideId: fetchedRideId, loading } = useCurrentRideId(user?.id);
  const [isRideRequested, setIsRideRequested] = useState(false);
  const [rideStatus, setRideStatus] = useState();
  const router = useRouter();
  const hasAccepted = useRef(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    const queryRideId = searchParams.get("rideId");

    if (queryRideId) {
      setIsRideRequested(true);
      setRideStatus("requested");

      const notifySuccess = localStorage.getItem("payment_success_notification");
      if (notifySuccess) {
        toast.success("Ride request submitted successfully!",{autoClose:2000});
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
        setShowReviewModal(true);
      }
    });

    return () => unsubscribe();
  }, [fetchedRideId]);

  useEffect(() => {
    const fetchPaymentId = async () => {
      if (!fetchedRideId) return;
      const rideDocRef = doc(db, "rideRequests", fetchedRideId);
      const rideSnap = await getDoc(rideDocRef);
      if (rideSnap.exists()) {
        const rideData = rideSnap.data();
        if (rideData?.paymentId) {
          setPaymentId(rideData.paymentId);
        }
      }
    };
  
    fetchPaymentId();
  }, [fetchedRideId]);

  const handleModalClose = () => {
    setShowReviewModal(false);
    router.push("/user-dashboard").then(() => {
      window.location.reload();
    });
  };

  const handleReviewSubmit = async (rating, feedback) => {
    if (!fetchedRideId) return;

    try {
      const rideDocRef = doc(db, "rideRequests", fetchedRideId);
      const rideSnap = await getDoc(rideDocRef);

      if (rideSnap.exists()) {
        const rideData = rideSnap.data();
        const driverId = rideData.driverId;

        if (!driverId) {
          toast.error("Driver not found for this ride.");
          return;
        }

        const feedbackRef = doc(db, "drivers", driverId, "feedbacks", fetchedRideId);
        await setDoc(feedbackRef, {
          userId: user?.id,
          rating,
          feedback,
          rideId: fetchedRideId,
          createdAt: new Date().toISOString(),
        });

        toast.success("Thanks for your feedback!");
        setShowReviewModal(false);

        router.replace(router.asPath);

      } else {
        toast.error("Ride not found.");
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };


  const handleCancelRide = async (rideId, paymentId) => {
    if (!paymentId) {
      toast.error("No payment ID found for this ride.");
      return;
    }
  
    try {
      const res = await axios.post("/api/cancel-ride", {
        rideId,
        paymentId,
      });
  
      if (res.data.success) {
        toast.success("Ride cancelled and refund initiated");
        setRideStatus("cancelled");

        setTimeout(() => {
          router.push("/user-dashboard").then(() => {
            window.location.reload(); 
          }) 
        }, 5000);

      } else {
        toast.error(res.data.error || "Failed to cancel ride.");
      }
    } catch (error) {
      console.error("Cancel Ride Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };
  
  return (
    <div className="min-h-screen bg-blue-300">
      <Navbar />

      <div className="p-5">
        {!isRideRequested && !fetchedRideId && !loading && <RideRequestForm />}
      </div>

      {rideStatus && <RideProgressTracker currentStatus={rideStatus} />}

      {rideStatus === "requested" ? (
        <div className="p-4 space-y-10 text-center text-2xl font-semibold text-slate-700 mt-10">
          <p>Driver not yet assigned. Thank you for your patience!</p>
          <button
           onClick={() => handleCancelRide(fetchedRideId, paymentId)}
            className="bg-red-600 text-white px-4 py-1 rounded-xl hover:bg-red-800 text-xl"
          >
            Cancel Ride
          </button>
        </div>
      ) : null}

      {(rideStatus === "accepted" && fetchedRideId) && rideStatus !== "completed" ? (
        <div className="p-4 space-y-3">
          <PassengerLiveMap rideId={fetchedRideId} />
        </div>
      ) : null}

      <ReviewModal
        isOpen={showReviewModal}
        onClose={handleModalClose}
        onSubmit={handleReviewSubmit}
      />

      <ToastContainer position="top-right" />
    </div>
  );
};

export default Dashboard;
