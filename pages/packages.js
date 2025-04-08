import Navbar from "../components/Navbar";
import Packages from "@/components/Ridepackages";

const MyPackages = () => {
  return (
    <div className="h-screen bg-blue-300 overflow-hidden">
      <Navbar />
      
      <div className="flex justify-center p-6">
        <Packages />
      </div>
    </div>
  );
};

export default MyPackages;