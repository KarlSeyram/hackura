
'use client';

import { useState, useMemo } from 'react';
import { getEbooks } from '@/lib/data';
import type { Ebook } from '@/lib/definitions';
import ProductCard from '@/components/products/product-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { use } from 'react';

type SortOption = 'default' | 'price-asc' | 'price-desc';

// Since we are in a client component, we need to fetch data in a way that works with client components.
// React's `use` hook is a good way to resolve a promise.
const ebooksPromise = getEbooks();

export default function StorePage() {
  const initialEbooks = use(ebooksPromise);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const sortedEbooks = useMemo(() => {
    const sorted = [...initialEbooks];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'default':
      default:
        // In a real app, you might want a default sort order like "newest"
        return initialEbooks;
    }
  }, [sortBy, initialEbooks]);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <section className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Ebook Store
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
          Browse our collection of ebooks on cybersecurity and technology.
        </p>
      </section>

      <section>
        <div className="flex justify-end mb-6">
          <Select onValueChange={(value) => setSortBy(value as SortOption)} defaultValue="default">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedEbooks.map((ebook: Ebook) => (
              <ProductCard key={ebook.id} product={ebook} />
            ))}
          </div>
          {sortedEbooks.length === 0 && (
            <div className="text-center col-span-full py-12">
              <p className="text-muted-foreground">No products found.</p>
            </div>
          )}
        </>
      </section>
    </div>
  );
}
