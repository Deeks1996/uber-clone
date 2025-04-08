
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, role } = req.body;

      if (!userId || !role) {
        return res.status(400).json({ error: 'UserId and role are required' });
      }

      console.log('Received body:', req.body);
      console.log("UserId:", userId, "Role:", role);

      const clerkApiKey = process.env.CLERK_SECRET_KEY;

      
      const userEndpoint = `https://api.clerk.dev/v1/users/${userId}`;

      // Fetch the user from Clerk API
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
      console.log('Fetched User:', user);

      // Define the Clerk API endpoint to update the user's role
      const updateUserEndpoint = `https://api.clerk.dev/v1/users/${userId}`;

      // Send a PATCH request to update the user's metadata with the new role
      const updateResponse = await fetch(updateUserEndpoint, {
        method: 'PATCH', // Changed to PATCH based on Clerk API's documentation
        headers: {
          'Authorization': `Bearer ${clerkApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_metadata: { role }, // Update the user's role in public metadata
        }),
      });

      // Check if the update was successful
      if (!updateResponse.ok) {
        // Read the response body to log error details
        const responseText = await updateResponse.text();
        console.error('Error details:', responseText);
        throw new Error('Error updating user role');
      }

      // Parse and return the updated user
      const updatedUser = await updateResponse.json();
      return res.status(200).json(updatedUser);  // Return the updated user data

    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });  // Return error message if any
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' }); // Ensure only POST method is allowed
  }
}
