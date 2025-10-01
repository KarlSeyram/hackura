
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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareData, setShareData] = useState<{ shareableLink: string; productDescription: string; } | null>(null);

  const handleShareClick = async () => {
    setIsOpen(true);
    if (!shareData) {
      setIsLoading(true);
      try {
        const result = await generateShareableLinkWithPreview({
          productName: product.title,
          productDescription: product.description,
          productImageUrl: product.imageUrl,
        });
        setShareData({
          shareableLink: result.shareableLink,
          productDescription: result.productDescription,
        });
      } catch (error) {
        console.error('Error generating share link:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate shareable link.',
        });
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleNativeShare = async () => {
    if (navigator.share && shareData) {
      try {
        await navigator.share({
          title: product.title,
          text: shareData.productDescription,
          url: shareData.shareableLink,
        });
        setIsOpen(false);
      } catch (error) {
        console.error('Error with native share:', error);
        // If user cancels, it's not an error we need to show.
        // If another error, copyToClipboard can be a fallback.
        copyToClipboard();
      }
    } else {
        // Fallback for browsers that don't support native share
        copyToClipboard();
    }
  };

  const copyToClipboard = () => {
     if (shareData) {
      navigator.clipboard.writeText(shareData.shareableLink);
      toast({ title: 'Copied to clipboard!' });
      setIsOpen(false);
    }
  }


  return (
    <>
        <Button size="icon" variant="outline" onClick={handleShareClick}>
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share</span>
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share "{product.title}"</DialogTitle>
                    <DialogDescription>
                        Share this ebook with your friends and colleagues.
                    </DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : shareData && (
                    <div>
                        <p className="text-sm bg-muted p-4 rounded-md border italic">
                            "{shareData.productDescription}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 font-mono break-all">
                            {shareData.shareableLink}
                        </p>
                    </div>
                )}
                <DialogFooter className="sm:justify-start gap-2">
                    <Button onClick={handleNativeShare} disabled={isLoading}>
                         <Share2 className="mr-2 h-4 w-4" />
                         Share
                    </Button>
                     <Button variant="secondary" onClick={copyToClipboard} disabled={isLoading}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </>
  );
}
