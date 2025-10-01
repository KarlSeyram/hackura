
'use client';

import { Button } from '@/components/ui/button';
import ShareButton from '@/components/products/share-button';
import { useCart } from '@/hooks/use-cart';
import type { Ebook } from '@/lib/definitions';
import { useEffect } from 'react';

interface ProductClientProps {
    product: Ebook;
}

export function ProductClient({ product }: ProductClientProps) {
  const { addToCart } = useCart();

  useEffect(() => {
    // Track viewed product
    const viewed = JSON.parse(localStorage.getItem('viewedEbooks') || '[]');
    if (!viewed.includes(product.id)) {
      const updatedViewed = [product.id, ...viewed].slice(0, 10); // Keep last 10
      localStorage.setItem('viewedEbooks', JSON.stringify(updatedViewed));
    }
  }, [product.id]);

  return (
      <div className="mt-8 flex items-center gap-4">
        <Button size="lg" onClick={() => addToCart(product)}>Add to Cart</Button>
        <ShareButton product={product} />
      </div>
  );
}
