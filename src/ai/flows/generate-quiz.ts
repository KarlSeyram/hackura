
'use server';
/**
 * @fileOverview Generates a dynamic cybersecurity specialty quiz.
 *
 * - generateQuiz - A function that creates a new set of quiz questions.
 * - QuizQuestionSchema - The Zod schema for a single quiz question.
 * - GenerateQuizOutputSchema - The Zod schema for the entire quiz.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { QuizQuestion } from '@/lib/definitions';

const QuizQuestionSchema = z.object({
  id: z.string().describe('A unique identifier for the question (e.g., "q1", "q2").'),
  text: z.string().describe('The text of the quiz question.'),
  options: z
    .array(
      z.object({
        id: z.string().describe('A unique identifier for the option (e.g., "a1", "a2").'),
        text: z.string().describe('The text for the answer option.'),
      })
    )
    .describe('An array of 4 possible answer options.'),
});

const GenerateQuizOutputSchema = z.object({
  questions: z
    .array(QuizQuestionSchema)
    .length(3)
    .describe('An array of 3 quiz questions.'),
});

export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(): Promise<QuizQuestion[]> {
  const output = await generateQuizFlow();
  return output.questions;
}

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert in cybersecurity careers. Your task is to generate a short, engaging quiz with 3 questions to help a user determine which cybersecurity specialty might be a good fit for them.

The specialties are:
- Offensive Security / Penetration Testing
- Defensive Security / Security Architecture
- Digital Forensics and Incident Response (DFIR)
- Security Automation / DevSecOps

For each question, create 4 distinct options. Each option should subtly correspond to one of the four specialties listed above. The questions should be scenario-based or ask about preferences and problem-solving styles.

Do not mention the specialties directly in the questions or options. Make the questions and options creative and unique each time this prompt is called. Ensure all IDs are unique.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    outputSchema: GenerateQuizOutputSchema,
  },
  async () => {
    const {output} = await generateQuizPrompt();
    return output!;
  }
);
