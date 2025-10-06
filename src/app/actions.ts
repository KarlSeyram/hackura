
'use server';

import 'dotenv/config';
import { createAdminClient } from '@/lib/supabase/server';
import type { CartItem, PurchaseLink, Ebook } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';
import { generateDownloadToken, verifyDownloadToken } from '@/lib/downloadToken';


export async function recordPurchase(userId: string, cartItems: CartItem[], paymentReference: string) {
  const supabase = createAdminClient();

  const purchaseRecords = cartItems.map(item => ({
    ebook_id: item.id,
    payment_ref: paymentReference,
    user_id: userId, 
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
        .select('id, title, description, price, image_url, category, file_name')
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
        file_name: ebook.file_name
    }));
}

