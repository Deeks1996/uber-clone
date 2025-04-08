import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const withRoleProtection = (Component, requiredRole) => {
  return function ProtectedComponent(props) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      if (isLoaded) {
        const userRole = user?.publicMetadata?.role; // Get role from Clerk metadata
        
        if (userRole === requiredRole) {
          setIsAuthorized(true); // Allow access if role matches
        } else {
          router.replace("/unauthorized"); // Redirect to Unauthorized page
        }
      }
    }, [user, isLoaded, router]);

    if (!isLoaded || !isAuthorized) return <p>Loading...</p>;

    return <Component {...props} />;
  };
};

export default withRoleProtection;
