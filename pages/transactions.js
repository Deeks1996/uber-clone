import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import jsPDF from "jspdf"; 
import Navbar from "@/components/Navbar";

const Transactions = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      const q = query(
        collection(db, "rideRequests"),
        where("userId", "==", user.id),
        where("isPaid", "==", true)
      );

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTransactions(results);
    };

    fetchTransactions();
  }, [user]);

  const downloadReceipt = (transaction) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor("#0077b6");
    doc.text("Ride Payment Receipt", 20, 20);

    doc.setFontSize(12);
    doc.setTextColor("#000000");
    doc.text("Thank you for riding with us!", 20, 30);
    doc.text("We hope you had a smooth and enjoyable journey.", 20, 38);
    doc.text("Your satisfaction means the world to us.", 20, 46);

    doc.setFontSize(12);
    doc.text(`Ride ID: ${transaction.id}`, 20, 60);
    doc.text(`User ID: ${transaction.userId}`, 20, 70);
    doc.text(`Payment ID: ${transaction.paymentId}`, 20, 80);
    doc.text(`Amount Paid: Rs. ${transaction.price}`, 20, 90);
    doc.text(`Pickup: ${transaction.pickupLocation}`, 20, 100);
    doc.text(`Dropoff: ${transaction.dropoffLocation}`, 20, 110);
    doc.text(`Date: ${transaction.createdAt?.toDate().toLocaleString()}`, 20, 120);

    doc.setFontSize(10);
    doc.setTextColor("#555");
    doc.text("Have questions? Reach out to our support team anytime!", 20, 140);
    doc.text("Email: support@uber-clone.com | Phone: +91-7777888899", 20, 148);

    doc.save(`Receipt_${transaction.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-blue-300">
      <Navbar />

      <h1 className="text-2xl font-bold p-3 text-center">Payment Transactions</h1>

      {transactions.length === 0 ? (
        <p className="text-center">No transactions found.</p>
      ) : (
        <div className="overflow-x-auto p-3">
          <table className="min-w-full table-auto bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Ride</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-2">{txn.pickupLocation} → {txn.dropoffLocation}</td>
                  <td className="px-4 py-2">Rs. {txn.price}</td>
                  <td className="px-4 py-2">{txn.createdAt?.toDate().toLocaleString() || "N/A"}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                      onClick={() => downloadReceipt(txn)}
                    >
                      Download Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
