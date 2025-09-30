
'use server';
/**
 * @fileOverview Suggests ebooks based on user interest.
 *
 * - suggestEbooks - A function that suggests ebooks.
 * - SuggestEbooksInput - The input type for the suggestEbooks function.
 * - SuggestEbooksOutput - The return type for the suggestEbooks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Ebook } from '@/lib/definitions';

const SuggestEbooksInputSchema = z.object({
  interest: z.string().describe('The user\'s interest.'),
  ebooks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
  })).describe('A list of available ebooks.'),
});
export type SuggestEbooksInput = z.infer<typeof SuggestEbooksInputSchema>;

const SuggestEbooksOutputSchema = z.object({
  suggestionIds: z.array(z.string()).describe('A list of suggested ebook IDs.'),
});
export type SuggestEbooksOutput = z.infer<typeof SuggestEbooksOutputSchema>;


export async function suggestEbooks(
  interest: string,
  ebooks: Ebook[]
): Promise<SuggestEbooksOutput> {
  const input: SuggestEbooksInput = { interest, ebooks };
  return suggestEbooksFlow(input);
}

const suggestEbooksPrompt = ai.definePrompt({
  name: 'suggestEbooksPrompt',
  input: {schema: SuggestEbooksInputSchema},
  output: {schema: SuggestEbooksOutputSchema},
  prompt: `You are an expert ebook recommender for an online store called CyberShelf. Your goal is to help users find the perfect ebook based on their interests.

You will be given the user's interest and a list of available ebooks in JSON format.

Analyze the user's interest: "{{interest}}"

Here are the available ebooks:
{{{json ebooks}}}

Based on the user's interest and the available ebooks, recommend the most relevant ebooks. Return a list of the ebook IDs for your recommendations in the \`suggestionIds\` field.

Return up to 3 suggestions. If no books are a good fit, return an empty array.
`,
});

const suggestEbooksFlow = ai.defineFlow(
  {
    name: 'suggestEbooksFlow',
    inputSchema: SuggestEbooksInputSchema,
    outputSchema: SuggestEbooksOutputSchema,
  },
  async input => {
    const {output} = await suggestEbooksPrompt(input);
    return output!;
  }
);
