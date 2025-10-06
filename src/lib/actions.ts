
'use server';

import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { CartItem, Ebook } from '@/lib/definitions';
import { generateDownloadToken } from './downloadToken';
import { uploadFromGoogleDrive } from '@/ai/flows/upload-from-google-drive';


// Helper function to create admin client
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are not set.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  service: z.string().optional(),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "application/epub+zip", "application/zip"];

const productSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string().min(1, 'Category is required.'),
  image: z
    .any()
    .refine((file) => file?.size > 0, 'Cover image is required.')
    .refine((file) => file?.size <= MAX_IMAGE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .png, and .webp formats are supported."
    ),
  file: z
    .any()
    .refine((file) => file?.size > 0, 'Ebook file is required.')
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 25MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      "Only .pdf, .epub, and .zip formats are supported."
    ),
});

const driveFileSchema = z.object({
    id: z.string(),
    name: z.string(),
    token: z.string(),
});

const productFromDriveSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string().min(1, 'Category is required.'),
  image: z.union([z.instanceof(File), driveFileSchema]),
  file: z.union([z.instanceof(File), driveFileSchema]),
}).refine(data => {
    if (data.image instanceof File) {
        return data.image.size > 0;
    }
    return true;
}, { message: 'Cover image is required.', path: ['image'] })
.refine(data => {
    if (data.file instanceof File) {
        return data.file.size > 0;
    }
    return true;
}, { message: 'Ebook file is required.', path: ['file'] });


const updateProductSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string().min(1, 'Category is required.'),
});


const reviewSchema = z.object({
  ebookId: z.string(),
  rating: z.coerce.number().min(1, 'A rating is required.').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters.'),
  reviewer: z.string().min(2, 'Name must be at least 2 characters.'),
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

  const supabase = createAdminClient();
  const { name, email, service, message } = validatedFields.data;

  const { error } = await supabase.from('contact_requests').insert({
    name,
    email,
    service: service || null,
    message,
  });

  if (error) {
    console.error('Error inserting contact request:', error);
    return {
      errors: {},
      message: 'There was an error submitting your request. Please try again.',
    };
  }

  revalidatePath('/admin/requests');

  return {
    message: 'Thank you for your message! We will get back to you soon.',
    errors: {},
  };
}

export async function uploadProduct(prevState: any, formData: FormData) {
    const supabase = createAdminClient();

    const validatedFields = productSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        price: formData.get('price'),
        category: formData.get('category'),
        image: formData.get('image'),
        file: formData.get('file'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please correct the form errors.',
        };
    }

    const { title, description, price, category, image, file } = validatedFields.data;
    
    // 1. Upload cover image
    const imageFileName = `${Date.now()}-${image.name}`;
    const { error: imageError, data: imageData } = await supabase.storage
        .from('ebook-covers')
        .upload(imageFileName, image);

    if (imageError || !imageData) {
        return { message: `Failed to upload cover image: ${imageError?.message}`, errors: {} };
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
        category,
        image_url: imageUrl,
        file_name: ebookFileName,
        is_disabled: false,
    });

    if (dbError) {
        // Clean up storage if db insert fails
        await supabase.storage.from('ebook-covers').remove([imageFileName]);
        await supabase.storage.from('ebook-files').remove([ebookFileName]);
        return { message: `Failed to save product: ${dbError.message}`, errors: {} };
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/store');
    revalidatePath('/');

    return {
        message: 'Product uploaded successfully!',
        errors: {},
    };
}

export async function uploadProductFromGoogleDrive(prevState: any, formData: FormData) {
    const supabase = createAdminClient();

    const imageDriveId = formData.get('image-drive-id') as string;
    const imageDriveName = formData.get('image-drive-name') as string;
    const imageDriveToken = formData.get('image-drive-token') as string;

    const fileDriveId = formData.get('file-drive-id') as string;
    const fileDriveName = formData.get('file-drive-name') as string;
    const fileDriveToken = formData.get('file-drive-token') as string;

    let imageInput: any = formData.get('image');
    if (imageDriveId && imageDriveName && imageDriveToken) {
        imageInput = { id: imageDriveId, name: imageDriveName, token: imageDriveToken };
    }

    let fileInput: any = formData.get('file');
    if (fileDriveId && fileDriveName && fileDriveToken) {
        fileInput = { id: fileDriveId, name: fileDriveName, token: fileDriveToken };
    }

    const validatedFields = productFromDriveSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        price: formData.get('price'),
        category: formData.get('category'),
        image: imageInput,
        file: fileInput,
    });
    
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please correct the form errors.',
        };
    }

    const { title, description, price, category, image, file } = validatedFields.data;
    
    let imageUrl: string = '';
    let imageFileName: string = '';
    let ebookFileName: string = '';
    
    const uploadedFiles: { bucket: string; path: string }[] = [];

    try {
        // Handle Image Upload
        if (image instanceof File) {
            imageFileName = `${Date.now()}-${image.name}`;
            const { data, error } = await supabase.storage.from('ebook-covers').upload(imageFileName, image);
            if (error || !data) throw new Error(`Failed to upload cover image: ${error?.message}`);
            imageUrl = supabase.storage.from('ebook-covers').getPublicUrl(data.path).data.publicUrl;
            uploadedFiles.push({ bucket: 'ebook-covers', path: data.path });
        } else {
            imageFileName = `${Date.now()}-${image.name}`;
            const result = await uploadFromGoogleDrive({
                fileId: image.id,
                accessToken: image.token,
                fileName: imageFileName,
                bucket: 'ebook-covers',
            });
            imageUrl = result.publicUrl;
            uploadedFiles.push({ bucket: 'ebook-covers', path: result.filePath });
        }

        // Handle File Upload
        if (file instanceof File) {
            ebookFileName = `${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage.from('ebook-files').upload(ebookFileName, file);
            if (error || !data) throw new Error(`Failed to upload ebook file: ${error?.message}`);
            uploadedFiles.push({ bucket: 'ebook-files', path: data.path });
        } else {
            ebookFileName = `${Date.now()}-${file.name}`;
            const result = await uploadFromGoogleDrive({
                fileId: file.id,
                accessToken: file.token,
                fileName: ebookFileName,
                bucket: 'ebook-files',
            });
             uploadedFiles.push({ bucket: 'ebook-files', path: result.filePath });
        }

        // Insert product record into database
        const { error: dbError } = await supabase.from('ebooks').insert({
            title, description, price, category,
            image_url: imageUrl,
            file_name: ebookFileName,
            is_disabled: false,
        });

        if (dbError) {
            throw new Error(`Failed to save product to database: ${dbError.message}`);
        }

    } catch (error: any) {
        // Cleanup uploaded files on any failure
        for (const uf of uploadedFiles) {
            await supabase.storage.from(uf.bucket).remove([uf.path]);
        }
        return { message: error.message, errors: {} };
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/store');
    revalidatePath('/');

    return {
        message: 'Product uploaded successfully!',
        errors: {},
    };
}


export async function updateProduct(prevState: any, formData: FormData) {
  const supabase = createAdminClient();
  const validatedFields = updateProductSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    category: formData.get('category'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please correct the form errors.',
    };
  }

  const { id, title, description, price, category } = validatedFields.data;

  const { error } = await supabase
    .from('ebooks')
    .update({
      title,
      description,
      price,
      category,
    })
    .eq('id', id);

  if (error) {
    return { message: `Failed to update product: ${error.message}`, errors: {} };
  }

  revalidatePath('/admin/dashboard');
  revalidatePath('/store');
  revalidatePath(`/products/${id}`);
  revalidatePath('/');

  return {
    message: 'Product updated successfully!',
    errors: {},
  };
}


export async function submitReviewAction(prevState: any, formData: FormData) {
  const validatedFields = reviewSchema.safeParse({
    ebookId: formData.get('ebookId'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
    reviewer: formData.get('reviewer'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please correct the errors and try again.',
    };
  }
  
  const { ebookId, rating, comment, reviewer } = validatedFields.data;
  const supabase = createAdminClient();
  const { error } = await supabase.from('reviews').insert({
    ebook_id: ebookId,
    rating,
    comment,
    reviewer_name: reviewer,
  });

  if (error) {
    console.error('Error inserting review:', error);
    return {
      message: 'Sorry, there was an error submitting your review.',
      errors: {},
    };
  }
  
  revalidatePath(`/products/${ebookId}`);

  return {
    message: 'Thank you for your review!',
    errors: {},
  };
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; message: string; }> {
  const supabase = createAdminClient();

  // 1. Get the product details to find file names
  const { data: product, error: fetchError } = await supabase
    .from('ebooks')
    .select('image_url, file_name')
    .eq('id', productId)
    .single();

  if (fetchError || !product) {
    console.error('Error fetching product for deletion:', fetchError);
    return { success: false, message: 'Product not found.' };
  }
  
  const { image_url, file_name } = product;
  const imageFileName = image_url?.split('/').pop();
  
  // 2. Delete from database
  const { error: dbError } = await supabase
    .from('ebooks')
    .delete()
    .eq('id', productId);
  
  if (dbError) {
    console.error('Error deleting product from database:', dbError);
    return { success: false, message: 'Failed to delete product from database.' };
  }

  // 3. Delete files from storage (continue even if one fails)
  if (imageFileName) {
      const { error: imageError } = await supabase.storage
      .from('ebook-covers')
      .remove([imageFileName]);
      if (imageError) {
          console.warn('Failed to delete cover image:', imageError.message);
      }
  }

  if (file_name) {
      const { error: fileError } = await supabase.storage
      .from('ebook-files')
      .remove([file_name]);
      if (fileError) {
          console.warn('Failed to delete ebook file:', fileError.message);
      }
  }

  // 4. Revalidate paths to update the cache
  revalidatePath('/admin/dashboard');
  revalidatePath('/store');
  revalidatePath('/');

  return { success: true, message: 'Product deleted successfully.' };
}


export async function toggleProductDisabledStatus(productId: string, currentStatus: boolean): Promise<{ success: boolean; message: string; }> {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('ebooks')
        .update({ is_disabled: !currentStatus })
        .eq('id', productId);

    if (error) {
        console.error('Error toggling product status:', error);
        return { success: false, message: 'Failed to update product status.' };
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/store');
    revalidatePath(`/products/${productId}`);
    revalidatePath('/');

    return { success: true, message: 'Product status updated.' };
}
