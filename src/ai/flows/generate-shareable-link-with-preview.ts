
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
  productUrl: z.string().describe('The actual, shareable URL for the product page.'),
});
export type GenerateShareableLinkWithPreviewInput =
  z.infer<typeof GenerateShareableLinkWithPreviewInputSchema>;

const GenerateShareableLinkWithPreviewOutputSchema = z.object({
  shareableDescription: z.string().describe('A concise and engaging description of the ebook, suitable for sharing on social media.'),
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
  prompt: `You are an expert marketing assistant, skilled at writing compelling and concise social media copy.

Your task is to generate a short, engaging description for the following ebook product that can be shared on platforms like Twitter or LinkedIn.

The description should be no more than 250 characters.

Product Title: {{{productName}}}
Full Description: {{{productDescription}}}
Product URL: {{{productUrl}}}

Generate only the 'shareableDescription'.
`,
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
