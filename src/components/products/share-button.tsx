
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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface ShareButtonProps {
  product: Ebook;
}

export default function ShareButton({ product }: ShareButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareableContent, setShareableContent] = useState({ description: '', url: '' });
  
  const getProductUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/products/${product.id}`;
    }
    return `http://localhost:9002/products/${product.id}`;
  };

  const handleShareClick = async () => {
    const productUrl = getProductUrl();

    // Use Web Share API if available, as it's the best mobile experience
    if (navigator.share) {
      setIsLoading(true);
      try {
        const { shareableDescription } = await generateShareableLinkWithPreview({
          productName: product.title,
          productDescription: product.description,
          productUrl: productUrl,
        });

        await navigator.share({
          title: product.title,
          text: shareableDescription,
          url: productUrl,
        });
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          console.error('Error sharing product:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not share product at this time.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback for desktop: open the dialog
      setIsDialogOpen(true);
      setIsLoading(true);
       try {
        const { shareableDescription } = await generateShareableLinkWithPreview({
          productName: product.title,
          productDescription: product.description,
          productUrl: productUrl,
        });
        setShareableContent({ description: shareableDescription, url: productUrl });
      } catch (error) {
        console.error('Error generating share content:', error);
        // Use fallback content if AI fails
        setShareableContent({ description: product.description.substring(0, 150) + '...', url: productUrl });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'The content has been copied to your clipboard.',
    });
  };

  return (
    <>
      <Button size="icon" variant="outline" onClick={handleShareClick} disabled={isLoading} className="h-8 w-8">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        <span className="sr-only">Share</span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share "{product.title}"</DialogTitle>
            <DialogDescription>
              Copy the text below to share it on your favorite platform.
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
             <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
          ) : (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="share-description">Share Text</Label>
                    <Textarea id="share-description" readOnly value={shareableContent.description} rows={3} />
                </div>
                <div className="space-y-2">
                     <Label htmlFor="share-url">URL</Label>
                     <div className="flex items-center gap-2">
                        <Input id="share-url" readOnly value={shareableContent.url} />
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(shareableContent.url)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                     </div>
                </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => copyToClipboard(`${shareableContent.description}\n${shareableContent.url}`)}>
                <Copy className="mr-2 h-4 w-4" /> Copy All
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
