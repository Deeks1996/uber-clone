import { UserProfile } from "@clerk/nextjs";
import Navbar from "../components/Navbar";

const Profile = () => {
  return (
    <div className="min-h-screen bg-blue-200">
      <Navbar />
      
      <div className="flex justify-center p-6 ">
        <UserProfile routing="hash"/>
      </div>
    </div>
  );
};

export default Profile;
