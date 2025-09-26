'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { uploadProduct } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const fileSchema = z.custom<FileList>(val => val instanceof FileList, 'Please select a file.')
  .refine(files => files.length > 0, 'File is required.');

const imageSchema = fileSchema
  .refine(files => files[0].size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
  .refine(
    files => ["image/jpeg", "image/png", "image/webp"].includes(files[0].type),
    "Only .jpg, .png, and .webp formats are supported."
  );
  
const ebookFileSchema = fileSchema
  .refine(files => files[0].size <= 25 * 1024 * 1024, `Max file size is 25MB.`)
  .refine(
    files => ["application/pdf", "application/epub+zip"].includes(files[0].type),
    "Only .pdf and .epub formats are supported."
  );

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  image: imageSchema,
  file: ebookFileSchema,
});

type FormValues = z.infer<typeof FormSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Upload Product
    </Button>
  );
}

export default function UploadProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const [state, formAction, isPending] = useActionState(uploadProduct, {
    message: null,
    errors: {},
  });

  useEffect(() => {
    if (state?.message) {
      if (Object.keys(state.errors ?? {}).length === 0) {
        toast({
          title: 'Success!',
          description: state.message,
        });
        reset();
        router.push('/admin/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: state.message,
        });
      }
    }
  }, [state, toast, reset, router]);
  
  const onSubmit: SubmitHandler<FormValues> = data => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', String(data.price));
    formData.append('image', data.image[0]);
    formData.append('file', data.file[0]);

    formAction(formData);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="font-headline text-3xl font-bold tracking-tight">Upload New Product</h2>
      <Card>
        <CardHeader>
          <CardTitle>New Ebook Details</CardTitle>
          <CardDescription>
            Fill out the form below to add a new ebook to the store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} placeholder="e.g., Advanced Network Security" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} placeholder="A brief but engaging description of the ebook." rows={5} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (GHS)</Label>
              <Input id="price" type="number" {...register('price')} placeholder="e.g., 49.99" step="0.01" />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Ebook Cover Image</Label>
              <Input id="image" type="file" {...register('image')} accept="image/jpeg,image/png,image/webp" />
              {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
              {state?.errors?.image && <p className="text-sm text-destructive">{state.errors.image[0]}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="file">Ebook File (PDF, EPUB)</Label>
              <Input id="file" type="file" {...register('file')} accept=".pdf,.epub" />
              {errors.file && <p className="text-sm text-destructive">{errors.file.message}</p>}
               {state?.errors?.file && <p className="text-sm text-destructive">{state.errors.file[0]}</p>}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
