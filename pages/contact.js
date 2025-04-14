import { useState } from "react";
import Navbar from "@/components/Navbar";

const ContactPage = () => {

  return (
    <div className="min-h-screen bg-blue-200">
      <Navbar />

      <div className="max-w-3xl mx-auto p-6 rounded-lg shadow-xl bg-blue-200 mt-6">
        <h1 className="text-3xl font-semibold text-center text-blue-600 mb-6">Contact Us</h1>

        <p className="text-center text-gray-700 mb-4">
          If you have any questions or need assistance, feel free to reach out to us!
        </p>

        <div className="text-center mb-6">
          <p className="text-lg font-semibold">Our Contact Details</p>
          <p className="text-gray-600">Email: support@uber-clone.com</p>
          <p className="text-gray-600">Phone: +91-7777888899</p>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;
