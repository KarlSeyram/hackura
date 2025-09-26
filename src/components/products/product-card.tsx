'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Ebook } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import ShareButton from './share-button';

interface ProductCardProps {
  product: Ebook;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              data-ai-hint={product.imageHint}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="font-headline text-lg mb-1">
          <Link href={`/products/${product.id}`}>{product.title}</Link>
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="flex items-center gap-2">
            <ShareButton product={product} />
            <Button size="icon" variant="outline" onClick={() => addToCart(product)}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add to cart</span>
            </Button>
        </div>
        <p className="font-semibold text-lg">${product.price.toFixed(2)}</p>
      </CardFooter>
    </Card>
  );
}
