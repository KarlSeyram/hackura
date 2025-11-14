
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { Ebook } from '@/lib/definitions';
import { suggestEbooks } from '@/ai/flows/suggest-ebooks';
import ProductCard from '@/components/products/product-card';
import { Skeleton } from '@/components/ui/skeleton';

interface HomeClientProps {
  allEbooks: Ebook[];
}

function ProductSkeleton() {
    return (
        <div className="flex flex-col space-y-3">
            <Skeleton className="h-[250px] w-full rounded-lg" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    )
}

export function HomeClient({ allEbooks }: HomeClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Ebook[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!isClient) return;

    const getSuggestions = async () => {
      const viewedEbooks = JSON.parse(localStorage.getItem('viewedEbooks') || '[]');
      if (viewedEbooks.length > 1) {
        const viewedTitles = allEbooks
          .filter(ebook => viewedEbooks.includes(ebook.id))
          .map(ebook => ebook.title);
        
        const interest = `I have shown interest in the following books: ${viewedTitles.join(', ')}. Please suggest similar books.`;

        try {
          const result = await suggestEbooks(interest, allEbooks);
          const suggestedEbooks = allEbooks.filter(ebook => 
            result.suggestionIds.includes(ebook.id) && !viewedEbooks.includes(ebook.id)
          );
          setSuggestions(suggestedEbooks.slice(0, 3));
        } catch (err) {
          console.error('Error getting AI suggestions:', err);
        }
      }
      setIsLoading(false);
    };

    getSuggestions();
  }, [allEbooks, isClient]);

  if (isLoading) {
    return (
         <section className="mt-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight mb-8">
                Recommended For You
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <ProductSkeleton />
                <ProductSkeleton />
                <ProductSkeleton />
            </div>
        </section>
    );
  }

  if (suggestions.length === 0) {
      return null;
  }

  return (
    <section className="mt-16">
      <h2 className="font-headline text-3xl font-bold tracking-tight mb-8">
        Recommended For You
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((ebook: Ebook) => (
          <ProductCard key={ebook.id} product={ebook} />
        ))}
      </div>
    </section>
  );
}
