"use client";
import { SignIn, UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [role, setRole] = useState("");
  const [isRoleAssigned, setIsRoleAssigned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && user?.publicMetadata?.role) {
      setIsRoleAssigned(true);
    }
  }, [isLoaded, user]);

  const handleRoleSubmit = async () => {
    if (!role) return alert("Please select a role");

    const userId = user?.id;

    if (!userId) {
      console.error("User ID is not available.");
      return;
    }

    setLoading(true);  

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
        console.log("Role successfully set:", data);
        setIsRoleAssigned(true);
        router.push(role === "user" ? "/user-dashboard" : "/driver-dashboard");
      }
    } catch (error) {
      console.error("Error during role assignment:", error);
      alert("An error occurred while setting the role. Please try again.");
    } finally {
      setLoading(false);  
    }
  };

  return (
    <main className="min-h-screen overflow-hidden">
      <div className="bg-landing">
        {!isSignedIn ? (
          <div className="right-10 absolute top-10">
            <SignIn routing="hash" />
          </div>
        ) : (
          <div className="flex flex-col absolute top-20 right-20 space-y-4 items-center border-2 rounded-xl p-8 bg-gray-700">
            <UserButton aftersignouturl="/" />
            <p className="text-white text-lg">You&apos;re signed in!re signed in!</p>

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
                  disabled={loading}  
                  className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500 disabled:bg-gray-400"
                >
                  {loading ? "Setting Role..." : "Go to Dashboard"}
                </button>
              </>
            ) : (
              <button
                onClick={() =>
                  router.push(
                    user?.publicMetadata?.role === "user"
                      ? "/user-dashboard"
                      : "/driver-dashboard"
                  )
                }
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-500"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
