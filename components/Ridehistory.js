import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/router';

const RideHistory = () => {
  const { user } = useUser();
  const [rides, setRides] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchUserRides();
    }
  }, [user]);

  const fetchUserRides = async () => {
    const q = query(
      collection(db, 'rideRequests'),
      where('userId', '==', user.id)
    );

    const querySnapshot = await getDocs(q);
    const rideData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setRides(rideData);
  };

  return (
  <div className="p-2">
    <h2 className="text-2xl font-bold mb-4 text-red-800 text-center">Ride History</h2>

    {rides.length === 0 ? (
      <p className="text-red-600 text-center">No rides found.</p>
    ) : (
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full bg-white border border-gray-300 text-sm">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4 border-b">Pickup</th>
              <th className="py-2 px-4 border-b">Dropoff</th>
              <th className="py-2 px-4 border-b">Package</th>
              <th className="py-2 px-4 border-b">Price</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Requested At</th>
            </tr>
          </thead>
          <tbody>
            {rides.map((ride) => (
              <tr key={ride.id} className=" hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{ride.pickupLocation}</td>
                <td className="py-2 px-4 border-b">{ride.dropoffLocation}</td>
                <td className="py-2 px-4 border-b">{ride.selectedPackage}</td>
                <td className="py-2 px-4 border-b">₹{ride.price}</td>
                <td className="py-2 px-4 border-b capitalize">{ride.status}</td>
                <td className="py-2 px-6 border-b">
                  {ride.createdAt?.toDate().toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
};

export default RideHistory;