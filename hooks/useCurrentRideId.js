import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const useCurrentRideId = (userId) => {
  const [rideId, setRideId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchRideId = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "rideRequests"),
          where("userId", "==", userId),
          where("status", "in", ["requested", "accepted", "in_progress"])
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setRideId(snapshot.docs[0].id);
        } else {
          setRideId(null);
        }
      } catch (error) {
        console.error("Error fetching ride ID:", error);
        setRideId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRideId();
  }, [userId]);

  return { rideId, loading };
};

export default useCurrentRideId;
