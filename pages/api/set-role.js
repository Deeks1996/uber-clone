import { db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, role } = req.body;

      if (!userId || !role) {
        return res.status(400).json({ error: 'UserId and role are required' });
      }

      const allowedRoles = ["user", "driver"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: "Invalid role provided" });
      }

      const clerkApiKey = process.env.CLERK_SECRET_KEY;
      const userEndpoint = `https://api.clerk.dev/v1/users/${userId}`;

      const userResponse = await fetch(userEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${clerkApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Error fetching user from Clerk');
      }

      const user = await userResponse.json();

      if (user.public_metadata?.role === "admin") {
        return res.status(403).json({ error: "Cannot change role for admin user" });
      }

      const updateResponse = await fetch(userEndpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${clerkApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: { role },
        }),
      });

      if (!updateResponse.ok) {
        const responseText = await updateResponse.text();
        console.error('Error details:', responseText);
        throw new Error('Error updating user role in Clerk');
      }

      const updatedUser = await updateResponse.json();

      const userRef = doc(db, "users", userId);
      await setDoc(userRef, {
        id: userId,
        email: user.email_addresses?.[0]?.email_address || "",
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        role: role,
        createdAt: new Date().toISOString(),
      });

      return res.status(200).json({
        message: "User role updated in Clerk and saved to Firebase.",
        user: updatedUser,
      });

    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
