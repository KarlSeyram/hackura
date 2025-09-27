
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import type { CartItem } from '@/lib/definitions';

// This function creates secure, time-limited download links for purchased ebooks.
export async function createSignedDownloads(cartItems: CartItem[], paymentReference: string) {
  const supabase = createAdminClient();

  // First, record the main purchase event.
  // In a multi-item cart, you might create one purchase record with multiple line items.
  // For simplicity here, we'll assume one main purchase record can be associated.
  const purchaseRecords = cartItems.map(item => ({
    ebook_id: item.id,
    payment_ref: paymentReference,
    // In a real app, you'd associate this with a logged-in user's ID
    // user_id: userId,
  }));

  if (purchaseRecords.length > 0) {
    const { error: insertError } = await supabase
      .from('purchases')
      .insert(purchaseRecords);

    if (insertError) {
      console.error('Error inserting purchase records:', insertError);
      // Even if this fails, we might still proceed or handle it differently
      // For now, we'll log it and continue.
    }
  }

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
      
      return { 
        ebook_id: item.id, 
        download_url: data.signedUrl, 
        payment_ref: paymentReference,
        title: ebookData.title,
      };
    })
  );

  const validLinks = productsWithDownloads.filter(item => item !== null);
  
  // We need to insert title into the purchase_links table now
  const linksToInsert = validLinks.map(link => ({
      ebook_id: link!.ebook_id,
      download_url: link!.download_url,
      payment_ref: link!.payment_ref,
      title: link!.title,
  }));


  if (linksToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('purchase_links')
        .insert(linksToInsert as any);

      if (insertError) {
          console.error('Error inserting purchase links:', insertError);
          return [];
      }
  }
  
  return validLinks;
}

export async function getPurchaseDownloadLinks(purchaseId: string) {
    const supabase = createAdminClient();
    const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('id, ebook_id')
        .eq('payment_ref', purchaseId)
        .single();

    if (purchaseError || !purchase) {
        console.error('Error fetching purchase:', purchaseId, purchaseError);
        throw new Error('Could not find a matching purchase. Please contact support if you believe this is an error.');
    }

    const { data: ebook, error: ebookError } = await supabase
        .from('ebooks')
        .select('title, file_name')
        .eq('id', purchase.ebook_id)
        .single();

    if (ebookError || !ebook) {
        console.error('Error fetching ebook for purchase:', purchase.id, ebookError);
        throw new Error('Could not find the requested ebook. Please contact support.');
    }

    const downloadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ebook-files/${ebook.file_name}`;

    return [{ title: ebook.title, download_url: downloadUrl }];
}

export async function clearPurchaseData(paymentRef: string) {
    const supabase = createAdminClient();
    
    const { error } = await supabase
        .from('purchase_links')
        .delete()
        .eq('payment_ref', paymentRef);

    if (error) {
        console.error('Error cleaning up purchase data:', error);
    }
}
