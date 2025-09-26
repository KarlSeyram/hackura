
'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CartItem } from '@/lib/definitions';

// This function creates secure, time-limited download links for purchased ebooks.
export async function createSignedDownloads(cartItems: CartItem[]) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables are not configured.');
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Use Promise.all to generate all signed URLs in parallel.
  const productsWithDownloads = await Promise.all(
    cartItems.map(async (item) => {
      // We need to fetch the file_name from the database using the product id
      const { data: ebookData, error: dbError } = await supabase
        .from('ebooks')
        .select('file_name')
        .eq('id', item.id)
        .single();
      
      if (dbError || !ebookData || !ebookData.file_name) {
        console.error(`Error fetching ebook data for ${item.title}:`, dbError);
        return { ...item, downloadUrl: null }; // Handle case where ebook is not found
      }

      const { data, error } = await supabase.storage
        .from('ebook-files')
        .createSignedUrl(ebookData.file_name, 60 * 60 * 24); // Link expires in 24 hours

      if (error) {
        console.error(`Error creating signed URL for ${item.title}:`, error);
        return { ...item, downloadUrl: null }; // Handle error gracefully
      }
      
      return { ...item, downloadUrl: data.signedUrl };
    })
  );

  return productsWithDownloads;
}
