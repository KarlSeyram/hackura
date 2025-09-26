'use server';
/**
 * @fileOverview Generates a shareable link, product description, and image preview for an ebook.
 *
 * - generateShareableLinkWithPreview - A function that generates the shareable link and preview.
 * - GenerateShareableLinkWithPreviewInput - The input type for the generateShareableLinkWithPreview function.
 * - GenerateShareableLinkWithPreviewOutput - The return type for the generateShareableLinkWithPreview function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateShareableLinkWithPreviewInputSchema = z.object({
  productName: z.string().describe('The name of the ebook product.'),
  productDescription: z.string().describe('The description of the ebook product.'),
  productImageUrl: z.string().describe('The URL of the ebook product image.'),
});
export type GenerateShareableLinkWithPreviewInput =
  z.infer<typeof GenerateShareableLinkWithPreviewInputSchema>;

const GenerateShareableLinkWithPreviewOutputSchema = z.object({
  shareableLink: z.string().describe('The generated shareable link for the ebook.'),
  productDescription: z.string().describe('A concise description of the ebook for sharing.'),
  productImageUrl: z.string().describe('The URL of the ebook product image for the preview.'),
});
export type GenerateShareableLinkWithPreviewOutput =
  z.infer<typeof GenerateShareableLinkWithPreviewOutputSchema>;

export async function generateShareableLinkWithPreview(
  input: GenerateShareableLinkWithPreviewInput
): Promise<GenerateShareableLinkWithPreviewOutput> {
  return generateShareableLinkWithPreviewFlow(input);
}

const generateShareableLinkWithPreviewPrompt = ai.definePrompt({
  name: 'generateShareableLinkWithPreviewPrompt',
  input: {schema: GenerateShareableLinkWithPreviewInputSchema},
  output: {schema: GenerateShareableLinkWithPreviewOutputSchema},
  prompt: `You are an expert marketing assistant, skilled at generating shareable content.

  Generate a shareable link, product description, and image preview for the following ebook product:

  Product Name: {{{productName}}}
  Product Description: {{{productDescription}}}
  Product Image URL: {{{productImageUrl}}}

  Shareable Link: (Make this up, it does not need to be real.)
  Product Description: (A concise, engaging description for social media sharing.)
  Product Image URL: (The original image URL should be returned here.)`,
});

const generateShareableLinkWithPreviewFlow = ai.defineFlow(
  {
    name: 'generateShareableLinkWithPreviewFlow',
    inputSchema: GenerateShareableLinkWithPreviewInputSchema,
    outputSchema: GenerateShareableLinkWithPreviewOutputSchema,
  },
  async input => {
    const {output} = await generateShareableLinkWithPreviewPrompt(input);
    return output!;
  }
);
