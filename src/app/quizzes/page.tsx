import { getEbooks } from '@/lib/data';
import { QuizClient } from './quiz-client';
import { generateQuiz } from '@/ai/flows/generate-quiz';

export default async function QuizzesPage() {
  const ebooks = await getEbooks();
  const questions = await generateQuiz();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Cybersecurity Specialty Quiz</h1>
        <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
          Answer a few questions and our AI will suggest a specialty and relevant ebooks for you.
        </p>
      </div>
      
      <QuizClient allEbooks={ebooks} questions={questions} />
    </div>
  );
}
