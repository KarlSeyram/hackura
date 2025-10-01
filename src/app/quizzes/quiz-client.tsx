'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Ebook, QuizQuestion } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { gradeQuiz } from '@/ai/flows/quiz-grader';
import { Loader2, RefreshCw } from 'lucide-react';
import ProductCard from '@/components/products/product-card';

interface QuizClientProps {
    allEbooks: Ebook[];
    questions: QuizQuestion[];
}

export function QuizClient({ allEbooks, questions }: QuizClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [result, setResult] = useState<{ specialty: string; reasoning: string; suggestedEbookIds: string[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnswerChange = (questionId: string, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const formattedAnswers = questions.map(q => {
                const selectedOption = q.options.find(opt => opt.id === answers[q.id]);
                return {
                    question: q.text,
                    answer: selectedOption?.text || 'No answer',
                };
            });
            const quizResult = await gradeQuiz(formattedAnswers, allEbooks);
            setResult(quizResult);
        } catch (err) {
            console.error('Error grading quiz:', err);
            setError('Sorry, something went wrong while grading your quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetake = () => {
        setAnswers({});
        setCurrentQuestionIndex(0);
        setResult(null);
        setError(null);
        startTransition(() => {
            router.refresh();
        });
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const allQuestionsAnswered = Object.keys(answers).length === questions.length;

     if (isPending) {
        return (
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Generating a new quiz...</p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Analyzing your answers...</p>
            </div>
        )
    }

    if (error) {
        return (
             <div className="text-center text-destructive bg-destructive/10 p-6 rounded-lg">
                <p>{error}</p>
                <Button onClick={handleRetake} className="mt-4">Try Again</Button>
            </div>
        )
    }

    if (result) {
        const suggestedEbooks = allEbooks.filter(ebook => result.suggestedEbookIds.includes(ebook.id));
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Your Recommended Specialty: {result.specialty}</CardTitle>
                    <CardDescription>{result.reasoning}</CardDescription>
                </CardHeader>
                <CardContent>
                    {suggestedEbooks.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4">Recommended Reading:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {suggestedEbooks.map(ebook => (
                                    <ProductCard key={ebook.id} product={ebook} />
                                ))}
                            </div>
                        </div>
                    )}
                    <Button onClick={handleRetake} variant="outline" className="mt-8">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Take Another Quiz
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                <CardDescription className="text-lg">{currentQuestion.text}</CardDescription>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    className="space-y-4"
                >
                    {currentQuestion.options.map(option => (
                        <div key={option.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="text-base flex-1">{option.text}</Label>
                        </div>
                    ))}
                </RadioGroup>

                <div className="mt-8 flex justify-between items-center">
                    <Button onClick={handleBack} variant="outline" disabled={currentQuestionIndex === 0}>
                        Back
                    </Button>
                    {isLastQuestion ? (
                        <Button onClick={handleSubmit} disabled={!allQuestionsAnswered}>
                            See My Results
                        </Button>
                    ) : (
                        <Button onClick={handleNext} disabled={!answers[currentQuestion.id]}>
                            Next
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
