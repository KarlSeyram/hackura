"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const adFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  link: z.string().url("A valid URL is required."),
  image: z.instanceof(File).optional(),
  existing_image_url: z.string().url().optional(),
});

export async function createOrUpdateAd(formData: FormData) {
  const supabase = createAdminClient();
  const rawFormData = Object.fromEntries(formData.entries());

  const validatedFields = adFormSchema.safeParse(rawFormData);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid form data." };
  }

  const { id, title, description, link, image, existing_image_url } = validatedFields.data;
  let imageUrl = existing_image_url;

  // 1. Handle image upload if a new image is provided
  if (image && image.size > 0) {
    const fileExt = image.name.split(".").pop();
    const fileName = `ad-${Date.now()}.${fileExt}`;
    const filePath = `ads-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("ebook-files") // Using the same bucket as per previous setup
      .upload(filePath, image, { upsert: true });

    if (uploadError) {
      return { success: false, message: "Failed to upload image." };
    }

    // Get the public URL of the uploaded file
    const { data: urlData } = supabase.storage
      .from("ebook-files")
      .getPublicUrl(filePath);
    imageUrl = urlData.publicUrl;
  }
  
  // Prepare data for Supabase, ensuring the current user's ID is included as admin_id
  const { data: { user } } = await supabase.auth.getUser();
  
  const dataToUpsert = {
    title,
    description: description || null,
    link,
    image_url: imageUrl || null,
    admin_id: user?.id
  };

  // 2. Insert or update the record in the 'ads' table
  if (id) {
    // Update existing ad
    const { error } = await supabase.from("ads").update(dataToUpsert).eq("id", id);
    if (error) {
      return { success: false, message: `Failed to update ad: ${error.message}` };
    }
  } else {
    // Create new ad
    const { error } = await supabase.from("ads").insert(dataToUpsert);
     if (error) {
      return { success: false, message: `Failed to create ad: ${error.message}` };
    }
  }

  // 3. Revalidate paths to show updated content
  revalidatePath("/admin/ads");
  revalidatePath("/ads");

  return { success: true, message: `Ad ${id ? "updated" : "created"} successfully!` };
}

export async function deleteAd(id: string): Promise<{ success: boolean; message: string; }> {
    const supabase = createAdminClient();

    // Optionally, delete the associated image from storage first
    const { data: adData, error: fetchError } = await supabase.from('ads').select('image_url').eq('id', id).single();
    if (fetchError) {
        return { success: false, message: 'Failed to find ad to delete.' };
    }

    // Delete the record from the database
    const { error: deleteError } = await supabase.from('ads').delete().eq('id', id);
    if (deleteError) {
        return { success: false, message: 'Failed to delete ad.' };
    }

    // If database deletion was successful, delete the image from storage
    if (adData?.image_url) {
        const imagePath = adData.image_url.split('/ebook-files/')[1];
        if (imagePath) {
            await supabase.storage.from('ebook-files').remove([imagePath]);
        }
    }

    revalidatePath('/admin/ads');
    revalidatePath('/ads');
    return { success: true, message: 'Ad deleted successfully.' };
}
