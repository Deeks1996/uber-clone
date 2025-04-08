import { Clerk } from '@clerk/clerk-sdk-node';

const clerk = new Clerk({ apiKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY });

export default async function updateRoleForUser (userId, role) {
  const userId1 = 'user_2vFV0ikntQluVOFxhb31TVmfpPE'; // Replace with your actual user ID
const role1 = 'driver';
  try {
    // Update the user's public metadata with the role
    const updatedUser = await clerk.users.updateUser(userId1, {
      publicMetadata: { role1 },
    });

    console.log('User role updated:', updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
  }
};


updateRoleForUser(userId, role);