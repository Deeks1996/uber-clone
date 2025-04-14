import Navbar from "../../components/Navbar";
import Packages from "@/components/Ridepackages";

const MyPackages = () => {
  return (
    <div className="min-h-screen bg-blue-200">
      <Navbar />
      
      <div className="flex justify-center p-6">
        <Packages />
      </div>
    </div>
  );
};

export default MyPackages;