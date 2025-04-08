import { createUser } from "../../models/user";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userId, name, email, phone } = req.body;
    try {
      await createUser(userId, name, email, phone);
      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
