
'use client';

import { useState, useEffect } from 'react';
import { Share2, Copy, Loader2, Check } from 'lucide-react';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [shareableContent, setShareableContent] = useState({ 
    description: `Check out this great ebook: "${product.title}"`, 
    url: '' 
  });
  
  const getProductUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/products/${product.id}`;
    }
    // This is a fallback for server-side or build-time rendering.
    return `https://your-domain.com/products/${product.id}`;
  };

  useEffect(() => {
    // When the dialog opens, start fetching the AI description.
    if (isDialogOpen) {
      const productUrl = getProductUrl();
      setShareableContent(prev => ({ ...prev, url: productUrl }));
      setIsLoading(true);

      generateShareableLinkWithPreview({
        productName: product.title,
        productDescription: product.description,
        productUrl: productUrl,
      }).then(result => {
        if (result?.shareableDescription) {
          setShareableContent(prev => ({ ...prev, description: result.shareableDescription }));
        }
      }).catch(error => {
        console.error('AI share text generation failed, using fallback:', error);
        // The fallback is already set in the initial state, so no update needed on error.
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [isDialogOpen, product.title, product.description, product.id]);
  
  useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCopied]);

  const handleShareClick = () => {
    // Always open the dialog for a consistent experience on all devices.
    setIsDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    toast({
      title: 'Copied!',
      description: 'The content has been copied to your clipboard.',
    });
  };

  return (
    <>
      <Button size="icon" variant="outline" onClick={handleShareClick} className="h-8 w-8">
        <Share2 className="h-4 w-4" />
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
          <div className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor="share-description">Share Text</Label>
                  {isLoading ? (
                    <div className="h-[78px] w-full flex items-center justify-center rounded-md border bg-muted">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Textarea id="share-description" readOnly value={shareableContent.description} rows={3} />
                  )}
              </div>
              <div className="space-y-2">
                   <Label htmlFor="share-url">URL</Label>
                   <div className="flex items-center gap-2">
                      <Input id="share-url" readOnly value={shareableContent.url} />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(shareableContent.url)}>
                          {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                   </div>
              </div>
          </div>
          <DialogFooter className="sm:justify-between gap-2">
             <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button onClick={() => copyToClipboard(`${shareableContent.description}\n${shareableContent.url}`)} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
                Copy All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
