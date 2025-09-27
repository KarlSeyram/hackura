
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import type { CartItem } from '@/lib/definitions';

// This function creates secure, time-limited download links for purchased ebooks.
export async function createSignedDownloads(cartItems: CartItem[], paymentReference: string) {
  const supabase = createAdminClient();

  // Use Promise.all to generate all signed URLs in parallel.
  const productsWithDownloads = await Promise.all(
    cartItems.map(async (item) => {
      // We need to fetch the file_name from the database using the product id
      const { data: ebookData, error: dbError } = await supabase
        .from('ebooks')
        .select('file_name, title')
        .eq('id', item.id)
        .single();
      
      if (dbError || !ebookData || !ebookData.file_name) {
        console.error(`Error fetching ebook data for ${item.title} (ID: ${item.id}):`, dbError);
        return null;
      }

      const { data, error } = await supabase.storage
        .from('ebook-files')
        .createSignedUrl(ebookData.file_name, 60 * 60 * 24); // Link expires in 24 hours

      if (error) {
        console.error(`Error creating signed URL for ${item.title} (File: ${ebookData.file_name}):`, error);
        return null;
      }
      
      return { ebook_id: item.id, download_url: data.signedUrl, payment_ref: paymentReference, title: ebookData.title };
    })
  );

  const validLinks = productsWithDownloads.filter(item => item !== null);

  if (validLinks.length > 0) {
      const { error: insertError } = await supabase
        .from('purchase_links')
        .insert(validLinks as any);

      if (insertError) {
          console.error('Error inserting purchase links:', insertError);
          return [];
      }
  }
  
  return validLinks;
}
