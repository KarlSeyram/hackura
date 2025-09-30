import { getEbooks } from '@/lib/data';
import { AiSuggestionsClient } from './ai-suggestions-client';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default async function AiSuggestionsPage() {
  const ebooks = await getEbooks();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-4">
          <h1 className="font-headline text-4xl font-bold tracking-tight">AI Ebook Suggestions</h1>
          <p className="text-muted-foreground md:text-xl">
            Describe what you're interested in, and our AI will find the perfect book for you.
          </p>
          <AiSuggestionsClient allEbooks={ebooks} />
        </div>
        
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle>Not Sure Where to Start?</CardTitle>
                <CardDescription>Take our quick, AI-powered quiz to discover which cybersecurity specialty fits you best and get personalized book recommendations.</CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button asChild>
                    <Link href="/quizzes">
                        <FileQuestion className="mr-2 h-4 w-4" />
                        Take the Specialty Quiz
                    </Link>
                </Button>
            </CardFooter>
        </Card>
      </div>

    </div>
  );
}
