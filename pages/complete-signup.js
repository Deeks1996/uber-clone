import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/router";

const CompleteSignUp = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState("user"); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (user?.publicMetadata?.role) {
      router.push("/");
    }
  }, [user, isLoaded, router]);

  const handleRoleSelection = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await fetch("/api/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({ role }),
      });

      router.push("/"); 
    } catch (error) {
      console.error("Error setting role:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">Select Your Role</h2>
      <select
        className="border p-2 mb-4"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="user">User</option>
        <option value="driver">Driver</option>
      </select>
      <button
        onClick={handleRoleSelection}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        disabled={loading}
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
};

export default CompleteSignUp;
