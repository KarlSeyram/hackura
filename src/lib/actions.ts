
'use server';

import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  service: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

const fileSchema = z.custom<File>(file => file instanceof File, 'Please upload a file.');

const imageSchema = fileSchema.refine(
  file => file.size === 0 || file.type.startsWith('image/'),
  'Please upload an image file.'
);

const ebookFileSchema = fileSchema.refine(
    file => file.size > 0, "Please upload a file."
).refine(
    file => ['application/pdf', 'application/epub+zip'].includes(file.type),
    'Please upload a PDF or EPUB file.'
);


const productSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  price: z.preprocess(
    val => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Price must be a positive number.')
  ),
  image: imageSchema.refine(file => file.size > 0, 'Cover image is required.'),
  file: ebookFileSchema,
});


export async function submitContactRequest(prevState: any, formData: FormData) {
  const validatedFields = contactSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    service: formData.get('service'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please correct the errors and try again.',
    };
  }

  // In a real application, you would save this to a database.
  console.log('New contact request:', validatedFields.data);

  return {
    message: 'Thank you for your message! We will get back to you soon.',
    errors: {},
  };
}

export async function uploadProduct(prevState: any, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const validatedFields = productSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        price: formData.get('price'),
        image: formData.get('image'),
        file: formData.get('file'),
    });

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please correct the form errors.',
        };
    }

    const { title, description, price, image, file } = validatedFields.data;

    // 1. Upload cover image
    const imageFileName = `${Date.now()}-${image.name}`;
    const { error: imageError, data: imageData } = await supabase.storage
        .from('ebook-covers')
        .upload(imageFileName, image);

    if (imageError) {
        return { message: `Failed to upload cover image: ${imageError.message}`, errors: {} };
    }
    const { data: { publicUrl: imageUrl } } = supabase.storage.from('ebook-covers').getPublicUrl(imageData.path);


    // 2. Upload ebook file
    const ebookFileName = `${Date.now()}-${file.name}`;
    const { error: fileError } = await supabase.storage
        .from('ebook-files')
        .upload(ebookFileName, file);
    
    if (fileError) {
        // Clean up uploaded image if file upload fails
        await supabase.storage.from('ebook-covers').remove([imageFileName]);
        return { message: `Failed to upload ebook file: ${fileError.message}`, errors: {} };
    }

    // 3. Insert product record into database
    const { error: dbError } = await supabase.from('ebooks').insert({
        title,
        description,
        price,
        image_url: imageUrl,
        file_name: ebookFileName,
    });

    if (dbError) {
        // Clean up storage if db insert fails
        await supabase.storage.from('ebook-covers').remove([imageFileName]);
        await supabase.storage.from('ebook-files').remove([ebookFileName]);
        return { message: `Failed to save product: ${dbError.message}`, errors: {} };
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/store');

    return {
        message: 'Product uploaded successfully!',
        errors: {},
    };
}
