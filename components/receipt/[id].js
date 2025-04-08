"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // or useRouter for pages directory
import jsPDF from "jspdf";

export default function ReceiptPage() {
  const { id } = useParams(); // useRouter().query.id in pages
  const [ride, setRide] = useState(null);

  // Fetch ride details from Firebase
  useEffect(() => {
    async function fetchRide() {
      const res = await fetch(`/api/get-ride?id=${id}`); // adjust this to your API
      const data = await res.json();
      setRide(data);
    }

    if (id) fetchRide();
  }, [id]);

  function downloadReceipt() {
    if (!ride) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Ride Receipt", 20, 20);

    doc.setFontSize(12);
    doc.text(`Ride ID: ${ride.id}`, 20, 40);
    doc.text(`From: ${ride.origin}`, 20, 50);
    doc.text(`To: ${ride.destination}`, 20, 60);
    doc.text(`Date: ${new Date(ride.date).toLocaleString()}`, 20, 70);
    doc.text(`Driver ID: ${ride.driverId}`, 20, 80);
    doc.text(`User ID: ${ride.userId}`, 20, 90);
    doc.text(`Amount Paid: ₹${ride.price}`, 20, 100);
    doc.text(`Status: ${ride.status}`, 20, 110);
    doc.text(`Payment: ${ride.paymentStatus}`, 20, 120);

    doc.save(`receipt-${ride.id}.pdf`);
  }

  if (!ride) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Ride Receipt</h2>
      <div className="space-y-2 text-sm">
        <p><span className="font-semibold">Ride ID:</span> {ride.id}</p>
        <p><span className="font-semibold">From:</span> {ride.origin}</p>
        <p><span className="font-semibold">To:</span> {ride.destination}</p>
        <p><span className="font-semibold">Date:</span> {new Date(ride.date).toLocaleString()}</p>
        <p><span className="font-semibold">Driver:</span> {ride.driverId}</p>
        <p><span className="font-semibold">User:</span> {ride.userId}</p>
        <p><span className="font-semibold">Amount:</span> ₹{ride.price}</p>
        <p><span className="font-semibold">Payment Status:</span> {ride.paymentStatus}</p>
        <p><span className="font-semibold">Ride Status:</span> {ride.status}</p>
      </div>

      <button
        onClick={downloadReceipt}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Download Receipt
      </button>
    </div>
  );
}

