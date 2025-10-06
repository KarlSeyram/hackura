
'use server';
/**
 * @fileOverview Handles uploading a file from Google Drive to Supabase Storage.
 *
 * - uploadFromGoogleDrive - A function that takes a Google Drive file ID and an access token,
 *   downloads the file, and uploads it to a specified Supabase storage bucket.
 */

import { google } from 'googleapis';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'genkit';
import { ai } from '@/ai/genkit';
import { PassThrough } from 'stream';

const UploadFromGoogleDriveInputSchema = z.object({
  fileId: z.string().describe('The ID of the file in Google Drive.'),
  accessToken: z.string().describe('The OAuth2 access token for Google Drive.'),
  fileName: z.string().describe('The desired file name for the uploaded file.'),
  bucket: z.string().describe('The Supabase storage bucket to upload to (e.g., "ebook-covers" or "ebook-files").'),
});

export type UploadFromGoogleDriveInput = z.infer<typeof UploadFromGoogleDriveInputSchema>;

const UploadFromGoogleDriveOutputSchema = z.object({
  filePath: z.string().describe('The path of the uploaded file in Supabase storage.'),
  publicUrl: z.string().describe('The public URL of the uploaded file.'),
});

export type UploadFromGoogleDriveOutput = z.infer<typeof UploadFromGoogleDriveOutputSchema>;

async function uploadFromGoogleDrive(input: UploadFromGoogleDriveInput): Promise<UploadFromGoogleDriveOutput> {
  return uploadFromGoogleDriveFlow(input);
}


const uploadFromGoogleDriveFlow = ai.defineFlow(
  {
    name: 'uploadFromGoogleDriveFlow',
    inputSchema: UploadFromGoogleDriveInputSchema,
    outputSchema: UploadFromGoogleDriveOutputSchema,
  },
  async ({ fileId, accessToken, fileName, bucket }) => {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const supabase = createAdminClient();

    try {
      // 1. Get the file from Google Drive as a stream
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      
      const passThrough = new PassThrough();
      response.data.pipe(passThrough);

      // 2. Upload the stream to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, passThrough, {
            upsert: true, // Overwrite if file exists
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
      }

      // 3. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

      return {
        filePath: uploadData.path,
        publicUrl: publicUrl,
      };
    } catch (err: any) {
      console.error('Error during Google Drive to Supabase transfer:', err);
      throw new Error(err.message || 'An unknown error occurred during the file transfer.');
    }
  }
);
export { uploadFromGoogleDrive };
