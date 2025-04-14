import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { id, email, name, role } = req.body;

      if (!id || !email || !name || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await db.collection("users").doc(id).set({
        id,
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
      });

      return res.status(200).json({ message: "User stored successfully" });
    } catch (err) {
      console.error("Error storing user:", err);
      return res.status(500).json({ error: "Failed to store user" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
