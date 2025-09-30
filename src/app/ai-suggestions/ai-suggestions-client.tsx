
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Ebook } from '@/lib/definitions';
import { suggestEbooks } from '@/ai/flows/suggest-ebooks';
import ProductCard from '@/components/products/product-card';
import { Separator } from '@/components/ui/separator';

interface AiSuggestionsClientProps {
  allEbooks: Ebook[];
}

export function AiSuggestionsClient({ allEbooks }: AiSuggestionsClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [interest, setInterest] = useState('');
  const [suggestions, setSuggestions] = useState<Ebook[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleGetSuggestions = async () => {
    if (!interest.trim()) {
      setError('Please tell us what you are interested in.');
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    setSuggestions([]);

    try {
      const result = await suggestEbooks(interest, allEbooks);
      const suggestedEbooks = allEbooks.filter(ebook =>
        result.suggestionIds.includes(ebook.id)
      );
      setSuggestions(suggestedEbooks);
      if (suggestedEbooks.length === 0) {
        setError('No suggestions found for your interest. Try being more specific or broader.');
      }
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
      setError('Sorry, something went wrong while getting suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Textarea
          placeholder="e.g., 'I want to learn about ethical hacking and penetration testing for web applications.'"
          value={interest}
          onChange={e => setInterest(e.target.value)}
          rows={4}
          className="text-base"
        />
        {error && !isLoading && <p className="text-sm text-center text-destructive mt-2">{error}</p>}
        <Button onClick={handleGetSuggestions} disabled={isLoading} className="w-full mt-4" size="lg">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Get Suggestions
        </Button>
      </div>

      {hasSearched && !isLoading && suggestions.length > 0 && (
        <div>
            <Separator className="my-8" />
            <div>
              <h3 className="text-2xl font-bold text-center mb-6">Here are your recommendations:</h3>
              <div className="space-y-6">
                {suggestions.map(ebook => (
                  <ProductCard key={ebook.id} product={ebook} />
                ))}
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
