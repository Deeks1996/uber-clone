"use client";

import { useUser } from "@clerk/nextjs";
import DriverDashboard from '../components/DriverDashboard'; 
import DriverLocation from "@/components/DriverLocation";
import useCurrentRideId from '@/hooks/useCurrentRideId';

const DriverDashboardPage = () => {
  const { user, isSignedIn, isLoaded } = useUser();

  // Only get rideId if the user is loaded and signed in
  const { rideId } = useCurrentRideId(user?.id);

  // Optional: You can redirect unauthorized users here (if needed)
  // useEffect(() => {
  //   if (!isLoaded) return;

  //   if (!isSignedIn) {
  //     router.push("/");
  //   } else if (user?.publicMetadata?.role !== "driver") {
  //     router.push("/unauthorized");
  //   }
  // }, [isSignedIn, isLoaded, user, router]);

  return (
    <div className="flex flex-col min-h-screen bg-blue-300">
      <DriverDashboard />
      {rideId ? (
        <DriverLocation driverId={user?.id} rideId={rideId} />
      ) : (
        <p className="text-gray-600 text-center mt-4">No active ride assigned.</p>
      )}
    </div>
  );
};

export default DriverDashboardPage;
