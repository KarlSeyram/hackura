
'use client';

import { notFound, useRouter } from 'next/navigation';
import { getEbooks } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Ebook } from '@/lib/definitions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
});

type FormValues = z.infer<typeof FormSchema>;

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<Ebook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error || !data) {
        notFound();
      } else {
        const ebook: Ebook = {
            id: data.id,
            title: data.title,
            description: data.description,
            price: data.price,
            imageUrl: data.image_url,
            category: data.category || 'General',
            imageHint: ''
        };
        setProduct(ebook);
        setValue('title', ebook.title);
        setValue('description', ebook.description);
        setValue('price', ebook.price);
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [id, setValue]);

  if (isLoading) {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        </div>
    )
  }

  if (!product) {
    notFound();
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from('ebooks')
      .update({
        title: data.title,
        description: data.description,
        price: data.price,
      })
      .eq('id', id);

    if (error) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: `Could not update product: ${error.message}`
        })
    } else {
        toast({
            title: 'Success!',
            description: 'Product updated successfully.'
        })
        router.push('/admin/dashboard');
        router.refresh();
    }
    setIsSubmitting(false);
  }

  return (
    <div className="flex-1 space-y-4">
      <h2 className="font-headline text-3xl font-bold tracking-tight">Edit Product</h2>
      <Card>
        <CardHeader>
          <CardTitle>Editing: {product.title}</CardTitle>
          <CardDescription>
            Make changes to the product details below. Image and file uploads are not supported on this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} rows={5} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
