
'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Ebook } from '@/lib/definitions';

interface ShareButtonProps {
  product: Ebook;
}

export default function ShareButton({ product }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const productUrl = `${window.location.origin}/products/${product.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this amazing ebook: ${product.title}`,
          url: productUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Silently fail if user cancels share dialog
      }
    } else {
      try {
        await navigator.clipboard.writeText(productUrl);
        toast({ title: 'Copied to clipboard!' });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not copy link to clipboard.',
        });
      }
    }
  };

  return (
    <Button size="icon" variant="outline" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      <span className="sr-only">Share</span>
    </Button>
  );
}
