'use client';

import { useState } from 'react';
import { ebooks } from '@/lib/data';
import type { Ebook } from '@/lib/definitions';
import ProductCard from '@/components/products/product-card';
import { Button } from '@/components/ui/button';

const allCategories = ['All', ...new Set(ebooks.map(ebook => ebook.imageHint.split(' ')[0]))];

export default function StorePage() {
  const [filteredEbooks, setFilteredEbooks] = useState<Ebook[]>(ebooks);
  const [activeCategory, setActiveCategory] = useState('All');

  const filterEbooks = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      setFilteredEbooks(ebooks);
    } else {
      setFilteredEbooks(
        ebooks.filter(ebook => ebook.imageHint.toLowerCase().includes(category.toLowerCase()))
      );
    }
  };

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
        <div className="flex justify-center mb-8 space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {allCategories.map(category => (
                <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                onClick={() => filterEbooks(category)}
                className="capitalize"
                >
                {category}
                </Button>
            ))}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEbooks.map((ebook: Ebook) => (
            <ProductCard key={ebook.id} product={ebook} />
          ))}
        </div>
        {filteredEbooks.length === 0 && (
            <div className="text-center col-span-full py-12">
                <p className="text-muted-foreground">No products found for this category.</p>
            </div>
        )}
      </section>
    </div>
  );
}
