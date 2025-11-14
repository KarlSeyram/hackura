
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Ebook } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ShoppingCart, Download, Loader2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { getFreeDownloadUrl } from '@/app/actions';
import ShareButton from './share-button';

interface ProductCardProps {
  product: Ebook;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS';
  
  const handleFreeDownload = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent link navigation
    e.preventDefault();

    setIsDownloading(true);
    toast({
        title: 'Preparing Download',
        description: 'Generating your secure download link...',
    });
    try {
        const result = await getFreeDownloadUrl(product.id);
        if (result.url) {
            window.open(result.url, '_blank');
        } else {
            throw new Error(result.error || 'An unknown error occurred.');
        }
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Download Failed',
            description: error instanceof Error ? error.message : 'Could not prepare your download.',
        });
    } finally {
        setIsDownloading(false);
    }
  };

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
        <p className="font-bold text-base">
            {product.price === 0 ? 'Free' : formattedPrice}
        </p>
        <div className="flex items-center gap-1">
          <ShareButton product={product} />
          {product.price === 0 ? (
            <Button size="icon" variant="outline" onClick={handleFreeDownload} disabled={isDownloading} className="h-8 w-8">
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="sr-only">Download</span>
            </Button>
          ) : (
            <Button size="icon" variant="outline" onClick={() => addToCart(product)} className="h-8 w-8">
                <ShoppingCart className="h-4 w-4" />
                <span className="sr-only">Add to cart</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
