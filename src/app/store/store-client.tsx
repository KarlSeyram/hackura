
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
  if (!initialEbooks) {
    return (
      <div className="text-center col-span-full py-12">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <section>
        {initialEbooks.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {initialEbooks.map((ebook: Ebook) => (
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
