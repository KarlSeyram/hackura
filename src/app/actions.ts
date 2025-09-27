
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import type { CartItem, PurchaseLink } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';


export async function recordPurchase(cartItems: CartItem[], paymentReference: string) {
  const supabase = createAdminClient();

  const purchaseRecords = cartItems.map(item => ({
    ebook_id: item.id,
    payment_ref: paymentReference,
    // In a real app with user accounts, you would get the user ID here.
    // user_id: userId, 
  }));

  if (purchaseRecords.length > 0) {
    const { error: insertError } = await supabase
      .from('purchases')
      .insert(purchaseRecords);

    if (insertError) {
      console.error('Error inserting purchase records:', insertError);
      throw new Error('Failed to record purchase.');
    }
  }

  revalidatePath(`/download/${paymentReference}`);
  return { success: true };
}


export async function getPurchaseDownloadLinks(purchaseId: string): Promise<PurchaseLink[]> {
    const supabase = createAdminClient();
    
    // There might be multiple items in a single purchase, identified by the same payment_ref
    const { data: purchases, error: purchaseError } = await supabase
        .from('purchases')
        .select('id, ebook_id')
        .eq('payment_ref', purchaseId);

    if (purchaseError || !purchases || purchases.length === 0) {
        console.error('Error fetching purchase:', purchaseId, purchaseError);
        throw new Error('Could not find a matching purchase. Please contact support if you believe this is an error.');
    }

    const downloadLinks: PurchaseLink[] = [];

    for (const purchase of purchases) {
        const { data: ebook, error: ebookError } = await supabase
            .from('ebooks')
            .select('title, file_name')
            .eq('id', purchase.ebook_id)
            .single();

        if (ebookError || !ebook) {
            console.error('Error fetching ebook for purchase:', purchase.id, ebookError);
            // We can choose to continue to fetch other links or fail all.
            // For now, we'll just log the error and skip this item.
            continue; 
        }

        const downloadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ebook-files/${ebook.file_name}`;

        downloadLinks.push({ title: ebook.title, download_url: downloadUrl });
    }

    if(downloadLinks.length === 0){
        throw new Error('Could not retrieve download links for your purchase. Please contact support.');
    }

    return downloadLinks;
}
