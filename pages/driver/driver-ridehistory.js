import Navbar from "../../components/Navbar";
import DriverRideHistory from "@/components/Driver-Ridehistory";

const Driverhistory = () => {
  return (
    <div className="min-h-screen bg-blue-200">
      <Navbar />

      <div className="flex justify-center p-4">
        <div className="w-full max-w-6xl">
          <DriverRideHistory />
        </div>
      </div>
    </div>
  );
};

export default Driverhistory;