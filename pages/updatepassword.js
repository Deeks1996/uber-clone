import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { clerkClient } from "@clerk/nextjs"; 
import { ToastContainer, toast } from "react-toastify";

const UpdatePassword = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  
  useEffect(() => {
    const checkUser = async () => {
      if (!user?.id) return;

      try {
        const userRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        if (!userData?.mustChangePassword) {
          router.replace("/"); 
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user?.id) {
      checkUser();
    }
  }, [isLoaded, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await clerkClient.users.updateUser(user.id, { password: newPassword });

      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        mustChangePassword: false,
      });

      toast.success("Password updated successfully.");
      router.replace("/"); 
    } catch (err) {
      console.error("Error updating password:", err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="bg-blue-200 min-h-screen">
      <div className="p-8 flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4">Update Password</h1>

        <form onSubmit={handlePasswordUpdate} className="bg-slate-200 p-6 rounded-xl shadow space-y-4 flex flex-col justify-center w-1/3">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-900 text-white p-2 rounded"
          >
            Update Password
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UpdatePassword;
