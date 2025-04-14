"use client";

import { SignIn, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRoleAssigned, setIsRoleAssigned] = useState(false);

  useEffect(() => {
    const storeUser = async () => {
      if (!user) return;

      try {
        await fetch("/api/store-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            name: user.fullName,
            email: user.emailAddresses[0]?.emailAddress,
            role: user.publicMetadata?.role || "", 
          }),
        });
      } catch (err) {
        console.error("Error storing user:", err);
      }
    };

    if (isSignedIn && user) {
      storeUser();
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const assignedRole = user?.publicMetadata?.role;

      if (assignedRole) {
        setIsRoleAssigned(true); 

        if (assignedRole === "admin") {
          router.push("/admin/dashboard");
        } else if (assignedRole === "user") {
          router.push("/rider/dashboard");
        } else if (assignedRole === "driver") {
          router.push("/driver/dashboard");
        }
      } else {
        setIsRoleAssigned(false);
      }

      setLoading(false); 
    } else if (!isSignedIn) {
      setLoading(false); 
    }
  }, [isLoaded, isSignedIn, user, router]);

  const handleRoleSubmit = async () => {
    if (!role) return alert("Please select a role");

    const userId = user?.id;
    if (!userId) {
      console.error("User ID is not available.");
      return;
    }

    try {
      const res = await fetch("/api/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Failed to set role:", data);
        alert("Failed to set role: " + data.error);
      } else {
        setIsRoleAssigned(true);

        if (role === "user") {
          router.push("/rider/dashboard");
        } else if (role === "driver") {
          router.push("/driver/dashboard");
        }
      }
    } catch (error) {
      console.error("Error during role assignment:", error);
      alert("An error occurred while setting the role. Please try again.");
    }
  };

  if (!isSignedIn || loading) {
    return (
      <div className="min-h-screen bg-landing relative flex justify-center items-center">
        <div className="absolute top-10 right-10">
          <SignIn routing="hash" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-landing relative overflow-hidden">
      <div className="flex flex-col absolute top-20 right-20 space-y-4 items-center border-2 rounded-xl p-8 bg-gray-700">
        <UserButton aftersignouturl="/" />
        <p className="text-white text-lg">You&apos;re signed in!</p>

        {!isRoleAssigned ? (
          <>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-2 rounded bg-white text-black"
            >
              <option value="">Choose Role</option>
              <option value="user">User</option>
              <option value="driver">Driver</option>
            </select>
            <button
              onClick={handleRoleSubmit}
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500"
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              const role = user.publicMetadata.role;
              if (role === "user") {
                router.push("/rider/dashboard");
              } else if (role === "driver") {
                router.push("/driver/dashboard");
              }
            }}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    </main>
  );
}
