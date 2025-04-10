"use client";
import { useEffect, useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { FaCar, FaUser, FaHistory, FaPhone } from "react-icons/fa";
import { PiPackageFill } from "react-icons/pi";
import { RiFeedbackFill } from "react-icons/ri";
import { GrTransaction } from "react-icons/gr";

const Navbar = ({ requestedCount }) => {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role;

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-blue-900 text-white p-4 flex justify-between items-center">
      <h2 className="text-xl font-bold">Uber Clone</h2>
      <div className="flex flex-row gap-10 relative">
        {role === "driver" ? (
          <>
            <Link
              href="/driver-dashboard"
              className={clsx(
                "relative inline-flex items-center gap-1 px-2 py-1 rounded",
                isActive("/driver-dashboard") && "bg-black"
              )}
            >
              <FaCar />
              <span>Requests</span>
              {requestedCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full px-1 shadow">
                  {requestedCount}
                </span>
              )}
            </Link>

            <Link
              href="/driver-ridehistory"
              className={clsx(
                "flex items-center gap-1",
                isActive("/driver-ridehistory") && "bg-black px-2 py-1 rounded"
              )}
            >
              <FaHistory className="me-1" />
              Ride History
            </Link>

            <Link
              href="/feedbacks"
              className={clsx(
                "flex items-center gap-1",
                isActive("/feedbacks") && "bg-black px-2 py-1 rounded"
              )}
            >
              <RiFeedbackFill className="me-1" />
              Feedbacks
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/user-dashboard"
              className={clsx(
                "flex items-center gap-1",
                isActive("/user-dashboard") && "bg-black px-2 py-1 rounded"
              )}
            >
              <FaCar className="me-1" />
              Ride
            </Link>

            <Link
              href="/packages"
              className={clsx(
                "flex items-center gap-1",
                isActive("/packages") && "bg-black px-2 py-1 rounded"
              )}
            >
              <PiPackageFill className="me-1" />
              Packages
            </Link>

            <Link
              href="/ridehistory"
              className={clsx(
                "flex items-center gap-1",
                isActive("/ridehistory") && "bg-black px-2 py-1 rounded"
              )}
            >
              <FaHistory className="me-1" />
              Ride History
            </Link>

            <Link
              href="/transactions"
              className={clsx(
                "flex items-center gap-1",
                isActive("/transactions") && "bg-black px-2 py-1 rounded"
              )}
            >
              <GrTransaction className="me-1" />
              Transactions
            </Link>
          </>
        )}

        <Link
          href="/profile"
          className={clsx(
            "flex items-center gap-1",
            isActive("/profile") && "bg-black px-2 py-1 rounded"
          )}
        >
          <FaUser />
          Profile
        </Link>

        <Link
          href="/contact"
          className={clsx(
            "flex items-center gap-1",
            isActive("/contact") && "bg-black px-2 py-1 rounded"
          )}
        >
          <FaPhone />
          Contact Us
        </Link>
      </div>

      <div className="flex flex-row space-x-2">
        <p>Welcome, {user?.fullName}</p>
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;
