"use client";
import { useEffect, useState } from "react";
import packageData from "../data/ride-packages.json";
import { motion } from "framer-motion";

const Packages = () => {
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    setPackages(packageData);
  }, []);

  return (
    <div className="p-6 bg-gray-800 overflow-hidden rounded-lg ">
      <h2 className="text-2xl font-bold mb-6 text-gray-100 ">Choose Your Ride Package</h2>
      <div className="grid md:grid-cols-3 gap-6 ">
        {packages.map((pkg, index) => (
          <motion.div
            key={index}
            className="rounded-lg shadow-lg overflow-hidden bg-gray-50 border-2 border-gray-800"
            whileHover={{
              scale: 1.05, 
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)", 
            }}
            transition={{
              type: "spring",
              stiffness: 300, 
              damping: 20, 
            }}
          >
            <img
              src={pkg.imageUrl}
              alt={pkg.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {pkg.name}
              </h3>
              <p className="text-gray-600 mb-2">
                <strong>Base Fare:</strong> ₹{pkg.baseFare}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Per Km:</strong> ₹{pkg.pricePerKm}
              </p>
              <ul className="text-gray-600 text-sm list-disc pl-5">
                {pkg.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Packages;
