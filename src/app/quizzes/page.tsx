import { getEbooks } from '@/lib/data';
import { QuizClient } from './quiz-client';
import type { QuizQuestion } from '@/lib/definitions';

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'When you encounter a complex technical problem, what is your first instinct?',
    options: [
      { id: 'a1', text: 'Try to break it, find its limits, and see how it fails.' },
      { id: 'a2', text: 'Analyze its structure, design a resilient solution, and document everything.' },
      { id: 'a3', text: 'Figure out how the attacker got in and trace their steps.' },
      { id: 'a4', text: 'Write a script to automate a repetitive part of the analysis.' },
    ],
  },
  {
    id: 'q2',
    text: 'Which of these sounds most interesting to you?',
    options: [
      { id: 'b1', text: 'Finding a zero-day vulnerability in a popular application.' },
      { id: 'b2', text: 'Designing a secure, scalable cloud architecture for a global service.' },
      { id: 'b3', text: 'Analyzing malware to understand its behavior and impact.' },
      { id: 'b4', text: 'Building a custom tool to parse millions of log entries for anomalies.' },
    ],
  },
  {
    id: 'q3',
    text: 'What kind of project would you be most excited to work on?',
    options: [
      { id: 'c1', text: 'A red team engagement simulating a sophisticated APT group.' },
      { id: 'c2', text: 'A complete security overhaul for a legacy enterprise system.' },
      { id: 'c3', text: 'A live digital forensics case to uncover evidence of a data breach.' },
      { id: 'c4', text: 'Developing a machine learning model to predict security threats.' },
    ],
  },
];


export default async function QuizzesPage() {
  const ebooks = await getEbooks();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight">Cybersecurity Quizzes</h1>
        <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
          Test your knowledge and find your cybersecurity specialty.
        </p>
      </div>
      
      <QuizClient allEbooks={ebooks} questions={quizQuestions} />
    </div>
  );
}
