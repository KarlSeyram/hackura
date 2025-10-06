
'use client';

import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import type { Ebook } from '@/lib/definitions';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateProduct } from '@/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Save Changes
    </Button>
  );
}

type FormState = {
  message: string;
  errors?: {
    id?: string[];
    title?: string[];
    description?: string[];
    price?: string[];
    category?: string[];
  }
};

export function EditForm({ product }: { product: Ebook }) {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const initialState: FormState = { message: '' };
  const [state, dispatch] = useFormState(updateProduct, initialState);
  
  const isSubmitted = useRef(false);

   useEffect(() => {
    if (isSubmitted.current && state?.message) {
      if (state.errors && Object.keys(state.errors).length > 0) {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success!',
          description: state.message,
        });
        router.push('/admin/dashboard');
      }
      isSubmitted.current = false; 
    }
  }, [state, toast, router]);
  
  const handleFormAction = (formData: FormData) => {
    isSubmitted.current = true;
    dispatch(formData);
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
          <form ref={formRef} action={handleFormAction} className="space-y-6">
            <input type="hidden" name="id" value={product.id} />
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={product.title} />
              {state?.errors?.title && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={product.description} rows={5} />
              {state?.errors?.description && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={product.price} />
              {state?.errors?.price && <p className="text-sm text-destructive">{state.errors.price[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={product.category} />
              {state?.errors?.category && <p className="text-sm text-destructive">{state.errors.category[0]}</p>}
            </div>
            
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
