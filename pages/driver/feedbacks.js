import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import { Star } from "lucide-react"; 

const DriverFeedbackPage = () => {
  const { user } = useUser();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchFeedbacks = async () => {
      try {
        const feedbackRef = collection(db, "drivers", user.id, "feedbacks");
        const q = query(feedbackRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const feedbackList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeedbacks(feedbackList);

        if (feedbackList.length > 0) {
          const total = feedbackList.reduce((sum, fb) => sum + (fb.rating || 0), 0);
          const avg = total / feedbackList.length;
          setAverageRating(avg.toFixed(1));
        } else {
          setAverageRating(null);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-blue-200">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Ride Feedback</h1>

        {/* Add average rating section here */}
        {averageRating !== null && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-lg font-semibold">Average Rating:</p>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                  fill={i < Math.round(averageRating) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span className="ml-2 text-lg font-bold text-blue-900">{averageRating}</span>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading feedbacks...</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-center text-gray-500">No feedbacks received yet.</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-sm">
                    Ride ID: <span className="font-mono">{fb.rideId}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < fb.rating ? "text-yellow-400" : "text-gray-300"}`}
                        fill={i < fb.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>

                {fb.feedback ? (
                  <p className="text-green-800">{fb.feedback}</p>
                ) : (
                  <p className="text-gray-400 italic">No written feedback</p>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  Submitted on {new Date(fb.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverFeedbackPage;
