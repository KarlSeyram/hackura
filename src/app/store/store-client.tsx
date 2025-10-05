
'use client';

import { useState, useMemo } from 'react';
import type { Ebook } from '@/lib/definitions';
import ProductCard from '@/components/products/product-card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings } from 'lucide-react';

interface StoreClientProps {
    initialEbooks: Ebook[];
}

export function StoreClient({ initialEbooks }: StoreClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');

  const categories = useMemo(() => {
    if (!initialEbooks) return ['all'];
    const allCategories = initialEbooks.map(ebook => ebook.category).filter(Boolean); // Filter out null/undefined categories
    return ['all', ...Array.from(new Set(allCategories))];
  }, [initialEbooks]);

  const filteredAndSortedEbooks = useMemo(() => {
    if (!initialEbooks) return [];

    let filtered = initialEbooks.filter(ebook => !ebook.isDisabled);

    if (searchTerm) {
      filtered = filtered.filter(ebook =>
        ebook.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(ebook => ebook.category === category);
    }

    if (sortOrder === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [initialEbooks, searchTerm, category, sortOrder]);
  
  if (!initialEbooks) {
    return (
      <div className="text-center col-span-full py-12">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <section>
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
            <div className="flex-1 min-w-0">
                <Input
                    placeholder="Search for books..."
                    className="w-full max-w-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex flex-wrap gap-4">
                <Button variant="outline" asChild>
                    <Link href="/ai-suggestions">
                        <Settings className="mr-2 h-4 w-4" />
                        AI Suggestions
                    </Link>
                </Button>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                                {cat === 'all' ? 'All Categories' : cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        {filteredAndSortedEbooks.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredAndSortedEbooks.map((ebook: Ebook) => (
                  <ProductCard key={ebook.id} product={ebook} />
              ))}
          </div>
        ) : (
          <div className="text-center col-span-full py-12">
            <p className="text-muted-foreground">no products found</p>
          </div>
        )}
  </section>
  );
}
