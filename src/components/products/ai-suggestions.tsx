
'use client';

import { useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type { Ebook } from '@/lib/definitions';
import { suggestEbooks } from '@/ai/flows/suggest-ebooks';
import ProductCard from './product-card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AiSuggestionsProps {
  allEbooks: Ebook[];
}

export function AiSuggestions({ allEbooks }: AiSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [interest, setInterest] = useState('');
  const [suggestions, setSuggestions] = useState<Ebook[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = async () => {
    if (!interest.trim()) {
      setError('Please tell us what you are interested in.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const result = await suggestEbooks(interest, allEbooks);
      const suggestedEbooks = allEbooks.filter(ebook =>
        result.suggestionIds.includes(ebook.id)
      );
      setSuggestions(suggestedEbooks);
      if (suggestedEbooks.length === 0) {
        setError('No suggestions found for your interest. Try being more specific.');
      }
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
      setError('Sorry, something went wrong while getting suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Settings className="mr-2 h-4 w-4" />
        AI Suggestions
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>AI Ebook Suggestions</DialogTitle>
            <DialogDescription>
              Describe what you're interested in learning about, and our AI will suggest some ebooks for you.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="e.g., 'I want to learn about ethical hacking and penetration testing for web applications.'"
              value={interest}
              onChange={e => setInterest(e.target.value)}
              rows={4}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button onClick={handleGetSuggestions} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Get Suggestions
            </Button>
          </DialogFooter>

          {suggestions.length > 0 && (
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Here are your recommendations:</h3>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {suggestions.map(ebook => (
                            <ProductCard key={ebook.id} product={ebook} />
                        ))}
                    </div>
                </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
