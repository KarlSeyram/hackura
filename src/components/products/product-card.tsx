
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Ebook } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import ShareButton from './share-button';

interface ProductCardProps {
  product: Ebook;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: paystackCurrency,
  }).format(product.price);
  
  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-lg shadow-sm transition-all hover:shadow-md bg-card border">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={product.imageHint}
          />
        </div>
      </Link>
      <CardContent className="flex-1 p-3">
        <p className="text-xs text-muted-foreground truncate mb-1">{product.category}</p>
        <Link href={`/products/${product.id}`} className="block text-sm font-medium text-foreground hover:text-primary line-clamp-2 leading-tight">
            {product.title}
        </Link>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-3 pt-0">
        <p className="font-bold text-base">{formattedPrice}</p>
        <div className="flex items-center gap-1">
          <ShareButton product={product} />
          <Button size="icon" variant="outline" onClick={() => addToCart(product)} className="h-8 w-8">
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Add to cart</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
