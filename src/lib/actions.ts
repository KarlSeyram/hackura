
'use server';

import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import type { CartItem } from '@/lib/definitions';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  service: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

const fileSchema = z.custom<FileList>(val => val instanceof FileList, 'Please select a file.')
  .refine(files => files.length > 0, 'File is required.');

const imageSchema = fileSchema
  .refine(files => files?.[0]?.size > 0, 'File is required.')
  .refine(files => files?.[0]?.size <= 5 * 1024 * 1024, `Max file size is 5MB.`)
  .refine(
    files => ["image/jpeg", "image/png", "image/webp"].includes(files?.[0]?.type),
    "Only .jpg, .png, and .webp formats are supported."
  );
  
const ebookFileSchema = fileSchema
 .refine(files => files?.[0]?.size > 0, 'File is required.')
  .refine(files => files?.[0]?.size <= 25 * 1024 * 1024, `Max file size is 25MB.`)
  .refine(
    files => ["application/pdf", "application/epub+zip"].includes(files?.[0]?.type),
    "Only .pdf and .epub formats are supported."
  );

const productSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  price: z.preprocess(
    val => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Price must be a positive number.')
  ),
  image: imageSchema,
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { message: 'Supabase environment variables are not configured.', errors: {} };
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
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
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please correct the form errors.',
        };
    }

    const { title, description, price, image, file } = validatedFields.data;
    
    // The image from the form is a FileList, get the first file
    const imageFile = image[0];
    const ebookFile = file[0];

    // 1. Upload cover image
    const imageFileName = `${Date.now()}-${imageFile.name}`;
    const { error: imageError, data: imageData } = await supabase.storage
        .from('ebook-covers')
        .upload(imageFileName, imageFile);

    if (imageError || !imageData) {
        return { message: `Failed to upload cover image: ${imageError?.message}`, errors: {} };
    }
    const { data: { publicUrl: imageUrl } } = supabase.storage.from('ebook-covers').getPublicUrl(imageData.path);


    // 2. Upload ebook file
    const ebookFileName = `${Date.now()}-${ebookFile.name}`;
    const { error: fileError } = await supabase.storage
        .from('ebook-files')
        .upload(ebookFileName, ebookFile);
    
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

// This function creates secure, time-limited download links for purchased ebooks.
export async function createSignedDownloads(cartItems: CartItem[]) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables are not configured.');
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Use Promise.all to generate all signed URLs in parallel.
  const productsWithDownloads = await Promise.all(
    cartItems.map(async (item) => {
      // We need to fetch the file_name from the database using the product id
      const { data: ebookData, error: dbError } = await supabase
        .from('ebooks')
        .select('file_name')
        .eq('id', item.id)
        .single();
      
      if (dbError || !ebookData) {
        console.error(`Error fetching ebook data for ${item.title}:`, dbError);
        return { ...item, downloadUrl: null }; // Handle case where ebook is not found
      }

      const { data, error } = await supabase.storage
        .from('ebook-files')
        .createSignedUrl(ebookData.file_name, 60 * 60 * 24); // Link expires in 24 hours

      if (error) {
        console.error(`Error creating signed URL for ${item.title}:`, error);
        return { ...item, downloadUrl: null }; // Handle error gracefully
      }
      
      return { ...item, downloadUrl: data.signedUrl };
    })
  );

  return productsWithDownloads;
}
