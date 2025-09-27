
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Ebook } from '@/lib/definitions';
import ProductCard from '@/components/products/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function StorePage() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [filteredEbooks, setFilteredEbooks] = useState<Ebook[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEbooks() {
      setLoading(true);
      const { data, error } = await supabase.from('ebooks').select('*').order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching ebooks:', error);
        setEbooks([]);
        setFilteredEbooks([]);
      } else {
        const fetchedEbooks: Ebook[] = data.map(ebook => ({
          id: ebook.id,
          title: ebook.title,
          description: ebook.description,
          price: ebook.price,
          imageUrl: ebook.image_url,
          imageHint: '',
        }));
        setEbooks(fetchedEbooks);
        setFilteredEbooks(fetchedEbooks);
      }
      
      setLoading(false);
    }
    fetchEbooks();
  }, []);

  const filterEbooks = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      setFilteredEbooks(ebooks);
    } else {
      // This part of the logic might need adjustment if real categories are added.
      setFilteredEbooks(
        ebooks.filter(ebook => ebook.imageHint?.toLowerCase().includes(category.toLowerCase()))
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
        {/* <div className="flex justify-center mb-8 space-x-2 overflow-x-auto pb-2 no-scrollbar">
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
        </div> */}
        {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredEbooks.map((ebook: Ebook) => (
                <ProductCard key={ebook.id} product={ebook} />
              ))}
            </div>
            {filteredEbooks.length === 0 && (
                <div className="text-center col-span-full py-12">
                    <p className="text-muted-foreground">No products found.</p>
                </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
