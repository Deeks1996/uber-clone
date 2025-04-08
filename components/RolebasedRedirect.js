import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/router";

const RoleBasedRedirect = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const role = user.publicMetadata?.role; 

      if (!role) {
        router.push("/complete-signup"); 
      } else if (role === "driver") {
        router.push("/driverDashboard");
      } else if (role === "user") {
        router.push("/user-Dashboard");
      }
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return null;
};

export default RoleBasedRedirect;
