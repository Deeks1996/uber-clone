"use client";

import { useUser } from "@clerk/nextjs";
import DriverDashboard from '../../components/DriverDashboard'; 
import DriverLocation from "@/components/DriverLocation";
import useCurrentRideId from '@/hooks/useCurrentRideId';

const DriverDashboardPage = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { rideId } = useCurrentRideId(user?.id);


  return (
    <div className="flex flex-col min-h-screen bg-blue-200">
      <DriverDashboard />
      {rideId ? (
        <DriverLocation driverId={user?.id} rideId={rideId} />
      ) : (
        <p></p>
      )}
    </div>
  );
};

export default DriverDashboardPage;
