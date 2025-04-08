import Navbar from "../components/Navbar";
import RideHistory from "@/components/Ridehistory";

const MyRidehistory = () => {
  return (
    <div className="min-h-screen bg-blue-300">
      <Navbar />
      
      <div className="flex justify-center p-6 ">
        <RideHistory/>
      </div>
    </div>
  );
};

export default MyRidehistory;