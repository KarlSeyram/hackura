
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// This page is now deprecated in favor of /download/[purchaseId]
// but we keep it to handle any in-flight token-based downloads.
// New purchases will not be directed here.

async function DownloadContent() {
  return (
    <div className="w-full max-w-md p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-center flex flex-col items-center">
      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
      <h1 className="font-headline text-xl font-bold text-destructive-foreground">Download Link Invalid</h1>
      <p className="text-destructive-foreground/80 mt-2">
        This download page is no longer in use. Please check your purchase confirmation for the correct link or contact support.
      </p>
      <Button asChild className="mt-6">
        <Link href="/store">Back to Store</Link>
      </Button>
    </div>
  );
}

export default async function DownloadPage() {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh]">
          <DownloadContent />
      </div>
    );
}
