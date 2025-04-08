import Navbar from "../components/Navbar";
import DriverRideHistory from "@/components/Driver-Ridehistory";

const Driverhistory = () => {
  return (
    <div className="min-h-screen bg-blue-300">
      <Navbar />
      
      <div className="flex justify-center">
        <DriverRideHistory/>
      </div>
    </div>
  );
};

export default Driverhistory;