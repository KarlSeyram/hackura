
'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateShareableLinkWithPreview } from '@/ai/flows/generate-shareable-link-with-preview';
import type { GenerateShareableLinkWithPreviewOutput, GenerateShareableLinkWithPreviewInput } from '@/ai/flows/generate-shareable-link-with-preview';
import type { Ebook } from '@/lib/definitions';
import Image from 'next/image';

interface ShareButtonProps {
  product: Ebook;
}

export default function ShareButton({ product }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<GenerateShareableLinkWithPreviewOutput | null>(null);
  const { toast } = useToast();

  const handleShare = async () => {
    setLoading(true);
    setResult(null);
    try {
      const input: GenerateShareableLinkWithPreviewInput = {
        productName: product.title,
        productDescription: product.description,
        productImageUrl: product.imageUrl
      };
      const response = await generateShareableLinkWithPreview(input);
      setResult(response);
    } catch (error) {
      console.error('Error generating shareable link:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate a shareable link. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!result?.shareableLink) return;
    navigator.clipboard.writeText(result.shareableLink);
    setCopied(true);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this Ebook</DialogTitle>
          <DialogDescription>
            Copy the link below to share "{product.title}" with others.
          </DialogDescription>
        </DialogHeader>
        {loading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {result && (
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image src={result.productImageUrl} alt={product.title} layout="fill" objectFit="cover" data-ai-hint={product.imageHint} />
            </div>
            <p className="text-sm text-muted-foreground">{result.productDescription}</p>
            <div className="flex items-center space-x-2">
              <Input value={result.shareableLink} readOnly />
              <Button size="icon" onClick={handleCopyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
