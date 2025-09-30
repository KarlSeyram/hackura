import { getEbooks } from '@/lib/data';
import { AiSuggestionsClient } from './ai-suggestions-client';

export default async function AiSuggestionsPage() {
  const ebooks = await getEbooks();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight">AI Ebook Suggestions</h1>
        <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
          Describe what you're interested in learning about, and our AI will suggest some ebooks for you from our store.
        </p>
      </div>
      
      <AiSuggestionsClient allEbooks={ebooks} />
    </div>
  );
}
