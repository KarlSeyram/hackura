
'use client';

import { useState, useMemo } from 'react';
import type { Ebook } from '@/lib/definitions';
import ProductCard from '@/components/products/product-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SortOption = 'default' | 'price-asc' | 'price-desc';

interface StoreClientProps {
    initialEbooks: Ebook[];
}

export function StoreClient({ initialEbooks }: StoreClientProps) {
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const sortedEbooks = useMemo(() => {
    // Create a new array to avoid mutating the original prop
    const sorted = [...initialEbooks]; 
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'default':
      default:
         // The initial order from the server is preserved
        return initialEbooks;
    }
  }, [sortBy, initialEbooks]);

  return (
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
  </section>
  );
}
