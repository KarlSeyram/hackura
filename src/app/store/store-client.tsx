
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

type SortOption = 'default' | 'price-asc' | 'price-desc';

interface StoreClientProps {
    initialEbooks: Ebook[];
}

export function StoreClient({ initialEbooks }: StoreClientProps) {
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const allCategories = initialEbooks.map(ebook => ebook.category);
    return ['all', ...Array.from(new Set(allCategories))];
  }, [initialEbooks]);

  const filteredAndSortedEbooks = useMemo(() => {
    let filtered = initialEbooks.filter(ebook => !ebook.isDisabled);

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ebook => ebook.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(ebook =>
        ebook.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'default':
      default:
        return filtered;
    }
  }, [sortBy, searchQuery, selectedCategory, initialEbooks]);

  return (
    <section>
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
            <div className="flex-1 min-w-0">
                <Input
                    placeholder="Search for books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md"
                />
            </div>
            <div className="flex gap-4">
                <Button variant="outline" asChild>
                    <Link href="/ai-suggestions">
                        <Settings className="mr-2 h-4 w-4" />
                        AI Suggestions
                    </Link>
                </Button>
                <Select onValueChange={setSelectedCategory} defaultValue="all">
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(category => (
                            <SelectItem key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={(value) => setSortBy(value as SortOption)} defaultValue="default">
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Price" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredAndSortedEbooks.map((ebook: Ebook) => (
                <ProductCard key={ebook.id} product={ebook} />
            ))}
        </div>
        {filteredAndSortedEbooks.length === 0 && (
        <div className="text-center col-span-full py-12">
            <p className="text-muted-foreground">no products found</p>
        </div>
        )}
  </section>
  );
}
