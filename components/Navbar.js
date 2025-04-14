import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { FaBars, FaCar, FaUser, FaHistory, FaPhone } from "react-icons/fa";
import { PiPackageFill } from "react-icons/pi";
import { RiFeedbackFill } from "react-icons/ri";
import { GrTransaction } from "react-icons/gr";

const Navbar = ({ requestedCount }) => {
  const pathname = usePathname();
  const { user } = useUser();
  const role = user?.publicMetadata?.role;
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => pathname === path;
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <nav className="bg-blue-950 text-white px-5 py-2 flex items-center justify-between h-14 relative shadow">
      <div className="flex items-center justify-between w-full md:w-auto">
        <h2 className="text-lg font-semibold">Uber Clone</h2>
        <button
          className="md:hidden text-white text-2xl"
          onClick={toggleMenu}
        >
          <FaBars />
        </button>
      </div>

      <div className="hidden md:flex items-center gap-6">
        {getLinksByRole(role, isActive, requestedCount)}
        <Link
          href="/profile"
          className={clsx(
            "flex items-center gap-1",
            isActive("/profile") && "text-white bg-black px-2 py-1 rounded"
          )}
        >
          <FaUser />
          Profile
        </Link>
        {role !== "admin" && (
          <Link
            href="/contact"
            className={clsx(
              "flex items-center gap-1",
              isActive("/contact") && "text-white bg-black px-2 py-1 rounded"
            )}
          >
            <FaPhone />
            Contact 
          </Link>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm">Welcome, {user?.fullName}</span>
          <UserButton />
        </div>
      </div>

      {menuOpen && (
        <div className="absolute top-14 right-4 w-60 bg-blue-900 rounded-md shadow-md p-4 z-50 md:hidden">
          <div className="flex flex-col gap-4">
            {getLinksByRole(role, isActive, requestedCount)}
            <Link
              href="/profile"
              className={clsx(
                "flex items-center gap-1",
                isActive("/profile") && "text-white bg-black px-2 py-1 rounded"
              )}
            >
              <FaUser />
              Profile
            </Link>
            {role !== "admin" && (
              <Link
                href="/contact"
                className={clsx(
                  "flex items-center gap-1",
                  isActive("/contact") && "text-white bg-black px-2 py-1 rounded"
                )}
              >
                <FaPhone />
                Contact
              </Link>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm">Welcome, {user?.fullName}</span>
              <UserButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

function getLinksByRole(role, isActive, requestedCount) {
  const linkClass = (path) =>
    clsx(
      "flex items-center gap-1",
      isActive(path) && "text-white bg-black px-2 py-1 rounded"
    );

  if (role === "driver") {
    return (
      <>
        <Link href="/driver/dashboard" className={linkClass("/driver/dashboard")}>
          <div className="relative flex items-center gap-1">
            <FaCar />
            Requests
            {requestedCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs rounded-full px-1 shadow">
                {requestedCount}
              </span>
            )}
          </div>
        </Link>
        <Link href="/driver/driver-ridehistory" className={linkClass("/driver/driver-ridehistory")}>
          <FaHistory />
          Ride History
        </Link>
        <Link href="/driver/feedbacks" className={linkClass("/driver/feedbacks")}>
          <RiFeedbackFill />
          Feedbacks
        </Link>
      </>
    );
  } else if (role === "admin") {
    return (
      <>
        <Link href="/admin/dashboard" className={linkClass("/admin/dashboard")}>
          <FaCar />
          Rides
        </Link>
        <Link href="/admin/queries" className={linkClass("/admin/queries")}>
          <FaPhone />
          Customer Queries
        </Link>
      </>
    );
  } else {
    return (
      <>
        <Link href="/rider/dashboard" className={linkClass("/rider/dashboard")}>
          <FaCar />
          Ride
        </Link>
        <Link href="/rider/packages" className={linkClass("/rider/packages")}>
          <PiPackageFill />
          Packages
        </Link>
        <Link href="/rider/ridehistory" className={linkClass("/rider/ridehistory")}>
          <FaHistory />
          Ride History
        </Link>
        <Link href="/rider/transactions" className={linkClass("/rider/transactions")}>
          <GrTransaction />
          Transactions
        </Link>
      </>
    );
  }
}

export default Navbar;
