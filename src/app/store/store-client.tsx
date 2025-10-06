
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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');

  const categories = useMemo(() => {
    if (!initialEbooks) return ['All'];
    const uniqueCategories = new Set(initialEbooks.map(ebook => ebook.category));
    return ['All', ...Array.from(uniqueCategories)];
  }, [initialEbooks]);

  const filteredAndSortedEbooks = useMemo(() => {
    let filtered = initialEbooks.filter(ebook => !ebook.isDisabled);

    if (searchTerm) {
      filtered = filtered.filter(ebook =>
        ebook.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(ebook => ebook.category === selectedCategory);
    }

    const sorted = [...filtered];

    if (sortOrder === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    }

    return sorted;
  }, [initialEbooks, searchTerm, selectedCategory, sortOrder]);
  
  if (!initialEbooks) {
    return (
      <div className="text-center col-span-full py-12">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <section>
       <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4"
          />
        </div>
        <div className="flex items-center gap-2">
           <Button asChild variant="outline">
              <Link href="/ai-suggestions">
                <Settings className="mr-2 h-4 w-4" />
                AI Suggestions
              </Link>
          </Button>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={setSortOrder}>
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
