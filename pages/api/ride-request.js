// pages/api/ride-request.js
import { requestRide } from "../../models/rider";
import { assignNearestDriver } from "../../utils/assignDriver";

export default async (req, res) => {
  if (req.method === "POST") {
    const { userId, pickup, dropoff, rideType, price, name } = req.body;

    // Create a new ride request
    const rideId = await requestRide(userId, pickup, dropoff, rideType, price, name);

    // Assign the nearest driver
    await assignNearestDriver(rideId, pickup);

    res.status(200).json({ message: "Ride requested and driver assigned" });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
};
