
'use client';

import { useState } from 'react';
import { Share2, Copy, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Ebook } from '@/lib/definitions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { generateShareableLinkWithPreview } from '@/ai/flows/generate-shareable-link-with-preview';

interface ShareButtonProps {
  product: Ebook;
}

export default function ShareButton({ product }: ShareButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/products/${product.id}` : '';

  const handleShareClick = async () => {
    setIsLoading(true);
    try {
      // Generate a concise description using AI.
      const { shareableDescription } = await generateShareableLinkWithPreview({
        productName: product.title,
        productDescription: product.description,
        productUrl: productUrl,
      });

      // Use the Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: shareableDescription,
          url: productUrl,
        });
      } else {
        // Fallback to copying the link to the clipboard
        navigator.clipboard.writeText(productUrl);
        toast({
          title: 'Link Copied!',
          description: 'The product link has been copied to your clipboard.',
        });
      }
    } catch (error) {
      // Don't show an error if the user cancels the share sheet
      if ((error as DOMException).name !== 'AbortError') {
        console.error('Error sharing product:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not share product. The link has been copied as a fallback.',
        });
        // Fallback for any error during sharing
        navigator.clipboard.writeText(productUrl);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button size="icon" variant="outline" onClick={handleShareClick} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      <span className="sr-only">Share</span>
    </Button>
  );
}
