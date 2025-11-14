
'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { uploadProduct } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading...
        </>
      ) : (
        'Upload Product'
      )}
    </Button>
  );
}

type FormErrors = {
  title?: string[];
  description?: string[];
  price?: string[];
  category?: string[];
  image?: string[];
  file?: string[];
};

type FormState = {
  message: string;
  errors: FormErrors;
};

const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';

export default function UploadProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const initialState: FormState = { message: '', errors: {} };
  const [state, formAction] = useFormState(uploadProduct, initialState);


  useEffect(() => {
    if (state.message) {
      if (Object.keys(state.errors).length > 0) {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: state.message,
        });
      } else {
        toast({
          title: 'Success!',
          description: state.message,
        });
        formRef.current?.reset();
        router.push('/admin/dashboard');
        router.refresh();
      }
    }
  }, [state, toast, router]);


  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex-1 space-y-4">
        <h2 className="font-headline text-3xl font-bold tracking-tight">Upload New Product</h2>
        <Card>
          <CardHeader>
            <CardTitle>New Ebook Details</CardTitle>
            <CardDescription>
              Fill out the form below to add a new ebook to the store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="e.g., Advanced Network Security" />
                {state.errors?.title?.[0] && <p className="text-sm text-destructive">{state.errors.title[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="A brief but engaging description of the ebook." rows={5} />
                {state.errors?.description?.[0] && <p className="text-sm text-destructive">{state.errors.description[0]}</p>}
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label htmlFor="price">Price ({paystackCurrency})</Label>
                    <Input id="price" name="price" type="number" placeholder="e.g., 49.99 or 0 for free" step="0.01" />
                    {state.errors?.price?.[0] && <p className="text-sm text-destructive">{state.errors.price[0]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" placeholder="e.g., Offensive Security" />
                    {state.errors?.category?.[0] && <p className="text-sm text-destructive">{state.errors.category[0]}</p>}
                  </div>
               </div>

              <div className="space-y-2">
                <Label htmlFor="image">Ebook Cover Image</Label>
                <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" />
                 {state.errors?.image?.[0] && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Ebook File (PDF, EPUB, ZIP)</Label>
                <Input id="file" name="file" type="file" accept=".pdf,.epub,.zip" />
                {state.errors?.file?.[0] && <p className="text-sm text-destructive">{state.errors.file[0]}</p>}
              </div>
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    