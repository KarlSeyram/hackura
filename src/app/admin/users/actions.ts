
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
