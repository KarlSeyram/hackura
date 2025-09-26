'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ebooks } from '@/lib/data';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/products/share-button';
import { useCart } from '@/hooks/use-cart';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { addToCart } = useCart();
  const product = ebooks.find(p => p.id === params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="relative aspect-[3/4] w-full max-w-md mx-auto overflow-hidden rounded-lg shadow-lg">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            data-ai-hint={product.imageHint}
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 text-3xl font-bold">${product.price.toFixed(2)}</p>
          <p className="mt-6 text-base text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <Button size="lg" onClick={() => addToCart(product)}>Add to Cart</Button>
            <ShareButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
