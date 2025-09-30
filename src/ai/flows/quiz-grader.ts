
'use server';
/**
 * @fileOverview Grades a cybersecurity quiz and recommends ebooks.
 *
 * - gradeQuiz - A function that grades the quiz and provides a specialty and recommendations.
 * - QuizGraderInput - The input type for the function.
 * - QuizGraderOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Ebook } from '@/lib/definitions';

const QuizAnswerSchema = z.object({
    question: z.string(),
    answer: z.string(),
});

const QuizGraderInputSchema = z.object({
  answers: z.array(QuizAnswerSchema).describe('The user\'s answers to the quiz questions.'),
  ebooks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
  })).describe('A list of available ebooks.'),
});
export type QuizGraderInput = z.infer<typeof QuizGraderInputSchema>;

const QuizGraderOutputSchema = z.object({
  specialty: z.string().describe('The cybersecurity specialty recommended for the user.'),
  reasoning: z.string().describe('A brief, encouraging explanation for why this specialty was chosen based on their answers.'),
  suggestedEbookIds: z.array(z.string()).describe('A list of up to 2 suggested ebook IDs relevant to the specialty.'),
});
export type QuizGraderOutput = z.infer<typeof QuizGraderOutputSchema>;


export async function gradeQuiz(
  answers: { question: string; answer: string }[],
  ebooks: Ebook[]
): Promise<QuizGraderOutput> {
  const input: QuizGraderInput = { answers, ebooks };
  return quizGraderFlow(input);
}

const quizGraderPrompt = ai.definePrompt({
  name: 'quizGraderPrompt',
  input: {schema: QuizGraderInputSchema},
  output: {schema: QuizGraderOutputSchema},
  prompt: `You are an expert career counselor for the cybersecurity industry. Your task is to analyze a user's answers to a short quiz and recommend a cybersecurity specialty for them. You also need to suggest relevant ebooks from a provided list.

You will be given the user's answers and a list of available ebooks in JSON format.

**Cybersecurity Specialties to choose from:**
-   **Offensive Security / Penetration Testing:** Focuses on actively finding and exploiting vulnerabilities.
-   **Defensive Security / Security Architecture:** Focuses on designing, building, and protecting systems.
-   **Digital Forensics and Incident Response (DFIR):** Focuses on investigating breaches and analyzing evidence.
-   **Security Automation / DevSecOps:** Focuses on scripting, coding, and integrating security into development pipelines.

**Your Task:**

1.  **Analyze the User's Answers:** Review the user's answers to determine their inclinations and interests.
    -   Answers related to breaking things, curiosity about exploits, and simulating attacks point towards **Offensive Security**.
    -   Answers related to building, designing, and structural integrity point towards **Defensive Security**.
    -   Answers related to investigation, tracing steps, and analysis of past events point towards **DFIR**.
    -   Answers related to automation, scripting, and efficiency point towards **Security Automation**.
2.  **Determine the Best-Fit Specialty:** Based on the pattern of answers, choose the single most fitting specialty from the list above.
3.  **Provide a Reasoning:** Write a short, encouraging paragraph explaining why you recommended that specialty, referencing their answering style (e.g., "Your answers show a passion for...").
4.  **Recommend Ebooks:** From the provided list of ebooks, select 1 or 2 that are most relevant to the recommended specialty. Return their IDs in the \`suggestedEbookIds\` field.

**User's Quiz Answers:**
{{{json answers}}}

**Available Ebooks:**
{{{json ebooks}}}
`,
});

const quizGraderFlow = ai.defineFlow(
  {
    name: 'quizGraderFlow',
    inputSchema: QuizGraderInputSchema,
    outputSchema: QuizGraderOutputSchema,
  },
  async input => {
    const {output} = await quizGraderPrompt(input);
    return output!;
  }
);
