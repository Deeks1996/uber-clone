import { requestRide } from "../../models/ride";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userId, pickup, dropoff, rideType, price,name } = req.body;
    try {
      const rideId = await requestRide(userId, pickup, dropoff, rideType, price,name);
      res.status(201).json({ rideId, message: "Ride request created" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
