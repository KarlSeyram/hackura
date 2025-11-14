
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { uploadFromGoogleDrive } from '@/ai/flows/upload-from-google-drive';
import { createAdminClient } from '@/lib/supabase/server';
import { getFirebaseAdmin } from '@/lib/firebase/admin';

function slugify(text: string): string {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
        .replace(/&/g, '-and-') // Replace & with 'and'
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, '') // Trim - from end of text
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
  price: z.coerce.number().min(0, 'Price must be a non-negative number.'),
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

const adSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().min(1, 'Description is required.'),
  link: z.string().url('A valid URL is required.'),
  image: z
    .any()
    .refine((file) => file?.size > 0, 'Image is required.')
    .refine((file) => file?.size <= MAX_IMAGE_SIZE, `Max image size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Only .jpg, .png, and .webp formats are supported."
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
  title: z.string().min(1, 'Title is required.').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters.').trim(),
  price: z.coerce.number().min(0, 'Price must be a non-negative number.'),
  category: z.string().min(1, 'Category is required.').trim(),
});


const reviewSchema = z.object({
  ebookId: z.string(),
  rating: z.coerce.number().min(1, 'A rating is required.').max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters.'),
  reviewer: z.string().min(2, 'Name must be at least 2 characters.'),
});

const discountSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, 'Code must be at least 3 characters.').max(50).trim().toUpperCase(),
  discount_percent: z.coerce.number().int().min(1, 'Percent must be at least 1.').max(100, 'Percent cannot exceed 100.'),
  is_active: z.boolean(),
  expires_at: z.string().nullable().optional(),
});


const subscriberSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});


type FormState = {
  message: string;
  errors: {
    name?: string[];
    email?: string[];
    service?: string[];
    message?: string[];
  };
};

export async function submitContactRequest(prevState: FormState, formData: FormData): Promise<FormState> {
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

  // 1. Insert the contact request into the database
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

  // 2. Invoke the Edge Function to send an auto-reply (non-blocking)
  const { error: functionError } = await supabase.functions.invoke('send-contact-reply', {
    body: { name, email },
  });

  if (functionError) {
    // Log the error but don't fail the entire operation, as the request was still saved.
    console.error('Failed to invoke send-contact-reply function:', functionError);
  }

  // 3. Revalidate the path for the admin dashboard
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
    
    const fileExtension = file.name.split('.').pop();
    const slug = slugify(title);
    
    // Determine subdirectory based on price
    const ebookFolder = price === 0 ? 'free' : 'paid';
    const ebookFileName = `${ebookFolder}/${slug}.${fileExtension}`;
    
    const imageFileExtension = image.name.split('.').pop();
    const imageFileName = `${slug}.${imageFileExtension}`;

    // 1. Upload cover image
    const { error: imageError, data: imageData } = await supabase.storage
        .from('ebook-covers')
        .upload(imageFileName, image, { upsert: true });

    if (imageError || !imageData) {
        return { message: `Failed to upload cover image: ${imageError?.message}`, errors: {} };
    }
    const { data: { publicUrl: imageUrl } } = supabase.storage.from('ebook-covers').getPublicUrl(imageData.path);


    // 2. Upload ebook file
    const { error: fileError } = await supabase.storage
        .from('ebook-files')
        .upload(ebookFileName, file, { upsert: true });
    
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
        file_name: ebookFileName, // Store the full path including subfolder
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


export async function createOrUpdateDiscount(prevState: any, formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get('id') as string;
  const isEdit = !!id;

  const validatedFields = discountSchema.safeParse({
    id: id,
    code: formData.get('code'),
    discount_percent: formData.get('discount_percent'),
    is_active: formData.get('is_active') === 'on',
    expires_at: formData.get('expires_at') || null,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please correct the form errors.',
    };
  }

  const { code, discount_percent, is_active, expires_at } = validatedFields.data;
  
  if (isEdit) {
    const { error } = await supabase.from('discounts')
      .update({ code, discount_percent, is_active, expires_at })
      .eq('id', id);

    if (error) {
        if (error.code === '23505') { // Unique constraint violation
             return { message: `Discount code "${code}" already exists.`, errors: { code: ['This code is already in use.'] } };
        }
      return { message: `Failed to update discount: ${error.message}`, errors: {} };
    }
  } else {
    const { error } = await supabase.from('discounts').insert({
        code, discount_percent, is_active, expires_at
    });
     if (error) {
        if (error.code === '23505') {
            return { message: `Discount code "${code}" already exists.`, errors: { code: ['This code is already in use.'] } };
        }
      return { message: `Failed to create discount: ${error.message}`, errors: {} };
    }
  }

  revalidatePath('/admin/discounts');

  return {
    message: `Discount "${code}" has been ${isEdit ? 'updated' : 'created'} successfully!`,
    errors: {},
  };
}

export async function deleteDiscount(id: string): Promise<{ success: boolean; message: string; }> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('discounts').delete().eq('id', id);
    if (error) {
        return { success: false, message: 'Failed to delete discount.' };
    }
    revalidatePath('/admin/discounts');
    return { success: true, message: 'Discount deleted.' };
}

export async function toggleDiscountStatus(id: string, currentStatus: boolean): Promise<{ success: boolean; message: string; }> {
    const supabase = createAdminClient();
    const { error } = await supabase.from('discounts').update({ is_active: !currentStatus }).eq('id', id);
    if (error) {
        return { success: false, message: 'Failed to update discount status.' };
    }
    revalidatePath('/admin/discounts');
    return { success: true, message: 'Discount status updated.' };
}


export async function submitSubscriber(prevState: any, formData: FormData): Promise<{message: string; errors: { email?: string[] }}> {
  const validatedFields = subscriberSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Please enter a valid email address.',
    };
  }
  
  const supabase = createAdminClient();
  const { email } = validatedFields.data;

  // 1. Save the subscriber to the database
  const { error: dbError } = await supabase.from('subscribers').upsert(
    { email },
    { onConflict: 'email', ignoreDuplicates: true }
  );

  if (dbError) {
    console.error("Error adding subscriber:", dbError);
    return {
      errors: {},
      message: "Sorry, there was an issue with our system. Please try again later.",
    };
  }

  // 2. Invoke the Edge Function to send the email
  const { error: functionError } = await supabase.functions.invoke('send-welcome-email', {
    body: { email },
  });

  if (functionError) {
    console.error('Error invoking send-welcome-email function:', functionError);
    // Even if the email fails, the user is still subscribed. 
    // We can return a slightly different message.
    return {
      errors: {},
      message: "You are subscribed, but we couldn't send the welcome email. Please contact support for your discount.",
    };
  }
  
  return {
    errors: {},
    message: 'Check your inbox for a welcome message and a 20% discount!',
  };
}


export async function createAd(prevState: any, formData: FormData) {
    const supabase = createAdminClient();
    const admin = await getFirebaseAdmin();
    
    // This is a placeholder for getting the authenticated admin user's ID.
    // In a real app, you would get this from the user's session.
    // For now, we'll simulate it. This part needs to be implemented correctly with your auth provider.
    const adminId = 'simulated-admin-id';

    const validatedFields = adSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        link: formData.get('link'),
        image: formData.get('image'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Please correct the form errors.',
        };
    }

    const { title, description, link, image } = validatedFields.data;
    
    const imageFileExtension = image.name.split('.').pop();
    const imageFileName = `${slugify(title)}-${Date.now()}.${imageFileExtension}`;

    // Upload ad image
    const { data: imageData, error: imageError } = await supabase.storage
        .from('ads-images')
        .upload(imageFileName, image, { upsert: true });

    if (imageError || !imageData) {
        return { message: `Failed to upload ad image: ${imageError?.message}`, errors: {} };
    }
    const { data: { publicUrl: imageUrl } } = supabase.storage.from('ads-images').getPublicUrl(imageData.path);

    // Insert ad record into database
    const { error: dbError } = await supabase.from('ads').insert({
        title,
        description,
        link,
        image_url: imageUrl,
        admin_id: adminId, // Replace with actual authenticated admin ID
    });

    if (dbError) {
        // Clean up storage if db insert fails
        await supabase.storage.from('ads-images').remove([imageFileName]);
        return { message: `Failed to save ad: ${dbError.message}`, errors: {} };
    }

    revalidatePath('/admin/ads');
    revalidatePath('/ads');

    return {
        message: 'Ad created successfully!',
        errors: {},
    };
}
