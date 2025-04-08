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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-red-800">Ride History</h2>
      {rides.length === 0 ? (
        <p className="text-red-600">No rides found.</p>
      ) : (
        <ul className="space-y-4">
          {rides.map(ride => (
            <li key={ride.id} className="p-4 bg-gray-800 rounded-lg shadow-md text-white">
              <p><strong>Pickup:</strong> {ride.pickupLocation}</p>
              <p><strong>Dropoff:</strong> {ride.dropoffLocation}</p>
              <p><strong>Package:</strong> {ride.selectedPackage}</p>
              <p><strong>Price:</strong> ₹{ride.price}</p>
              <p><strong>Status:</strong> {ride.status}</p>
              <p><strong>Requested At:</strong> {ride.createdAt?.toDate().toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RideHistory;
