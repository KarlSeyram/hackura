
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
  prompt: `You are a world-class social media marketing expert, known for crafting viral posts that drive engagement and sales.

Your task is to write a highly persuasive and captivating description for the following ebook.

**Instructions:**
1.  **Use a captivating tone:** Start with a hook that grabs attention.
2.  **Highlight the benefit:** Focus on what the reader will gain or be able to do after reading the book.
3.  **Include a Call-to-Action:** Encourage people to check it out.
4.  **Use Emojis:** Add 1-2 relevant emojis to make the text visually appealing.
5.  **Keep it concise:** The entire description should be under 280 characters, perfect for platforms like X.

**Product Details:**
*   **Title:** {{{productName}}}
*   **Description:** {{{productDescription}}}
*   **URL:** {{{productUrl}}}

Generate only the 'shareableDescription'. Do not include the product URL in your response, as it will be appended automatically.

**Example Output:**
"Ready to master ethical hacking? 🚀 This guide breaks down complex concepts into easy-to-follow steps. Level up your security skills and become a pen-testing pro. Check it out!"`,
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
