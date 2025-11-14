import { getEbooks } from '@/lib/data';
import { AiSuggestionsClient } from './ai-suggestions-client';

export default async function AiSuggestionsPage() {
  const ebooks = await getEbooks();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-4 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight">AI Ebook Suggestions</h1>
          <p className="text-muted-foreground md:text-xl max-w-2xl mx-auto">
            Describe what you're interested in, and our AI will find the perfect book for you.
          </p>
        </div>
        <div className="mt-8">
            <AiSuggestionsClient allEbooks={ebooks} />
        </div>
    </div>
  );
}
