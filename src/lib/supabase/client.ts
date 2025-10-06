
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: This client is for client-side (browser) use.
// It uses the public anon key and is safe to expose.

export function createBrowserClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase client environment variables are not set.');
    }

    return createClient(supabaseUrl, supabaseAnonKey);
}
