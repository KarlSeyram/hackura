
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// For use in server-side logic (e.g., API routes, Server Actions)
export function createAdminClient() {
  config(); // Force-load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    throw new Error(
      'Supabase URL is not set or is invalid in environment variables. Please check your .env file.'
    );
  }
  
  if (!serviceRoleKey) {
    throw new Error(
        'Supabase Service Role Key is not set in environment variables. Please check your .env file.'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
