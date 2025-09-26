'use client';

import { Button } from '@/components/ui/button';
import ShareButton from '@/components/products/share-button';
import { useCart } from '@/hooks/use-cart';
import type { Ebook } from '@/lib/definitions';

interface ProductClientProps {
    product: Ebook;
}

export function ProductClient({ product }: ProductClientProps) {
  const { addToCart } = useCart();
  return (
      <div className="mt-8 flex items-center gap-4">
        <Button size="lg" onClick={() => addToCart(product)}>Add to Cart</Button>
        <ShareButton product={product} />
      </div>
  );
}
