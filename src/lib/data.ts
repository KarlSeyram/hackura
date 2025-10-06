
'use server';

import type { Ebook, Review } from './definitions';
import { createAdminClient } from '@/lib/supabase/server';

export async function getEbooks(options: { includeDisabled?: boolean } = {}): Promise<Ebook[]> {
  console.log('Attempting to fetch ebooks...');
  console.log('Supabase URL Used:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Loaded' : 'NOT LOADED');

  const { includeDisabled = false } = options;
  const supabase = createAdminClient();
  
  let query = supabase
    .from("ebooks")
    .select("id, title, description, price, image_url, category, is_disabled")
    .order("created_at", { ascending: false });

  if (!includeDisabled) {
    query = query.eq('is_disabled', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Critical Error fetching ebooks from Supabase:", error);
    return [];
  }

  console.log(`Query successful. Found ${data.length} ebooks.`);
  
  if (data.length === 0) {
      console.log('No ebooks were returned from the database. Please check your Supabase table "ebooks" to ensure it contains data and that the "is_disabled" column is set to false for the ebooks you want to display.');
  }

  const fetchedEbooks: Ebook[] = data.map((ebook, index) => ({
    id: ebook.id,
    title: ebook.title,
    description: ebook.description, 
    price: ebook.price,
    imageUrl: ebook.image_url,
    imageHint: '',
    category: ebook.category || 'General',
    isDisabled: ebook.is_disabled,
  }));

  return fetchedEbooks;
}

export async function getReviewsForEbook(ebookId: string): Promise<Review[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('reviews')
        .select('id, ebook_id, reviewer_name, rating, comment')
        .eq('ebook_id', ebookId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }

    return data.map(r => ({
        id: r.id,
        ebookId: r.ebook_id,
        reviewer: r.reviewer_name,
        rating: r.rating,
        comment: r.comment,
    }));
}

export async function submitReview(ebookId: string, rating: number, comment: string, reviewer: string) {
    const supabase = createAdminClient();
    const { error } = await supabase.from('reviews').insert({
        ebook_id: ebookId,
        rating,
        comment,
        reviewer_name: reviewer,
    });

    if (error) {
        console.error('Error inserting review:', error);
        return { success: false, message: 'Sorry, there was an error submitting your review.' };
    }

    return { success: true, message: 'Thank you for your review!' };
}
