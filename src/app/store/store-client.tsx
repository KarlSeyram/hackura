
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

  if (!initialEbooks || initialEbooks.length === 0) {
    return (
      <div className="text-center col-span-full py-12">
        <p className="text-muted-foreground">no products found</p>
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
                />
            </div>
            <div className="flex gap-4">
                <Button variant="outline" asChild>
                    <Link href="/ai-suggestions">
                        <Settings className="mr-2 h-4 w-4" />
                        AI Suggestions
                    </Link>
                </Button>
                <Select defaultValue="all">
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                    </SelectContent>
                </Select>

                <Select defaultValue="default">
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
            {initialEbooks.map((ebook: Ebook) => (
                <ProductCard key={ebook.id} product={ebook} />
            ))}
        </div>
        {initialEbooks.length === 0 && (
        <div className="text-center col-span-full py-12">
            <p className="text-muted-foreground">no products found</p>
        </div>
        )}
  </section>
  );
}
