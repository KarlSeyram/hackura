
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import type { Ebook } from '@/lib/definitions';
import { EditForm } from './edit-form';

async function getProduct(id: string): Promise<Ebook | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !data) {
        return null;
    }

    const ebook: Ebook = {
        id: data.id,
        title: data.title,
        description: data.description,
        price: data.price,
        imageUrl: data.image_url,
        category: data.category || 'General',
        imageHint: '',
        isDisabled: data.is_disabled
    };
    return ebook;
}


export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }
  
  return (
    <EditForm product={product} />
  );
}
