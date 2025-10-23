
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import type { UserWithRole } from './definitions';

const roleSchema = z.object({
  userId: z.string(),
  currentIsAdmin: z.boolean(),
});

export async function toggleAdminRole(
  userId: string,
  currentIsAdmin: boolean
): Promise<{ success: boolean; message: string }> {
  const validated = roleSchema.safeParse({ userId, currentIsAdmin });

  if (!validated.success) {
    return { success: false, message: 'Invalid input.' };
  }

  const supabase = createAdminClient();

  try {
    if (currentIsAdmin) {
      // If they are an admin, remove their role
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // If they are not an admin, add their role
      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: 'admin',
      });

      if (error) throw error;
    }

    revalidatePath('/admin/users');
    return { success: true, message: 'User role updated successfully.' };
  } catch (error: any) {
    console.error('Error toggling admin role:', error);
    return {
      success: false,
      message: error.message || 'A server error occurred.',
    };
  }
}

export async function getUsersWithRoles(): Promise<{ users: UserWithRole[]; error: string | null; }> {
  try {
    const admin = await getFirebaseAdmin();
    const supabase = createAdminClient();

    // 1. Fetch all users from Firebase Auth
    const listUsersResult = await admin.auth().listUsers();
    const authUsers = listUsersResult.users.map(userRecord => ({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        creationTime: userRecord.metadata.creationTime,
    }));

    // 2. Fetch all admin roles from the 'user_roles' table in Supabase
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    
    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      throw new Error('Could not fetch user roles from the database.');
    }

    const adminIds = new Set(rolesData?.map(r => r.user_id) || []);

    // 3. Merge the data
    const combinedUsers: UserWithRole[] = authUsers.map(user => ({
      ...user,
      isAdmin: adminIds.has(user.uid),
    }));

    return { users: combinedUsers, error: null };
  } catch (error: any) {
    console.error("Error getting users with roles:", error);
    return { users: [], error: 'Could not fetch user data. Please ensure your Firebase Admin credentials are set correctly on the server.' };
  }
}
