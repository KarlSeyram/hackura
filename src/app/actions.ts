
'use server';

import type { CartItem, PurchaseLink, Ebook } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';
import { generateDownloadToken, verifyDownloadToken } from '@/lib/downloadToken';
import { createAdminClient } from '@/lib/supabase/server';


export async function recordPurchase(
  { userId, cartItems, paymentReference, finalPrice, discountCode }: 
  { userId: string; cartItems: CartItem[]; paymentReference: string; finalPrice: number; discountCode?: string; }
) {
  const supabase = createAdminClient();

  // 1. Prepare purchase records for insertion
  const purchaseRecords = cartItems.map(item => ({
    ebook_id: item.id,
    payment_ref: paymentReference,
    user_id: userId,
    final_price: finalPrice,
    discount_code: discountCode,
  }));

  // 2. Insert records into the 'purchases' table
  if (purchaseRecords.length > 0) {
    const { error: insertError } = await supabase
      .from('purchases')
      .insert(purchaseRecords);

    if (insertError) {
      console.error('Error inserting purchase records:', insertError);
      throw new Error('Failed to record purchase.');
    }
  }

  // 3. Invoke the Edge Function to send a receipt email (non-blocking)
  const { error: functionError } = await supabase.functions.invoke('send-receipt-email', {
    body: { userId, cartItems, paymentReference, finalPrice, discountCode },
  });

  if (functionError) {
    // Log the error but don't block the user's flow.
    // The purchase is recorded, but the email failed.
    // This should be monitored via server logs.
    console.error('Failed to invoke send-receipt-email function:', functionError);
  }

  // 4. Revalidate paths to update cached data
  revalidatePath('/my-ebooks');
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

        // Generate a short-lived signed URL for the download
        const { data, error: urlError } = await supabase.storage
            .from('ebook-files')
            .createSignedUrl(ebook.file_name, 3600); // URL is valid for 1 hour

        if (urlError) {
            console.error('Error creating signed URL for', ebook.file_name, urlError);
            continue;
        }

        downloadLinks.push({ title: ebook.title, download_url: data.signedUrl });
    }

    if(downloadLinks.length === 0){
        throw new Error('Could not retrieve download links for your purchase. Please contact support.');
    }

    return downloadLinks;
}

export async function getSecureDownloadUrl(ebookId: string): Promise<{
    url?: string;
    error?: 'not_found' | 'unknown';
}> {
    const supabase = createAdminClient();

    const { data: ebook, error: dbError } = await supabase
        .from('ebooks')
        .select('file_name')
        .eq('id', ebookId)
        .single();

    if (dbError || !ebook) {
        console.error('Ebook not found for ID:', ebookId, dbError);
        return { error: 'not_found' };
    }
    
    // Create a signed URL that's valid for a short time (e.g., 5 minutes)
    const { data, error: urlError } = await supabase.storage
        .from('ebook-files')
        .createSignedUrl(ebook.file_name, 300);

    if (urlError) {
        console.error('Error creating signed URL:', urlError);
        return { error: 'unknown' };
    }

    return { url: data.signedUrl };
}

export async function createDownloadToken(ebookId: string): Promise<string> {
    return generateDownloadToken(ebookId);
}


export async function getMyEbooks(userId: string): Promise<Ebook[]> {
    const supabase = createAdminClient();

    // 1. Get all unique ebook_ids the user has purchased
    const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('ebook_id')
        .eq('user_id', userId);

    if (purchasesError) {
        console.error('Error fetching user purchases:', purchasesError);
        return [];
    }

    if (!purchases || purchases.length === 0) {
        return [];
    }

    const ebookIds = [...new Set(purchases.map(p => p.ebook_id))];

    // 2. Fetch the details for those ebooks
    const { data: ebooks, error: ebooksError } = await supabase
        .from('ebooks')
        .select('id, title, description, price, image_url, category, file_name, is_disabled')
        .in('id', ebookIds);

    if (ebooksError) {
        console.error('Error fetching purchased ebooks:', ebooksError);
        return [];
    }

    return ebooks.map(ebook => ({
        id: ebook.id,
        title: ebook.title,
        description: ebook.description, 
        price: ebook.price,
        imageUrl: ebook.image_url,
        imageHint: '',
        category: ebook.category || 'General',
        file_name: ebook.file_name,
        isDisabled: ebook.is_disabled
    }));
}


export async function applyDiscount(code: string): Promise<{
  success: boolean;
  message: string;
  discount?: {
    code: string;
    percent: number;
  };
}> {
  if (!code) {
    return { success: false, message: 'Please enter a discount code.' };
  }
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('discounts')
    .select('code, discount_percent, expires_at, is_active')
    .eq('code', code.trim().toUpperCase())
    .single();

  if (error || !data) {
    return { success: false, message: 'This discount code is not valid.' };
  }

  if (!data.is_active) {
    return { success: false, message: 'This discount code is no longer active.' };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { success: false, message: 'This discount code has expired.' };
  }

  return {
    success: true,
    message: 'Discount applied!',
    discount: {
      code: data.code,
      percent: data.discount_percent,
    },
  };
}

export async function getFreeDownloadUrl(ebookId: string): Promise<{ url?: string; error?: string }> {
  const supabase = createAdminClient();

  const { data: ebook, error: dbError } = await supabase
    .from('ebooks')
    .select('file_name, price')
    .eq('id', ebookId)
    .single();

  if (dbError || !ebook) {
    return { error: 'Ebook not found.' };
  }

  if (ebook.price !== 0) {
    return { error: 'This ebook is not free.' };
  }
  
  if (!ebook.file_name) {
      return { error: 'File path is missing for this ebook.' };
  }

  const { data, error: urlError } = await supabase.storage
    .from('ebook-files')
    .createSignedUrl(ebook.file_name, 3600); // 1 hour expiry

  if (urlError) {
    console.error('Error creating signed URL for free ebook:', urlError);
    return { error: 'Could not create download link. Please try again.' };
  }

  return { url: data.signedUrl };
}
