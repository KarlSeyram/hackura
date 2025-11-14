
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/products/share-button';
import { useCart } from '@/hooks/use-cart';
import type { Ebook } from '@/lib/definitions';
import { useEffect } from 'react';
import * as ga from '@/lib/ga';
import { useToast } from '@/hooks/use-toast';
import { getFreeDownloadUrl } from '@/app/actions';
import { Download, Loader2 } from 'lucide-react';


interface ProductClientProps {
    product: Ebook;
}

export function ProductClient({ product }: ProductClientProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Track viewed product for recommendations
    const viewed = JSON.parse(localStorage.getItem('viewedEbooks') || '[]');
    if (!viewed.includes(product.id)) {
      const updatedViewed = [product.id, ...viewed].slice(0, 10); // Keep last 10
      localStorage.setItem('viewedEbooks', JSON.stringify(updatedViewed));
    }
    
    // Track GA view_item event
    ga.event('view_item', {
      currency: process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || 'GHS',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.title,
        price: product.price,
        item_category: product.category,
      }]
    });

  }, [product]);

  const handleFreeDownload = async () => {
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


  return (
      <div className="mt-8 flex items-center gap-4">
        {product.price === 0 ? (
            <Button size="lg" onClick={handleFreeDownload} disabled={isDownloading}>
                {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                Download for Free
            </Button>
        ) : (
             <Button size="lg" onClick={() => addToCart(product)}>Add to Cart</Button>
        )}
        <ShareButton product={product} />
      </div>
  );
}
