
'use server';
/**
 * @fileOverview A chatbot assistant for the CyberShelf ebook store.
 *
 * - askAssistant - A function that provides answers and recommends ebooks.
 * - ChatbotInput - The input type for the chatbot function.
 * - ChatbotOutput - The return type for the chatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Ebook } from '@/lib/definitions';

const ChatbotInputSchema = z.object({
  query: z.string().describe('The user\'s question or request.'),
  ebooks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
  })).describe('A list of available ebooks.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  answer: z.string().describe('A helpful, conversational answer to the user\'s query. If relevant, this answer should mention the recommended ebooks.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function askAssistant(
  query: string,
  ebooks: Ebook[]
): Promise<ChatbotOutput> {
  const input: ChatbotInput = { query, ebooks };
  return ebookChatbotFlow(input);
}

const ebookChatbotPrompt = ai.definePrompt({
  name: 'ebookChatbotPrompt',
  input: {schema: ChatbotInputSchema},
  output: {schema: ChatbotOutputSchema},
  prompt: `You are a friendly and knowledgeable chatbot assistant for an online ebook store called "CyberShelf". Your purpose is to help users with their cybersecurity-related questions and recommend relevant ebooks from the store's catalog.

You will be given the user's query and a list of available ebooks in JSON format.

Your answer should be conversational, clear, and helpful.

1.  **Analyze the User's Query:** Understand the user's intent. Are they asking a general knowledge question, or are they looking for a specific type of book?
2.  **Formulate a Direct Answer:** First, directly answer the user's question.
3.  **Recommend Ebooks (If Relevant):** If the user's query is related to topics covered by the available ebooks, recommend 1 or 2 of the most relevant ebooks.
    -   When recommending, state the title of the book clearly.
    -   Briefly explain why it's a good recommendation based on their query.
    -   Do NOT include the ebook ID or any other metadata in your final answer.
4.  **Keep it Concise:** Provide a helpful answer without being overly verbose.

User's Query: "{{query}}"

Available Ebooks:
{{{json ebooks}}}
`,
});

const ebookChatbotFlow = ai.defineFlow(
  {
    name: 'ebookChatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    const {output} = await ebookChatbotPrompt(input);
    return output!;
  }
);
