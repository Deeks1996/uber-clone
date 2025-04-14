import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { collection, getDocs, doc , getDoc} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar"; 

const CustomerQueriesPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    const fetchQueries = async () => {
      if (!user?.id) return;

      try {
        const userRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
          setAuthorized(true);
          const querySnap = await getDocs(collection(db, "customerQueries"));

          const queryData = querySnap.docs.map((docSnap) => ({
            queryId: docSnap.id,
            ...docSnap.data(),
          }));

          setQueries(queryData);
        } else {
          router.replace("/");
        }
      } catch (error) {
        console.error("Error fetching customer queries:", error);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) fetchQueries();
  }, [isLoaded, user, router]);

  if (!isLoaded || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading queries...</div>;
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-blue-200">
      <Navbar />

      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Customer Queries</h1>
        
        <div className="overflow-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-200 text-sm text-gray-600">
              <tr>
                <th className="px-4 py-2">Query ID</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Query</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {queries.map((query) => (
                <tr key={query.queryId} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{query.queryId}</td>
                  <td className="px-4 py-2">{query.name}</td>
                  <td className="px-4 py-2">{query.email}</td>
                  <td className="px-4 py-2">{query.message}</td>
                  <td className="px-4 py-2 capitalize">{query.status}</td>
                  <td className="px-4 py-2">
                    {query.timestamp?.toDate?.().toLocaleString() || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerQueriesPage;
