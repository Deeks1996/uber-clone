import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";

const AdminRidesPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const fetchRides = async () => {
      if (!user?.id) return;

      try {
        const userRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
          setAuthorized(true);
          const rideSnap = await getDocs(collection(db, "rideRequests"));

          const rideData = rideSnap.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              rideId: docSnap.id,
              ...data,
            };
          });

          setRides(rideData);
        } else {
          router.replace("/");
        }
      } catch (error) {
        console.error("Error fetching rides:", error);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) fetchRides();
  }, [isLoaded, user, router]);

  if (!isLoaded || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading rides...</div>;
  }

  if (!authorized) return null;

  return (
    <div className="bg-blue-200 min-h-screen">
      <Navbar/>

      <h1 className="text-3xl font-bold mb-6 text-center p-2">All Ride Requests</h1>
      <div className="overflow-auto px-4">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead className="bg-blue-900 text-sm text-white">
            <tr>
              <th className="px-4 py-2">Rider ID</th>
              <th className="px-4 py-2">Rider Name</th>
              <th className="px-4 py-2">Driver</th>
              <th className="px-4 py-2">Pickup</th>
              <th className="px-4 py-2">Dropoff</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Price (₹)</th>
              <th className="px-4 py-2">Paid?</th>
              <th className="px-4 py-2">Started</th>
              <th className="px-4 py-2">Completed</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-700">
            {rides.map((ride) => (
              <tr key={ride.rideId} className="border-t hover:bg-gray-200">
                <td className="px-4 py-2">{ride.userId}</td>
                <td className="px-4 py-2">{ride.name || "N/A"}</td>
                <td className="px-4 py-2">{ride.driverName || "Unassigned"}</td>
                <td className="px-4 py-2">{ride.pickupLocation}</td>
                <td className="px-4 py-2">{ride.dropoffLocation}</td>
                <td className="px-4 py-2 capitalize">{ride.status}</td>
                <td className="px-4 py-2">₹{ride.price}</td>
                <td className="px-4 py-2">{ride.isPaid ? "Yes" : "No"}</td>
                <td className="px-4 py-2">{ride.startedAt?.toDate?.().toLocaleString() || "-"}</td>
                <td className="px-4 py-2">{ride.completedAt?.toDate?.().toLocaleString() || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRidesPage;
